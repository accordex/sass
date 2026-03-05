"use server";

// ==============================================================================
// Partner Program & Marketplace Server Actions — Phase 6
// ==============================================================================
// CRUD for: Partners, Commissions, Payouts, MDF Requests,
//           Marketplace Listings, Marketplace Reviews
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  CreatePartnerSchema, UpdatePartnerSchema,
  CreateCommissionSchema, UpdateCommissionSchema,
  CreatePayoutSchema, UpdatePayoutSchema,
  CreateMdfRequestSchema, UpdateMdfRequestSchema,
  CreateListingSchema, UpdateListingSchema,
  CreateReviewSchema, UpdateReviewSchema,
} from "@/lib/validations/partner";
import {
  PartnerStatus, PartnerType, PartnerTier,
  CommissionStatus, PayoutStatus, MdfStatus,
  ListingStatus, ListingType, ModerationStatus,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

// ==============================================================================
// HELPER: Generate sequential reference codes
// ==============================================================================
async function generateCode(
  tenantId: string,
  prefix: string,
  model: "partner" | "commission" | "partnerPayout" | "mdfRequest"
): Promise<string> {
  const year = new Date().getFullYear();
  const pattern = `${prefix}-${year}-`;

  let count = 0;
  if (model === "partner") {
    count = await prisma.partner.count({
      where: { tenant_id: tenantId, partner_code: { startsWith: pattern } },
    });
  } else if (model === "commission") {
    count = await prisma.commission.count({
      where: { tenant_id: tenantId, commission_no: { startsWith: pattern } },
    });
  } else if (model === "partnerPayout") {
    count = await prisma.partnerPayout.count({
      where: { tenant_id: tenantId, payout_no: { startsWith: pattern } },
    });
  } else if (model === "mdfRequest") {
    count = await prisma.mdfRequest.count({
      where: { tenant_id: tenantId, request_no: { startsWith: pattern } },
    });
  }

  return `${pattern}${String(count + 1).padStart(4, "0")}`;
}

// ==============================================================================
// PARTNER ACTIONS
// ==============================================================================

export async function getPartners({
  page = 1,
  perPage = 20,
  search = "",
  status,
  partner_type,
  tier,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  partner_type?: string;
  tier?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, is_deleted: false };
  if (status) where.status = status as PartnerStatus;
  if (partner_type) where.partner_type = partner_type as PartnerType;
  if (tier) where.tier = tier as PartnerTier;
  if (search) {
    where.OR = [
      { company_name: { contains: search, mode: "insensitive" } },
      { contact_name: { contains: search, mode: "insensitive" } },
      { contact_email: { contains: search, mode: "insensitive" } },
      { partner_code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        partner_manager: { select: { id: true, first_name: true, last_name: true } },
        _count: { select: { commissions: true, payouts: true, mdf_requests: true } },
      },
    }),
    prisma.partner.count({ where }),
  ]);

  return { partners, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getPartnerById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const partner = await prisma.partner.findFirst({
    where: { id, tenant_id: tenantId, is_deleted: false },
    include: {
      partner_manager: { select: { id: true, first_name: true, last_name: true } },
      _count: { select: { commissions: true, payouts: true, mdf_requests: true, marketplace_listings: true } },
    },
  });
  if (!partner) return { error: "Partner not found" };
  return { partner };
}

export async function createPartner(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreatePartnerSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const partnerCode = await generateCode(tenantId, "PTR", "partner");
    const { partner_manager_id, agreement_signed_at, website, ...rest } = parsed.data;

    const partner = await prisma.partner.create({
      data: {
        tenant_id: tenantId,
        partner_code: partnerCode,
        ...rest,
        website: website || null,
        partner_manager_id: partner_manager_id || null,
        agreement_signed_at: agreement_signed_at ? new Date(agreement_signed_at) : null,
      },
    });
    revalidatePath("/partners");
    return { partner };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A partner with this email already exists" };
    return { error: "Failed to create partner" };
  }
}

export async function updatePartner(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdatePartnerSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { partner_manager_id, agreement_signed_at, website, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (partner_manager_id !== undefined) updateData.partner_manager_id = partner_manager_id || null;
    if (agreement_signed_at !== undefined) updateData.agreement_signed_at = agreement_signed_at ? new Date(agreement_signed_at) : null;
    if (website !== undefined) updateData.website = website || null;

    const partner = await prisma.partner.update({
      where: { id, tenant_id: tenantId },
      data: updateData,
    });
    revalidatePath("/partners");
    return { partner };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A partner with this email already exists" };
    return { error: "Failed to update partner" };
  }
}

