// ==============================================================================
// API Route: /api/v1/bills — Purchase Bill Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getPurchaseBills, createPurchaseBill } from "@/app/actions/accounting";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getPurchaseBills({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    sortBy: searchParams.get("sort_by") || "bill_date",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createPurchaseBill(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
