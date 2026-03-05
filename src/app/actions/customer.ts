"use server";

// ==============================================================================
// CRM Customer (Account) Management Server Actions
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { CreateCustomerSchema, UpdateCustomerSchema } from "@/lib/validations/customer";
import { revalidatePath } from "next/cache";

/**
 * List customers with pagination, search, and filtering.
 */
export async function getCustomers({
  page = 1,
  perPage = 10,
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
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
      { company_name: { contains: search, mode: "insensitive" } },
      { customer_code: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { gstin: { contains: search, mode: "insensitive" } },
    ];
  }

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      include: {
        _count: {
          select: { contacts: true, sales_invoices: true, deals: true },
        },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.customer.count({ where }),
  ]);

  return {
    data: customers,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get a single customer by ID with related data.
 */
export async function getCustomerById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const customer = await prisma.customer.findFirst({
    where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    include: {
      contacts: { where: { is_deleted: false }, orderBy: { is_primary: "desc" } },
      deals: { where: { is_deleted: false }, orderBy: { created_at: "desc" }, take: 10 },
      sales_invoices: { where: { is_deleted: false }, orderBy: { invoice_date: "desc" }, take: 10 },
      _count: {
        select: { contacts: true, sales_invoices: true, deals: true, payment_receipts: true },
      },
    },
  });

  if (!customer) return { error: "Customer not found" };
  return { data: customer };
}

/**
 * Create a new customer.
 */
export async function createCustomer(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        tenant_id: (user as any).tenantId,
        ...parsed.data,
        billing_address: parsed.data.billing_address as any,
        shipping_address: parsed.data.shipping_address as any,
      },
    });

    revalidatePath("/crm/customers");
    return { data: customer, success: true };
  } catch (error: any) {
    if (error.code === "P2002") {
      return { error: "A customer with this code already exists" };
    }
    console.error("Create customer error:", error);
    return { error: error.message || "Failed to create customer" };
  }
}

/**
 * Update an existing customer.
 */
export async function updateCustomer(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateCustomerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;

  try {
    const existing = await prisma.customer.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Customer not found" };

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        ...data,
        billing_address: data.billing_address as any,
        shipping_address: data.shipping_address as any,
      },
    });

    revalidatePath("/crm/customers");
    return { data: customer, success: true };
  } catch (error: any) {
    console.error("Update customer error:", error);
    return { error: error.message || "Failed to update customer" };
  }
}

/**
 * Soft-delete a customer.
 */
export async function deleteCustomer(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const existing = await prisma.customer.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Customer not found" };

    // Check for unpaid invoices
    const unpaidInvoices = await prisma.salesInvoice.count({
      where: {
        customer_id: id,
        is_deleted: false,
        status: { in: ["SENT", "PARTIALLY_PAID", "OVERDUE"] },
      },
    });

    if (unpaidInvoices > 0) {
      return { error: `Cannot delete customer with ${unpaidInvoices} unpaid invoice(s)` };
    }

    await prisma.customer.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date(), is_active: false },
    });

    revalidatePath("/crm/customers");
    return { success: true };
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return { error: error.message || "Failed to delete customer" };
  }
}

/**
 * Get customer statistics for the dashboard.
 */
export async function getCustomerStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const where = { tenant_id: tenantId, is_deleted: false };

  const [totalCustomers, activeCustomers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.count({ where: { ...where, is_active: true } }),
  ]);

  return {
    data: { totalCustomers, activeCustomers },
  };
}
