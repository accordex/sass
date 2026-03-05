// ==============================================================================
// API Route: /api/v1/autonomous-decisions — Autonomous Decision Logs
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAutonomousDecisions,
  overrideAutonomousDecision,
} from "@/app/actions/ai-enhancement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getAutonomousDecisions({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    decision_type: searchParams.get("decision_type") || undefined,
    status: searchParams.get("status") || undefined,
    module: searchParams.get("module") || undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const result = await overrideAutonomousDecision(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
