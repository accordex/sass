// ==============================================================================
// API Route: /api/v1/partners — Partner Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getPartners, createPartner, updatePartner, deletePartner } from "@/app/actions/partner";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getPartners({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || undefined,
    partner_type: searchParams.get("partner_type") || undefined,
    tier: searchParams.get("tier") || undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createPartner(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updatePartner(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deletePartner(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
