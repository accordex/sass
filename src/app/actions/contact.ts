"use server";

// ==============================================================================
// CRM Contact Management Server Actions
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { CreateContactSchema, UpdateContactSchema } from "@/lib/validations/contact";
import { revalidatePath } from "next/cache";

/**
 * List contacts with pagination, search, and filtering.
 */
export async function getContacts({
  page = 1,
  perPage = 10,
  search = "",
  customer_id = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: {
  page?: number;
  perPage?: number;
  search?: string;
  customer_id?: string;
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
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  if (customer_id) where.customer_id = customer_id;

  const [contacts, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      include: {
        customer: {
          select: { id: true, company_name: true, customer_code: true },
        },
      },
      skip,
      take: perPage,
      orderBy: { [sortBy]: sortOrder },
    }),
    prisma.contact.count({ where }),
  ]);

  return {
    data: contacts,
    meta: { total, page, perPage, totalPages: Math.ceil(total / perPage) },
  };
}

/**
 * Get a single contact by ID.
 */
export async function getContactById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const contact = await prisma.contact.findFirst({
    where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    include: {
      customer: true,
      leads: {
        select: { id: true, first_name: true, last_name: true, status: true },
      },
    },
  });

  if (!contact) return { error: "Contact not found" };
  return { data: contact };
}

/**
 * Create a new contact.
 */
export async function createContact(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateContactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  try {
    const contact = await prisma.contact.create({
      data: {
        tenant_id: (user as any).tenantId,
        ...parsed.data,
      },
    });

    revalidatePath("/crm/contacts");
    return { data: contact, success: true };
  } catch (error: any) {
    console.error("Create contact error:", error);
    return { error: error.message || "Failed to create contact" };
  }
}

/**
 * Update an existing contact.
 */
export async function updateContact(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateContactSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };
  }

  const { id, ...data } = parsed.data;

  try {
    const existing = await prisma.contact.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Contact not found" };

    const contact = await prisma.contact.update({
      where: { id },
      data,
    });

    revalidatePath("/crm/contacts");
    return { data: contact, success: true };
  } catch (error: any) {
    console.error("Update contact error:", error);
    return { error: error.message || "Failed to update contact" };
  }
}

/**
 * Soft-delete a contact.
 */
export async function deleteContact(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    const existing = await prisma.contact.findFirst({
      where: { id, tenant_id: (user as any).tenantId, is_deleted: false },
    });
    if (!existing) return { error: "Contact not found" };

    await prisma.contact.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });

    revalidatePath("/crm/contacts");
    return { success: true };
  } catch (error: any) {
    console.error("Delete contact error:", error);
    return { error: error.message || "Failed to delete contact" };
  }
}
