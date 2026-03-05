// ==============================================================================
// Notification API Routes — /api/v1/notifications
// ==============================================================================
// GET  — List notifications for current user
// PUT  — Mark notifications as read
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getNotifications, getUnreadCount, markAllAsRead } from "@/app/actions/notification";
import { auth } from "@/lib/auth";

/**
 * GET /api/v1/notifications — List notifications with filters
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

    // If requesting just the count
    if (searchParams.get("count_only") === "true") {
      const count = await getUnreadCount();
      return NextResponse.json({ data: { unread_count: count } });
    }

    const result = await getNotifications({
      page: parseInt(searchParams.get("page") || "1"),
      perPage: parseInt(searchParams.get("per_page") || "20"),
      filter: (searchParams.get("filter") as any) || "all",
      type: searchParams.get("type") || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/v1/notifications error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch notifications" } },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/v1/notifications — Mark all as read
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    await markAllAsRead();

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error: any) {
    console.error("PUT /api/v1/notifications error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to update notifications" } },
      { status: 500 }
    );
  }
}
