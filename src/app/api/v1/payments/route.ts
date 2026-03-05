// ==============================================================================
// API Route: /api/v1/payments — Payment Receipt & Payment Made Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getPaymentReceipts, createPaymentReceipt, getPaymentsMade, createPaymentMade } from "@/app/actions/accounting";

// GET: List payment receipts (incoming payments)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "receipts"; // "receipts" or "made"

  if (type === "made") {
    const result = await getPaymentsMade({
      page: Number(searchParams.get("page")) || 1,
      perPage: Number(searchParams.get("per_page")) || 10,
      search: searchParams.get("search") || "",
      sortBy: searchParams.get("sort_by") || "payment_date",
      sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  }

  // Default: payment receipts
  const result = await getPaymentReceipts({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    sortBy: searchParams.get("sort_by") || "payment_date",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

// POST: Create a payment receipt or payment made
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { type, ...data } = body;

  if (type === "made") {
    const result = await createPaymentMade(data);
    if ("error" in result) {
      return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
    }
    return NextResponse.json(result, { status: 201 });
  }

  // Default: create payment receipt
  const result = await createPaymentReceipt(data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
