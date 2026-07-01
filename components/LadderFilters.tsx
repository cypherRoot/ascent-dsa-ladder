"use client";

import type { ReactNode } from "react";
import type { Difficulty } from "@/lib/types";

const FILTER_BUTTON =
  "shrink-0 rounded-md border px-3 py-2 font-mono text-[11px] transition md:px-2.5 md:py-1.5";

const ACTIVE_DIFFICULTY: Record<Difficulty, string> = {
  Easy: "border-easy/40 bg-easy/10 text-easy",
  Medium: "border-medium/40 bg-medium/10 text-medium",
  Hard: "border-hard/40 bg-hard/10 text-hard",
};

export const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function LadderFilters({
  viewLabel,
  search,
  selectedDifficulties,
  coreOnly,
  hideSolved,
  onSearchChange,
  onDifficultyToggle,
  onCoreOnlyToggle,
  onHideSolvedToggle,
  onReset,
}: {
  viewLabel: string;
  search: string;
  selectedDifficulties: Set<Difficulty>;
  coreOnly: boolean;
  hideSolved: boolean;
  onSearchChange: (search: string) => void;
  onDifficultyToggle: (difficulty: Difficulty) => void;
  onCoreOnlyToggle: () => void;
  onHideSolvedToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="border-b border-line bg-ink/95 backdrop-blur-md md:sticky md:top-[57px] md:z-20 md:bg-ink/85">
      <div className="mx-auto flex max-w-shell flex-col gap-2.5 px-3 py-3 sm:px-5 md:flex-row md:flex-wrap md:items-center md:gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint md:w-auto md:tracking-[0.2em]">
          {viewLabel}
        </span>

        <div className="flex min-w-0 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 md:flex-1 lg:flex-none">
          <SearchIcon />
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search problems"
            className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text placeholder:text-faint focus:outline-none md:text-xs lg:w-40"
          />
        </div>

        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
          <div className="flex shrink-0 items-center gap-1">
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => onDifficultyToggle(difficulty)}
                className={`${FILTER_BUTTON} ${
                  selectedDifficulties.has(difficulty)
                    ? ACTIVE_DIFFICULTY[difficulty]
                    : "border-line text-faint hover:text-muted"
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>

          <ToggleButton active={coreOnly} onClick={onCoreOnlyToggle}>
            {"\u2605"} Blind 75
          </ToggleButton>
          <ToggleButton active={hideSolved} onClick={onHideSolvedToggle}>
            Hide solved
          </ToggleButton>

          <button
            onClick={onReset}
            className={`${FILTER_BUTTON} border-line text-faint hover:border-hard/50 hover:text-hard md:ml-auto`}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`${FILTER_BUTTON} ${
        active
          ? "border-accent/50 bg-accent/10 text-accentSoft"
          : "border-line text-faint hover:text-muted"
      }`}
    >
      {children}
    </button>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-faint"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
