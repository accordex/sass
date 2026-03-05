// ==============================================================================
// NextAuth Configuration (Edge-Compatible — NO database imports)
// ==============================================================================
// This file contains the NextAuth configuration that CAN run in the Edge
// runtime (middleware). It must NOT import Prisma, bcrypt, or any Node.js-only
// modules. Database-dependent providers go in auth.ts instead.
//
// Pattern:
//   auth.config.ts  → lightweight config (sessions, callbacks, pages)
//   auth.ts         → full config with providers + Prisma (server-only)
//   middleware.ts   → imports only from auth.config.ts
// ==============================================================================

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  // ---------------------------------------------------------------------------
  // Session Strategy: JWT (stateless, no server-side session store needed)
  // ---------------------------------------------------------------------------
  session: {
    strategy: "jwt",
    maxAge: 60 * 60, // 1 hour — matches auth.session_timeout setting
  },

  // ---------------------------------------------------------------------------
  // Pages: Custom auth pages using existing UI template
  // ---------------------------------------------------------------------------
  pages: {
    signIn: "/auth/auth1/login",
    error: "/auth/error",
  },

  // ---------------------------------------------------------------------------
  // Callbacks: Enrich JWT and session with tenant/role data
  // ---------------------------------------------------------------------------
  callbacks: {
    /**
     * Middleware authorization check.
     * Runs on every request matched by the middleware config.
     * Returns true to allow access, false to redirect to signIn page.
     */
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/admin") ||
        nextUrl.pathname.startsWith("/dashboards") ||
        nextUrl.pathname.startsWith("/apps");

      if (isOnDashboard) {
        // Require authentication for dashboard/admin routes
        return isLoggedIn;
      }

      return true; // Allow public routes
    },

    /**
     * JWT callback — runs when token is created or refreshed.
     * We store tenant and role info in the JWT to avoid DB lookups on every request.
     */
    async jwt({ token, user }) {
      if (user) {
        // First login — add custom fields from authorize() response
        token.id = user.id;
        token.tenantId = (user as any).tenantId;
        token.tenantCode = (user as any).tenantCode;
        token.tenantName = (user as any).tenantName;
        token.roles = (user as any).roles;
        token.permissions = (user as any).permissions;
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.status = (user as any).status;
      }
      return token;
    },

    /**
     * Session callback — exposes JWT data to the client via useSession().
     * Only include what the frontend needs; keep sensitive data in JWT only.
     */
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session as any).tenantId = token.tenantId;
        (session as any).tenantCode = token.tenantCode;
        (session as any).tenantName = token.tenantName;
        (session as any).roles = token.roles;
        (session as any).permissions = token.permissions;
        (session as any).firstName = token.firstName;
        (session as any).lastName = token.lastName;
      }
      return session;
    },
  },

  // Providers are added in auth.ts (not here, to avoid Edge runtime issues)
  providers: [],
};
