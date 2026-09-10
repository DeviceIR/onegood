"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { toPersianDigits } from "@/lib/money";

export function AnimatedCounter({
  value,
  durationMs = 900,
}: {
  value: number;
  durationMs?: number;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const from = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, durationMs, reduce]);

  return <span>{toPersianDigits(display)}</span>;
}
