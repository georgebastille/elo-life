// Fetch through the API to ensure consistent runtime and no build-time DB access
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

import { getRulesRepository } from "@/db/repositories/rulesRepo";

export default async function LeaderboardPage() {
  // Fetch directly from the repository on the server to avoid URL issues
  const repo = getRulesRepository();
  let rules: { id: string; text: string; rating: number; games_played: number }[] = [];
  try {
    rules = await repo.listOrdered(100, 0);
  } catch {
    rules = [];
  }
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