export async function deletePartner(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    await prisma.partner.update({
      where: { id, tenant_id: tenantId },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    revalidatePath("/partners");
    return { success: true };
  } catch {
    return { error: "Failed to delete partner" };
  }
}

// ==============================================================================
// COMMISSION ACTIONS
// ==============================================================================

export async function getCommissions({
  page = 1,
  perPage = 20,
  search = "",
  status,
  partner_id,
  commission_type,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  partner_id?: string;
  commission_type?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status as CommissionStatus;
  if (partner_id) where.partner_id = partner_id;
  if (commission_type) where.commission_type = commission_type;
  if (search) {
    where.OR = [
      { commission_no: { contains: search, mode: "insensitive" } },
      { deal_reference: { contains: search, mode: "insensitive" } },
      { partner: { company_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [commissions, total] = await Promise.all([
    prisma.commission.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        partner: { select: { id: true, company_name: true, partner_code: true, tier: true } },
        payout: { select: { id: true, payout_no: true, status: true } },
      },
    }),
    prisma.commission.count({ where }),
  ]);

  return { commissions, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createCommission(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateCommissionSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const commissionNo = await generateCode(tenantId, "COM", "commission");
    const { deal_id, clawback_until, ...rest } = parsed.data;

    const commission = await prisma.commission.create({
      data: {
        tenant_id: tenantId,
        commission_no: commissionNo,
        ...rest,
        deal_id: deal_id || null,
        clawback_until: clawback_until ? new Date(clawback_until) : null,
      },
    });
    revalidatePath("/partners/commissions");
    return { commission };
  } catch (e: any) {
    return { error: "Failed to create commission" };
  }
}

export async function updateCommission(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdateCommissionSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { deal_id, clawback_until, status, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (deal_id !== undefined) updateData.deal_id = deal_id || null;
    if (clawback_until !== undefined) updateData.clawback_until = clawback_until ? new Date(clawback_until) : null;
    if (status !== undefined) updateData.status = status as CommissionStatus;

    // Auto-set approved fields
    if (status === "APPROVED") {
      updateData.approved_by = `${(user as any).user?.first_name || ""} ${(user as any).user?.last_name || ""}`.trim();
      updateData.approved_at = new Date();
    }
    if (status === "PAID") {
      updateData.paid_at = new Date();
    }

    const commission = await prisma.commission.update({
      where: { id, tenant_id: tenantId },
      data: updateData,
    });
    revalidatePath("/partners/commissions");
    return { commission };
  } catch {
    return { error: "Failed to update commission" };
  }
}

export async function deleteCommission(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    await prisma.commission.delete({ where: { id, tenant_id: tenantId } });
    revalidatePath("/partners/commissions");
    return { success: true };
  } catch {
    return { error: "Failed to delete commission" };
  }
}

// ==============================================================================
// PARTNER PAYOUT ACTIONS
// ==============================================================================

export async function getPayouts({
  page = 1,
  perPage = 20,
  search = "",
  status,
  partner_id,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  partner_id?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status as PayoutStatus;
  if (partner_id) where.partner_id = partner_id;
  if (search) {
    where.OR = [
      { payout_no: { contains: search, mode: "insensitive" } },
      { partner: { company_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [payouts, total] = await Promise.all([
    prisma.partnerPayout.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        partner: { select: { id: true, company_name: true, partner_code: true } },
        _count: { select: { commissions: true } },
      },
    }),
    prisma.partnerPayout.count({ where }),
  ]);

  return { payouts, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createPayout(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreatePayoutSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const payoutNo = await generateCode(tenantId, "PAY", "partnerPayout");

    const payout = await prisma.partnerPayout.create({
      data: {
        tenant_id: tenantId,
        payout_no: payoutNo,
        partner_id: parsed.data.partner_id,
        period_start: new Date(parsed.data.period_start),
        period_end: new Date(parsed.data.period_end),
        total_amount: parsed.data.total_amount,
        tds_amount: parsed.data.tds_amount,
        net_amount: parsed.data.net_amount,
        currency: parsed.data.currency,
        status: (parsed.data.status || "DRAFT") as PayoutStatus,
        payment_method: parsed.data.payment_method || null,
        payment_ref: parsed.data.payment_ref || null,
        notes: parsed.data.notes || null,
      },
    });
    revalidatePath("/partners/payouts");
    return { payout };
  } catch {
    return { error: "Failed to create payout" };
  }
}

export async function updatePayout(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdatePayoutSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { period_start, period_end, status, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (period_start) updateData.period_start = new Date(period_start);
    if (period_end) updateData.period_end = new Date(period_end);
    if (status) updateData.status = status as PayoutStatus;

    if (status === "COMPLETED") {
      updateData.processed_at = new Date();
      updateData.processed_by = `${(user as any).user?.first_name || ""} ${(user as any).user?.last_name || ""}`.trim();
    }

    const payout = await prisma.partnerPayout.update({
      where: { id, tenant_id: tenantId },
      data: updateData,
    });
    revalidatePath("/partners/payouts");
    return { payout };
  } catch {
    return { error: "Failed to update payout" };
  }
}

export async function deletePayout(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    await prisma.partnerPayout.delete({ where: { id, tenant_id: tenantId } });
    revalidatePath("/partners/payouts");
    return { success: true };
  } catch {
    return { error: "Failed to delete payout" };
  }
}

// ==============================================================================
// MDF REQUEST ACTIONS
// ==============================================================================

export async function getMdfRequests({
  page = 1,
  perPage = 20,
  search = "",
  status,
  partner_id,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  partner_id?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (status) where.status = status as MdfStatus;
  if (partner_id) where.partner_id = partner_id;
  if (search) {
    where.OR = [
      { request_no: { contains: search, mode: "insensitive" } },
      { title: { contains: search, mode: "insensitive" } },
      { partner: { company_name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [mdfRequests, total] = await Promise.all([
    prisma.mdfRequest.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        partner: { select: { id: true, company_name: true, partner_code: true, mdf_budget: true } },
      },
    }),
    prisma.mdfRequest.count({ where }),
  ]);

  return { mdfRequests, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createMdfRequest(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateMdfRequestSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const requestNo = await generateCode(tenantId, "MDF", "mdfRequest");
    const { activity_start, activity_end, ...rest } = parsed.data;

    const mdfRequest = await prisma.mdfRequest.create({
      data: {
        tenant_id: tenantId,
        request_no: requestNo,
        ...rest,
        activity_start: activity_start ? new Date(activity_start) : null,
        activity_end: activity_end ? new Date(activity_end) : null,
      },
    });
    revalidatePath("/partners/mdf");
    return { mdfRequest };
  } catch {
    return { error: "Failed to create MDF request" };
  }
}

export async function updateMdfRequest(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdateMdfRequestSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { activity_start, activity_end, status, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (activity_start !== undefined) updateData.activity_start = activity_start ? new Date(activity_start) : null;
    if (activity_end !== undefined) updateData.activity_end = activity_end ? new Date(activity_end) : null;
    if (status) updateData.status = status as MdfStatus;

    const mdfRequest = await prisma.mdfRequest.update({
      where: { id, tenant_id: tenantId },
      data: updateData,
    });
    revalidatePath("/partners/mdf");
    return { mdfRequest };
  } catch {
    return { error: "Failed to update MDF request" };
  }
}

export async function deleteMdfRequest(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    await prisma.mdfRequest.delete({ where: { id, tenant_id: tenantId } });
    revalidatePath("/partners/mdf");
    return { success: true };
  } catch {
    return { error: "Failed to delete MDF request" };
  }
}

// ==============================================================================
// MARKETPLACE LISTING ACTIONS
// ==============================================================================

export async function getMarketplaceListings({
  page = 1,
  perPage = 20,
  search = "",
  status,
  listing_type,
  partner_id,
  is_featured,
}: {
  page?: number;
  perPage?: number;
  search?: string;
  status?: string;
  listing_type?: string;
  partner_id?: string;
  is_featured?: boolean;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, is_deleted: false };
  if (status) where.status = status as ListingStatus;
  if (listing_type) where.listing_type = listing_type as ListingType;
  if (partner_id) where.partner_id = partner_id;
  if (is_featured !== undefined) where.is_featured = is_featured;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { short_description: { contains: search, mode: "insensitive" } },
      { category: { contains: search, mode: "insensitive" } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.marketplaceListing.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        partner: { select: { id: true, company_name: true, partner_code: true } },
        _count: { select: { reviews: true } },
      },
    }),
    prisma.marketplaceListing.count({ where }),
  ]);

  return { listings, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createMarketplaceListing(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateListingSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { partner_id, external_url, ...rest } = parsed.data;

    const listing = await prisma.marketplaceListing.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        partner_id: partner_id || null,
        external_url: external_url || null,
      },
    });
    revalidatePath("/partners/marketplace");
    return { listing };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A listing with this slug already exists" };
    return { error: "Failed to create marketplace listing" };
  }
}

export async function updateMarketplaceListing(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdateListingSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { partner_id, external_url, status, listing_type, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (partner_id !== undefined) updateData.partner_id = partner_id || null;
    if (external_url !== undefined) updateData.external_url = external_url || null;
    if (status) updateData.status = status as ListingStatus;
    if (listing_type) updateData.listing_type = listing_type as ListingType;

    const listing = await prisma.marketplaceListing.update({
      where: { id, tenant_id: tenantId },
      data: updateData,
    });
    revalidatePath("/partners/marketplace");
    return { listing };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A listing with this slug already exists" };
    return { error: "Failed to update marketplace listing" };
  }
}

export async function deleteMarketplaceListing(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    await prisma.marketplaceListing.update({
      where: { id, tenant_id: tenantId },
      data: { is_deleted: true, deleted_at: new Date() },
    });
    revalidatePath("/partners/marketplace");
    return { success: true };
  } catch {
    return { error: "Failed to delete marketplace listing" };
  }
}

