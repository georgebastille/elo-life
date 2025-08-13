import { NextRequest, NextResponse } from "next/server";
import { getRulesRepository } from "@/db/repositories/rulesRepo";

function normalizeText(t: string) {
  return t.trim().replace(/\s+/g, " ").toLowerCase();
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const text: string | undefined = body.text;
  if (!text || normalizeText(text).length < 3 || text.length > 200) {
    return NextResponse.json({ error: "Invalid text" }, { status: 400 });
  }
  const repo = getRulesRepository();
  const exists = await repo.findByTextNormalized(normalizeText(text));
  if (exists) {
    return NextResponse.json({ error: "Rule already exists" }, { status: 409 });
  }
  const rule = await repo.create(text.trim());
  return NextResponse.json({ rule });
}
export const runtime = 'nodejs';
