// ==============================================================================
// Zod Validations — CRM Lead Module
// ==============================================================================

import { z } from "zod";

export const LeadSourceEnum = z.enum([
  "WEBSITE",
  "REFERRAL",
  "COLD_CALL",
  "SOCIAL_MEDIA",
  "ADVERTISEMENT",
  "TRADE_SHOW",
  "PARTNER",
  "EMAIL_CAMPAIGN",
  "ORGANIC_SEARCH",
  "OTHER",
]);

export const LeadStatusEnum = z.enum([
  "NEW",
  "CONTACTED",
  "QUALIFIED",
  "UNQUALIFIED",
  "NURTURING",
  "CONVERTED",
  "LOST",
]);

export const CreateLeadSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or less"),
  last_name: z
    .string()
    .max(100, "Last name must be 100 characters or less")
    .optional()
    .nullable(),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .nullable(),
  company_name: z
    .string()
    .max(255, "Company name must be 255 characters or less")
    .optional()
    .nullable(),
  job_title: z
    .string()
    .max(100, "Job title must be 100 characters or less")
    .optional()
    .nullable(),
  source: LeadSourceEnum.default("OTHER"),
  status: LeadStatusEnum.default("NEW"),
  owner_id: z.string().uuid("Invalid owner ID"),
  next_follow_up: z.string().datetime().optional().nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
});

export const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  id: z.string().uuid("Invalid lead ID"),
});

export const LeadActivitySchema = z.object({
  lead_id: z.string().uuid("Invalid lead ID"),
  activity_type: z
    .string()
    .min(1, "Activity type is required")
    .max(50, "Activity type must be 50 characters or less"),
  title: z
    .string()
    .min(1, "Activity title is required")
    .max(255, "Title must be 255 characters or less"),
  description: z.string().optional().nullable(),
  outcome: z
    .string()
    .max(100, "Outcome must be 100 characters or less")
    .optional()
    .nullable(),
  activity_date: z.string().datetime().optional(),
  duration_mins: z.number().int().positive().optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadInput = z.infer<typeof UpdateLeadSchema>;
export type LeadActivityInput = z.infer<typeof LeadActivitySchema>;
