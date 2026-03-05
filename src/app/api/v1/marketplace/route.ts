// ==============================================================================
// API Route: /api/v1/marketplace — Marketplace Listing Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getMarketplaceListings, createMarketplaceListing, updateMarketplaceListing, deleteMarketplaceListing } from "@/app/actions/partner";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getMarketplaceListings({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || undefined,
    listing_type: searchParams.get("listing_type") || undefined,
    partner_id: searchParams.get("partner_id") || undefined,
    is_featured: searchParams.has("is_featured") ? searchParams.get("is_featured") === "true" : undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createMarketplaceListing(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateMarketplaceListing(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteMarketplaceListing(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
