"use server";

// ==============================================================================
// HRMS Server Actions — Phase 3
// ==============================================================================
// CRUD for: Departments, Designations, Employees, Attendance, Leave, Holidays
// ==============================================================================

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-utils";
import {
  CreateDepartmentSchema, UpdateDepartmentSchema,
  CreateDesignationSchema, UpdateDesignationSchema,
  CreateEmployeeSchema, UpdateEmployeeSchema,
  CreateAttendanceSchema, UpdateAttendanceSchema, BulkAttendanceSchema,
  CreateLeaveTypeSchema, UpdateLeaveTypeSchema,
  CreateLeaveRequestSchema, ApproveRejectLeaveSchema,
  CreateHolidaySchema, UpdateHolidaySchema,
  CreateEmployeeDocumentSchema,
} from "@/lib/validations/hrms";
import { revalidatePath } from "next/cache";

// ==============================================================================
// DEPARTMENT ACTIONS
// ==============================================================================

export async function getDepartments({
  page = 1, perPage = 50, search = "", is_active = "",
}: { page?: number; perPage?: number; search?: string; is_active?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, is_deleted: false };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { dept_code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (is_active === "true") where.is_active = true;
  if (is_active === "false") where.is_active = false;

  const [departments, total] = await Promise.all([
    prisma.department.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: { parent: { select: { id: true, name: true } }, head: { select: { id: true, first_name: true, last_name: true } }, _count: { select: { employees: true } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.count({ where }),
  ]);

  return { departments, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getDepartmentById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const department = await prisma.department.findFirst({
    where: { id, tenant_id: tenantId, is_deleted: false },
    include: { parent: true, head: { select: { id: true, first_name: true, last_name: true } }, children: true, employees: { select: { id: true, first_name: true, last_name: true, employee_code: true }, where: { is_deleted: false } } },
  });

  if (!department) return { error: "Department not found" };
  return { department };
}

export async function createDepartment(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateDepartmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const department = await prisma.department.create({
      data: { tenant_id: tenantId, ...parsed.data },
    });
    revalidatePath("/hrms/departments");
    return { department };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Department code already exists" };
    return { error: "Failed to create department" };
  }
}

export async function updateDepartment(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = UpdateDepartmentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const department = await prisma.department.update({
      where: { id }, data: parsed.data,
    });
    revalidatePath("/hrms/departments");
    return { department };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Department code already exists" };
    return { error: "Failed to update department" };
  }
}

export async function deleteDepartment(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.department.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date() } });
    revalidatePath("/hrms/departments");
    return { success: true };
  } catch {
    return { error: "Failed to delete department" };
  }
}

// ==============================================================================
// DESIGNATION ACTIONS
// ==============================================================================

export async function getDesignations({
  page = 1, perPage = 50, search = "",
}: { page?: number; perPage?: number; search?: string } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { code: { contains: search, mode: "insensitive" } },
      { grade: { contains: search, mode: "insensitive" } },
    ];
  }

  const [designations, total] = await Promise.all([
    prisma.designation.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: { _count: { select: { employees: true } } },
      orderBy: { sort_order: "asc" },
    }),
    prisma.designation.count({ where }),
  ]);

  return { designations, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createDesignation(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateDesignationSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const designation = await prisma.designation.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/hrms/designations");
    return { designation };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Designation code already exists" };
    return { error: "Failed to create designation" };
  }
}

export async function updateDesignation(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateDesignationSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const designation = await prisma.designation.update({ where: { id }, data: parsed.data });
    revalidatePath("/hrms/designations");
    return { designation };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Designation code already exists" };
    return { error: "Failed to update designation" };
  }
}

export async function deleteDesignation(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.designation.delete({ where: { id } });
    revalidatePath("/hrms/designations");
    return { success: true };
  } catch {
    return { error: "Failed to delete designation. It may have associated employees." };
  }
}

// ==============================================================================
// EMPLOYEE ACTIONS
// ==============================================================================

