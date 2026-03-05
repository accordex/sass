// ==============================================================================
// Tenant Validation Schemas (Zod)
// ==============================================================================
// Validation rules for tenant (organization) management:
//   - Create new tenant (signup)
//   - Update tenant details
//   - Tenant settings update
//
// Used by both the registration flow and admin tenant management.
// ==============================================================================

import { z } from "zod";

/**
 * Create new tenant validation
 * Used during registration and admin tenant creation
 */
export const createTenantSchema = z.object({
  tenant_code: z
    .string()
    .min(3, "Tenant code must be at least 3 characters")
    .max(50, "Tenant code cannot exceed 50 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Tenant code can only contain lowercase letters, numbers, and hyphens"
    ),
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name is too long"),
  trade_name: z
    .string()
    .max(255, "Trade name is too long")
    .optional()
    .nullable(),
  primary_email: z
    .string()
    .min(1, "Primary email is required")
    .email("Please enter a valid email address"),
  phone_number: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^[+]?[0-9]{10,15}$/, "Please enter a valid phone number"),
  plan_id: z.string().uuid("Invalid plan ID"),
});

/**
 * Update tenant validation
 * Partial — only provided fields are updated
 */
export const updateTenantSchema = z.object({
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(255)
    .optional(),
  trade_name: z.string().max(255).optional().nullable(),
  primary_email: z.string().email("Invalid email").optional(),
  phone_number: z
    .string()
    .regex(/^[+]?[0-9]{10,15}$/, "Invalid phone number")
    .optional(),
  tenant_settings: z.record(z.any()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Tenant settings update — validates the settings JSON structure
 */
export const tenantSettingsSchema = z.object({
  timezone: z.string().optional(),
  currency: z.string().length(3, "Currency must be 3-letter ISO code").optional(),
  date_format: z.string().optional(),
  language: z.string().optional(),
  gst_registered: z.boolean().optional(),
  gstin: z
    .string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format")
    .optional()
    .or(z.literal("")),
  logo_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  address: z.object({
    line1: z.string().optional(),
    line2: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// Export types
export type CreateTenantInput = z.infer<typeof createTenantSchema>;
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>;
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>;
