// ==============================================================================
// Prisma Client Singleton (Prisma v7 — Adapter-based)
// ==============================================================================
// Creates a single shared Prisma Client instance to avoid connection pool
// exhaustion during development (Next.js hot reload creates new instances).
// In production, a single instance is used naturally.
//
// Prisma v7 requires passing a database adapter to the PrismaClient constructor
// instead of using `url` in the schema.prisma datasource block.
// ==============================================================================

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Extend the global object to hold the Prisma client during development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Create a new PrismaClient with the PostgreSQL adapter.
 * In Prisma v7, the connection URL is passed via the adapter, not the schema.
 */
function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is not set. " +
      "Please configure it in your .env file."
    );
  }

  // Create the PostgreSQL adapter with the connection string
  // PrismaPg expects a config object, not a raw URL string
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  }) as unknown as PrismaClient;
}

/**
 * Shared Prisma Client instance.
 * - In development: reuses the instance across hot reloads
 * - In production: creates a single instance
 *
 * Usage: import { prisma } from "@/lib/prisma";
 */
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
