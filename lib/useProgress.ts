"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "ascent.progress.v1";

/**
 * Per-user solved state lives in localStorage (not a file) so every visitor
 * who opens the shared link tracks their own ascent. Export/import gives a
 * JSON backup you own — insurance against clearing your cache.
 */
export function useProgress() {
  const [solved, setSolved] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const ids: number[] = JSON.parse(raw);
        setSolved(new Set(ids));
      }
    } catch {
      /* corrupt or unavailable storage — start clean */
    }
    setMounted(true);
  }, []);

  const persist = useCallback((next: Set<number>) => {
    setSolved(next);
    try {
      localStorage.setItem(KEY, JSON.stringify([...next]));
    } catch {
      /* storage full / blocked — keep in-memory */
    }
  }, []);

  const toggle = useCallback(
    (id: number) => {
      const next = new Set(solved);
      next.has(id) ? next.delete(id) : next.add(id);
      persist(next);
    },
    [solved, persist]
  );

  const reset = useCallback(() => persist(new Set()), [persist]);

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
          const data = JSON.parse(String(reader.result));
          const ids: number[] = Array.isArray(data) ? data : data.solved;
          if (Array.isArray(ids)) persist(new Set(ids.map(Number)));
        } catch {
          /* ignore malformed import */
        }
      };
      reader.readAsText(file);
    },
    [persist]
  );

  return { solved, mounted, toggle, reset, exportJson, importJson };
}
