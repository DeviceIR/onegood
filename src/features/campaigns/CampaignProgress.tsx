"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { toPersianDigits } from "@/lib/money";
import { duration, ease } from "@/lib/motion";

export function CampaignProgress({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const reduce = useReducedMotion();

  return (
    <div
      ref={ref}
      className="h-2 w-full overflow-hidden rounded-full bg-border"
      role="progressbar"
      aria-valuenow={p}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`پیشرفت ${toPersianDigits(p)} درصد`}
    >
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: reduce || inView ? `${p}%` : 0 }}
        transition={{ duration: reduce ? 0 : duration.slow + 0.2, ease, delay: 0.08 }}
      />
    </div>
  );
}
