// ==============================================================================
// Next.js Middleware — Route Protection (Edge-Compatible)
// ==============================================================================
// This middleware runs on the Edge runtime before every matched request.
// It uses the LIGHTWEIGHT auth config (auth.config.ts) — no Prisma or Node.js
// dependencies. The `authorized` callback in auth.config.ts handles the logic.
//
// IMPORTANT: Do NOT import from "@/lib/auth" here — that file imports Prisma
// which uses Node.js modules (node:crypto, etc.) incompatible with Edge runtime.
//
// Future enhancements (later phases):
//   - Rate limiting per endpoint
//   - Tenant subdomain detection
//   - IP whitelisting for admin routes
// ==============================================================================

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Create a middleware-safe auth handler using the lightweight config
export default NextAuth(authConfig).auth;

// ---------------------------------------------------------------------------
// Matcher Configuration
// ---------------------------------------------------------------------------
// Run middleware on all routes except static files and Next.js internals
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     * - auth (auth pages — handled by the authorized callback)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api/auth).*)",
  ],
};
