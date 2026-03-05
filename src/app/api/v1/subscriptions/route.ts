// ==============================================================================
// API Route: /api/v1/subscriptions — Subscription & Billing Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAllSubscriptions, getCurrentSubscription, createSubscription, getBillingStats } from "@/app/actions/billing";

// GET: List subscriptions or get current / billing stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const view = searchParams.get("view"); // "current", "stats", or default (list)

  if (view === "current") {
    const result = await getCurrentSubscription();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  }

  if (view === "stats") {
    const result = await getBillingStats();
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json(result);
  }

  // Default: list all subscriptions (admin)
  const result = await getAllSubscriptions({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 10,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || "",
    sortBy: searchParams.get("sort_by") || "created_at",
    sortOrder: (searchParams.get("sort_order") as "asc" | "desc") || "desc",
  });

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

// POST: Create a new subscription for a tenant
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tenant_id, ...data } = body;

  if (!tenant_id) {
    return NextResponse.json({ error: "tenant_id is required" }, { status: 400 });
  }

  const result = await createSubscription(tenant_id, data);
  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
