"use server";

// ==============================================================================
// Tenant Management Server Actions
// ==============================================================================
// CRUD operations for tenant (organization) management.
// All actions require authentication and appropriate roles.
//
// Available Actions:
//   - getTenants: List all tenants (Super Admin only)
//   - getTenantById: Get single tenant details
//   - updateTenant: Update tenant details
//   - suspendTenant: Suspend a tenant account
//   - reactivateTenant: Reactivate a suspended tenant
//   - deleteTenant: Soft-delete a tenant
//   - getTenantStats: Dashboard statistics
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";
import { updateTenantSchema } from "@/lib/validations/tenant";
import { revalidatePath } from "next/cache";

/**
 * List all tenants with pagination and filtering.
 * Only accessible by Super Admin.
 *
 * @param page - Page number (1-based)
 * @param perPage - Records per page
 * @param search - Search by company name, code, or email
 * @param status - Filter by tenant status
 */
export async function getTenants({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
} = {}) {
  await requireRole(["super_admin"]);

  const skip = (page - 1) * perPage;

  // Build dynamic where clause based on filters
  const where: any = { is_deleted: false };

  if (search) {
    where.OR = [
      { company_name: { contains: search, mode: "insensitive" } },
      { tenant_code: { contains: search, mode: "insensitive" } },
      { primary_email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      where,
      include: {
        plan: { select: { plan_name: true, plan_code: true } },
        _count: { select: { users: true } },
      },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.tenant.count({ where }),
  ]);

  return {
    data: tenants,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get a single tenant by ID with full details.
 * Super Admin can view any tenant; Tenant Admin can view their own.
 */
export async function getTenantById(tenantId: string) {
  const session = await getCurrentUser();
  const userRoles = (session as any).roles || [];

  // Non-super-admins can only view their own tenant
  if (
    !userRoles.includes("super_admin") &&
    (session as any).tenantId !== tenantId
  ) {
    throw new Error("You don't have permission to view this tenant");
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId, is_deleted: false },
    include: {
      plan: true,
      _count: {
        select: {
          users: { where: { is_deleted: false } },
          roles: true,
          notifications: true,
          audit_logs: true,
        },
      },
    },
  });

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  return tenant;
}

/**
 * Update tenant details.
 * Super Admin can update any tenant; Tenant Admin can update their own.
 */
export async function updateTenant(tenantId: string, data: any) {
  const session = await getCurrentUser();
  const userRoles = (session as any).roles || [];

  if (
    !userRoles.includes("super_admin") &&
    (session as any).tenantId !== tenantId
  ) {
    throw new Error("You don't have permission to update this tenant");
  }

  // Validate input
  const validated = updateTenantSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.errors[0]?.message || "Invalid input");
  }

  // Get current values for audit log
  const currentTenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!currentTenant) {
    throw new Error("Tenant not found");
  }

  // Update the tenant
  const updatedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: validated.data,
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "update",
      resource_type: "tenant",
      resource_id: tenantId,
      old_values: currentTenant as any,
      new_values: validated.data as any,
    },
  });

  revalidatePath("/tenants");
  return updatedTenant;
}

/**
 * Suspend a tenant account.
 * Super Admin only. Prevents all users from logging in.
 */
export async function suspendTenant(tenantId: string, reason?: string) {
  await requireRole(["super_admin"]);

  const session = await getCurrentUser();

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      status: "SUSPENDED",
      metadata: {
        suspension_reason: reason || "Suspended by administrator",
        suspended_at: new Date().toISOString(),
        suspended_by: session.user.id,
      },
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "suspend",
      resource_type: "tenant",
      resource_id: tenantId,
      new_values: { status: "SUSPENDED", reason },
    },
  });

  revalidatePath("/tenants");
  return tenant;
}

/**
 * Reactivate a suspended tenant.
 * Super Admin only.
 */
export async function reactivateTenant(tenantId: string) {
  await requireRole(["super_admin"]);

  const session = await getCurrentUser();

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      status: "ACTIVE",
      metadata: {
        reactivated_at: new Date().toISOString(),
        reactivated_by: session.user.id,
      },
    },
  });

  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "reactivate",
      resource_type: "tenant",
      resource_id: tenantId,
      new_values: { status: "ACTIVE" },
    },
  });

  revalidatePath("/tenants");
  return tenant;
}

/**
 * Soft-delete a tenant.
 * Super Admin only. Data is preserved but tenant becomes inaccessible.
 */
export async function deleteTenant(tenantId: string) {
  await requireRole(["super_admin"]);

  const session = await getCurrentUser();

  // Prevent deleting the platform tenant
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (tenant?.tenant_code === "softmerce-platform") {
    throw new Error("Cannot delete the platform tenant");
  }

  const deletedTenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
      status: "CANCELLED",
    },
  });

  await prisma.auditLog.create({
    data: {
      tenant_id: tenantId,
      user_id: session.user.id,
      action: "delete",
      resource_type: "tenant",
      resource_id: tenantId,
      old_values: { status: tenant?.status },
      new_values: { status: "CANCELLED", is_deleted: true },
    },
  });

  revalidatePath("/tenants");
  return deletedTenant;
}

/**
 * Get tenant dashboard statistics.
 * Returns counts and summary data for the dashboard widgets.
 */
export async function getTenantStats() {
  const session = await getCurrentUser();
  const userRoles = (session as any).roles || [];
  const isSuperAdmin = userRoles.includes("super_admin");

  if (isSuperAdmin) {
    // Platform-wide statistics
    const [
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalUsers,
      activeUsers,
      recentSignups,
    ] = await Promise.all([
      prisma.tenant.count({ where: { is_deleted: false } }),
      prisma.tenant.count({ where: { status: "ACTIVE", is_deleted: false } }),
      prisma.tenant.count({ where: { status: "TRIAL", is_deleted: false } }),
      prisma.tenant.count({ where: { status: "SUSPENDED", is_deleted: false } }),
      prisma.user.count({ where: { is_deleted: false } }),
      prisma.user.count({ where: { status: "ACTIVE", is_deleted: false } }),
      prisma.tenant.findMany({
        where: { is_deleted: false },
        orderBy: { created_at: "desc" },
        take: 5,
        select: {
          id: true,
          company_name: true,
          tenant_code: true,
          status: true,
          created_at: true,
          plan: { select: { plan_name: true } },
        },
      }),
    ]);

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      suspendedTenants,
      totalUsers,
      activeUsers,
      recentSignups,
    };
  } else {
    // Tenant-specific statistics
    const tenantId = (session as any).tenantId;
    const [
      totalUsers,
      activeUsers,
      unreadNotifications,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({
        where: { tenant_id: tenantId, is_deleted: false },
      }),
      prisma.user.count({
        where: { tenant_id: tenantId, status: "ACTIVE", is_deleted: false },
      }),
      prisma.notification.count({
        where: {
          tenant_id: tenantId,
          user_id: session.user.id,
          status: { in: ["PENDING", "SENT", "DELIVERED"] },
        },
      }),
      prisma.auditLog.findMany({
        where: { tenant_id: tenantId },
        orderBy: { created_at: "desc" },
        take: 10,
        include: {
          user: {
            select: { first_name: true, last_name: true, email: true },
          },
        },
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      unreadNotifications,
      recentAuditLogs,
    };
  }
}
