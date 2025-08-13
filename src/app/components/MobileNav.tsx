"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu when the route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape and lock scroll when open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", onKey);
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  return (
    <header className="sm:hidden border-b border-black/10 dark:border-white/10">
      <div className="p-4 flex items-center justify-between">
        <div className="text-lg font-semibold">Elo Life</div>
        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
        >
          {/* Hamburger / Close icon */}
          <svg
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Off-canvas drawer */}
      {/* Backdrop */}
      <div
        className={`${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        } fixed inset-0 z-40 bg-black/40 transition-opacity`}
        onClick={() => setOpen(false)}
      />
      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={`${
          open ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 z-50 h-full w-72 max-w-[80vw] border-r border-black/10 dark:border-white/10 bg-background transition-transform`}
      >
        <div className="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
          <div className="text-lg font-semibold">Elo Life</div>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setOpen(false)}
            className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-2">
          <Link
            href="/"
            className="block px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            Vote
          </Link>
          <Link
            href="/add"
            className="block px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            Add Rule
          </Link>
          <Link
            href="/leaderboard"
            className="block px-3 py-2 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            Leaderboard
          </Link>
        </nav>
      </aside>
    </header>
  );
}
