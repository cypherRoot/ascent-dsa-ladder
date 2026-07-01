"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "ascent.progress.v1";

function parseProgress(raw: string | null): Set<number> {
  if (!raw) return new Set();

  const data = JSON.parse(raw);
  const ids = Array.isArray(data) ? data : data?.solved;

  if (!Array.isArray(ids)) return new Set();

  return new Set(
    ids
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0)
  );
}

function writeProgress(next: Set<number>) {
  localStorage.setItem(KEY, JSON.stringify([...next]));
}

/**
 * Per-user solved state lives in localStorage (not a file) so every visitor
 * who opens the shared link tracks their own ascent. Export/import gives a
 * JSON backup you own - insurance against clearing your cache.
 */
export function useProgress() {
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setSolved(parseProgress(localStorage.getItem(KEY)));
    } catch {
      /* corrupt or unavailable storage - start clean */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    const syncFromAnotherTab = (event: StorageEvent) => {
      if (event.key !== KEY) return;

      try {
        setSolved(parseProgress(event.newValue));
      } catch {
        setSolved(new Set());
      }
    };

    window.addEventListener("storage", syncFromAnotherTab);
    return () => window.removeEventListener("storage", syncFromAnotherTab);
  }, []);

  const updateProgress = useCallback((buildNext: (current: Set<number>) => Set<number>) => {
    setSolved((current) => {
      const next = buildNext(current);

      try {
        writeProgress(next);
      } catch {
        /* storage full / blocked - keep in-memory */
      }

      return next;
    });
  }, []);

  const toggle = useCallback((id: number) => {
    updateProgress((current) => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, [updateProgress]);

  const reset = useCallback(() => updateProgress(() => new Set()), [updateProgress]);

  const exportJson = useCallback(() => {
    const blob = new Blob([JSON.stringify({ solved: [...solved] }, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ascent-progress.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [solved]);

  const importJson = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          updateProgress(() => parseProgress(String(reader.result)));
        } catch {
          /* ignore malformed import */
        }
      };
      reader.readAsText(file);
    },
    [updateProgress]
  );

  return { solved, mounted, toggle, reset, exportJson, importJson };
}