export async function getEmployees({
  page = 1, perPage = 10, search = "", department_id = "", status = "", employment_type = "",
  sortBy = "created_at", sortOrder = "desc",
}: {
  page?: number; perPage?: number; search?: string; department_id?: string;
  status?: string; employment_type?: string; sortBy?: string; sortOrder?: "asc" | "desc";
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId, is_deleted: false };
  if (search) {
    where.OR = [
      { first_name: { contains: search, mode: "insensitive" } },
      { last_name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { employee_code: { contains: search, mode: "insensitive" } },
    ];
  }
  if (department_id) where.department_id = department_id;
  if (status) where.status = status;
  if (employment_type) where.employment_type = employment_type;

  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        department: { select: { id: true, name: true, dept_code: true } },
        designation: { select: { id: true, title: true, code: true } },
        reporting_manager: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy,
    }),
    prisma.employee.count({ where }),
  ]);

  return { employees, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function getEmployeeById(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const employee = await prisma.employee.findFirst({
    where: { id, tenant_id: tenantId, is_deleted: false },
    include: {
      department: true,
      designation: true,
      reporting_manager: { select: { id: true, first_name: true, last_name: true, employee_code: true } },
      direct_reports: { select: { id: true, first_name: true, last_name: true, employee_code: true }, where: { is_deleted: false } },
      documents: { orderBy: { created_at: "desc" } },
      employee_salary: { include: { salary_structure: true } },
      leave_balances: { include: { leave_type: true } },
    },
  });

  if (!employee) return { error: "Employee not found" };
  return { employee };
}

export async function createEmployee(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateEmployeeSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { date_of_joining, date_of_birth, date_of_confirmation, date_of_exit, ...rest } = parsed.data;
    const employee = await prisma.employee.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        date_of_joining: new Date(date_of_joining),
        date_of_birth: date_of_birth ? new Date(date_of_birth) : null,
        date_of_confirmation: date_of_confirmation ? new Date(date_of_confirmation) : null,
        date_of_exit: date_of_exit ? new Date(date_of_exit) : null,
      },
    });
    revalidatePath("/hrms/employees");
    return { employee };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Employee code or email already exists" };
    return { error: "Failed to create employee" };
  }
}

export async function updateEmployee(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateEmployeeSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { date_of_joining, date_of_birth, date_of_confirmation, date_of_exit, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (date_of_joining) updateData.date_of_joining = new Date(date_of_joining);
    if (date_of_birth !== undefined) updateData.date_of_birth = date_of_birth ? new Date(date_of_birth) : null;
    if (date_of_confirmation !== undefined) updateData.date_of_confirmation = date_of_confirmation ? new Date(date_of_confirmation) : null;
    if (date_of_exit !== undefined) updateData.date_of_exit = date_of_exit ? new Date(date_of_exit) : null;

    const employee = await prisma.employee.update({ where: { id }, data: updateData });
    revalidatePath("/hrms/employees");
    return { employee };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Employee code or email already exists" };
    return { error: "Failed to update employee" };
  }
}

export async function deleteEmployee(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.employee.update({ where: { id }, data: { is_deleted: true, deleted_at: new Date(), status: "SEPARATED" } });
    revalidatePath("/hrms/employees");
    return { success: true };
  } catch {
    return { error: "Failed to delete employee" };
  }
}

export async function getEmployeeStats() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const [total, active, onNotice, separated, byDepartment, byType] = await Promise.all([
    prisma.employee.count({ where: { tenant_id: tenantId, is_deleted: false } }),
    prisma.employee.count({ where: { tenant_id: tenantId, is_deleted: false, status: "ACTIVE" } }),
    prisma.employee.count({ where: { tenant_id: tenantId, is_deleted: false, status: "ON_NOTICE" } }),
    prisma.employee.count({ where: { tenant_id: tenantId, is_deleted: false, status: "SEPARATED" } }),
    prisma.employee.groupBy({ by: ["department_id"], where: { tenant_id: tenantId, is_deleted: false }, _count: true }),
    prisma.employee.groupBy({ by: ["employment_type"], where: { tenant_id: tenantId, is_deleted: false }, _count: true }),
  ]);

  return { total, active, onNotice, separated, byDepartment, byType };
}

// ==============================================================================
// ATTENDANCE ACTIONS
// ==============================================================================

