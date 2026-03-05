// ==============================================================================
// Zod Validation Schemas — Phase 6: Partner Program & Marketplace
// ==============================================================================

import { z } from "zod";

// ==============================================================================
// PARTNER SCHEMAS
// ==============================================================================

export const CreatePartnerSchema = z.object({
  company_name: z.string().min(2, "Company name is required").max(255),
  contact_name: z.string().min(2, "Contact name is required").max(255),
  contact_email: z.string().email("Valid email is required").max(255),
  contact_phone: z.string().max(20).optional().nullable(),
  website: z.string().url("Must be a valid URL").max(500).optional().nullable().or(z.literal("")),
  partner_type: z.enum(["RESELLER", "REFERRAL", "TECHNOLOGY", "AFFILIATE"]).default("REFERRAL"),
  tier: z.enum(["BRONZE", "SILVER", "GOLD", "PLATINUM"]).default("BRONZE"),
  status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "TERMINATED"]).default("PENDING"),
  commission_rate: z.coerce.number().min(0).max(100).default(10),
  partner_manager_id: z.string().uuid().optional().nullable().or(z.literal("")),
  agreement_signed_at: z.string().optional().nullable(),
  mdf_budget: z.coerce.number().min(0).default(0),
  specializations: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  portal_access: z.boolean().default(true),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().max(20).optional().nullable(),
  gstin: z.string().max(20).optional().nullable(),
  pan: z.string().max(15).optional().nullable(),
  bank_details: z.any().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdatePartnerSchema = CreatePartnerSchema.partial();

// ==============================================================================
// COMMISSION SCHEMAS
// ==============================================================================

export const CreateCommissionSchema = z.object({
  partner_id: z.string().uuid("Partner is required"),
  commission_type: z.enum(["REFERRAL", "RESALE", "RENEWAL", "EXPANSION"]).default("REFERRAL"),
  deal_reference: z.string().max(255).optional().nullable(),
  deal_id: z.string().uuid().optional().nullable().or(z.literal("")),
  base_amount: z.coerce.number().min(0, "Base amount is required"),
  commission_rate: z.coerce.number().min(0).max(100, "Rate must be 0-100"),
  commission_amount: z.coerce.number().min(0),
  currency: z.string().max(3).default("INR"),
  status: z.enum(["PENDING", "APPROVED", "PAID", "CLAWED_BACK"]).default("PENDING"),
  clawback_eligible: z.boolean().default(true),
  clawback_until: z.string().optional().nullable(),
  approval_notes: z.string().optional().nullable(),
});

export const UpdateCommissionSchema = CreateCommissionSchema.partial();

// ==============================================================================
// PARTNER PAYOUT SCHEMAS
// ==============================================================================

export const CreatePayoutSchema = z.object({
  partner_id: z.string().uuid("Partner is required"),
  period_start: z.string().min(1, "Period start is required"),
  period_end: z.string().min(1, "Period end is required"),
  total_amount: z.coerce.number().min(0),
  tds_amount: z.coerce.number().min(0).default(0),
  net_amount: z.coerce.number().min(0),
  currency: z.string().max(3).default("INR"),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "PROCESSING", "COMPLETED", "FAILED"]).default("DRAFT"),
  payment_method: z.string().max(50).optional().nullable(),
  payment_ref: z.string().max(100).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdatePayoutSchema = CreatePayoutSchema.partial();

// ==============================================================================
// MDF REQUEST SCHEMAS
// ==============================================================================

export const CreateMdfRequestSchema = z.object({
  partner_id: z.string().uuid("Partner is required"),
  title: z.string().min(2, "Title is required").max(255),
  description: z.string().min(5, "Description is required"),
  requested_amount: z.coerce.number().min(0, "Amount is required"),
  approved_amount: z.coerce.number().min(0).optional().nullable(),
  status: z.enum(["SUBMITTED", "APPROVED", "REJECTED", "UTILIZED", "EXPIRED"]).default("SUBMITTED"),
  activity_start: z.string().optional().nullable(),
  activity_end: z.string().optional().nullable(),
  attachments: z.array(z.string()).default([]),
  approval_notes: z.string().optional().nullable(),
  utilization_report: z.string().optional().nullable(),
});

export const UpdateMdfRequestSchema = CreateMdfRequestSchema.partial();

// ==============================================================================
// MARKETPLACE LISTING SCHEMAS
// ==============================================================================

export const CreateListingSchema = z.object({
  partner_id: z.string().uuid().optional().nullable().or(z.literal("")),
  title: z.string().min(2, "Title is required").max(255),
  slug: z.string().min(2, "Slug is required").max(255),
  short_description: z.string().max(500).optional().nullable(),
  description: z.string().min(5, "Description is required"),
  listing_type: z.enum(["APP", "SERVICE", "INTEGRATION", "TEMPLATE"]).default("APP"),
  status: z.enum(["DRAFT", "SUBMITTED", "PUBLISHED", "REJECTED", "ARCHIVED"]).default("DRAFT"),
  category: z.string().max(100).optional().nullable(),
  tags: z.array(z.string()).default([]),
  logo_url: z.string().max(500).optional().nullable(),
  screenshots: z.array(z.string()).default([]),
  pricing_model: z.string().max(50).optional().nullable(),
  price: z.coerce.number().min(0).optional().nullable(),
  external_url: z.string().url().max(500).optional().nullable().or(z.literal("")),
  version: z.string().max(30).optional().nullable(),
  is_featured: z.boolean().default(false),
});

export const UpdateListingSchema = CreateListingSchema.partial();

// ==============================================================================
// MARKETPLACE REVIEW SCHEMAS
// ==============================================================================

export const CreateReviewSchema = z.object({
  listing_id: z.string().uuid("Listing is required"),
  rating: z.coerce.number().int().min(1, "Rating must be 1-5").max(5, "Rating must be 1-5"),
  title: z.string().max(255).optional().nullable(),
  content: z.string().optional().nullable(),
});

export const UpdateReviewSchema = CreateReviewSchema.partial();
