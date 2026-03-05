// ==============================================================================
// API Route: /api/v1/courses — Course Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCourses, createCourse, updateCourse, deleteCourse } from "@/app/actions/elearning";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getCourses({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    category_id: searchParams.get("category_id") || undefined,
    level: searchParams.get("level") || undefined,
    published: searchParams.has("published") ? searchParams.get("published") === "true" : undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createCourse(body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const body = await request.json();
  const result = await updateCourse(id, body);
  if ("error" in result) return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteCourse(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
