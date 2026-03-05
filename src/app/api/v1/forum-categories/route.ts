// ==============================================================================
// API Route: /api/v1/forum-categories — Forum Category Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getForumCategories, createForumCategory, updateForumCategory, deleteForumCategory } from "@/app/actions/elearning";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getForumCategories({
    search: searchParams.get("search") || "",
    includeInactive: searchParams.get("include_inactive") === "true",
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createForumCategory(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateForumCategory(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteForumCategory(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
