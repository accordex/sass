// ==============================================================================
// Zod Validations — Subscription & Billing Module
// ==============================================================================

import { z } from "zod";

export const CreateSubscriptionSchema = z.object({
  plan_id: z.string().uuid("Please select a plan"),
  billing_cycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).default("MONTHLY"),
  quantity: z.number().int().positive("Quantity must be at least 1").default(1),
  discount_id: z.string().uuid().optional().nullable(),
  payment_method_id: z.string().uuid().optional().nullable(),
});

export const UpdateSubscriptionSchema = z.object({
  id: z.string().uuid("Invalid subscription ID"),
  plan_id: z.string().uuid().optional(),
  billing_cycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY"]).optional(),
  quantity: z.number().int().positive().optional(),
  cancel_at_period_end: z.boolean().optional(),
});

export const CreatePaymentMethodSchema = z.object({
  method_type: z
    .string()
    .min(1, "Payment method type is required")
    .max(50),
  provider: z.string().min(1, "Provider is required").max(50),
  provider_method_id: z.string().max(255).optional().nullable(),
  last_four: z.string().max(4).optional().nullable(),
  brand: z.string().max(50).optional().nullable(),
  expiry_month: z.number().int().min(1).max(12).optional().nullable(),
  expiry_year: z.number().int().min(2024).optional().nullable(),
  is_default: z.boolean().default(false),
});

export const CreateDiscountSchema = z.object({
  coupon_code: z
    .string()
    .min(1, "Coupon code is required")
    .max(50)
    .transform((v) => v.toUpperCase()),
  description: z.string().optional().nullable(),
  discount_percent: z.number().min(0).max(100).optional().nullable(),
  flat_amount: z.number().min(0).optional().nullable(),
  max_discount: z.number().min(0).optional().nullable(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().optional().nullable(),
  max_redemptions: z.number().int().positive().optional().nullable(),
});

export type CreateSubscriptionInput = z.infer<typeof CreateSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof UpdateSubscriptionSchema>;
export type CreatePaymentMethodInput = z.infer<typeof CreatePaymentMethodSchema>;
export type CreateDiscountInput = z.infer<typeof CreateDiscountSchema>;
