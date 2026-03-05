// ==============================================================================
// API Route: /api/v1/certificates — Certificate Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCertificates, issueCertificate, revokeCertificate } from "@/app/actions/elearning";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getCertificates({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    course_id: searchParams.get("course_id") || undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const enrollmentId = body.enrollment_id;
  if (!enrollmentId) return NextResponse.json({ error: "enrollment_id is required" }, { status: 400 });
  const result = await issueCertificate(enrollmentId);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const action = searchParams.get("action");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  if (action === "revoke") {
    const result = await revokeCertificate(id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    return NextResponse.json(result);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
