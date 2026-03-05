// ==============================================================================
// Authentication Validation Schemas (Zod)
// ==============================================================================
// Defines validation rules for all authentication-related inputs:
//   - Login form
//   - Registration form
//   - Password reset
//   - Profile updates
//
// These schemas are used both client-side (form validation) and
// server-side (API/Server Action validation) for consistency.
// ==============================================================================

import { z } from "zod";

/**
 * Login form validation
 * - Email: valid email format, required
 * - Password: minimum 6 characters, required
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

/**
 * User registration validation
 * - First/Last name: required, reasonable length
 * - Email: valid format
 * - Password: minimum 8 chars with complexity requirements
 * - Company name: required for initial tenant creation
 */
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name is too long"),
    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name is too long"),
    email: z
      .string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address"),
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
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
    company_name: z
      .string()
      .min(1, "Company name is required")
      .max(255, "Company name is too long"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

/**
 * Forgot password — request reset link
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email address is required")
    .email("Please enter a valid email address"),
});

/**
 * Reset password — set new password with token
 */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

// Export types derived from schemas (for type-safe form handling)
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
