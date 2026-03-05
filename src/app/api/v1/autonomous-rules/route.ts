// ==============================================================================
// API Route: /api/v1/autonomous-rules — Autonomous Decision Rules
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAutonomousRules,
  createAutonomousRule,
  updateAutonomousRule,
  deleteAutonomousRule,
} from "@/app/actions/ai-enhancement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getAutonomousRules({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    decision_type: searchParams.get("decision_type") || undefined,
    module: searchParams.get("module") || undefined,
    is_active: searchParams.has("is_active") ? searchParams.get("is_active") === "true" : undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createAutonomousRule(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const result = await updateAutonomousRule(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteAutonomousRule(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
