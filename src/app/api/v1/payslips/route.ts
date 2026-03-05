// ==============================================================================
// API Route: /api/v1/payslips — Payslip Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getPayslips, getPayslipById } from "@/app/actions/payroll";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Single payslip by ID
  const id = searchParams.get("id");
  if (id) {
    const result = await getPayslipById(id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 404 });
    return NextResponse.json(result);
  }

  const result = await getPayslips({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    payroll_run_id: searchParams.get("payroll_run_id") || "",
    employee_id: searchParams.get("employee_id") || "",
    month: Number(searchParams.get("month")) || 0,
    year: Number(searchParams.get("year")) || 0,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}
