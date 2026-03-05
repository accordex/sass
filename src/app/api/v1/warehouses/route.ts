// ==============================================================================
// API Route: /api/v1/warehouses — Warehouse Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse } from "@/app/actions/inventory";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getWarehouses({
    search: searchParams.get("search") || "",
    includeInactive: searchParams.get("include_inactive") === "true",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createWarehouse(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateWarehouse(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteWarehouse(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
