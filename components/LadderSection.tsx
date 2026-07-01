"use client";

import type { Problem, View } from "@/lib/types";
import Rung from "./Rung";

export interface LadderSectionData {
  key: string;
  title: string;
  cue: string;
  items: Problem[];
  filtered: Problem[];
}

export default function LadderSection({
  section,
  index,
  view,
  solved,
  mounted,
  collapsed,
  onToggleCollapse,
  onToggleSolved,
}: {
  section: LadderSectionData;
  index: number;
  view: View;
  solved: Set<number>;
  mounted: boolean;
  collapsed: boolean;
  onToggleCollapse: (key: string) => void;
  onToggleSolved: (id: number) => void;
}) {
  const total = section.items.length;
  const done = mounted ? section.items.filter((problem) => solved.has(problem.id)).length : 0;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const sectionId = buildSectionId(view, section.key);

  return (
    <section className="mb-10 sm:mb-14">
      <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-xs text-faint tnum">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h2 className="min-w-0 flex-1 font-display text-lg font-semibold tracking-tight text-text sm:text-xl">
          {section.title}
        </h2>
        <span className="font-mono text-xs text-muted tnum">
          {done}/{total}
        </span>
        <span className="font-mono text-xs text-accent tnum">{percent}%</span>
        <CollapseButton
          title={section.title}
          collapsed={collapsed}
          controls={sectionId}
          onClick={() => onToggleCollapse(section.key)}
        />
      </div>

      {!collapsed && (
        <div id={sectionId}>
          {section.cue && (
            <p className="mb-4 max-w-2xl border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-muted">
              {section.cue}
            </p>
          )}

          <div className="flex gap-2 sm:gap-4">
            <div className="spine hidden self-stretch sm:block">
              <div className="spine__fill" style={{ height: `${percent}%` }} />
            </div>

            <div className="min-w-0 flex-1">
              {section.filtered.map((problem, itemIndex) => (
                <Rung
                  key={problem.id}
                  problem={problem}
                  index={itemIndex + 1}
                  solved={mounted && solved.has(problem.id)}
                  onToggle={onToggleSolved}
                  secondaryLabel={view === "topic" ? problem.pattern : problem.topic}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function CollapseButton({
  title,
  collapsed,
  controls,
  onClick,
}: {
  title: string;
  collapsed: boolean;
  controls: string;
  onClick: () => void;
}) {
  const label = collapsed ? `Expand ${title}` : `Collapse ${title}`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={!collapsed}
      aria-controls={controls}
      className="ml-auto inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accentSoft"
      title={label}
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="hidden font-mono text-[10px] uppercase tracking-[0.14em] sm:inline"
      >
        {collapsed ? "Show" : "Hide"}
      </span>
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform ${collapsed ? "-rotate-90" : ""}`}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

function buildSectionId(view: View, key: string) {
  return `section-${view}-${key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}
