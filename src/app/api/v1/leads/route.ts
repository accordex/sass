// ==============================================================================
// API Route: /api/v1/leads — CRM Lead Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getLeads, createLead } from "@/app/actions/lead";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getLeads({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    source: searchParams.get("source") || "",
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
  const result = await createLead(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
