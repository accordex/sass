// ==============================================================================
// Authentication Utility Functions
// ==============================================================================
// Helper functions for:
//   - Getting the current authenticated session (server-side)
//   - Checking permissions
//   - Password hashing
//   - Tenant context extraction
//
// Usage:
//   import { getCurrentUser, hasPermission, hashPassword } from "@/lib/auth-utils";
// ==============================================================================

import { auth } from "@/lib/auth";
import bcryptjs from "bcryptjs";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user session.
 * Use in Server Components and Server Actions.
 *
 * @returns Session object with user, tenant, roles, and permissions
 * @throws Redirects to login page if not authenticated
 */
export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/auth1/login");
  }

  return session;
}

/**
 * Get the current session without redirecting.
 * Useful when you need to check auth status without forcing a redirect.
 *
 * @returns Session object or null if not authenticated
 */
export async function getOptionalUser() {
  const session = await auth();
  return session;
}

/**
 * Check if the current user has a specific permission.
 *
 * @param permission - Permission string in "resource:action" format (e.g., "leads:create")
 * @returns true if the user has the permission
 *
 * @example
 * if (await hasPermission("leads:create")) {
 *   // User can create leads
 * }
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const session = await auth();

  if (!session?.permissions) return false;

  // Super admins have all permissions
  if ((session as any).roles?.includes("super_admin")) return true;

  return (session as any).permissions.includes(permission);
}

/**
 * Check if the current user has any of the specified roles.
 *
 * @param roles - Array of role codes to check against
 * @returns true if the user has at least one of the specified roles
 *
 * @example
 * if (await hasRole(["tenant_admin", "super_admin"])) {
 *   // User is an admin
 * }
 */
export async function hasRole(roles: string[]): Promise<boolean> {
  const session = await auth();

  if (!(session as any)?.roles) return false;

  return (session as any).roles.some((role: string) => roles.includes(role));
}

/**
 * Require specific roles — redirects to unauthorized page if not met.
 * Use at the top of Server Components or Server Actions.
 *
 * @param roles - Array of required role codes
 *
 * @example
 * // In a Server Component:
 * await requireRole(["tenant_admin", "super_admin"]);
 */
export async function requireRole(roles: string[]) {
  const session = await getCurrentUser();

  const userRoles = (session as any).roles || [];
  const hasRequiredRole = userRoles.some((role: string) =>
    roles.includes(role)
  );

  if (!hasRequiredRole) {
    redirect("/auth/error?error=AccessDenied");
  }

  return session;
}

/**
 * Hash a plain-text password using bcrypt.
 * Uses 12 salt rounds (recommended for production).
 *
 * @param password - Plain text password
 * @returns Bcrypt hash string
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcryptjs.hash(password, saltRounds);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 *
 * @param password - Plain text password to verify
 * @param hash - Bcrypt hash to compare against
 * @returns true if the password matches
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

/**
 * Get the current user's tenant ID from the session.
 * Useful for scoping database queries to the current tenant.
 *
 * @returns Tenant UUID string
 * @throws Redirects to login if not authenticated
 */
export async function getTenantId(): Promise<string> {
  const session = await getCurrentUser();
  return (session as any).tenantId;
}
