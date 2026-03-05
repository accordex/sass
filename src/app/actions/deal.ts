"use server";

// ==============================================================================
// CRM Deal / Opportunity Management Server Actions
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { CreateDealSchema, UpdateDealSchema } from "@/lib/validations/deal";
import { revalidatePath } from "next/cache";

/**
 * List deals with pagination, search, and filtering.
 */
export async function getDeals({
  page = 1,
  perPage = 10,
  search = "",
  pipeline_id = "",
  stage_id = "",
  owner_id = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  pipeline_id?: string;
  stage_id?: string;
  owner_id?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = {
    tenant_id: tenantId,
    is_deleted: false,
  };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { deal_number: { contains: search, mode: "insensitive" } },
    ];
  }

  if (pipeline_id) where.pipeline_id = pipeline_id;
  if (stage_id) where.stage_id = stage_id;
  if (owner_id) where.owner_id = owner_id;

  const [deals, total] = await Promise.all([
    prisma.deal.findMany({
      where,
      include: {
        customer: {
          select: { id: true, company_name: true, customer_code: true },
        },
        pipeline: { select: { id: true, name: true } },
        stage: { select: { id: true, name: true, color: true, win_probability: true } },
        owner: {
          select: { id: true, first_name: true, last_name: true },
        },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.deal.count({ where }),
  ]);

  return {
    data: deals,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get a single deal by ID with full details.
 */
export async function getDealById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const deal = await prisma.deal.findFirst({
    where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    include: {
      customer: true,
      pipeline: { include: { stages: { orderBy: { sort_order: "asc" } } } },
      stage: true,
      owner: { select: { id: true, first_name: true, last_name: true, email: true } },
    },
  });

  if (!deal) return { error: "Deal not found" };
  return { data: deal };
}

/**
 * Create a new deal.
 */
export async function createDeal(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateDealSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const tenantId = (user as any).tenantId;

    // Auto-generate deal number
    const count = await prisma.deal.count({ where: { tenant_id: tenantId } });
    const year = new Date().getFullYear();
    const dealNumber = `DEAL-${year}-${String(count + 1).padStart(4, "0")}`;

    const deal = await prisma.deal.create({
      data: {
        tenant_id: tenantId,
        deal_number: dealNumber,
        ...parsed.data,
        expected_close: parsed.data.expected_close
          ? new Date(parsed.data.expected_close)
          : null,
      },
    });

    revalidatePath("/crm/deals");
    return { data: deal, success: true };
  } catch (error: any) {
    console.error("Create deal error:", error);
    return { error: error.message || "Failed to create deal" };
  }
}

/**
 * Update an existing deal.
 */
export async function updateDeal(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateDealSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;

  try {
    const existing = await prisma.deal.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Deal not found" };

    const deal = await prisma.deal.update({
      where: { id },
      data: {
        ...data,
        expected_close: data.expected_close
          ? new Date(data.expected_close)
          : undefined,
        actual_close: data.actual_close
          ? new Date(data.actual_close)
          : undefined,
      },
    });

    revalidatePath("/crm/deals");
    return { data: deal, success: true };
  } catch (error: any) {
    console.error("Update deal error:", error);
    return { error: error.message || "Failed to update deal" };
  }
}

/**
 * Soft-delete a deal.
 */
export async function deleteDeal(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const existing = await prisma.deal.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Deal not found" };

    await prisma.deal.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    revalidatePath("/crm/deals");
    return { success: true };
  } catch (error: any) {
    console.error("Delete deal error:", error);
    return { error: error.message || "Failed to delete deal" };
  }
}

/**
 * Get pipelines with stages for the current tenant.
 */
export async function getPipelines() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const pipelines = await prisma.pipeline.findMany({
    where: { tenant_id: (user as any).tenantId, is_active: true },
    include: {
      stages: { orderBy: { sort_order: "asc" } },
      _count: { select: { deals: true } },
    },
    orderBy: { created_at: "asc" },
  });

  return { data: pipelines };
}

/**
 * Get deal statistics for the dashboard.
 */
export async function getDealStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const where = { tenant_id: tenantId, is_deleted: false };

  const [totalDeals, openDeals, wonDeals, lostDeals] = await Promise.all([
    prisma.deal.count({ where }),
    prisma.deal.count({
      where: {
        ...where,
        stage: { name: { notIn: ["Closed Won", "Closed Lost"] } },
      },
    }),
    prisma.deal.count({
      where: {
        ...where,
        stage: { name: "Closed Won" },
      },
    }),
    prisma.deal.count({
      where: {
        ...where,
        stage: { name: "Closed Lost" },
      },
    }),
  ]);

  // Calculate pipeline value (sum of open deals)
  const pipelineValue = await prisma.deal.aggregate({
    where: {
      ...where,
      stage: { name: { notIn: ["Closed Won", "Closed Lost"] } },
    },
    _sum: { deal_value: true },
  });

  // Calculate won value
  const wonValue = await prisma.deal.aggregate({
    where: {
      ...where,
      stage: { name: "Closed Won" },
    },
    _sum: { deal_value: true },
  });

  return {
    data: {
      totalDeals,
      openDeals,
      wonDeals,
      lostDeals,
      pipelineValue: pipelineValue._sum.deal_value || 0,
      wonValue: wonValue._sum.deal_value || 0,
      winRate: totalDeals > 0
        ? Math.round((wonDeals / (wonDeals + lostDeals || 1)) * 100)
        : 0,
    },
  };
}