// ==============================================================================
// MARKETPLACE REVIEW ACTIONS
// ==============================================================================

export async function getMarketplaceReviews({
  listing_id,
  page = 1,
  perPage = 20,
}: {
  listing_id: string;
  page?: number;
  perPage?: number;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, listing_id };

  const [reviews, total] = await Promise.all([
    prisma.marketplaceReview.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      orderBy: { created_at: "desc" },
      include: {
        reviewer: { select: { id: true, first_name: true, last_name: true, avatar_url: true } },
      },
    }),
    prisma.marketplaceReview.count({ where }),
  ]);

  return { reviews, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createMarketplaceReview(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;
  const userId = (user as any).id;

  const parsed = CreateReviewSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const review = await prisma.marketplaceReview.create({
      data: {
        tenant_id: tenantId,
        reviewer_id: userId,
        listing_id: parsed.data.listing_id,
        rating: parsed.data.rating,
        title: parsed.data.title || null,
        content: parsed.data.content || null,
      },
    });

    // Update listing's average rating
    const agg = await prisma.marketplaceReview.aggregate({
      where: { listing_id: parsed.data.listing_id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.marketplaceListing.update({
      where: { id: parsed.data.listing_id },
      data: {
        avg_rating: agg._avg.rating || 0,
        review_count: agg._count.rating || 0,
      },
    });

    revalidatePath("/partners/marketplace");
    return { review };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "You have already reviewed this listing" };
    return { error: "Failed to create review" };
  }
}

export async function deleteMarketplaceReview(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  try {
    const review = await prisma.marketplaceReview.findFirst({ where: { id, tenant_id: tenantId } });
    if (!review) return { error: "Review not found" };

    await prisma.marketplaceReview.delete({ where: { id } });

    // Re-calculate listing average
    const agg = await prisma.marketplaceReview.aggregate({
      where: { listing_id: review.listing_id },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.marketplaceListing.update({
      where: { id: review.listing_id },
      data: {
        avg_rating: agg._avg.rating || 0,
        review_count: agg._count.rating || 0,
      },
    });

    revalidatePath("/partners/marketplace");
    return { success: true };
  } catch {
    return { error: "Failed to delete review" };
  }
}

// ==============================================================================
// HELPER: Get all partners for dropdowns
// ==============================================================================
export async function getPartnersForDropdown() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const partners = await prisma.partner.findMany({
    where: { tenant_id: tenantId, is_deleted: false, status: "ACTIVE" },
    select: { id: true, company_name: true, partner_code: true, commission_rate: true, tier: true },
    orderBy: { company_name: "asc" },
  });
  return { partners };
}