export async function getAttendance({
  page = 1, perPage = 20, employee_id = "", date = "", status = "", from_date = "", to_date = "",
}: {
  page?: number; perPage?: number; employee_id?: string; date?: string;
  status?: string; from_date?: string; to_date?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (employee_id) where.employee_id = employee_id;
  if (date) where.attendance_date = new Date(date);
  if (status) where.status = status;
  if (from_date && to_date) {
    where.attendance_date = { gte: new Date(from_date), lte: new Date(to_date) };
  }

  const [records, total] = await Promise.all([
    prisma.attendance.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: { employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: { select: { name: true } } } } },
      orderBy: [{ attendance_date: "desc" }, { employee: { first_name: "asc" } }],
    }),
    prisma.attendance.count({ where }),
  ]);

  return { records, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createAttendance(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateAttendanceSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { attendance_date, check_in, check_out, ...rest } = parsed.data;
    const record = await prisma.attendance.create({
      data: {
        tenant_id: tenantId,
        ...rest,
        attendance_date: new Date(attendance_date),
        check_in: check_in ? new Date(check_in) : null,
        check_out: check_out ? new Date(check_out) : null,
      },
    });
    revalidatePath("/hrms/attendance");
    return { record };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Attendance already marked for this date" };
    return { error: "Failed to mark attendance" };
  }
}

export async function updateAttendance(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateAttendanceSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { attendance_date, check_in, check_out, ...rest } = parsed.data;
    const updateData: any = { ...rest };
    if (attendance_date) updateData.attendance_date = new Date(attendance_date);
    if (check_in !== undefined) updateData.check_in = check_in ? new Date(check_in) : null;
    if (check_out !== undefined) updateData.check_out = check_out ? new Date(check_out) : null;

    const record = await prisma.attendance.update({ where: { id }, data: updateData });
    revalidatePath("/hrms/attendance");
    return { record };
  } catch {
    return { error: "Failed to update attendance" };
  }
}

export async function markBulkAttendance(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = BulkAttendanceSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const date = new Date(parsed.data.attendance_date);
    let created = 0;
    for (const rec of parsed.data.records) {
      await prisma.attendance.upsert({
        where: { employee_id_attendance_date: { employee_id: rec.employee_id, attendance_date: date } },
        update: { status: rec.status as any, check_in: rec.check_in ? new Date(rec.check_in) : null, check_out: rec.check_out ? new Date(rec.check_out) : null, notes: rec.notes },
        create: { tenant_id: tenantId, employee_id: rec.employee_id, attendance_date: date, status: rec.status as any, check_in: rec.check_in ? new Date(rec.check_in) : null, check_out: rec.check_out ? new Date(rec.check_out) : null, notes: rec.notes },
      });
      created++;
    }
    revalidatePath("/hrms/attendance");
    return { success: true, count: created };
  } catch {
    return { error: "Failed to mark bulk attendance" };
  }
}

// ==============================================================================
// LEAVE TYPE ACTIONS
// ==============================================================================

export async function getLeaveTypes() {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const leaveTypes = await prisma.leaveType.findMany({
    where: { tenant_id: tenantId },
    orderBy: { name: "asc" },
  });
  return { leaveTypes };
}

export async function createLeaveType(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateLeaveTypeSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const leaveType = await prisma.leaveType.create({ data: { tenant_id: tenantId, ...parsed.data } });
    revalidatePath("/hrms/leave");
    return { leaveType };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Leave type code already exists" };
    return { error: "Failed to create leave type" };
  }
}

export async function updateLeaveType(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateLeaveTypeSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const leaveType = await prisma.leaveType.update({ where: { id }, data: parsed.data });
    revalidatePath("/hrms/leave");
    return { leaveType };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "Leave type code already exists" };
    return { error: "Failed to update leave type" };
  }
}

// ==============================================================================
// LEAVE REQUEST ACTIONS
// ==============================================================================

