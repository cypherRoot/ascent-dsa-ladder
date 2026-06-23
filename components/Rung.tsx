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
      className="reveal group grid grid-cols-[24px_minmax(0,1fr)_36px] items-center gap-2 border-b border-line/70 py-3 pl-1 pr-0 transition-colors hover:bg-surface/60 sm:grid-cols-[22px_2.4rem_minmax(0,1fr)_auto] sm:gap-4 sm:pl-3 sm:pr-2"
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

      <span className="hidden font-mono text-xs text-faint tnum sm:inline">
        {String(index).padStart(2, "0")}
      </span>

      <div className="min-w-0">
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex min-w-0 items-center gap-2 text-sm font-medium sm:text-base ${
            solved ? "text-muted line-through decoration-accent/60" : "text-text"
          } hover:text-accentSoft`}
        >
          <span className="truncate">{problem.title}</span>
          {problem.core && (
            <span
              title="Blind 75 - the essential core"
              className="font-mono text-[10px] uppercase tracking-wider text-accent"
            >
              ★
            </span>
          )}
        </a>
        <div className="mt-1 flex min-w-0 items-center gap-2 font-mono text-[10px] text-faint sm:gap-3 sm:text-[11px]">
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
        className="flex h-8 w-8 items-center justify-center rounded-md border border-line font-mono text-[11px] text-muted transition hover:border-accent hover:text-accentSoft focus-visible:opacity-100 sm:h-auto sm:w-auto sm:gap-1.5 sm:px-2.5 sm:py-1.5 sm:opacity-0 sm:group-hover:opacity-100"
        aria-label={`Open ${problem.title}`}
      >
        <span className="sr-only sm:not-sr-only">solve</span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 17 17 7M9 7h8v8" />
        </svg>
      </a>
    </div>
  );
}
