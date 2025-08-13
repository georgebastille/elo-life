import { NextRequest, NextResponse } from "next/server";
import { getRulesRepository } from "@/db/repositories/rulesRepo";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || 100), 200);
  const offset = Math.max(Number(searchParams.get("offset") || 0), 0);
  const repo = getRulesRepository();
  const rules = await repo.listOrdered(limit, offset);
  return NextResponse.json({ rules });
}
export const runtime = 'nodejs';
