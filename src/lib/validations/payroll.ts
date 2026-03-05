// ==============================================================================
// Payroll Zod Validation Schemas — Phase 3
// ==============================================================================
// Covers: Salary Components, Salary Structures, Employee Salary, Payroll Runs
// ==============================================================================

import { z } from "zod";

// ==============================================================================
// SALARY COMPONENT
// ==============================================================================

export const CreateSalaryComponentSchema = z.object({
  code: z.string().min(1, "Component code is required").max(30),
  name: z.string().min(1, "Component name is required").max(255),
  description: z.string().optional().nullable(),
  component_type: z.enum(["EARNING", "DEDUCTION"]),
  calculation_method: z.enum(["FIXED", "PERCENTAGE_OF_BASIC", "PERCENTAGE_OF_GROSS", "PERCENTAGE_OF_CTC", "FORMULA"]).optional().default("FIXED"),
  percentage_value: z.number().min(0).max(100).optional().nullable(),
  formula: z.string().optional().nullable(),
  is_taxable: z.boolean().optional().default(true),
  is_part_of_ctc: z.boolean().optional().default(true),
  is_statutory: z.boolean().optional().default(false),
  statutory_code: z.string().max(20).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateSalaryComponentSchema = CreateSalaryComponentSchema.partial();

// ==============================================================================
// SALARY STRUCTURE
// ==============================================================================

export const CreateSalaryStructureSchema = z.object({
  code: z.string().min(1, "Structure code is required").max(30),
  name: z.string().min(1, "Structure name is required").max(255),
  description: z.string().optional().nullable(),
  base_ctc: z.number().min(0).optional().nullable(),
  is_active: z.boolean().optional().default(true),
  lines: z.array(z.object({
    salary_component_id: z.string().uuid("Component is required"),
    default_amount: z.number().min(0).optional().default(0),
    percentage_override: z.number().min(0).max(100).optional().nullable(),
    sort_order: z.number().int().optional().default(0),
  })).optional().default([]),
});

export const UpdateSalaryStructureSchema = CreateSalaryStructureSchema.partial();

// ==============================================================================
// EMPLOYEE SALARY
// ==============================================================================

export const CreateEmployeeSalarySchema = z.object({
  employee_id: z.string().uuid("Employee is required"),
  salary_structure_id: z.string().uuid("Salary structure is required"),
  annual_ctc: z.number().min(0, "Annual CTC must be >= 0"),
  monthly_gross: z.number().min(0),
  monthly_net: z.number().min(0),
  basic_salary: z.number().min(0),
  component_breakdown: z.any().optional().default({}),
  pf_applicable: z.boolean().optional().default(true),
  esi_applicable: z.boolean().optional().default(false),
  pt_applicable: z.boolean().optional().default(true),
  tax_regime: z.string().max(10).optional().default("new"),
  effective_from: z.string().min(1, "Effective date is required"),
  effective_until: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateEmployeeSalarySchema = CreateEmployeeSalarySchema.partial();

// ==============================================================================
// PAYROLL RUN
// ==============================================================================

export const CreatePayrollRunSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  period_start: z.string().min(1, "Period start is required"),
  period_end: z.string().min(1, "Period end is required"),
  notes: z.string().optional().nullable(),
});

export const ProcessPayrollSchema = z.object({
  payroll_run_id: z.string().uuid("Payroll run ID is required"),
});

export const ApprovePayrollSchema = z.object({
  payroll_run_id: z.string().uuid("Payroll run ID is required"),
  notes: z.string().optional().nullable(),
});
