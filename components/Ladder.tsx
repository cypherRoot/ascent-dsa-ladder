"use client";

import { useMemo, useRef, useState } from "react";
import type { Difficulty, Meta, Problem, View } from "@/lib/types";
import { useProgress } from "@/lib/useProgress";
import { useRevealBatch } from "./primitives";
import Dashboard from "./Dashboard";
import LadderFilters, { DIFFICULTIES } from "./LadderFilters";
import LadderHeader from "./LadderHeader";
import LadderSection, { type LadderSectionData } from "./LadderSection";

export default function Ladder({
  problems,
  meta,
}: {
  problems: Problem[];
  meta: Meta;
}) {
  const progress = useProgress();
  const [view, setView] = useState<View>("topic");
  const [search, setSearch] = useState("");
  const [difficulties, setDifficulties] = useState<Set<Difficulty>>(
    new Set(DIFFICULTIES)
  );
  const [coreOnly, setCoreOnly] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const ladderRef = useRef<HTMLDivElement>(null);

  const sections = useSections(problems, meta, view);
  const visibleSections = useFilteredSections(sections, {
    search,
    difficulties,
    coreOnly,
    hideSolved,
    solved: progress.solved,
  });
  const stats = useStats(problems, progress.solved, progress.mounted);

  useRevealBatch(ladderRef, [
    view,
    search.trim().toLowerCase(),
    coreOnly,
    hideSolved,
    [...difficulties].sort().join("|"),
    [...collapsedSections].sort().join("|"),
    progress.mounted,
  ]);

  const toggleDifficulty = (difficulty: Difficulty) => {
    setDifficulties((current) => {
      const next = new Set(current);
      next.has(difficulty) ? next.delete(difficulty) : next.add(difficulty);

      if (next.size === 0) next.add(difficulty);
      return next;
    });
  };

  const toggleSection = (key: string) => {
    setCollapsedSections((current) => {
      const next = new Set(current);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <>
      <LadderHeader
        view={view}
        onViewChange={setView}
        onExport={progress.exportJson}
        onImport={progress.importJson}
      />

      <Dashboard
        total={problems.length}
        solvedCount={stats.solvedCount}
        core={stats.core}
        byDiff={stats.byDifficulty}
        mounted={progress.mounted}
      />

      <LadderFilters
        viewLabel={view === "topic" ? "Grouped by data structure or subject" : "Grouped by recognition pattern"}
        search={search}
        selectedDifficulties={difficulties}
        coreOnly={coreOnly}
        hideSolved={hideSolved}
        onSearchChange={setSearch}
        onDifficultyToggle={toggleDifficulty}
        onCoreOnlyToggle={() => setCoreOnly((value) => !value)}
        onHideSolvedToggle={() => setHideSolved((value) => !value)}
        onReset={() => {
          if (confirm("Reset all progress on this device? This can't be undone.")) {
            progress.reset();
          }
        }}
      />

      <main ref={ladderRef} className="mx-auto max-w-shell px-4 pb-28 pt-10 sm:px-5">
        {visibleSections.length === 0 ? (
          <p className="py-24 text-center font-mono text-sm text-muted">
            No problems match these filters. Loosen a filter to see more rungs.
          </p>
        ) : (
          visibleSections.map((section, index) => (
            <LadderSection
              key={section.key}
              section={section}
              index={index}
              view={view}
              solved={progress.solved}
              mounted={progress.mounted}
              collapsed={collapsedSections.has(section.key)}
              onToggleCollapse={toggleSection}
              onToggleSolved={progress.toggle}
            />
          ))
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

function useSections(problems: Problem[], meta: Meta, view: View) {
  return useMemo(() => {
    if (view === "topic") {
      return meta.topics
        .map((topic) => ({
          key: topic,
          title: topic,
          cue: "",
          items: problems.filter((problem) => problem.topic === topic),
        }))
        .filter((section) => section.items.length > 0);
    }

    return meta.patterns
      .map((pattern) => ({
        key: pattern.name,
        title: pattern.name,
        cue: pattern.cue,
        items: problems.filter((problem) => problem.pattern === pattern.name),
      }))
      .filter((section) => section.items.length > 0);
  }, [problems, meta, view]);
}

function useFilteredSections(
  sections: Omit<LadderSectionData, "filtered">[],
  filters: {
    search: string;
    difficulties: Set<Difficulty>;
    coreOnly: boolean;
    hideSolved: boolean;
    solved: Set<number>;
  }
) {
  return useMemo(() => {
    const query = filters.search.trim().toLowerCase();

    return sections
      .map((section) => ({
        ...section,
        filtered: section.items.filter((problem) => {
          const matchesDifficulty = filters.difficulties.has(problem.difficulty);
          const matchesCore = !filters.coreOnly || problem.core;
          const matchesSearch = !query || problem.title.toLowerCase().includes(query);
          const matchesSolved = !filters.hideSolved || !filters.solved.has(problem.id);

          return matchesDifficulty && matchesCore && matchesSearch && matchesSolved;
        }),
      }))
      .filter((section) => section.filtered.length > 0);
  }, [
    sections,
    filters.search,
    filters.difficulties,
    filters.coreOnly,
    filters.hideSolved,
    filters.solved,
  ]);
}

function useStats(problems: Problem[], solved: Set<number>, mounted: boolean) {
  return useMemo(() => {
    const solvedCount = mounted
      ? problems.filter((problem) => solved.has(problem.id)).length
      : 0;

    return {
      solvedCount,
      core: {
        total: problems.filter((problem) => problem.core).length,
        solved: problems.filter((problem) => problem.core && solved.has(problem.id)).length,
      },
      byDifficulty: {
        Easy: getDifficultyStat(problems, solved, "Easy"),
        Medium: getDifficultyStat(problems, solved, "Medium"),
        Hard: getDifficultyStat(problems, solved, "Hard"),
      },
    };
  }, [problems, solved, mounted]);
}

function getDifficultyStat(
  problems: Problem[],
  solved: Set<number>,
  difficulty: Difficulty
) {
  const matching = problems.filter((problem) => problem.difficulty === difficulty);

  return {
    label: difficulty,
    total: matching.length,
    solved: matching.filter((problem) => solved.has(problem.id)).length,
  };
}
