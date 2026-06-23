"use client";

import { useMemo, useRef, useState } from "react";
import type { Difficulty, Meta, Problem, View } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";
import { useRevealBatch } from "./primitives";
import Dashboard from "./Dashboard";
import Rung from "./Rung";

const DIFFS: Difficulty[] = ["Easy", "Medium", "Hard"];

export default function Ladder({
  problems,
  meta,
}: {
  problems: Problem[];
  meta: Meta;
}) {
  const { solved, mounted, toggle, exportJson, importJson, reset } = useProgress();
  const [view, setView] = useState<View>("topic");
  const [search, setSearch] = useState("");
  const [diffs, setDiffs] = useState<Set<Difficulty>>(new Set(DIFFS));
  const [coreOnly, setCoreOnly] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const scope = useRef<HTMLDivElement>(null);

  const q = search.trim().toLowerCase();
  const matches = (p: Problem) =>
    diffs.has(p.difficulty) &&
    (!coreOnly || p.core) &&
    (!q || p.title.toLowerCase().includes(q)) &&
    (!hideSolved || !solved.has(p.id));

  // Sections: same dataset, grouped two ways.
  const sections = useMemo(() => {
    if (view === "topic") {
      return meta.topics
        .map((t) => ({
          key: t,
          title: t,
          cue: "",
          items: problems.filter((p) => p.topic === t),
        }))
        .filter((s) => s.items.length > 0);
    }
    return meta.patterns
      .map((pat) => ({
        key: pat.name,
        title: pat.name,
        cue: pat.cue,
        items: problems.filter((p) => p.pattern === pat.name),
      }))
      .filter((s) => s.items.length > 0);
  }, [view, problems, meta]);

  const visibleSections = sections
    .map((s) => ({ ...s, filtered: s.items.filter(matches) }))
    .filter((s) => s.filtered.length > 0);
  const viewLabel =
    view === "topic"
      ? "Grouped by data structure or subject"
      : "Grouped by recognition pattern";
  const collapsedKey = [...collapsed].sort().join("|");

  useRevealBatch(scope, [
    view,
    q,
    coreOnly,
    hideSolved,
    [...diffs].join(),
    collapsedKey,
    mounted,
  ]);

  // overall stats (always full set, not filtered)
  const solvedCount = mounted ? problems.filter((p) => solved.has(p.id)).length : 0;
  const stat = (d: Difficulty) => {
    const all = problems.filter((p) => p.difficulty === d);
    return {
      label: d,
      total: all.length,
      solved: all.filter((p) => solved.has(p.id)).length,
    };
  };
  const coreStat = {
    total: problems.filter((p) => p.core).length,
    solved: problems.filter((p) => p.core && solved.has(p.id)).length,
  };

  const toggleDiff = (d: Difficulty) => {
    const next = new Set(diffs);
    next.has(d) ? next.delete(d) : next.add(d);
    if (next.size === 0) next.add(d); // never allow empty
    setDiffs(next);
  };
  const toggleSection = (key: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto grid max-w-shell grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:flex sm:justify-between sm:gap-3 sm:px-5 sm:py-3">
          <a href="#" className="flex min-w-0 shrink-0 items-center gap-2">
            <span className="text-accent">▲</span>
            <span className="font-display text-base font-semibold tracking-tight">
              Ascent
            </span>
          </a>

          <div className="order-3 col-span-2 flex w-full items-center gap-1 rounded-lg border border-line bg-surface p-1 sm:order-none sm:col-span-1 sm:w-auto">
            {(["topic", "pattern"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex-1 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition sm:flex-none ${
                  view === v
                    ? "bg-accent text-white"
                    : "text-muted hover:text-text"
                }`}
              >
                {v === "topic" ? "Topics" : "Patterns"}
              </button>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={exportJson}
              title="Export progress as JSON"
              className="rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accentSoft"
            >
              Export
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              title="Import progress JSON"
              className="hidden rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-muted transition hover:border-accent hover:text-accentSoft sm:block"
            >
              Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importJson(f);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </header>

      <Dashboard
        total={problems.length}
        solvedCount={solvedCount}
        core={coreStat}
        byDiff={{ Easy: stat("Easy"), Medium: stat("Medium"), Hard: stat("Hard") }}
        mounted={mounted}
      />

      {/* Filter bar */}
      <div className="border-b border-line bg-ink/95 backdrop-blur-md md:sticky md:top-[57px] md:z-20 md:bg-ink/85">
        <div className="mx-auto flex max-w-shell flex-col gap-2.5 px-3 py-3 sm:px-5 md:flex-row md:flex-wrap md:items-center md:gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-faint md:w-auto md:tracking-[0.2em]">
            {viewLabel}
          </span>
          <div className="flex min-w-0 items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 md:flex-1 lg:flex-none">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-faint">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems"
              className="min-w-0 flex-1 bg-transparent font-mono text-sm text-text placeholder:text-faint focus:outline-none md:text-xs lg:w-40"
            />
          </div>

          <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0">
            <div className="flex shrink-0 items-center gap-1">
              {DIFFS.map((d) => (
                <button
                  key={d}
                  onClick={() => toggleDiff(d)}
                  className={`rounded-md border px-3 py-2 font-mono text-[11px] transition md:px-2.5 md:py-1.5 ${
                    diffs.has(d)
                      ? d === "Easy"
                        ? "border-easy/40 bg-easy/10 text-easy"
                        : d === "Medium"
                        ? "border-medium/40 bg-medium/10 text-medium"
                        : "border-hard/40 bg-hard/10 text-hard"
                      : "border-line text-faint hover:text-muted"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

          <button
            onClick={() => setCoreOnly((v) => !v)}
            className={`shrink-0 rounded-md border px-3 py-2 font-mono text-[11px] transition md:px-2.5 md:py-1.5 ${
              coreOnly
                ? "border-accent/50 bg-accent/10 text-accentSoft"
                : "border-line text-faint hover:text-muted"
            }`}
          >
            ★ Blind 75
          </button>

          <button
            onClick={() => setHideSolved((v) => !v)}
            className={`shrink-0 rounded-md border px-3 py-2 font-mono text-[11px] transition md:px-2.5 md:py-1.5 ${
              hideSolved
                ? "border-accent/50 bg-accent/10 text-accentSoft"
                : "border-line text-faint hover:text-muted"
            }`}
          >
            Hide solved
          </button>

          <button
            onClick={() => {
              if (confirm("Reset all progress on this device? This can't be undone.")) reset();
            }}
            className="shrink-0 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-faint transition hover:border-hard/50 hover:text-hard md:ml-auto md:px-2.5 md:py-1.5"
          >
            Reset
          </button>
          </div>
        </div>
      </div>

      {/* Ladder body */}
      <main ref={scope} className="mx-auto max-w-shell px-4 pb-28 pt-10 sm:px-5">
        {visibleSections.length === 0 ? (
          <p className="py-24 text-center font-mono text-sm text-muted">
            No problems match these filters. Loosen a filter to see more rungs.
          </p>
        ) : (
          visibleSections.map((s, si) => {
            const total = s.items.length;
            const done = mounted ? s.items.filter((p) => solved.has(p.id)).length : 0;
            const pct = total ? Math.round((done / total) * 100) : 0;
            const isCollapsed = collapsed.has(s.key);
            const sectionId = `section-${view}-${s.key.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
            return (
              <section key={s.key} className="mb-10 sm:mb-14">
                <div className="mb-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-xs text-faint tnum">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <h2 className="min-w-0 flex-1 font-display text-lg font-semibold tracking-tight text-text sm:text-xl">
                    {s.title}
                  </h2>
                  <span className="font-mono text-xs text-muted tnum">
                    {done}/{total}
                  </span>
                  <span className="font-mono text-xs text-accent tnum">{pct}%</span>
                  <button
                    type="button"
                    onClick={() => toggleSection(s.key)}
                    aria-expanded={!isCollapsed}
                    aria-controls={sectionId}
                    className="ml-auto inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-line px-2 text-muted transition hover:border-accent hover:text-accentSoft"
                    title={isCollapsed ? `Expand ${s.title}` : `Collapse ${s.title}`}
                  >
                    <span className="sr-only">
                      {isCollapsed ? `Expand ${s.title}` : `Collapse ${s.title}`}
                    </span>
                    <span aria-hidden="true" className="hidden font-mono text-[10px] uppercase tracking-[0.14em] sm:inline">
                      {isCollapsed ? "Show" : "Hide"}
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
                      className={`transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                </div>
                {!isCollapsed && (
                  <div id={sectionId}>
                    {s.cue && (
                      <p className="mb-4 max-w-2xl border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-muted">
                        {s.cue}
                      </p>
                    )}

                    <div className="flex gap-2 sm:gap-4">
                      {/* signature spine */}
                      <div className="spine hidden self-stretch sm:block">
                        <div className="spine__fill" style={{ height: `${pct}%` }} />
                      </div>

                      <div className="min-w-0 flex-1">
                        {s.filtered.map((p, i) => (
                          <Rung
                            key={p.id}
                            problem={p}
                            index={i + 1}
                            solved={mounted && solved.has(p.id)}
                            onToggle={toggle}
                            secondaryLabel={view === "topic" ? p.pattern : p.topic}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            );
          })
        )}

        <footer className="mt-16 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-faint">
          Progress is saved in this browser only (localStorage). Use Export to back
          it up or carry it to another device. Share the link - everyone climbs their
          own ladder.
        </footer>
      </main>
    </>
  );
}
