// ==============================================================================
// Zod Validations — CRM Customer (Account) Module
// ==============================================================================

import { z } from "zod";

const AddressSchema = z.object({
  line1: z.string().optional(),
  line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
  country: z.string().default("India"),
});

export const CreateCustomerSchema = z.object({
  customer_code: z
    .string()
    .min(1, "Customer code is required")
    .max(50, "Customer code must be 50 characters or less"),
  company_name: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name must be 255 characters or less"),
  trade_name: z
    .string()
    .max(255, "Trade name must be 255 characters or less")
    .optional()
    .nullable(),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .max(20, "Phone number must be 20 characters or less")
    .optional()
    .nullable(),
  website: z
    .string()
    .url("Please enter a valid website URL")
    .max(500)
    .optional()
    .nullable()
    .or(z.literal("")),
  gstin: z
    .string()
    .max(15, "GSTIN must be 15 characters or less")
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$|^$/, "Invalid GSTIN format")
    .optional()
    .nullable()
    .or(z.literal("")),
  pan_number: z
    .string()
    .max(10, "PAN must be 10 characters")
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$|^$/, "Invalid PAN format")
    .optional()
    .nullable()
    .or(z.literal("")),
  billing_address: AddressSchema.optional().nullable(),
  shipping_address: AddressSchema.optional().nullable(),
  payment_terms: z.number().int().min(0).max(365).default(30),
  credit_limit: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial().extend({
  id: z.string().uuid("Invalid customer ID"),
});

export type CreateCustomerInput = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;
