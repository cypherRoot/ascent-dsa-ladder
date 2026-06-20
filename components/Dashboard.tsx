"use client";

import { CountUp } from "./primitives";

interface Stat {
  label: string;
  solved: number;
  total: number;
  color?: string;
}

export default function Dashboard({
  total,
  solvedCount,
  core,
  byDiff,
  mounted,
}: {
  total: number;
  solvedCount: number;
  core: { solved: number; total: number };
  byDiff: { Easy: Stat; Medium: Stat; Hard: Stat };
  mounted: boolean;
}) {
  const pct = total ? Math.round((solvedCount / total) * 100) : 0;
  const shown = mounted ? solvedCount : 0;
  const shownPct = mounted ? pct : 0;

  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-shell grid-cols-1 gap-10 px-5 py-16 md:grid-cols-[1fr_auto] md:items-end md:py-20">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-accent">
            DSA Interview Ladder
          </p>
          <h1 className="mt-4 font-display text-5xl font-bold leading-[0.98] tracking-tight text-text sm:text-6xl">
            Climb the patterns
            <br />
            that get asked.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-muted">
            173 curated problems — NeetCode 150 plus the Striver-SDE high-frequency
            set — ordered into rungs. Solve each on LeetCode or GfG, then mark your
            ascent. Two ladders, one progress: climb by topic or by pattern.
          </p>

          <div className="mt-8 grid max-w-lg grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
            <StatCell label="Solved" value={shown} total={total} accent />
            <StatCell label="Core ★" value={mounted ? core.solved : 0} total={core.total} />
            <StatCell
              label="Remaining"
              value={total - shown}
              total={total}
              dim
            />
          </div>

          <div className="mt-4 flex max-w-lg flex-wrap gap-x-6 gap-y-2 font-mono text-[11px] text-faint">
            {(["Easy", "Medium", "Hard"] as const).map((d) => {
              const s = byDiff[d];
              return (
                <span key={d} className="inline-flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      d === "Easy" ? "bg-easy" : d === "Medium" ? "bg-medium" : "bg-hard"
                    }`}
                  />
                  <span className="text-muted">{d}</span>
                  <span className="tnum text-text">
                    {mounted ? s.solved : 0}/{s.total}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Signature: vertical elevation gauge */}
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-end">
            <div className="font-display text-4xl font-bold tnum text-text">
              <CountUp value={shownPct} />
              <span className="text-xl text-muted">%</span>
            </div>
            <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
              to ready
            </p>
          </div>
          <div className="relative h-44 w-3 overflow-hidden rounded-full border border-line bg-surface">
            <div
              className="absolute bottom-0 left-0 w-full rounded-full"
              style={{
                height: `${shownPct}%`,
                background: "linear-gradient(#9C90F8, #7C6CF6)",
                boxShadow: "0 0 14px rgba(124,108,246,0.6)",
                transition: "height 0.9s cubic-bezier(0.22,1,0.36,1)",
              }}
            />
            {[25, 50, 75].map((m) => (
              <span
                key={m}
                className="absolute left-0 h-px w-full bg-ink/70"
                style={{ bottom: `${m}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCell({
  label,
  value,
  total,
  accent,
  dim,
}: {
  label: string;
  value: number;
  total: number;
  accent?: boolean;
  dim?: boolean;
}) {
  return (
    <div className="bg-surface px-4 py-3.5">
      <div
        className={`font-display text-2xl font-semibold tnum ${
          accent ? "text-accentSoft" : dim ? "text-muted" : "text-text"
        }`}
      >
        <CountUp value={value} />
        <span className="text-sm text-faint">/{total}</span>
      </div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
        {label}
      </div>
    </div>
  );
}
