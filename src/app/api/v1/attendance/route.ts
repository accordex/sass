// ==============================================================================
// API Route: /api/v1/attendance — Attendance Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAttendance, createAttendance, updateAttendance, markBulkAttendance } from "@/app/actions/hrms";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getAttendance({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    employee_id: searchParams.get("employee_id") || "",
    date: searchParams.get("date") || "",
    status: searchParams.get("status") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const bulk = searchParams.get("bulk") === "true";
  const body = await request.json();

  if (bulk) {
    const result = await markBulkAttendance(body);
    if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
    return NextResponse.json(result, { status: 201 });
  }

  const result = await createAttendance(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateAttendance(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}
