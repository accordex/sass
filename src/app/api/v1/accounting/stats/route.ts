// ==============================================================================
// API Route: /api/v1/accounting/stats — Accounting Dashboard Statistics
// ==============================================================================

import { NextResponse } from "next/server";
import { getAccountingStats } from "@/app/actions/accounting";

export async function GET() {
  const result = await getAccountingStats();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}
