// ==============================================================================
// API Route: /api/v1/leave-requests — Leave Request Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getLeaveRequests, createLeaveRequest, approveRejectLeave } from "@/app/actions/hrms";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getLeaveRequests({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    employee_id: searchParams.get("employee_id") || "",
    status: searchParams.get("status") || "",
    from_date: searchParams.get("from_date") || "",
    to_date: searchParams.get("to_date") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createLeaveRequest(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await approveRejectLeave(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}
