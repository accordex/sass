// ==============================================================================
// API Route: /api/v1/salary-components — Salary Component Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSalaryComponents, createSalaryComponent, updateSalaryComponent, deleteSalaryComponent } from "@/app/actions/payroll";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getSalaryComponents({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 50,
    search: searchParams.get("search") || "",
    component_type: searchParams.get("component_type") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createSalaryComponent(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateSalaryComponent(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteSalaryComponent(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
