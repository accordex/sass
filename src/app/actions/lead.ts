"use server";

// ==============================================================================
// CRM Lead Management Server Actions
// ==============================================================================
// CRUD operations for sales leads with search, pagination, and filtering.
// Leads are scoped by tenant_id for multi-tenant isolation.
//
// Available Actions:
//   - getLeads: List leads with pagination/filtering
//   - getLeadById: Get single lead details
//   - createLead: Create a new lead
//   - updateLead: Update lead details
//   - deleteLead: Soft-delete a lead
//   - convertLead: Convert lead to contact/customer
//   - getLeadStats: Dashboard statistics
//   - createLeadActivity: Log an activity on a lead
//   - getLeadActivities: Get activities for a lead
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { CreateLeadSchema, UpdateLeadSchema, LeadActivitySchema } from "@/lib/validations/lead";
import { revalidatePath } from "next/cache";

/**
 * List leads with pagination, search, and filtering.
 * Scoped to the current user's tenant.
 */
export async function getLeads({
  page = 1,
  perPage = 10,
  search = "",
  status = "",
  source = "",
  owner_id = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  source?: string;
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
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { company_name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status) where.status = status;
  if (source) where.source = source;
  if (owner_id) where.owner_id = owner_id;

  const [leads, total] = await Promise.all([
    prisma.lead.findMany({
      where,
      include: {
        owner: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.lead.count({ where }),
  ]);

  return {
    data: leads,
    meta: {
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

/**
 * Get a single lead by ID with all details and activities.
 */
export async function getLeadById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const lead = await prisma.lead.findFirst({
    where: {
      id,
      tenant_id: (user as any).tenantId,
      is_deleted: false,
    },
    include: {
      owner: {
        select: { id: true, first_name: true, last_name: true, email: true },
      },
      contact: true,
      activities: {
        include: {
          performer: {
            select: { id: true, first_name: true, last_name: true },
          },
        },
        orderBy: { activity_date: "desc" },
        take: 20,
      },
    },
  });

  if (!lead) return { error: "Lead not found" };
  return { data: lead };
}

/**
 * Create a new lead.
 */
export async function createLead(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const lead = await prisma.lead.create({
      data: {
        tenant_id: (user as any).tenantId,
        ...parsed.data,
        next_follow_up: parsed.data.next_follow_up
          ? new Date(parsed.data.next_follow_up)
          : null,
      },
    });

    revalidatePath("/crm/leads");
    return { data: lead, success: true };
  } catch (error: any) {
    console.error("Create lead error:", error);
    return { error: error.message || "Failed to create lead" };
  }
}

/**
 * Update an existing lead.
 */
export async function updateLead(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;

  try {
    // Verify lead belongs to the tenant
    const existing = await prisma.lead.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });

    if (!existing) return { error: "Lead not found" };

    const lead = await prisma.lead.update({
      where: { id },
      data: {
        ...data,
        next_follow_up: data.next_follow_up
          ? new Date(data.next_follow_up)
          : undefined,
      },
    });

    revalidatePath("/crm/leads");
    return { data: lead, success: true };
  } catch (error: any) {
    console.error("Update lead error:", error);
    return { error: error.message || "Failed to update lead" };
  }
}

/**
 * Soft-delete a lead.
 */
export async function deleteLead(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const existing = await prisma.lead.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });

    if (!existing) return { error: "Lead not found" };

    await prisma.lead.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    revalidatePath("/crm/leads");
    return { success: true };
  } catch (error: any) {
    console.error("Delete lead error:", error);
    return { error: error.message || "Failed to delete lead" };
  }
}

/**
 * Convert a lead to a contact (and optionally a customer).
 * Creates a Contact record and links it to the lead.
 */
export async function convertLead(leadId: string, createCustomer: boolean = false) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        tenant_id: (user as any).tenantId,
        is_deleted: false,
        is_converted: false,
      },
    });

    if (!lead) return { error: "Lead not found or already converted" };

    const tenantId = (user as any).tenantId;

    // Use a transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      let customerId: string | null = null;

      // Optionally create a customer
      if (createCustomer && lead.company_name) {
        // Generate a customer code
        const count = await tx.customer.count({ where: { tenant_id: tenantId } });
        const customerCode = `CUST-${String(count + 1).padStart(4, "0")}`;

        const customer = await tx.customer.create({
          data: {
            tenant_id: tenantId,
            customer_code: customerCode,
            company_name: lead.company_name,
            email: lead.email,
            phone: lead.phone,
          },
        });
        customerId = customer.id;
      }

      // Create the contact
      const contact = await tx.contact.create({
        data: {
          tenant_id: tenantId,
          customer_id: customerId,
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          job_title: lead.job_title,
          is_primary: true,
          tags: lead.tags as any,
        },
      });

      // Update the lead
      await tx.lead.update({
        where: { id: leadId },
        data: {
          is_converted: true,
          converted_at: new Date(),
          status: "CONVERTED",
          contact_id: contact.id,
        },
      });

      return { contact, customerId };
    });

    revalidatePath("/crm/leads");
    revalidatePath("/crm/contacts");
    revalidatePath("/crm/customers");
    return { data: result, success: true };
  } catch (error: any) {
    console.error("Convert lead error:", error);
    return { error: error.message || "Failed to convert lead" };
  }
}

/**
 * Log an activity on a lead (call, email, meeting, note, etc.)
 */
export async function createLeadActivity(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = LeadActivitySchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const activity = await prisma.leadActivity.create({
      data: {
        ...parsed.data,
        performed_by: (user as any).id!,
        activity_date: parsed.data.activity_date
          ? new Date(parsed.data.activity_date)
          : new Date(),
      },
    });

    // Update lead's last_activity_at
    await prisma.lead.update({
      where: { id: parsed.data.lead_id },
      data: { last_activity_at: new Date() },
    });

    revalidatePath(`/crm/leads/${parsed.data.lead_id}`);
    return { data: activity, success: true };
  } catch (error: any) {
    console.error("Create lead activity error:", error);
    return { error: error.message || "Failed to log activity" };
  }
}

/**
 * Get activities for a specific lead.
 */
export async function getLeadActivities(leadId: string, page = 1, perPage = 20) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const skip = (page - 1) * perPage;

  const [activities, total] = await Promise.all([
    prisma.leadActivity.findMany({
      where: { lead_id: leadId },
      include: {
        performer: {
          select: { id: true, first_name: true, last_name: true },
        },
      },
      skip,
      take: perPage,
      orderBy: { activity_date: "desc" },
    }),
    prisma.leadActivity.count({ where: { lead_id: leadId } }),
  ]);

  return {
    data: activities,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get lead statistics for the dashboard.
 */
export async function getLeadStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const tenantId = (user as any).tenantId;
  const where = { tenant_id: tenantId, is_deleted: false };

  const [
    totalLeads,
    newLeads,
    qualifiedLeads,
    convertedLeads,
    lostLeads,
  ] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { ...where, status: "NEW" } }),
    prisma.lead.count({ where: { ...where, status: "QUALIFIED" } }),
    prisma.lead.count({ where: { ...where, is_converted: true } }),
    prisma.lead.count({ where: { ...where, status: "LOST" } }),
  ]);

  return {
    data: {
      totalLeads,
      newLeads,
      qualifiedLeads,
      convertedLeads,
      lostLeads,
      conversionRate: totalLeads > 0
        ? Math.round((convertedLeads / totalLeads) * 100)
        : 0,
    },
  };
}
