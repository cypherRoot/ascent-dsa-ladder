"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Animated tabular number that counts up to `value`. */
export function CountUp({
  value,
  duration = 1.1,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    if (prefersReduced()) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const obj = { n: prev.current };
    const tween = gsap.to(obj, {
      n: value,
      duration,
      ease: "power2.out",
      onUpdate: () => setDisplay(Math.round(obj.n)),
    });
    prev.current = value;
    return () => {
      tween.kill();
    };
  }, [value, duration]);

  return (
    <span className={className}>{display}</span>
  );
}

/**
 * Batch-reveals every `.reveal` element inside `scope` as it scrolls into
 * view. Re-runs whenever `deps` change (tab/filter switches rebuild the list).
 */
export function useRevealBatch(scope: RefObject<HTMLElement>, deps: unknown[]) {
  useEffect(() => {
    const root = scope.current;
    if (!root) return;
    const items = Array.from(root.querySelectorAll<HTMLElement>(".reveal"));
    if (prefersReduced()) {
      items.forEach((el) => el.classList.add("is-in"));
      return;
    }
    items.forEach((el) => el.classList.remove("is-in"));
    const batch = ScrollTrigger.batch(items, {
      start: "top 92%",
      once: true,
      onEnter: (els) =>
        gsap.to(els, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.035,
          onStart: () => els.forEach((e) => e.classList.add("is-in")),
        }),
    });
    ScrollTrigger.refresh();
    return () => batch.forEach((t) => t.kill());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
