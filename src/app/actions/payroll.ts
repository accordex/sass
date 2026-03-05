"use server";

// ==============================================================================
// Payroll Server Actions — Phase 3
// ==============================================================================
// CRUD for: Salary Components, Salary Structures, Employee Salary, Payroll Runs
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import { PayrollStatus } from "@/generated/prisma/client";
import {
  CreateSalaryComponentSchema, UpdateSalaryComponentSchema,
  CreateSalaryStructureSchema, UpdateSalaryStructureSchema,
  CreateEmployeeSalarySchema, UpdateEmployeeSalarySchema,
  CreatePayrollRunSchema,
} from "@/lib/validations/payroll";
import { revalidatePath } from "next/cache";

// ==============================================================================
// SALARY COMPONENT ACTIONS
// ==============================================================================

export async function getSalaryComponents({
  page = 1, perPage = 50, search = "", component_type = "",
}: { page?: number; perPage?: number; search?: string; component_type?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (component_type) where.component_type = component_type;

  const [components, total] = await Promise.all([
    prisma.salaryComponent.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      orderBy: { sort_order: "asc" },
    }),
    prisma.salaryComponent.count({ where }),
  ]);

  return { components, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createSalaryComponent(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateSalaryComponentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const component = await prisma.salaryComponent.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/payroll/salary-components");
    return { component };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Component code already exists" };
    return { error: "Failed to create salary component" };
  }
}

export async function updateSalaryComponent(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateSalaryComponentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const component = await prisma.salaryComponent.update({ where: { id }, data: parsed.data });
    revalidatePath("/payroll/salary-components");
    return { component };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Component code already exists" };
    return { error: "Failed to update salary component" };
  }
}

export async function deleteSalaryComponent(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.salaryComponent.delete({ where: { id } });
    revalidatePath("/payroll/salary-components");
    return { success: true };
  } catch {
    return { error: "Failed to delete salary component. It may be in use." };
  }
}

// ==============================================================================
// SALARY STRUCTURE ACTIONS
// ==============================================================================

export async function getSalaryStructures({
  page = 1, perPage = 20, search = "",
}: { page?: number; perPage?: number; search?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
    ];
  }

  const [structures, total] = await Promise.all([
    prisma.salaryStructure.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        lines: { include: { salary_component: { select: { id: true, name: true, code: true, component_type: true } } }, orderBy: { sort_order: "asc" } },
        _count: { select: { employee_salaries: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.salaryStructure.count({ where }),
  ]);

  return { structures, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getSalaryStructureById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const structure = await prisma.salaryStructure.findFirst({
    where: { id, tenant_id: tenantId },
    include: {
      lines: { include: { salary_component: true }, orderBy: { sort_order: "asc" } },
    },
  });

  if (!structure) return { error: "Salary structure not found" };
  return { structure };
}

export async function createSalaryStructure(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateSalaryStructureSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { lines, ...rest } = parsed.data;
    const structure = await prisma.salaryStructure.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        lines: lines?.length ? {
          create: lines.map((l) => ({ ...l })),
        } : undefined,
      },
      include: { lines: { include: { salary_component: true } } },
    });
    revalidatePath("/payroll/salary-structures");
    return { structure };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Structure code already exists" };
    return { error: "Failed to create salary structure" };
  }
}

export async function updateSalaryStructure(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateSalaryStructureSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { lines, ...rest } = parsed.data;

    // If lines are provided, replace them
    if (lines) {
      await prisma.salaryStructureLine.deleteMany({ where: { salary_structure_id: id } });
      await prisma.salaryStructureLine.createMany({
        data: lines.map((l) => ({ salary_structure_id: id, ...l })),
      });
    }

    const structure = await prisma.salaryStructure.update({
      where: { id }, data: rest,
      include: { lines: { include: { salary_component: true } } },
    });
    revalidatePath("/payroll/salary-structures");
    return { structure };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Structure code already exists" };
    return { error: "Failed to update salary structure" };
  }
}

export async function deleteSalaryStructure(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.salaryStructureLine.deleteMany({ where: { salary_structure_id: id } });
    await prisma.salaryStructure.delete({ where: { id } });
    revalidatePath("/payroll/salary-structures");
    return { success: true };
  } catch {
    return { error: "Failed to delete salary structure. It may have associated employees." };
  }
}

// ==============================================================================
// EMPLOYEE SALARY ACTIONS
// ==============================================================================

