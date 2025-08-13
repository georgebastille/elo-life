import { NextRequest, NextResponse } from "next/server";
import { getRulesRepository } from "@/db/repositories/rulesRepo";
import { getMatchesRepository } from "@/db/repositories/matchesRepo";
import { updateElo } from "@/services/elo";

export async function POST(req: NextRequest) {
  const { winnerId, loserId } = await req.json();
  if (!winnerId || !loserId || winnerId === loserId) {
    return NextResponse.json({ error: "Invalid vote" }, { status: 400 });
  }
  const rules = getRulesRepository();
  const matches = getMatchesRepository();
  const a = await rules.findById(winnerId);
  const b = await rules.findById(loserId);
  if (!a || !b) return NextResponse.json({ error: "Rule not found" }, { status: 404 });

  const k = Number(process.env.ELO_K || 32);
  const { newA, newB, delta } = updateElo(a.rating, b.rating, "A", k);

  await rules.updateRatings([
    { id: a.id, rating: newA },
    { id: b.id, rating: newB },
  ]);
  await rules.incrementGames([a.id, b.id]);
  await matches.insert({ ruleAId: a.id, ruleBId: b.id, winnerId: a.id, delta });

  return NextResponse.json({ ok: true });
}
export const runtime = 'nodejs';
