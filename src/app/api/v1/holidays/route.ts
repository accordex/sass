// ==============================================================================
// API Route: /api/v1/holidays — Holiday Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "@/app/actions/hrms";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getHolidays({
    year: Number(searchParams.get("year")) || new Date().getFullYear(),
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createHoliday(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateHoliday(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteHoliday(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
