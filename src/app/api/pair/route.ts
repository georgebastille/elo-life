import { NextResponse } from "next/server";
import { getRulesRepository } from "@/db/repositories/rulesRepo";

export async function GET() {
  const repo = getRulesRepository();
  // Take a candidate pool of low-games_played items then pick two with minimal rating diff
  const pool = await repo.candidatePool(20);
  if (pool.length < 2) {
    return NextResponse.json({ error: "Not enough rules" }, { status: 400 });
  }
  // Choose two distinct with smallest rating distance among a few random samples
  let best: [number, number] | null = null;
  function dist(i: number, j: number) {
    return Math.abs(pool[i].rating - pool[j].rating);
  }
  const n = pool.length;
  for (let t = 0; t < 30; t++) {
    const i = Math.floor(Math.random() * n);
    let j = Math.floor(Math.random() * n);
    if (j === i) j = (j + 1) % n;
    if (!best || dist(i, j) < dist(best[0], best[1])) best = [i, j];
  }
  const [i, j] = best!;
  return NextResponse.json({ a: pool[i], b: pool[j] });
}
export const runtime = 'nodejs';
