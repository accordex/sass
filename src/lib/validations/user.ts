// ==============================================================================
// User Management Validation Schemas (Zod)
// ==============================================================================
// Validation rules for user CRUD operations:
//   - Create/invite user
//   - Update user profile
//   - Change password
//   - Assign roles
// ==============================================================================

import { z } from "zod";

/**
 * Create new user (by admin invitation)
 */
export const createUserSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(100, "First name is too long"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(100, "Last name is too long"),
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[+]?[0-9]{10,15}$/.test(val),
      "Please enter a valid phone number"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and a number"
    ),
  role_ids: z
    .array(z.string().uuid("Invalid role ID"))
    .min(1, "At least one role must be assigned"),
});

/**
 * Update user profile
 */
export const updateUserSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => !val || /^[+]?[0-9]{10,15}$/.test(val),
      "Invalid phone number"
    ),
  avatar_url: z.string().url("Invalid URL").optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
});

/**
 * Change password (authenticated user)
 */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and a number"
      ),
    confirm_new_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "Passwords do not match",
    path: ["confirm_new_password"],
  });

/**
 * Assign roles to a user
 */
export const assignRolesSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  role_ids: z
    .array(z.string().uuid("Invalid role ID"))
    .min(1, "At least one role is required"),
});

/**
 * User preferences update
 */
export const userPreferencesSchema = z.object({
  theme: z.enum(["light", "dark"]).optional(),
  language: z.string().max(10).optional(),
  notifications: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      in_app: z.boolean().optional(),
      push: z.boolean().optional(),
    })
    .optional(),
  dashboard_layout: z.string().optional(),
});

// Export types
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type AssignRolesInput = z.infer<typeof assignRolesSchema>;
export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
