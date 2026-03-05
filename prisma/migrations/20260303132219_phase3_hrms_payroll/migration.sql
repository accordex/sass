-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCER', 'PROBATION');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ACTIVE', 'ON_NOTICE', 'SEPARATED', 'ON_LEAVE', 'SUSPENDED', 'ABSCONDING');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND', 'WORK_FROM_HOME', 'LATE');

-- CreateEnum
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "CalculationMethod" AS ENUM ('FIXED', 'PERCENTAGE_OF_BASIC', 'PERCENTAGE_OF_GROSS', 'PERCENTAGE_OF_CTC', 'FORMULA');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PROCESSED', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('RESUME', 'ID_PROOF', 'ADDRESS_PROOF', 'QUALIFICATION', 'OFFER_LETTER', 'APPOINTMENT_LETTER', 'EXPERIENCE_LETTER', 'RELIEVING_LETTER', 'SALARY_SLIP', 'PAN_CARD', 'AADHAAR', 'PASSPORT', 'OTHER');

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "dept_code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "head_id" UUID,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "grade" VARCHAR(20),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_code" VARCHAR(50) NOT NULL,
    "user_id" UUID,
    "department_id" UUID,
    "designation_id" UUID,
    "reporting_manager_id" UUID,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "emergency_phone" VARCHAR(20),
    "emergency_contact_name" VARCHAR(100),
    "date_of_birth" DATE,
    "gender" "Gender",
    "marital_status" "MaritalStatus",
    "blood_group" VARCHAR(5),
    "nationality" VARCHAR(50),
    "pan_number" VARCHAR(10),
    "aadhaar_number" VARCHAR(12),
    "uan_number" VARCHAR(12),
    "esi_number" VARCHAR(17),
    "bank_account_number" VARCHAR(30),
    "bank_name" VARCHAR(100),
    "bank_ifsc" VARCHAR(11),
    "current_address" JSONB,
    "permanent_address" JSONB,
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "status" "EmployeeStatus" NOT NULL DEFAULT 'ACTIVE',
    "date_of_joining" DATE NOT NULL,
    "date_of_confirmation" DATE,
    "date_of_exit" DATE,
    "exit_reason" TEXT,
    "notice_period_days" INTEGER NOT NULL DEFAULT 30,
    "work_location" VARCHAR(255),
    "shift" VARCHAR(50),
    "photo_url" VARCHAR(500),
    "custom_fields" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "category" "DocumentCategory" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "file_name" VARCHAR(255) NOT NULL,
    "file_url" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(100),
    "file_size" INTEGER,
    "expiry_date" DATE,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "check_in" TIMESTAMP(3),
    "check_out" TIMESTAMP(3),
    "hours_worked" DECIMAL(5,2),
    "overtime_hours" DECIMAL(5,2),
    "late_minutes" INTEGER,
    "early_leave_minutes" INTEGER,
    "check_in_location" JSONB,
    "check_out_location" JSONB,
    "ip_address" VARCHAR(45),
    "device_info" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "annual_allocation" DECIMAL(5,1) NOT NULL,
    "max_carry_forward" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "max_consecutive_days" INTEGER,
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "requires_doc_after_days" INTEGER,
    "allow_half_day" BOOLEAN NOT NULL DEFAULT true,
    "applicable_gender" "Gender",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "fiscal_year" VARCHAR(10) NOT NULL,
    "allocated" DECIMAL(5,1) NOT NULL,
    "carried_forward" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "used" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "pending" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "available" DECIMAL(5,1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "days_requested" DECIMAL(5,1) NOT NULL,
    "is_half_day" BOOLEAN NOT NULL DEFAULT false,
    "half_day_type" VARCHAR(20),
    "reason" TEXT NOT NULL,
    "document_url" VARCHAR(500),
    "status" "LeaveStatus" NOT NULL DEFAULT 'PENDING',
    "approver_id" UUID,
    "approver_notes" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" DATE NOT NULL,
    "year" INTEGER NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT true,
    "is_optional" BOOLEAN NOT NULL DEFAULT false,
    "applicable_to" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "component_type" "ComponentType" NOT NULL,
    "calculation_method" "CalculationMethod" NOT NULL DEFAULT 'FIXED',
    "percentage_value" DECIMAL(5,2),
    "formula" TEXT,
    "is_taxable" BOOLEAN NOT NULL DEFAULT true,
    "is_part_of_ctc" BOOLEAN NOT NULL DEFAULT true,
    "is_statutory" BOOLEAN NOT NULL DEFAULT false,
    "statutory_code" VARCHAR(20),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structures" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "base_ctc" DECIMAL(14,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "salary_structures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_structure_lines" (
    "id" UUID NOT NULL,
    "salary_structure_id" UUID NOT NULL,
    "salary_component_id" UUID NOT NULL,
    "default_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "percentage_override" DECIMAL(5,2),
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "salary_structure_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salaries" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "salary_structure_id" UUID NOT NULL,
    "annual_ctc" DECIMAL(14,2) NOT NULL,
    "monthly_gross" DECIMAL(14,2) NOT NULL,
    "monthly_net" DECIMAL(14,2) NOT NULL,
    "basic_salary" DECIMAL(14,2) NOT NULL,
    "component_breakdown" JSONB NOT NULL DEFAULT '{}',
    "pf_applicable" BOOLEAN NOT NULL DEFAULT true,
    "esi_applicable" BOOLEAN NOT NULL DEFAULT false,
    "pt_applicable" BOOLEAN NOT NULL DEFAULT true,
    "tax_regime" VARCHAR(10) NOT NULL DEFAULT 'new',
    "effective_from" DATE NOT NULL,
    "effective_until" DATE,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "employee_salaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_runs" (
    "id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "run_number" VARCHAR(50) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "total_employees" INTEGER NOT NULL DEFAULT 0,
    "total_gross" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_deductions" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_net" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "total_employer_contribution" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "processed_by" UUID,
    "processed_at" TIMESTAMP(3),
    "approved_by" UUID,
    "approved_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "notes" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslips" (
    "id" UUID NOT NULL,
    "payroll_run_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "payslip_number" VARCHAR(50) NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "working_days" DECIMAL(5,1) NOT NULL,
    "days_worked" DECIMAL(5,1) NOT NULL,
    "leave_days" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "lop_days" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "total_earnings" DECIMAL(14,2) NOT NULL,
    "total_deductions" DECIMAL(14,2) NOT NULL,
    "gross_salary" DECIMAL(14,2) NOT NULL,
    "net_salary" DECIMAL(14,2) NOT NULL,
    "employer_pf" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "employer_esi" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "tds_deducted" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "professional_tax" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "pdf_url" VARCHAR(500),
    "is_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payslips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_lines" (
    "id" UUID NOT NULL,
    "payslip_id" UUID NOT NULL,
    "salary_component_id" UUID NOT NULL,
    "component_type" "ComponentType" NOT NULL,
    "component_name" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "ytd_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "payslip_lines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "departments_tenant_id_idx" ON "departments"("tenant_id");

-- CreateIndex
CREATE INDEX "departments_parent_id_idx" ON "departments"("parent_id");

-- CreateIndex
CREATE INDEX "departments_is_active_idx" ON "departments"("is_active");

-- CreateIndex
CREATE INDEX "departments_is_deleted_idx" ON "departments"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "departments_tenant_id_dept_code_key" ON "departments"("tenant_id", "dept_code");

-- CreateIndex
CREATE INDEX "designations_tenant_id_idx" ON "designations"("tenant_id");

-- CreateIndex
CREATE INDEX "designations_is_active_idx" ON "designations"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "designations_tenant_id_code_key" ON "designations"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_user_id_key" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employees_tenant_id_idx" ON "employees"("tenant_id");

-- CreateIndex
CREATE INDEX "employees_user_id_idx" ON "employees"("user_id");

-- CreateIndex
CREATE INDEX "employees_department_id_idx" ON "employees"("department_id");

-- CreateIndex
CREATE INDEX "employees_designation_id_idx" ON "employees"("designation_id");

-- CreateIndex
CREATE INDEX "employees_reporting_manager_id_idx" ON "employees"("reporting_manager_id");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_employment_type_idx" ON "employees"("employment_type");

-- CreateIndex
CREATE INDEX "employees_date_of_joining_idx" ON "employees"("date_of_joining");

-- CreateIndex
CREATE INDEX "employees_is_deleted_idx" ON "employees"("is_deleted");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_employee_code_key" ON "employees"("tenant_id", "employee_code");

-- CreateIndex
CREATE UNIQUE INDEX "employees_tenant_id_email_key" ON "employees"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "employee_documents_employee_id_idx" ON "employee_documents"("employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_category_idx" ON "employee_documents"("category");

-- CreateIndex
CREATE INDEX "attendance_tenant_id_idx" ON "attendance"("tenant_id");

-- CreateIndex
CREATE INDEX "attendance_employee_id_idx" ON "attendance"("employee_id");

-- CreateIndex
CREATE INDEX "attendance_attendance_date_idx" ON "attendance"("attendance_date");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_employee_id_attendance_date_key" ON "attendance"("employee_id", "attendance_date");

-- CreateIndex
CREATE INDEX "leave_types_tenant_id_idx" ON "leave_types"("tenant_id");

-- CreateIndex
CREATE INDEX "leave_types_is_active_idx" ON "leave_types"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_tenant_id_code_key" ON "leave_types"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "leave_balances_tenant_id_idx" ON "leave_balances"("tenant_id");

-- CreateIndex
CREATE INDEX "leave_balances_employee_id_idx" ON "leave_balances"("employee_id");

-- CreateIndex
CREATE INDEX "leave_balances_leave_type_id_idx" ON "leave_balances"("leave_type_id");

-- CreateIndex
CREATE INDEX "leave_balances_fiscal_year_idx" ON "leave_balances"("fiscal_year");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employee_id_leave_type_id_fiscal_year_key" ON "leave_balances"("employee_id", "leave_type_id", "fiscal_year");

-- CreateIndex
CREATE INDEX "leave_requests_tenant_id_idx" ON "leave_requests"("tenant_id");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_idx" ON "leave_requests"("employee_id");

-- CreateIndex
CREATE INDEX "leave_requests_leave_type_id_idx" ON "leave_requests"("leave_type_id");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_requests_start_date_end_date_idx" ON "leave_requests"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "holidays_tenant_id_idx" ON "holidays"("tenant_id");

-- CreateIndex
CREATE INDEX "holidays_date_idx" ON "holidays"("date");

-- CreateIndex
CREATE INDEX "holidays_year_idx" ON "holidays"("year");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_tenant_id_date_key" ON "holidays"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "salary_components_tenant_id_idx" ON "salary_components"("tenant_id");

-- CreateIndex
CREATE INDEX "salary_components_component_type_idx" ON "salary_components"("component_type");

-- CreateIndex
CREATE INDEX "salary_components_is_active_idx" ON "salary_components"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "salary_components_tenant_id_code_key" ON "salary_components"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "salary_structures_tenant_id_idx" ON "salary_structures"("tenant_id");

-- CreateIndex
CREATE INDEX "salary_structures_is_active_idx" ON "salary_structures"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structures_tenant_id_code_key" ON "salary_structures"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "salary_structure_lines_salary_structure_id_idx" ON "salary_structure_lines"("salary_structure_id");

-- CreateIndex
CREATE UNIQUE INDEX "salary_structure_lines_salary_structure_id_salary_component_key" ON "salary_structure_lines"("salary_structure_id", "salary_component_id");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salaries_employee_id_key" ON "employee_salaries"("employee_id");

-- CreateIndex
CREATE INDEX "employee_salaries_tenant_id_idx" ON "employee_salaries"("tenant_id");

-- CreateIndex
CREATE INDEX "employee_salaries_employee_id_idx" ON "employee_salaries"("employee_id");

-- CreateIndex
CREATE INDEX "employee_salaries_salary_structure_id_idx" ON "employee_salaries"("salary_structure_id");

-- CreateIndex
CREATE INDEX "payroll_runs_tenant_id_idx" ON "payroll_runs"("tenant_id");

-- CreateIndex
CREATE INDEX "payroll_runs_month_year_idx" ON "payroll_runs"("month", "year");

-- CreateIndex
CREATE INDEX "payroll_runs_status_idx" ON "payroll_runs"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_runs_tenant_id_run_number_key" ON "payroll_runs"("tenant_id", "run_number");

-- CreateIndex
CREATE INDEX "payslips_payroll_run_id_idx" ON "payslips"("payroll_run_id");

-- CreateIndex
CREATE INDEX "payslips_employee_id_idx" ON "payslips"("employee_id");

-- CreateIndex
CREATE INDEX "payslips_month_year_idx" ON "payslips"("month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "payslips_payroll_run_id_employee_id_key" ON "payslips"("payroll_run_id", "employee_id");

-- CreateIndex
CREATE INDEX "payslip_lines_payslip_id_idx" ON "payslip_lines"("payslip_id");

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_head_id_fkey" FOREIGN KEY ("head_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designations" ADD CONSTRAINT "designations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_designation_id_fkey" FOREIGN KEY ("designation_id") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_reporting_manager_id_fkey" FOREIGN KEY ("reporting_manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_types" ADD CONSTRAINT "leave_types_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_components" ADD CONSTRAINT "salary_components_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structures" ADD CONSTRAINT "salary_structures_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structure_lines" ADD CONSTRAINT "salary_structure_lines_salary_structure_id_fkey" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "salary_structure_lines" ADD CONSTRAINT "salary_structure_lines_salary_component_id_fkey" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salaries" ADD CONSTRAINT "employee_salaries_salary_structure_id_fkey" FOREIGN KEY ("salary_structure_id") REFERENCES "salary_structures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_runs" ADD CONSTRAINT "payroll_runs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_payroll_run_id_fkey" FOREIGN KEY ("payroll_run_id") REFERENCES "payroll_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslips" ADD CONSTRAINT "payslips_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_lines" ADD CONSTRAINT "payslip_lines_payslip_id_fkey" FOREIGN KEY ("payslip_id") REFERENCES "payslips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_lines" ADD CONSTRAINT "payslip_lines_salary_component_id_fkey" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
