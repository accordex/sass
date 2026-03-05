"use client";

// ==============================================================================
// NextAuth Session Provider Wrapper
// ==============================================================================
// Wraps the application with NextAuth's SessionProvider to make
// session data available throughout the client-side via useSession().
//
// This must wrap all components that need access to authentication state.
// ==============================================================================

import { SessionProvider } from "next-auth/react";
import React from "react";

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
