"use server";

// ==============================================================================
// Audit Log Server Actions
// ==============================================================================
// Read-only access to the audit trail for compliance and monitoring.
//
// Available Actions:
//   - getAuditLogs: List audit entries with filtering
//   - getAuditLogById: Get details of a specific audit entry
//   - getResourceHistory: Get change history for a specific record
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";

/**
 * Get audit logs with pagination and filtering.
 * Tenant admins see their tenant's logs; super admins see all.
 *
 * @param page - Page number
 * @param perPage - Records per page
 * @param action - Filter by action type (create, update, delete, login)
 * @param resourceType - Filter by resource type (tenant, user, setting)
 * @param userId - Filter by user who performed the action
 * @param dateFrom - Start date for date range filter
 * @param dateTo - End date for date range filter
 */
export async function getAuditLogs({
  page = 1,
  perPage = 25,
  action = "",
  resourceType = "",
  userId = "",
  dateFrom = "",
  dateTo = "",
}: {
  page?: number;
  perPage?: number;
  action?: string;
  resourceType?: string;
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId };

  if (action) where.action = action;
  if (resourceType) where.resource_type = resourceType;
  if (userId) where.user_id = userId;

  if (dateFrom || dateTo) {
    where.created_at = {};
    if (dateFrom) where.created_at.gte = new Date(dateFrom);
    if (dateTo) where.created_at.lte = new Date(dateTo);
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            avatar_url: true,
          },
        },
      },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get the complete change history for a specific resource/record.
 * Useful for viewing all changes made to a particular lead, invoice, etc.
 *
 * @param resourceType - Entity type (e.g., "user", "tenant")
 * @param resourceId - UUID of the specific record
 */
export async function getResourceHistory(
  resourceType: string,
  resourceId: string
) {
  const session = await getCurrentUser();
  const tenantId = (session as any).tenantId;

  return prisma.auditLog.findMany({
    where: {
      tenant_id: tenantId,
      resource_type: resourceType,
      resource_id: resourceId,
    },
    include: {
      user: {
        select: { first_name: true, last_name: true, email: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
}
