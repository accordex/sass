// ==============================================================================
// API Route: /api/v1/bank-accounts — Bank Account Management
// ==============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getBankAccounts, createBankAccount } from "@/app/actions/accounting";

// GET: List all bank accounts for the tenant
export async function GET() {
  const result = await getBankAccounts();

  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 401 });
  }
  return NextResponse.json(result);
}

// POST: Create a new bank account
export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = await createBankAccount(body);

  if ("error" in result) {
    return NextResponse.json({ error: result.error, details: (result as any).details }, { status: 400 });
  }
  return NextResponse.json(result, { status: 201 });
}
