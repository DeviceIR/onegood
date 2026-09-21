"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

export function DonationReference({ code }: { code: string }) {
  return (
    <p className="rounded-xl border border-border bg-card px-4 py-3 font-mono text-lg tracking-wide">
      {code}
    </p>
  );
}

function SuccessMark() {
  return (
    <motion.svg
      viewBox="0 0 72 72"
      className="mx-auto mb-6 h-16 w-16 text-accent"
      aria-hidden
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: duration.base, ease }}
    >
      <motion.circle
        cx="36"
        cy="36"
        r="32"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        initial={{ pathLength: 0, opacity: 0.3 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease }}
      />
      <motion.path
        d="M22 37.5 L32 47 L51 26"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.45, ease, delay: 0.35 }}
      />
    </motion.svg>
  );
}

function Confetti() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const bits = [
    { x: -48, delay: 0, color: "var(--color-accent)" },
    { x: -18, delay: 0.05, color: "var(--color-gold)" },
    { x: 12, delay: 0.1, color: "var(--color-accent)" },
    { x: 38, delay: 0.04, color: "var(--color-gold)" },
    { x: -32, delay: 0.12, color: "var(--color-gold)" },
    { x: 24, delay: 0.16, color: "var(--color-accent)" },
  ];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-8 h-24 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <motion.span
          key={i}
          className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full"
          style={{ background: b.color }}
          initial={{ opacity: 0, y: 0, x: b.x }}
          animate={{ opacity: [0, 1, 0], y: 56, x: b.x * 1.15 }}
          transition={{ duration: 1.15, ease: "easeOut", delay: b.delay }}
        />
      ))}
    </div>
  );
}

export function PaymentStatusBanner({
  variant,
  title,
  children,
}: {
  variant: "success" | "failed";
  title: string;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const failed = variant === "failed";

  return (
    <motion.div
      className="relative mx-auto max-w-lg px-4 py-20 text-center"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={
        reduce
          ? undefined
          : failed
            ? { opacity: 1, x: [0, -6, 6, -3, 3, 0], y: 0 }
            : { opacity: 1, y: 0 }
      }
      transition={{ duration: failed ? 0.55 : duration.base, ease }}
    >
      {variant === "success" ? (
        <>
          <Confetti />
          <SuccessMark />
        </>
      ) : null}
      <motion.h1
        className={`text-3xl font-semibold ${
          variant === "success" ? "text-accent" : "text-foreground"
        }`}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.base, ease, delay: 0.12 }}
      >
        {title}
      </motion.h1>
      <motion.div
        className="mt-4 text-muted"
        initial={reduce ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: duration.base, ease, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
