// ==============================================================================
// Zod Validations — CRM Contact Module
// ==============================================================================

import { z } from "zod";

export const CreateContactSchema = z.object({
  customer_id: z.string().uuid("Invalid customer ID").optional().nullable(),
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
  job_title: z
    .string()
    .max(100, "Job title must be 100 characters or less")
    .optional()
    .nullable(),
  department: z
    .string()
    .max(100, "Department must be 100 characters or less")
    .optional()
    .nullable(),
  is_primary: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  custom_fields: z.record(z.any()).default({}),
});

export const UpdateContactSchema = CreateContactSchema.partial().extend({
  id: z.string().uuid("Invalid contact ID"),
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;
