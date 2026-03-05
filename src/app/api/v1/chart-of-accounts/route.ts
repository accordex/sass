// ==============================================================================
// API Route: /api/v1/chart-of-accounts — Chart of Accounts Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getChartOfAccounts, createChartOfAccount } from "@/app/actions/accounting";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getChartOfAccounts({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 50,
    search: searchParams.get("search") || "",
    account_type: searchParams.get("account_type") || "",
    sortBy: searchParams.get("sort_by") || "account_code",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "asc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createChartOfAccount(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
