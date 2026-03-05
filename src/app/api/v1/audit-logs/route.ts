// ==============================================================================
// Audit Log API Routes — /api/v1/audit-logs
// ==============================================================================
// GET — List audit logs with filtering and pagination
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs } from "@/app/actions/audit";
import { auth } from "@/lib/auth";

/**
 * GET /api/v1/audit-logs — List audit logs
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const result = await getAuditLogs({
      page: parseInt(searchParams.get("page") || "1"),
      perPage: parseInt(searchParams.get("per_page") || "25"),
      action: searchParams.get("action") || "",
      resourceType: searchParams.get("resource_type") || "",
      userId: searchParams.get("user_id") || "",
      dateFrom: searchParams.get("date_from") || "",
      dateTo: searchParams.get("date_to") || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/v1/audit-logs error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch audit logs" } },
      { status: 500 }
    );
  }
}
