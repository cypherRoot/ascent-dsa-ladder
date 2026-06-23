# Ascent - DSA Interview Ladder

Climb the patterns that actually get asked. A curated ladder of **192 problems**
(Java warmups + NeetCode 150 + Striver-SDE high-frequency set),
viewable two ways from **one dataset**: by **topic** (the learning ladder) or by
**pattern** (the interview-technique ladder). Solve each on LeetCode / GfG, come
back, check it off. Your progress is saved per-browser, so you can share the link
and everyone climbs their own ladder.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
```

Production:

```bash
npm run build
npm run start
```

Requires Node 18.18+.

## How it's wired

- **`data/problems.json`** - the single source of truth. Every problem: `id`,
  `title`, `url`, `platform`, `topic`, `pattern`, `difficulty`, `core` (Blind 75),
  `sources`.
- **`data/meta.json`** - the ordered topic ladder and the pattern ladder (each
  pattern carries its *recognition cue*: the "when do I reach for this" trigger).
- **Two views, one dataset** - `Ladder.tsx` just groups `problems.json` by
  `topic` (data structures/subjects) or by `pattern` (recognition techniques).
  Because progress keys on `id`, solving in one view
  updates the other automatically.
- **Progress = localStorage** (`lib/useProgress.ts`). It's per-browser runtime
  state, not a file - that's why a shared link gives each visitor their own
  progress. **Export / Import** buttons give you a JSON backup you own (insurance
  against clearing your cache, or moving to another device).
- **Motion** - Lenis smooth-scroll + GSAP scroll-reveal and count-up, all
  disabled under `prefers-reduced-motion`.

## Add or edit problems

Append one object to `data/problems.json` (give it a unique `id`). If you use a
new pattern, add it to `meta.json`'s `patterns` array with a cue. That's it - it
flows into both views and the dashboard automatically.

## Deploy

Static-friendly. Push to GitHub and import on **Vercel** (zero config), or run
`npm run build && npm run start` on any Node host. Fonts load from Google Fonts at
runtime, so the host needs no special config.

## Design

"Instrument-panel / ascent" - deep charcoal surfaces, a single electric-indigo
signal for *your* progress, difficulty as a quiet mint/amber/coral 3-step,
Space Grotesk display + JetBrains Mono telemetry. The signature element is the
vertical **progress spine** beside each section and the hero **elevation gauge**.
