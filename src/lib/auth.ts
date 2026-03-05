// ==============================================================================
// NextAuth v5 — Full Configuration (Server-Only)
// ==============================================================================
// Combines the Edge-compatible auth config with database-dependent providers.
// This file imports Prisma and bcrypt, so it can ONLY run on the server
// (NOT in middleware/Edge runtime).
//
// Exports: handlers, signIn, signOut, auth
// ==============================================================================

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/lib/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  // ---------------------------------------------------------------------------
  // Authentication Providers (require server-side Prisma access)
  // ---------------------------------------------------------------------------
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email Address", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Validate that both email and password are provided
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter your email and password");
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        // Find user by email (across all tenants — email is unique per tenant)
        // We fetch the first matching user; in production, you'd also match tenant
        const user = await prisma.user.findFirst({
          where: {
            email: email.toLowerCase().trim(),
            is_deleted: false,
          },
          include: {
            tenant: true,
            user_roles: {
              include: {
                role: {
                  include: {
                    role_permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        // User not found
        if (!user) {
          throw new Error("Invalid email or password");
        }

        // Check if account is locked due to too many failed attempts
        if (user.locked_until && new Date(user.locked_until) > new Date()) {
          throw new Error(
            "Account is temporarily locked. Please try again later."
          );
        }

        // Check if account is suspended or inactive
        if (user.status === "SUSPENDED") {
          throw new Error(
            "Your account has been suspended. Contact your administrator."
          );
        }

        if (user.status === "INACTIVE") {
          throw new Error(
            "Your account is inactive. Contact your administrator."
          );
        }

        // Check if tenant is active
        if (
          user.tenant.status === "SUSPENDED" ||
          user.tenant.status === "CANCELLED"
        ) {
          throw new Error(
            "Your organization's account is not active. Contact support."
          );
        }

        // Verify password against bcrypt hash
        const isPasswordValid = await bcryptjs.compare(
          password,
          user.password_hash
        );

        if (!isPasswordValid) {
          // Increment failed login count
          const maxAttempts = 5; // TODO: Read from settings
          const newFailedCount = user.failed_login_count + 1;

          await prisma.user.update({
            where: { id: user.id },
            data: {
              failed_login_count: newFailedCount,
              // Lock account after max attempts (30 minute lockout)
              locked_until:
                newFailedCount >= maxAttempts
                  ? new Date(Date.now() + 30 * 60 * 1000)
                  : null,
            },
          });

          throw new Error("Invalid email or password");
        }

        // Successful login — reset failed count and update login tracking
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failed_login_count: 0,
            locked_until: null,
            last_login_at: new Date(),
            login_count: { increment: 1 },
          },
        });

        // Extract role codes and permissions for the session
        const roles = user.user_roles.map((ur) => ur.role.role_code);
        const permissions = user.user_roles.flatMap((ur) =>
          ur.role.role_permissions.map(
            (rp) => `${rp.permission.resource}:${rp.permission.action}`
          )
        );

        // Return user object — this becomes the `token` in JWT callback
        return {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`,
          image: user.avatar_url,
          tenantId: user.tenant_id,
          tenantCode: user.tenant.tenant_code,
          tenantName: user.tenant.company_name,
          roles,
          permissions: [...new Set(permissions)], // Deduplicate
          firstName: user.first_name,
          lastName: user.last_name,
          status: user.status,
        };
      },
    }),
  ],
});
