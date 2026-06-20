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

  useRevealBatch(scope, [view, q, coreOnly, hideSolved, [...diffs].join(), mounted]);

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

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-shell items-center justify-between px-5 py-3">
          <a href="#" className="flex items-center gap-2">
            <span className="text-accent">▲</span>
            <span className="font-display text-base font-semibold tracking-tight">
              Ascent
            </span>
          </a>

          <div className="flex items-center gap-1 rounded-lg border border-line bg-surface p-1">
            {(["topic", "pattern"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                  view === v
                    ? "bg-accent text-white"
                    : "text-muted hover:text-text"
                }`}
              >
                {v === "topic" ? "By Topic" : "By Pattern"}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
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
      <div className="sticky top-[57px] z-20 border-b border-line bg-ink/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-shell flex-wrap items-center gap-3 px-5 py-3">
          <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" className="text-faint">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search problems"
              className="w-40 bg-transparent font-mono text-xs text-text placeholder:text-faint focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1">
            {DIFFS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiff(d)}
                className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition ${
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
            className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition ${
              coreOnly
                ? "border-accent/50 bg-accent/10 text-accentSoft"
                : "border-line text-faint hover:text-muted"
            }`}
          >
            ★ Blind 75
          </button>

          <button
            onClick={() => setHideSolved((v) => !v)}
            className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition ${
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
            className="ml-auto rounded-md border border-line px-2.5 py-1.5 font-mono text-[11px] text-faint transition hover:border-hard/50 hover:text-hard"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Ladder body */}
      <main ref={scope} className="mx-auto max-w-shell px-5 pb-28 pt-10">
        {visibleSections.length === 0 ? (
          <p className="py-24 text-center font-mono text-sm text-muted">
            No problems match these filters. Loosen a filter to see more rungs.
          </p>
        ) : (
          visibleSections.map((s, si) => {
            const total = s.items.length;
            const done = mounted ? s.items.filter((p) => solved.has(p.id)).length : 0;
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <section key={s.key} className="mb-14">
                <div className="mb-3 flex items-baseline gap-3">
                  <span className="font-mono text-xs text-faint tnum">
                    {String(si + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-text">
                    {s.title}
                  </h2>
                  <span className="font-mono text-xs text-muted tnum">
                    {done}/{total}
                  </span>
                  <span className="font-mono text-xs text-accent tnum">{pct}%</span>
                </div>
                {s.cue && (
                  <p className="mb-4 max-w-2xl border-l-2 border-accent/40 pl-3 text-sm italic leading-relaxed text-muted">
                    {s.cue}
                  </p>
                )}

                <div className="flex gap-4">
                  {/* signature spine */}
                  <div className="spine self-stretch">
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
              </section>
            );
          })
        )}

        <footer className="mt-16 border-t border-line pt-6 font-mono text-[11px] leading-relaxed text-faint">
          Progress is saved in this browser only (localStorage). Use Export to back
          it up or carry it to another device. Share the link — everyone climbs their
          own ladder.
        </footer>
      </main>
    </>
  );
}
