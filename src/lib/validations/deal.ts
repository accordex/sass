// ==============================================================================
// Zod Validations — CRM Deal / Opportunity Module
// ==============================================================================

import { z } from "zod";

export const CreateDealSchema = z.object({
  title: z
    .string()
    .min(1, "Deal title is required")
    .max(255, "Title must be 255 characters or less"),
  customer_id: z.string().uuid("Invalid customer ID").optional().nullable(),
  pipeline_id: z.string().uuid("Invalid pipeline ID"),
  stage_id: z.string().uuid("Invalid stage ID"),
  owner_id: z.string().uuid("Invalid owner ID"),
  deal_value: z.number().min(0, "Deal value must be positive").default(0),
  currency: z.string().max(3).default("INR"),
  win_probability: z
    .number()
    .min(0, "Probability must be between 0 and 100")
    .max(100, "Probability must be between 0 and 100")
    .default(0),
  expected_close: z.string().datetime().optional().nullable(),
  source: z
    .string()
    .max(100, "Source must be 100 characters or less")
    .optional()
    .nullable(),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
});

export const UpdateDealSchema = CreateDealSchema.partial().extend({
  id: z.string().uuid("Invalid deal ID"),
  loss_reason: z.string().optional().nullable(),
  actual_close: z.string().datetime().optional().nullable(),
});

export type CreateDealInput = z.infer<typeof CreateDealSchema>;
export type UpdateDealInput = z.infer<typeof UpdateDealSchema>;
