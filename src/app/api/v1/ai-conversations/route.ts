// ==============================================================================
// API Route: /api/v1/ai-conversations — AI Conversation Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getAIConversations,
  createAIConversation,
  updateAIConversation,
  deleteAIConversation,
} from "@/app/actions/ai-enhancement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const result = await getAIConversations({
    page: Number(searchParams.get("page")) || 1,
    perPage: Number(searchParams.get("per_page")) || 20,
    search: searchParams.get("search") || "",
    status: searchParams.get("status") || undefined,
    agent_id: searchParams.get("agent_id") || undefined,
  });
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 401 });
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createAIConversation(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const result = await updateAIConversation(body);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });
  const result = await deleteAIConversation(id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json(result);
}
