// ==============================================================================
// API Route: /api/v1/invoices — Sales Invoice Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getSalesInvoices, createSalesInvoice } from "@/app/actions/accounting";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getSalesInvoices({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    customer_id: searchParams.get("customer_id") || "",
    sortBy: searchParams.get("sort_by") || "invoice_date",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createSalesInvoice(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
