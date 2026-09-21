"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.fast + 0.08, ease }}
    >
      {children}
    </motion.div>
  );
}
