// ==============================================================================
// API Route: /api/v1/payroll-runs — Payroll Run Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getPayrollRuns, createPayrollRun, processPayrollRun, approvePayrollRun, getPayrollStats } from "@/app/actions/payroll";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Stats endpoint
  if (searchParams.get("stats") === "true") {
    const result = await getPayrollStats();
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
    return NextResponse.json(result);
  }

  const result = await getPayrollRuns({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    year: Number(searchParams.get("year")) || 0,
    month: Number(searchParams.get("month")) || 0,
    status: searchParams.get("status") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createPayrollRun(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  let result;
  if (action === "process") {
    result = await processPayrollRun(id);
  } else if (action === "approve") {
    result = await approvePayrollRun(id);
  } else {
    return NextResponse.json({ error: "Invalid action. Use ?action=process or ?action=approve" }, { status: 400 });
  }

  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
