"use client";

import { useRef } from "react";
import type { View } from "@/lib/types";

const VIEWS: View[] = ["topic", "pattern"];

export default function LadderHeader({
  view,
  onViewChange,
  onExport,
  onImport,
}: {
  view: View;
  onViewChange: (view: View) => void;
  onExport: () => void;
  onImport: (file: File) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto grid max-w-shell grid-cols-[1fr_auto] items-center gap-2 px-3 py-2.5 sm:flex sm:justify-between sm:gap-3 sm:px-5 sm:py-3">
        <a href="#" className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="text-accent">{"\u25B2"}</span>
          <span className="font-display text-base font-semibold tracking-tight">
            Ascent
          </span>
        </a>

        <div className="order-3 col-span-2 flex w-full items-center gap-1 rounded-lg border border-line bg-surface p-1 sm:order-none sm:col-span-1 sm:w-auto">
          {VIEWS.map((item) => (
            <button
              key={item}
              onClick={() => onViewChange(item)}
              className={`flex-1 rounded-md px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition sm:flex-none ${
                view === item
                  ? "bg-accent text-white"
                  : "text-muted hover:text-text"
              }`}
            >
              {item === "topic" ? "Topics" : "Patterns"}
            </button>
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onExport}
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
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onImport(file);
              event.target.value = "";
            }}
          />
        </div>
      </div>
    </header>
  );
}