export async function getEmployeeSalaries({
  page = 1, perPage = 10, search = "", employee_id = "",
}: { page?: number; perPage?: number; search?: string; employee_id?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (employee_id) where.employee_id = employee_id;
  if (search) {
    where.employee = {
      OR: [
        { first_name: { contains: search, mode: "insensitive" } },
        { last_name: { contains: search, mode: "insensitive" } },
        { employee_code: { contains: search, mode: "insensitive" } },
      ],
    };
  }

  const [salaries, total] = await Promise.all([
    prisma.employeeSalary.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: { select: { name: true } } } },
        salary_structure: { select: { id: true, name: true, code: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.employeeSalary.count({ where }),
  ]);

  return { salaries, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createEmployeeSalary(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateEmployeeSalarySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { effective_from, effective_until, ...rest } = parsed.data;

    // Delete any existing salary for this employee (unique constraint on employee_id)
    await prisma.employeeSalary.deleteMany({
      where: { employee_id: rest.employee_id },
    });

    const salary = await prisma.employeeSalary.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        effective_from: new Date(effective_from),
        effective_until: effective_until ? new Date(effective_until) : null,
      },
    });
    revalidatePath("/payroll/employee-salary");
    return { salary };
  } catch {
    return { error: "Failed to assign salary" };
  }
}

export async function updateEmployeeSalary(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateEmployeeSalarySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { effective_from, effective_until, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (effective_from) updateData.effective_from = new Date(effective_from);
    if (effective_until !== undefined) updateData.effective_until = effective_until ? new Date(effective_until) : null;

    const salary = await prisma.employeeSalary.update({ where: { id }, data: updateData });
    revalidatePath("/payroll/employee-salary");
    return { salary };
  } catch {
    return { error: "Failed to update employee salary" };
  }
}

// ==============================================================================
// PAYROLL RUN ACTIONS
// ==============================================================================

export async function getPayrollRuns({
  page = 1, perPage = 10, year = 0, month = 0, status = "",
}: { page?: number; perPage?: number; year?: number; month?: number; status?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (year) where.year = year;
  if (month) where.month = month;
  if (status) where.status = status;

  const [payrollRuns, total] = await Promise.all([
    prisma.payrollRun.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        _count: { select: { payslips: true } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.payrollRun.count({ where }),
  ]);

  return { payrollRuns, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createPayrollRun(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreatePayrollRunSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  // Check no existing run for same month/year
  const existing = await prisma.payrollRun.findFirst({
    where: { tenant_id: tenantId, month: parsed.data.month, year: parsed.data.year },
  });
  if (existing) return { error: `Payroll run already exists for ${parsed.data.month}/${parsed.data.year}` };

  try {
    const { period_start, period_end, ...rest } = parsed.data;
    const runNumber = `PAY-RUN-${rest.year}-${String(rest.month).padStart(2, "0")}`;
    const run = await prisma.payrollRun.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        run_number: runNumber,
        period_start: new Date(period_start),
        period_end: new Date(period_end),
        status: "DRAFT",
        processed_by: (user as any).id,
      },
    });
    revalidatePath("/payroll/runs");
    return { run };
  } catch {
    return { error: "Failed to create payroll run" };
  }
}

export async function processPayrollRun(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const run = await prisma.payrollRun.findFirst({ where: { id, tenant_id: tenantId } });
  if (!run) return { error: "Payroll run not found" };
  if (run.status !== "DRAFT") return { error: "Only DRAFT payroll runs can be processed" };

  try {
    // Get all employees with salary info
    const employeeSalaries = await prisma.employeeSalary.findMany({
      where: { tenant_id: tenantId },
      include: {
        employee: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
      },
    });

    // Generate payslips
    let processed = 0;
    let payslipCounter = 1;

    for (const es of employeeSalaries) {
      const workingDays = 30;
      const daysWorked = workingDays;

      const grossSalary = Number(es.monthly_gross);
      const totalDeductions = grossSalary - Number(es.monthly_net);
      const netSalary = Number(es.monthly_net);
      const totalEarnings = grossSalary;

      const payslipNumber = `PS-${run.year}-${String(run.month).padStart(2, "0")}-${String(payslipCounter).padStart(4, "0")}`;

      await prisma.payslip.create({
        data: {
          payroll_run_id: id,
          employee_id: es.employee_id,
          payslip_number: payslipNumber,
          month: run.month,
          year: run.year,
          working_days: workingDays,
          days_worked: daysWorked,
          leave_days: 0,
          lop_days: 0,
          total_earnings: totalEarnings,
          total_deductions: totalDeductions,
          gross_salary: grossSalary,
          net_salary: netSalary,
        },
      });
      processed++;
      payslipCounter++;
    }

    await prisma.payrollRun.update({
      where: { id },
      data: {
        status: "PROCESSED",
        total_employees: processed,
        total_gross: employeeSalaries.reduce((sum, es) => sum + Number(es.monthly_gross), 0),
        total_deductions: employeeSalaries.reduce((sum, es) => sum + Number(es.monthly_gross) - Number(es.monthly_net), 0),
        total_net: employeeSalaries.reduce((sum, es) => sum + Number(es.monthly_net), 0),
        processed_at: new Date(),
      },
    });

    revalidatePath("/payroll/runs");
    return { success: true, processed };
  } catch (e: any) {
    console.error("Payroll processing error:", e);
    return { error: "Failed to process payroll run" };
  }
}

export async function approvePayrollRun(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const run = await prisma.payrollRun.findFirst({ where: { id } });
  if (!run) return { error: "Payroll run not found" };
  if (run.status !== "PROCESSED") return { error: "Only PROCESSED payroll runs can be approved" };

  try {
    await prisma.payrollRun.update({
      where: { id },
      data: { status: "APPROVED", approved_by: (user as any).id, approved_at: new Date() },
    });
    revalidatePath("/payroll/runs");
    return { success: true };
  } catch {
    return { error: "Failed to approve payroll run" };
  }
}

export async function updatePayrollRun(id: string, data: Record<string, unknown>) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const run = await prisma.payrollRun.findFirst({ where: { id, tenant_id: (user as any).tenantId } });
  if (!run) return { error: "Payroll run not found" };

  try {
    const updated = await prisma.payrollRun.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status as PayrollStatus } : {}),
        ...(data.status === "PROCESSING" ? { processed_at: new Date() } : {}),
        ...(data.status === "APPROVED" ? { approved_by: (user as any).id, approved_at: new Date() } : {}),
        ...(data.status === "PAID" ? { paid_at: new Date() } : {}),
      },
    });
    revalidatePath("/payroll/runs");
    return { run: updated };
  } catch {
    return { error: "Failed to update payroll run" };
  }
}

