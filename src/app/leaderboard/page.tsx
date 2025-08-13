// Fetch through the API to ensure consistent runtime and no build-time DB access
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { headers } from "next/headers";

export default async function LeaderboardPage() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host") || "";
  const protoHeader = h.get("x-forwarded-proto");
  const protocol = protoHeader || (process.env.VERCEL ? "https" : "http");
  const base = host ? `${protocol}://${host}` : "";
  const url = `${base}/api/leaderboard?limit=100`;
  const res = await fetch(url, { cache: "no-store" });
  const data = (await res.json().catch(() => ({ rules: [] }))) as { rules: { id: string; text: string; rating: number; games_played: number }[] };
  const rules = Array.isArray(data.rules) ? data.rules : [];
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Rule</th>
              <th className="py-2 pr-3">Rating</th>
              <th className="py-2">Games</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-3">{i + 1}</td>
                <td className="py-2 pr-3">{r.text}</td>
                <td className="py-2 pr-3">{(r.rating / 100).toFixed(2)}</td>
                <td className="py-2">{r.games_played}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
