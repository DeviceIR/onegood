"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { HERO_MESSAGES, heroMessageText } from "./hero-messages";
import { HERO_MESSAGE_INTERVAL } from "./constants";

export function RotatingHeroMessage() {
  // Message 01 on first paint (SSR + hydration match)
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const tick = () => {
      if (document.hidden) return;
      setIndex((i) => (i + 1) % HERO_MESSAGES.length);
    };
    const id = window.setInterval(tick, HERO_MESSAGE_INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  const current = HERO_MESSAGES[index]!;
  const textClass =
    "whitespace-pre-line ps-6 text-sm leading-[1.9] tracking-wide text-muted md:ps-8 md:text-base md:leading-[2] lg:text-lg lg:leading-[2.05]";

  return (
    <div className="relative w-full" aria-label="پیام برند ONE GOOD — حافظ خوبی‌ها">
      <div className="grid">
        {HERO_MESSAGES.map((m) => (
          <p
            key={`measure-${m.id}`}
            className={`invisible col-start-1 row-start-1 ${textClass}`}
            aria-hidden
          >
            {heroMessageText(m)}
          </p>
        ))}
        <div className="col-start-1 row-start-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.id}
              className={textClass}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(4px)" }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, y: -6, filter: "blur(3px)" }
              }
              transition={{ duration: reduce ? 0.2 : 0.9, ease: "easeOut" }}
            >
              {heroMessageText(current)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