export async function deletePayrollRun(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const run = await prisma.payrollRun.findFirst({ where: { id, tenant_id: (user as any).tenantId } });
  if (!run) return { error: "Payroll run not found" };
  if (run.status !== "DRAFT") return { error: "Only DRAFT payroll runs can be deleted" };

  try {
    await prisma.payrollRun.delete({ where: { id } });
    revalidatePath("/payroll/runs");
    return { success: true };
  } catch {
    return { error: "Failed to delete payroll run" };
  }
}

// ==============================================================================
// PAYSLIP ACTIONS
// ==============================================================================

export async function getPayslips({
  page = 1, perPage = 10, payroll_run_id = "", employee_id = "", month = 0, year = 0,
  search = "", status = "",
}: {
  page?: number; perPage?: number; payroll_run_id?: string;
  employee_id?: string; month?: number; year?: number;
  search?: string; status?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = {};
  if (payroll_run_id) where.payroll_run_id = payroll_run_id;
  if (employee_id) where.employee_id = employee_id;
  if (month) where.month = month;
  if (year) where.year = year;

  // Filter by tenant through payroll_run
  where.payroll_run = { tenant_id: tenantId };
  if (status) where.payroll_run.status = status;

  // Search by employee name or payslip number
  if (search) {
    where.OR = [
      { payslip_number: { contains: search, mode: "insensitive" } },
      { employee: { first_name: { contains: search, mode: "insensitive" } } },
      { employee: { last_name: { contains: search, mode: "insensitive" } } },
      { employee: { employee_code: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [payslips, total] = await Promise.all([
    prisma.payslip.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: { select: { name: true } } } },
        payroll_run: { select: { id: true, status: true, run_number: true } },
        lines: { select: { component_name: true, component_type: true, amount: true, sort_order: true }, orderBy: { sort_order: "asc" } },
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
    }),
    prisma.payslip.count({ where }),
  ]);

  return { payslips, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getPayslipById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const payslip = await prisma.payslip.findFirst({
    where: { id },
    include: {
      employee: {
        select: {
          id: true, first_name: true, last_name: true, employee_code: true, email: true,
          pan_number: true, uan_number: true, bank_account_number: true, bank_name: true, bank_ifsc: true,
          department: { select: { name: true } },
          designation: { select: { title: true } },
        },
      },
      payroll_run: { select: { id: true, status: true, run_number: true } },
      lines: { include: { salary_component: true }, orderBy: { sort_order: "asc" } },
    },
  });

  if (!payslip) return { error: "Payslip not found" };
  return { payslip };
}

export async function deletePayslip(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const payslip = await prisma.payslip.findFirst({ where: { id } });
  if (!payslip) return { error: "Payslip not found" };

  try {
    await prisma.payslip.delete({ where: { id } });
    revalidatePath("/payroll/payslips");
    return { success: true };
  } catch {
    return { error: "Failed to delete payslip" };
  }
}

// ==============================================================================
// PAYROLL STATS
// ==============================================================================

export async function getPayrollStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const [totalEmployeesOnPayroll, currentRun, lastSixMonthsRuns] = await Promise.all([
    prisma.employeeSalary.count({ where: { tenant_id: tenantId } }),
    prisma.payrollRun.findFirst({
      where: { tenant_id: tenantId, month: currentMonth, year: currentYear },
    }),
    prisma.payrollRun.findMany({
      where: { tenant_id: tenantId },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 6,
    }),
  ]);

  return {
    totalEmployeesOnPayroll,
    currentRun,
    lastSixMonthsRuns,
    currentMonth,
    currentYear,
  };
}
