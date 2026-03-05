"use server";

// ==============================================================================
// Subscription & Billing Server Actions
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth-utils";
import { CreateSubscriptionSchema, UpdateSubscriptionSchema } from "@/lib/validations/billing";
import { revalidatePath } from "next/cache";

/**
 * Get the current tenant's active subscription.
 */
export async function getCurrentSubscription() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const subscription = await prisma.subscription.findFirst({
    where: {
      tenant_id: (user as any).tenantId,
      status: { in: ["ACTIVE", "TRIAL"] },
    },
    include: {
      plan: true,
      discount: true,
      payment_method: true,
    },
    orderBy: { created_at: "desc" },
  });

  return { data: subscription };
}

/**
 * List all subscriptions (Super Admin only).
 */
export async function getAllSubscriptions({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}) {
  await requireRole(["super_admin"]);

  const skip = (page - 1) * perPage;
  const where: any = {};

  if (status) where.status = status;
  if (search) {
    where.tenant = {
      OR: [
        { company_name: { contains: search, mode: "insensitive" } },
        { tenant_code: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [subscriptions, total] = await Promise.all([
    prisma.subscription.findMany({
      where,
      include: {
        tenant: { select: { id: true, company_name: true, tenant_code: true } },
        plan: { select: { id: true, plan_name: true, plan_code: true } },
      },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.subscription.count({ where }),
  ]);

  return {
    data: subscriptions,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Create a new subscription for a tenant.
 */
export async function createSubscription(tenantId: string, input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateSubscriptionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: parsed.data.plan_id },
    });
    if (!plan) return { error: "Selected plan not found" };

    const now = new Date();
    let periodEnd = new Date(now);

    // Calculate period based on billing cycle
    switch (parsed.data.billing_cycle) {
      case "MONTHLY":
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        break;
      case "QUARTERLY":
        periodEnd.setMonth(periodEnd.getMonth() + 3);
        break;
      case "YEARLY":
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
        break;
    }

    const subscription = await prisma.subscription.create({
      data: {
        tenant_id: tenantId,
        plan_id: parsed.data.plan_id,
        status: "ACTIVE",
        billing_cycle: parsed.data.billing_cycle,
        current_period_start: now,
        current_period_end: periodEnd,
        quantity: parsed.data.quantity,
        discount_id: parsed.data.discount_id,
        payment_method_id: parsed.data.payment_method_id,
        next_invoice_at: periodEnd,
      },
    });

    // Update tenant's subscription status
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        subscription_status: "ACTIVE",
        plan_id: parsed.data.plan_id,
      },
    });

    revalidatePath("/billing/subscriptions");
    return { data: subscription, success: true };
  } catch (error: any) {
    console.error("Create subscription error:", error);
    return { error: error.message || "Failed to create subscription" };
  }
}

/**
 * Cancel a subscription.
 */
export async function cancelSubscription(subscriptionId: string, immediate = false) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, tenant_id: (user as any).tenantId },
    });
    if (!subscription) return { error: "Subscription not found" };

    if (immediate) {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "CANCELLED",
          cancelled_at: new Date(),
        },
      });

      await prisma.tenant.update({
        where: { id: subscription.tenant_id },
        data: { subscription_status: "CANCELLED" },
      });
    } else {
      await prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          cancel_at_period_end: true,
          cancelled_at: new Date(),
        },
      });
    }

    revalidatePath("/billing/subscriptions");
    return { success: true };
  } catch (error: any) {
    console.error("Cancel subscription error:", error);
    return { error: error.message || "Failed to cancel subscription" };
  }
}

/**
 * List platform invoices for the current tenant.
 */
export async function getPlatformInvoices({
  page = 1,
  perPage = 10,
  status = "",
  search = "",
}: {
  page?: number;
  perPage?: number;
  status?: string;
  search?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const skip = (page - 1) * perPage;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { invoice_number: { contains: search, mode: "insensitive" } },
    ];
  }

  const [invoices, total] = await Promise.all([
    prisma.platformInvoice.findMany({
      where,
      include: {
        subscription: { include: { plan: { select: { plan_name: true } } } },
        _count: { select: { items: true, payments: true } },
      },
      skip,
      take: perPage,
      orderBy: { created_at: "desc" },
    }),
    prisma.platformInvoice.count({ where }),
  ]);

  return {
    data: invoices,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get billing statistics.
 */
export async function getBillingStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;

  const [subscription, pendingInvoices, totalPaid] = await Promise.all([
    prisma.subscription.findFirst({
      where: { tenant_id: tenantId, status: { in: ["ACTIVE", "TRIAL"] } },
      include: { plan: true },
    }),
    prisma.platformInvoice.aggregate({
      where: { tenant_id: tenantId, status: { in: ["ISSUED", "OVERDUE"] } },
      _sum: { amount_due: true },
      _count: true,
    }),
    prisma.platformInvoice.aggregate({
      where: { tenant_id: tenantId, status: "PAID" },
      _sum: { total_amount: true },
    }),
  ]);

  return {
    data: {
      currentPlan: subscription?.plan?.plan_name || "No Plan",
      subscriptionStatus: subscription?.status || "NONE",
      billingCycle: subscription?.billing_cycle || "NONE",
      periodEnd: subscription?.current_period_end,
      pendingAmount: pendingInvoices._sum.amount_due || 0,
      pendingCount: pendingInvoices._count || 0,
      totalPaid: totalPaid._sum.total_amount || 0,
    },
  };
}
