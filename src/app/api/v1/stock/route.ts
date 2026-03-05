// ==============================================================================
// API Route: /api/v1/stock — Stock Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getStockSummary, createStockAdjustment, getStockMovements } from "@/app/actions/inventory";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Movements endpoint
  if (searchParams.get("type") === "movements") {
    const result = await getStockMovements({
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("per_page")) || 20,
      product_id: searchParams.get("product_id") || "",
      warehouse_id: searchParams.get("warehouse_id") || "",
      movement_type: searchParams.get("movement_type") || "",
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
    return NextResponse.json(result);
  }

  // Stock summary (default)
  const result = await getStockSummary({
    search: searchParams.get("search") || "",
    warehouse_id: searchParams.get("warehouse_id") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createStockAdjustment(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}
