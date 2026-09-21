"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, stagger, fadeUp, viewportOnce } from "@/lib/motion";

export function PageHeader({
  kicker,
  title,
  subtitle,
  dir,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  dir?: "rtl" | "ltr";
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <header className="mb-10 max-w-2xl">
        {kicker ? (
          <p className="text-sm font-semibold tracking-[0.2em] text-muted" dir="ltr">
            {kicker}
          </p>
        ) : null}
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl" dir={dir}>
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-3 leading-relaxed text-muted">{subtitle}</p>
        ) : null}
      </header>
    );
  }

  return (
    <motion.header
      className="mb-10 max-w-2xl"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {kicker ? (
        <motion.p
          variants={fadeUp}
          className="text-sm font-semibold tracking-[0.2em] text-muted"
          dir="ltr"
        >
          {kicker}
        </motion.p>
      ) : null}
      <motion.h1
        variants={fadeUp}
        className="mt-2 text-3xl font-bold tracking-tight md:text-4xl"
        dir={dir}
        transition={{ duration: duration.slow, ease }}
      >
        {title}
      </motion.h1>
      {subtitle ? (
        <motion.p variants={fadeUp} className="mt-3 leading-relaxed text-muted">
          {subtitle}
        </motion.p>
      ) : null}
    </motion.header>
  );
}
