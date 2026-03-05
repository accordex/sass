// ==============================================================================
// API Route: /api/v1/employee-salary — Employee Salary Assignment
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getEmployeeSalaries, createEmployeeSalary, updateEmployeeSalary } from "@/app/actions/payroll";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getEmployeeSalaries({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    employee_id: searchParams.get("employee_id") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createEmployeeSalary(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateEmployeeSalary(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}
