"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { Reveal } from "@/features/home/motion/Reveal";
import { SITE_NAME_EN } from "@/lib/seo";

const steps = [
  {
    step: "۱",
    title: "مشارکت",
    body: "یک مبلغ کوچک برای یک نیاز مشخص.",
  },
  {
    step: "۲",
    title: "اقدام",
    body: "خرید و تحویل وسیله‌های واقعی — با سند و شفافیت.",
  },
  {
    step: "۳",
    title: "اثر",
    body: "یک دانش‌آموز حمایت می‌شود؛ یک خوبی ادامه پیدا می‌کند.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLOListElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.45"],
  });
  const line = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  return (
    <ol ref={ref} className="relative mt-2 grid gap-8 md:grid-cols-3">
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute top-5 right-[12%] left-[12%] hidden h-px origin-right bg-accent/35 md:block"
          style={{ scaleX: line }}
        />
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute top-5 right-[12%] left-[12%] hidden h-px bg-border md:block"
        />
      )}
      {steps.map((item, i) => (
        <li key={item.step} className="relative">
          <Reveal delay={0.08 * (i + 1)} y={12}>
            <p className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-accent/30 bg-card text-sm font-semibold text-accent shadow-sm">
              {item.step}
            </p>
            <h3 className="mt-4 text-xl font-semibold">{item.title}</h3>
            <p className="mt-2 text-muted">{item.body}</p>
          </Reveal>
        </li>
      ))}
      <span className="sr-only">مسیر {SITE_NAME_EN}: مشارکت، اقدام، اثر</span>
    </ol>
  );
}
