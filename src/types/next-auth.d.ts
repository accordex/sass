// ==============================================================================
// NextAuth Type Extensions
// ==============================================================================
// Extends the default NextAuth types to include our custom fields:
//   - tenantId, tenantCode, tenantName (multi-tenant context)
//   - roles, permissions (RBAC)
//   - firstName, lastName (user profile)
//
// These fields are available in:
//   - Server: const session = await auth()
//   - Client: const { data: session } = useSession()
// ==============================================================================

import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    tenantId: string;
    tenantCode: string;
    tenantName: string;
    roles: string[];
    permissions: string[];
    firstName: string;
    lastName: string;
  }

  interface User extends DefaultUser {
    tenantId?: string;
    tenantCode?: string;
    tenantName?: string;
    roles?: string[];
    permissions?: string[];
    firstName?: string;
    lastName?: string;
    status?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    tenantId?: string;
    tenantCode?: string;
    tenantName?: string;
    roles?: string[];
    permissions?: string[];
    firstName?: string;
    lastName?: string;
    status?: string;
  }
}
