"use client";

import { useState } from "react";

export default function AddRulePage() {
  const [text, setText] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    if (!text.trim()) {
      setErr("Please enter a rule.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to add rule");
      }
      setText("");
      setMsg("Rule added! You can return to voting.");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-2">Add a new rule</h1>
      <p className="text-sm text-black/60 dark:text-white/60 mb-6">
        Keep it concise and meaningful. Duplicates are prevented.
      </p>

      {msg && <div className="mb-3 p-3 rounded bg-green-50 text-green-700">{msg}</div>}
      {err && <div className="mb-3 p-3 rounded bg-red-50 text-red-700">{err}</div>}

      <form onSubmit={submit} className="space-y-3">
        <textarea
          className="w-full min-h-[120px] p-3 border rounded bg-transparent"
          placeholder="e.g., Tell the truth, or at least don’t lie"
          value={text}
          maxLength={200}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="text-xs text-black/50 dark:text-white/50">{text.length}/200</div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
        >
          {loading ? "Adding…" : "Add Rule"}
        </button>
      </form>
    </div>
  );
}
