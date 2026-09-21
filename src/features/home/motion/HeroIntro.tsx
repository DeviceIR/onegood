"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { RotatingHeroMessage } from "@/features/home/hero/RotatingHeroMessage";
import { MotionLink } from "@/components/motion/MotionLink";
import { duration, ease, fadeUp, motionLinkClass, stagger } from "@/lib/motion";
import {
  SITE_EXPRESSION_FA,
  SITE_NAME_EN,
  SITE_NAME_FA,
} from "@/lib/seo";

const container = stagger;

const item = fadeUp;

const letterContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05, delayChildren: 0.02 },
  },
};

const letterDrop = {
  hidden: { opacity: 0, y: -36 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease },
  },
};

/** Letter drop only for LTR English brand — Persian must stay whole for RTL shaping. */
function BrandLetterDrop({ text }: { text: string }) {
  return (
    <motion.p
      variants={letterContainer}
      className="text-sm font-semibold tracking-[0.28em] text-muted"
      dir="ltr"
      aria-label={text}
    >
      {Array.from(text).map((ch, i) => (
        <motion.span
          key={`${ch}-${i}`}
          variants={letterDrop}
          className="inline-block"
          aria-hidden
        >
          {ch === " " ? "\u00A0" : ch}
        </motion.span>
      ))}
    </motion.p>
  );
}

/** Staggered hero brand + title + CTAs. */
export function HeroIntro() {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div>
        <p
          className="text-sm font-semibold tracking-[0.28em] text-muted"
          dir="ltr"
        >
          {SITE_NAME_EN}
        </p>
        <h1
          className="mt-2 text-4xl font-bold tracking-tight text-accent md:text-5xl lg:text-6xl"
          dir="rtl"
        >
          {SITE_EXPRESSION_FA}
        </h1>
        <p className="mt-4 text-base font-medium tracking-wide text-muted md:mt-5 md:text-lg" dir="rtl">
          {SITE_NAME_FA}
        </p>
        <div className="mt-10 max-w-2xl">
          <RotatingHeroMessage />
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/campaigns"
            className={`${motionLinkClass("primary")} h-12 px-6`}
          >
            مشارکت در {SITE_EXPRESSION_FA}
          </Link>
          <Link
            href="/impact"
            className={`${motionLinkClass("secondary")} h-12 px-6`}
          >
            مشاهده اثر کمک‌ها
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="relative"
    >
      <BrandLetterDrop text={SITE_NAME_EN} />
      <motion.h1
        variants={item}
        className="mt-2 text-4xl font-bold tracking-tight text-accent md:text-5xl lg:text-6xl"
        dir="rtl"
      >
        {SITE_EXPRESSION_FA}
      </motion.h1>
      <motion.p
        variants={item}
        className="mt-4 text-base font-medium tracking-wide text-muted md:mt-5 md:text-lg"
        dir="rtl"
      >
        {SITE_NAME_FA}
      </motion.p>
      <motion.div variants={item} className="mt-10 max-w-2xl">
        <RotatingHeroMessage />
      </motion.div>
      <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
        <MotionLink
          href="/campaigns"
          className={`${motionLinkClass("primary")} h-12 px-6`}
        >
          مشارکت در {SITE_EXPRESSION_FA}
        </MotionLink>
        <MotionLink
          href="/impact"
          className={`${motionLinkClass("secondary")} h-12 px-6`}
        >
          مشاهده اثر کمک‌ها
        </MotionLink>
      </motion.div>
    </motion.div>
  );
}
