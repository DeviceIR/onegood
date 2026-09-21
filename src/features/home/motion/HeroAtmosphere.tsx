"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/** Soft cursor-follow wash behind the hero. Decorative only. */
export function HeroAtmosphere() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 40, damping: 18 });
  const sy = useSpring(y, { stiffness: 40, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const onMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect();
      x.set(e.clientX - rect.left - rect.width / 2);
      y.set(e.clientY - rect.top - rect.height / 3);
    };
    parent.addEventListener("mousemove", onMove, { passive: true });
    return () => parent.removeEventListener("mousemove", onMove);
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <motion.div
        className="absolute left-1/2 top-[28%] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full opacity-50"
        style={{
          x: sx,
          y: sy,
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 22%, transparent), transparent 68%)",
        }}
      />
      <div className="hero-grain absolute inset-0" />
    </div>
  );
}
