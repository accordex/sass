// ==============================================================================
// HRMS Zod Validation Schemas — Phase 3
// ==============================================================================
// Covers: Departments, Designations, Employees, Attendance, Leave, Holidays
// ==============================================================================

import { z } from "zod";

// ==============================================================================
// DEPARTMENT
// ==============================================================================

export const CreateDepartmentSchema = z.object({
  dept_code: z.string().min(1, "Department code is required").max(20),
  name: z.string().min(1, "Department name is required").max(255),
  description: z.string().optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  head_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const UpdateDepartmentSchema = CreateDepartmentSchema.partial();

// ==============================================================================
// DESIGNATION
// ==============================================================================

export const CreateDesignationSchema = z.object({
  code: z.string().min(1, "Designation code is required").max(20),
  title: z.string().min(1, "Designation title is required").max(255),
  description: z.string().optional().nullable(),
  grade: z.string().max(20).optional().nullable(),
  sort_order: z.number().int().optional().default(0),
  is_active: z.boolean().optional().default(true),
});

export const UpdateDesignationSchema = CreateDesignationSchema.partial();

// ==============================================================================
// EMPLOYEE
// ==============================================================================

export const CreateEmployeeSchema = z.object({
  employee_code: z.string().min(1, "Employee code is required").max(50),
  user_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  designation_id: z.string().uuid().optional().nullable(),
  reporting_manager_id: z.string().uuid().optional().nullable(),
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address").max(255),
  phone: z.string().max(20).optional().nullable(),
  emergency_phone: z.string().max(20).optional().nullable(),
  emergency_contact_name: z.string().max(100).optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  marital_status: z.enum(["SINGLE", "MARRIED", "DIVORCED", "WIDOWED"]).optional().nullable(),
  blood_group: z.string().max(5).optional().nullable(),
  nationality: z.string().max(50).optional().nullable(),
  pan_number: z.string().max(10).optional().nullable(),
  aadhaar_number: z.string().max(12).optional().nullable(),
  uan_number: z.string().max(12).optional().nullable(),
  esi_number: z.string().max(17).optional().nullable(),
  bank_account_number: z.string().max(30).optional().nullable(),
  bank_name: z.string().max(100).optional().nullable(),
  bank_ifsc: z.string().max(11).optional().nullable(),
  current_address: z.any().optional().nullable(),
  permanent_address: z.any().optional().nullable(),
  employment_type: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "FREELANCER", "PROBATION"]).optional().default("FULL_TIME"),
  status: z.enum(["ACTIVE", "ON_NOTICE", "SEPARATED", "ON_LEAVE", "SUSPENDED", "ABSCONDING"]).optional().default("ACTIVE"),
  date_of_joining: z.string().min(1, "Joining date is required"),
  date_of_confirmation: z.string().optional().nullable(),
  date_of_exit: z.string().optional().nullable(),
  exit_reason: z.string().optional().nullable(),
  notice_period_days: z.number().int().optional().default(30),
  work_location: z.string().max(255).optional().nullable(),
  shift: z.string().max(50).optional().nullable(),
  photo_url: z.string().max(500).optional().nullable(),
  custom_fields: z.any().optional().default({}),
});

export const UpdateEmployeeSchema = CreateEmployeeSchema.partial();

// ==============================================================================
// ATTENDANCE
// ==============================================================================

export const CreateAttendanceSchema = z.object({
  employee_id: z.string().uuid("Employee is required"),
  attendance_date: z.string().min(1, "Date is required"),
  status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WEEKEND", "WORK_FROM_HOME", "LATE"]).default("PRESENT"),
  check_in: z.string().optional().nullable(),
  check_out: z.string().optional().nullable(),
  hours_worked: z.number().optional().nullable(),
  overtime_hours: z.number().optional().nullable(),
  late_minutes: z.number().int().optional().nullable(),
  early_leave_minutes: z.number().int().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateAttendanceSchema = CreateAttendanceSchema.partial();

export const BulkAttendanceSchema = z.object({
  attendance_date: z.string().min(1, "Date is required"),
  records: z.array(z.object({
    employee_id: z.string().uuid(),
    status: z.enum(["PRESENT", "ABSENT", "HALF_DAY", "ON_LEAVE", "HOLIDAY", "WEEKEND", "WORK_FROM_HOME", "LATE"]),
    check_in: z.string().optional().nullable(),
    check_out: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
  })),
});

// ==============================================================================
// LEAVE TYPE
// ==============================================================================

export const CreateLeaveTypeSchema = z.object({
  code: z.string().min(1, "Leave type code is required").max(10),
  name: z.string().min(1, "Leave type name is required").max(100),
  description: z.string().optional().nullable(),
  annual_allocation: z.number().min(0, "Allocation must be >= 0"),
  max_carry_forward: z.number().min(0).optional().default(0),
  max_consecutive_days: z.number().int().optional().nullable(),
  is_paid: z.boolean().optional().default(true),
  requires_doc_after_days: z.number().int().optional().nullable(),
  allow_half_day: z.boolean().optional().default(true),
  applicable_gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const UpdateLeaveTypeSchema = CreateLeaveTypeSchema.partial();

// ==============================================================================
// LEAVE REQUEST
// ==============================================================================

export const CreateLeaveRequestSchema = z.object({
  leave_type_id: z.string().uuid("Leave type is required"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  days_requested: z.number().min(0.5, "Minimum 0.5 days"),
  is_half_day: z.boolean().optional().default(false),
  half_day_type: z.string().max(20).optional().nullable(),
  reason: z.string().min(1, "Reason is required"),
  document_url: z.string().max(500).optional().nullable(),
});

export const ApproveRejectLeaveSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  approver_notes: z.string().optional().nullable(),
});

// ==============================================================================
// HOLIDAY
// ==============================================================================

export const CreateHolidaySchema = z.object({
  name: z.string().min(1, "Holiday name is required").max(255),
  date: z.string().min(1, "Date is required"),
  year: z.number().int().min(2020).max(2100),
  is_mandatory: z.boolean().optional().default(true),
  is_optional: z.boolean().optional().default(false),
  applicable_to: z.any().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const UpdateHolidaySchema = CreateHolidaySchema.partial();

// ==============================================================================
// EMPLOYEE DOCUMENT
// ==============================================================================

export const CreateEmployeeDocumentSchema = z.object({
  employee_id: z.string().uuid("Employee is required"),
  category: z.enum([
    "RESUME", "ID_PROOF", "ADDRESS_PROOF", "QUALIFICATION",
    "OFFER_LETTER", "APPOINTMENT_LETTER", "EXPERIENCE_LETTER",
    "RELIEVING_LETTER", "SALARY_SLIP", "PAN_CARD", "AADHAAR",
    "PASSPORT", "OTHER",
  ]),
  title: z.string().min(1, "Document title is required").max(255),
  file_name: z.string().min(1, "File name is required").max(255),
  file_url: z.string().min(1, "File URL is required").max(500),
  mime_type: z.string().max(100).optional().nullable(),
  file_size: z.number().int().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  is_verified: z.boolean().optional().default(false),
  notes: z.string().optional().nullable(),
});
