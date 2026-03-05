// ==============================================================================
// API Route: /api/v1/deals — CRM Deal / Opportunity Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getDeals, createDeal } from "@/app/actions/deal";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getDeals({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    pipeline_id: searchParams.get("pipeline_id") || "",
    stage_id: searchParams.get("stage_id") || "",
    owner_id: searchParams.get("owner_id") || "",
    sortBy: searchParams.get("sort_by") || "created_at",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createDeal(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
