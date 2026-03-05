// ==============================================================================
// User API Routes — /api/v1/users
// ==============================================================================
// GET  — List users in current tenant
// POST — Create new user (admin invitation)
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getUsers, createUser } from "@/app/actions/user";
import { auth } from "@/lib/auth";

/**
 * GET /api/v1/users — List users with pagination and search
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
    const result = await getUsers({
      page: parseInt(searchParams.get("page") || "1"),
      perPage: parseInt(searchParams.get("per_page") || "10"),
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
      roleCode: searchParams.get("role") || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GET /api/v1/users error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to fetch users" } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/users — Create new user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const result = await createUser(body);

    if (!result.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: result.error } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { data: result.user, message: "User created successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/v1/users error:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: error.message || "Failed to create user" } },
      { status: 500 }
    );
  }
}
