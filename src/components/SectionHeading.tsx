"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease, fadeUp, stagger, viewportOnce } from "@/lib/motion";

export function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className="mb-8 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
      </div>
    );
  }

  return (
    <motion.div
      className="mb-8 max-w-2xl"
      variants={stagger}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <motion.h2
        variants={fadeUp}
        className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"
        transition={{ duration: duration.slow, ease }}
      >
        {title}
      </motion.h2>
      {subtitle ? (
        <motion.p variants={fadeUp} className="mt-2 text-muted">
          {subtitle}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
