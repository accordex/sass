// ==============================================================================
// API Route: /api/v1/analytics-dashboards — Analytics Dashboard Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAnalyticsDashboards,
  createAnalyticsDashboard,
  updateAnalyticsDashboard,
  deleteAnalyticsDashboard,
  getExecutiveDashboardStats,
} from "@/app/actions/ai-enhancement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Special route: ?stats=true returns cross-module executive stats
  if (searchParams.get("stats") === "true") {
    const result = await getExecutiveDashboardStats();
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
    return NextResponse.json(result);
  }

  const result = await getAnalyticsDashboards({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createAnalyticsDashboard(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const result = await updateAnalyticsDashboard(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteAnalyticsDashboard(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
