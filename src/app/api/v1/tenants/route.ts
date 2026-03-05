// ==============================================================================
// Tenant API Routes — /api/v1/tenants
// ==============================================================================
// GET  — List all tenants (Super Admin only)
// POST — Create new tenant (public signup)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashPassword } from "@/lib/auth-utils";
import { createTenantSchema } from "@/lib/validations/tenant";

/**
 * GET /api/v1/tenants — List all tenants with pagination
 * Requires: Super Admin role
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const roles = (session as any).roles || [];
    if (!roles.includes("super_admin")) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Super admin access required" } },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "10");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const skip = (page - 1) * perPage;

    const where: any = { is_deleted: false };

    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: "insensitive" } },
        { tenant_code: { contains: search, mode: "insensitive" } },
        { primary_email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status) where.status = status;

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          plan: { select: { plan_name: true, plan_code: true } },
          _count: { select: { users: { where: { is_deleted: false } } } },
        },
        skip,
        take: perPage,
        orderBy: { created_at: "desc" },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      data: tenants,
      meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
    });
  } catch (error) {
    console.error("GET /api/v1/tenants error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch tenants" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/tenants — Create new tenant (public signup)
 * Creates a tenant and initial admin user.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // For public signup, we need additional user info
    const { tenant, user } = body;

    if (!tenant || !user) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Both tenant and user data are required" } },
        { status: 400 }
      );
    }

    // Validate tenant data
    const validated = createTenantSchema.safeParse(tenant);
    if (!validated.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: validated.error.errors[0]?.message || "Invalid tenant data",
            details: validated.error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Check for existing tenant code
    const existingTenant = await prisma.tenant.findUnique({
      where: { tenant_code: validated.data.tenant_code },
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "This tenant code is already taken" } },
        { status: 409 }
      );
    }

    // Check for existing user email
    const existingUser = await prisma.user.findFirst({
      where: { email: user.email.toLowerCase().trim(), is_deleted: false },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: { code: "CONFLICT", message: "An account with this email already exists" } },
        { status: 409 }
      );
    }

    const tenantAdminRole = await prisma.role.findFirst({
      where: { role_code: "tenant_admin", is_system: true },
    });

    const passwordHash = await hashPassword(user.password);
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          ...validated.data,
          status: "TRIAL",
          subscription_status: "TRIAL",
          trial_ends_at: trialEndsAt,
          tenant_settings: {
            timezone: "Asia/Kolkata",
            currency: "INR",
            date_format: "DD/MM/YYYY",
            language: "en",
          },
        },
      });

      const newUser = await tx.user.create({
        data: {
          tenant_id: newTenant.id,
          email: user.email.toLowerCase().trim(),
          password_hash: passwordHash,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone || null,
          status: "ACTIVE",
          email_verified: false,
          preferences: {
            theme: "light",
            language: "en",
            notifications: { email: true, sms: true, in_app: true },
          },
        },
      });

      if (tenantAdminRole) {
        await tx.userRole.create({
          data: { user_id: newUser.id, role_id: tenantAdminRole.id },
        });
      }

      return { tenant: newTenant, user: newUser };
    });

    return NextResponse.json(
      {
        data: {
          tenant: { id: result.tenant.id, tenant_code: result.tenant.tenant_code },
          user: { id: result.user.id, email: result.user.email },
        },
        message: "Tenant created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/v1/tenants error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to create tenant" } },
      { status: 500 }
    );
  }
}