export async function getLeaveRequests({
  page = 1, perPage = 10, employee_id = "", status = "", from_date = "", to_date = "",
}: {
  page?: number; perPage?: number; employee_id?: string; status?: string;
  from_date?: string; to_date?: string;
} = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const where: any = { tenant_id: tenantId };
  if (employee_id) where.employee_id = employee_id;
  if (status) where.status = status;
  if (from_date) where.start_date = { gte: new Date(from_date) };
  if (to_date) where.end_date = { ...(where.end_date || {}), lte: new Date(to_date) };

  const [requests, total] = await Promise.all([
    prisma.leaveRequest.findMany({
      where, skip: (page - 1) * perPage, take: perPage,
      include: {
        employee: { select: { id: true, first_name: true, last_name: true, employee_code: true, department: { select: { name: true } } } },
        leave_type: { select: { id: true, name: true, code: true } },
        approver: { select: { id: true, first_name: true, last_name: true } },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.leaveRequest.count({ where }),
  ]);

  return { requests, total, page, perPage, totalPages: Math.ceil(total / perPage) };
}

export async function createLeaveRequest(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateLeaveRequestSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  // Find the employee linked to the current user
  const employee = await prisma.employee.findFirst({ where: { tenant_id: tenantId, user_id: (user as any).id, is_deleted: false } });
  if (!employee) return { error: "No employee record found for current user" };

  try {
    const { start_date, end_date, ...rest } = parsed.data;
    const request = await prisma.leaveRequest.create({
      data: {
        tenant_id: tenantId,
        employee_id: employee.id,
        ...rest,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
      },
    });
    revalidatePath("/hrms/leave");
    return { request };
  } catch {
    return { error: "Failed to create leave request" };
  }
}

export async function approveRejectLeave(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = ApproveRejectLeaveSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  // Get the approver employee record
  const approver = await prisma.employee.findFirst({ where: { tenant_id: tenantId, user_id: (user as any).id, is_deleted: false } });

  try {
    const request = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status: parsed.data.status as any,
        approver_id: approver?.id || null,
        approver_notes: parsed.data.approver_notes,
        approved_at: new Date(),
      },
    });

    // If approved, update leave balance
    if (parsed.data.status === "APPROVED") {
      const leaveReq = await prisma.leaveRequest.findUnique({ where: { id }, include: { leave_type: true } });
      if (leaveReq) {
        const year = new Date().getFullYear();
        const fiscalYear = `${year - 1}-${year}`;
        const balance = await prisma.leaveBalance.findFirst({
          where: { employee_id: leaveReq.employee_id, leave_type_id: leaveReq.leave_type_id, fiscal_year: fiscalYear },
        });
        if (balance) {
          await prisma.leaveBalance.update({
            where: { id: balance.id },
            data: {
              used: { increment: Number(leaveReq.days_requested) },
              pending: { decrement: Number(leaveReq.days_requested) },
              available: { decrement: Number(leaveReq.days_requested) },
            },
          });
        }
      }
    }

    revalidatePath("/hrms/leave");
    return { request };
  } catch {
    return { error: "Failed to update leave request" };
  }
}

// ==============================================================================
// HOLIDAY ACTIONS
// ==============================================================================

export async function getHolidays({
  year = new Date().getFullYear(),
}: { year?: number } = {}) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const holidays = await prisma.holiday.findMany({
    where: { tenant_id: tenantId, year },
    orderBy: { date: "asc" },
  });
  return { holidays };
}

export async function createHoliday(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };
  const tenantId = (user as any).tenantId;

  const parsed = CreateHolidaySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { date, ...rest } = parsed.data;
    const holiday = await prisma.holiday.create({
      data: { tenant_id: tenantId, ...rest, date: new Date(date) },
    });
    revalidatePath("/hrms/holidays");
    return { holiday };
  } catch (e: any) {
    if (e.code === "P2002") return { error: "A holiday already exists on this date" };
    return { error: "Failed to create holiday" };
  }
}

export async function updateHoliday(id: string, data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = UpdateHolidaySchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const updateData: any = { ...parsed.data };
    if (updateData.date) updateData.date = new Date(updateData.date);
    const holiday = await prisma.holiday.update({ where: { id }, data: updateData });
    revalidatePath("/hrms/holidays");
    return { holiday };
  } catch {
    return { error: "Failed to update holiday" };
  }
}

export async function deleteHoliday(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.holiday.delete({ where: { id } });
    revalidatePath("/hrms/holidays");
    return { success: true };
  } catch {
    return { error: "Failed to delete holiday" };
  }
}

// ==============================================================================
// EMPLOYEE DOCUMENT ACTIONS
// ==============================================================================

export async function createEmployeeDocument(data: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const parsed = CreateEmployeeDocumentSchema.safeParse(data);
  if (!parsed.success) return { error: "Validation failed", details: parsed.error.flatten().fieldErrors };

  try {
    const { expiry_date, ...rest } = parsed.data;
    const doc = await prisma.employeeDocument.create({
      data: { ...rest, expiry_date: expiry_date ? new Date(expiry_date) : null },
    });
    revalidatePath("/hrms/employees");
    return { document: doc };
  } catch {
    return { error: "Failed to upload document" };
  }
}

export async function deleteEmployeeDocument(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  try {
    await prisma.employeeDocument.delete({ where: { id } });
    revalidatePath("/hrms/employees");
    return { success: true };
  } catch {
    return { error: "Failed to delete document" };
  }
}
