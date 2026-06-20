"use client";

import type { Problem } from "@/lib/types";

const diffColor: Record<string, string> = {
  Easy: "text-easy",
  Medium: "text-medium",
  Hard: "text-hard",
};
const diffDot: Record<string, string> = {
  Easy: "bg-easy",
  Medium: "bg-medium",
  Hard: "bg-hard",
};

export default function Rung({
  problem,
  index,
  solved,
  onToggle,
  secondaryLabel,
}: {
  problem: Problem;
  index: number;
  solved: boolean;
  onToggle: (id: number) => void;
  secondaryLabel: string;
}) {
  return (
    <div
      className="reveal group grid grid-cols-[22px_2.4rem_1fr_auto] items-center gap-3 sm:gap-4 border-b border-line/70 py-3 pl-3 pr-2 transition-colors hover:bg-surface/60"
    >
      <button
        className="checkbox"
        data-on={solved}
        aria-pressed={solved}
        aria-label={solved ? `Mark ${problem.title} unsolved` : `Mark ${problem.title} solved`}
        onClick={() => onToggle(problem.id)}
      >
        <svg viewBox="0 0 24 24" width="14" height="14">
          <polyline points="4,12 10,18 20,6" />
        </svg>
      </button>

      <span className="font-mono text-xs text-faint tnum">
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 truncate font-medium ${
            solved ? "text-muted line-through decoration-accent/60" : "text-text"
          } hover:text-accentSoft`}
        >
          <span className="truncate">{problem.title}</span>
          {problem.core && (
            <span
              title="Blind 75 — the essential core"
              className="font-mono text-[10px] uppercase tracking-wider text-accent"
            >
              ★
            </span>
          )}
        </a>
        <div className="mt-1 flex items-center gap-3 font-mono text-[11px] text-faint">
          <span className="inline-flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${diffDot[problem.difficulty]}`} />
            <span className={diffColor[problem.difficulty]}>{problem.difficulty}</span>
          </span>
          <span className="truncate text-muted">{secondaryLabel}</span>
          <span className="hidden text-faint sm:inline">
            {problem.platform === "gfg" ? "GfG" : "LeetCode"}
          </span>
        </div>
      </div>

      <a
        href={problem.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted opacity-0 transition group-hover:opacity-100 hover:border-accent hover:text-accentSoft focus-visible:opacity-100"
        aria-label={`Open ${problem.title}`}
      >
        solve
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
    </div>
  );
}
