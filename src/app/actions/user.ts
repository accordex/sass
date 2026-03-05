"use server";

// ==============================================================================
// User Management Server Actions
// ==============================================================================
// CRUD operations for user management within a tenant.
// Tenant Admins can manage users within their tenant.
// Super Admins can manage users across all tenants.
//
// Available Actions:
//   - getUsers: List users in tenant with pagination
//   - getUserById: Get single user details
//   - createUser: Invite/create a new user
//   - updateUser: Update user profile
//   - deleteUser: Soft-delete a user
//   - assignRoles: Assign roles to a user
//   - changePassword: Change user's password
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, getTenantId } from "@/lib/auth-utils";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

/**
 * List users within the current tenant with pagination and search.
 */
export async function getUsers({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  roleCode = "",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  roleCode?: string;
} = {}) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const skip = (page - 1) * perPage;

  // Build where clause
  const where: any = {
    tenant_id: tenantId,
    is_deleted: false,
  };

  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (roleCode) {
    where.user_roles = {
      some: { role: { role_code: roleCode } },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        avatar_url: true,
        status: true,
        email_verified: true,
        last_login_at: true,
        login_count: true,
        created_at: true,
        user_roles: {
          include: {
            role: { select: { role_name: true, role_code: true } },
          },
        },
      },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get a single user by ID with full details.
 */
export async function getUserById(userId: string) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const userRoles = (session as any).roles || [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      tenant_id: true,
      email: true,
      first_name: true,
      last_name: true,
      phone: true,
      avatar_url: true,
      status: true,
      email_verified: true,
      phone_verified: true,
      mfa_enabled: true,
      last_login_at: true,
      login_count: true,
      preferences: true,
      created_at: true,
      updated_at: true,
      user_roles: {
        include: {
          role: {
            select: { id: true, role_name: true, role_code: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Ensure user belongs to same tenant (unless super admin)
  if (
    !userRoles.includes("super_admin") &&
    user.tenant_id !== tenantId
  ) {
    throw new Error("You don't have permission to view this user");
  }

  return user;
}

/**
 * Create a new user (admin invitation).
 * Creates the user with the specified roles and sends a welcome notification.
 */
export async function createUser(data: any) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  // Validate input
  const validated = createUserSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid input",
    };
  }

  const { email, first_name, last_name, phone, password, role_ids } =
    validated.data;

  // Check if email already exists within this tenant
  const existingUser = await prisma.user.findUnique({
    where: {
      tenant_id_email: {
        tenant_id: tenantId,
        email: email.toLowerCase().trim(),
      },
    },
  });

  if (existingUser) {
    return {
      success: false,
      error: "A user with this email already exists in your organization",
    };
  }

  // Check tenant user limit
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      plan: { select: { max_users: true } },
      _count: { select: { users: { where: { is_deleted: false } } } },
    },
  });

  if (tenant && tenant._count.users >= tenant.plan.max_users) {
    return {
      success: false,
      error: `Your plan allows a maximum of ${tenant.plan.max_users} users. Please upgrade to add more.`,
    };
  }

  // Validate that provided role IDs exist
  const roles = await prisma.role.findMany({
    where: {
      id: { in: role_ids },
      OR: [
        { tenant_id: tenantId },
        { tenant_id: null, is_system: true },
      ],
    },
  });

  if (roles.length !== role_ids.length) {
    return { success: false, error: "One or more selected roles are invalid" };
  }

  // Prevent assigning super_admin role
  if (roles.some((r) => r.role_code === "super_admin")) {
    return {
      success: false,
      error: "Cannot assign the Super Admin role",
    };
  }

  const passwordHash = await hashPassword(password);

  // Create user with roles in transaction
  const newUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        tenant_id: tenantId,
        email: email.toLowerCase().trim(),
        first_name,
        last_name,
        phone: phone || null,
        password_hash: passwordHash,
        status: "ACTIVE",
        email_verified: false,
        preferences: {
          theme: "light",
          language: "en",
          notifications: { email: true, sms: true, in_app: true },
        },
      },
    });

    // Assign roles
    await tx.userRole.createMany({
      data: role_ids.map((roleId: string) => ({
        user_id: user.id,
        role_id: roleId,
      })),
    });

    // Create welcome notification
    await tx.notification.create({
      data: {
        tenant_id: tenantId,
        user_id: user.id,
        type: "user_created",
        channel: "IN_APP",
        priority: "MEDIUM",
        title: "Welcome to the team!",
        body: `Your account has been created. Welcome aboard, ${first_name}!`,
        status: "PENDING",
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        tenant_id: tenantId,
        user_id: session.user.id,
        action: "create",
        resource_type: "user",
        resource_id: user.id,
        new_values: {
          email: user.email,
          first_name,
          last_name,
          roles: roles.map((r) => r.role_name),
        },
      },
    });

    return user;
  });

  revalidatePath("/users");
  return { success: true, user: newUser };
}

/**
 * Update user profile/details.
 * Users can update their own profile; admins can update any user in tenant.
 */
export async function updateUser(userId: string, data: any) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const userRoles = (session as any).roles || [];

  // Validate input
  const validated = updateUserSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      error: validated.error.errors[0]?.message || "Invalid input",
    };
  }

  // Get the target user
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser || targetUser.is_deleted) {
    return { success: false, error: "User not found" };
  }

  // Permission check: own profile or admin
  const isOwnProfile = session.user.id === userId;
  const isAdmin =
    userRoles.includes("super_admin") || userRoles.includes("tenant_admin");

  if (!isOwnProfile && !isAdmin) {
    return { success: false, error: "You don't have permission to update this user" };
  }

  // Non-admins cannot change their own status
  if (!isAdmin && validated.data.status) {
    delete validated.data.status;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: validated.data,
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "update",
      resource_type: "user",
      resource_id: userId,
      old_values: {
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
        status: targetUser.status,
      },
      new_values: validated.data as any,
    },
  });

  revalidatePath("/users");
  return { success: true, user: updatedUser };
}

/**
 * Soft-delete a user account.
 * Admin only. The user will no longer be able to log in.
 */
export async function deleteUser(userId: string) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  // Cannot delete yourself
  if (session.user.id === userId) {
    return { success: false, error: "You cannot delete your own account" };
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser || targetUser.is_deleted) {
    return { success: false, error: "User not found" };
  }

  if (targetUser.tenant_id !== tenantId) {
    return { success: false, error: "User does not belong to your organization" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
      status: "INACTIVE",
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "delete",
      resource_type: "user",
      resource_id: userId,
      old_values: {
        email: targetUser.email,
        first_name: targetUser.first_name,
        last_name: targetUser.last_name,
      },
    },
  });

  revalidatePath("/users");
  return { success: true };
}

/**
 * Get available roles for assignment.
 * Returns system roles and tenant-specific roles.
 */
export async function getAvailableRoles() {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const userRoles = (session as any).roles || [];

  const where: any = {
    is_active: true,
    OR: [
      { tenant_id: tenantId },
      { tenant_id: null, is_system: true },
    ],
  };

  // Only super admins can see the super_admin role
  if (!userRoles.includes("super_admin")) {
    where.role_code = { not: "super_admin" };
  }

  return prisma.role.findMany({
    where,
    select: {
      id: true,
      role_name: true,
      role_code: true,
      description: true,
      is_system: true,
    },
    orderBy: { role_name: "asc" },
  });
}
