// ==============================================================================
// NextAuth API Route Handler
// ==============================================================================
// Handles all /api/auth/* routes:
//   - /api/auth/signin
//   - /api/auth/signout
//   - /api/auth/session
//   - /api/auth/csrf
//   - /api/auth/callback/credentials
//
// This file simply re-exports the handlers from our auth configuration.
// All authentication logic is in src/lib/auth.ts
// ==============================================================================

import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
