"use server";

// ==============================================================================
// Authentication Server Actions
// ==============================================================================
// Handles:
//   - User login (via NextAuth signIn)
//   - User registration (creates tenant + admin user)
//   - Password reset request
//   - Logout
//
// These are called from client components using React's useTransition or
// directly from form actions.
// ==============================================================================

import { signIn, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-utils";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { AuthError } from "next-auth";

/**
 * Server Action: Login with email and password
 *
 * @param formData - Contains email and password fields
 * @returns { success: boolean, error?: string }
 */
export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Validate input
    const validated = loginSchema.safeParse({ email, password });
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input",
      };
    }

    // Attempt sign in via NextAuth
    await signIn("credentials", {
      email: validated.data.email.toLowerCase().trim(),
      password: validated.data.password,
      redirect: false,
    });

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Invalid email or password" };
        default:
          return {
            success: false,
            error: error.message || "Authentication failed",
          };
      }
    }

    // Re-throw redirect errors (NextAuth internally throws these for redirects)
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    return { success: false, error: "An unexpected error occurred" };
  }
}

/**
 * Server Action: Register new user and tenant
 *
 * Creates:
 *   1. New tenant with trial subscription
 *   2. Admin user for the tenant
 *   3. Assigns tenant_admin role
 *
 * @param formData - Registration form data
 * @returns { success: boolean, error?: string }
 */
export async function registerAction(formData: FormData) {
  try {
    const rawData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: (formData.get("phone") as string) || undefined,
      password: formData.get("password") as string,
      confirm_password: formData.get("confirm_password") as string,
      company_name: formData.get("company_name") as string,
    };

    // Validate input
    const validated = registerSchema.safeParse(rawData);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input",
      };
    }

    const { first_name, last_name, email, phone, password, company_name } =
      validated.data;

    // Check if email already exists across all tenants
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase().trim(), is_deleted: false },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists",
      };
    }

    // Get the default trial plan (Starter)
    const starterPlan = await prisma.subscriptionPlan.findFirst({
      where: { plan_code: "starter", is_active: true },
    });

    if (!starterPlan) {
      return {
        success: false,
        error: "Registration is currently unavailable. Please try again later.",
      };
    }

    // Get the tenant_admin role for assignment
    const tenantAdminRole = await prisma.role.findFirst({
      where: { role_code: "tenant_admin", is_system: true },
    });

    if (!tenantAdminRole) {
      return {
        success: false,
        error: "System configuration error. Please contact support.",
      };
    }

    // Generate tenant code from company name
    const tenantCode = company_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 50);

    // Ensure tenant code is unique
    let finalTenantCode = tenantCode;
    let codeCounter = 0;
    while (
      await prisma.tenant.findUnique({
        where: { tenant_code: finalTenantCode },
      })
    ) {
      codeCounter++;
      finalTenantCode = `${tenantCode}-${codeCounter}`;
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Calculate trial end date (14 days from now — configurable in settings)
    const trialDays = 14;
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

    // Create tenant, user, and role assignment in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the tenant
      const tenant = await tx.tenant.create({
        data: {
          tenant_code: finalTenantCode,
          company_name,
          primary_email: email.toLowerCase().trim(),
          phone_number: phone || "",
          status: "TRIAL",
          plan_id: starterPlan.id,
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

      // 2. Create the admin user
      const user = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          password_hash: passwordHash,
          first_name,
          last_name,
          status: "ACTIVE",
          email_verified: false, // Will be verified via email confirmation
          preferences: {
            theme: "light",
            language: "en",
            notifications: { email: true, sms: true, in_app: true },
          },
        },
      });

      // 3. Assign tenant_admin role
      await tx.userRole.create({
        data: {
          user_id: user.id,
          role_id: tenantAdminRole.id,
        },
      });

      // 4. Create audit log entry for the registration
      await tx.auditLog.create({
        data: {
          tenant_id: tenant.id,
          user_id: user.id,
          action: "create",
          resource_type: "tenant",
          resource_id: tenant.id,
          new_values: {
            tenant_code: tenant.tenant_code,
            company_name: tenant.company_name,
            plan: starterPlan.plan_name,
          },
        },
      });

      return { tenant, user };
    });

    // Auto-login after successful registration
    await signIn("credentials", {
      email: email.toLowerCase().trim(),
      password,
      redirect: false,
    });

    return { success: true, tenantId: result.tenant.id };
  } catch (error) {
    console.error("Registration error:", error);

    // Re-throw redirect errors
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }

    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}

/**
 * Server Action: Logout
 * Invalidates the session and redirects to login page
 */
export async function logoutAction() {
  await signOut({ redirectTo: "/auth/auth1/login" });
}
