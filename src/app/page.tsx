"use client";

import { useEffect, useState } from "react";

type Rule = { id: string; text: string; rating: number };
type PairResponse = { a: Rule; b: Rule };

export default function Home() {
  const [pair, setPair] = useState<PairResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPair = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/pair", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load pair");
      const data = (await res.json()) as PairResponse;
      setPair(data);
    } catch (e: any) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPair();
  }, []);

  const vote = async (winnerId: string, loserId: string) => {
    try {
      setLoading(true);
      await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, loserId }),
      });
    } catch (e) {
      // ignore for now; still try to load next
    } finally {
      await loadPair();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Vote your favorite</h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        Help rank the rules by choosing between two options.
      </p>

      {error && (
        <div className="text-red-600 bg-red-50 dark:bg-red-950/30 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {(!pair || loading) && (
        <div className="text-sm text-black/60 dark:text-white/60">Loading…</div>
      )}

      {pair && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            className="text-left rounded border p-4 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => vote(pair.a.id, pair.b.id)}
          >
            <div className="text-lg font-medium mb-2">{pair.a.text}</div>
            <div className="text-xs text-black/50 dark:text-white/50">
              Rating: {(pair.a.rating / 100).toFixed(2)}
            </div>
          </button>
          <button
            className="text-left rounded border p-4 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => vote(pair.b.id, pair.a.id)}
          >
            <div className="text-lg font-medium mb-2">{pair.b.text}</div>
            <div className="text-xs text-black/50 dark:text-white/50">
              Rating: {(pair.b.rating / 100).toFixed(2)}
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
