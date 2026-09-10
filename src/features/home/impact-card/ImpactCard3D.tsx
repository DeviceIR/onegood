"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useReducedMotion,
} from "framer-motion";
import { Money } from "@/components/Money";
import { AnimatedCounter } from "./AnimatedCounter";
import { toPersianDigits } from "@/lib/money";

type Stats = {
  totalDonationsToman: bigint | number;
  studentsHelped: number;
  campaignsCompleted: number;
  contributors: number;
};

function isEmptyStats(stats: Stats) {
  return (
    BigInt(stats.totalDonationsToman) === 0n &&
    stats.studentsHelped === 0 &&
    stats.campaignsCompleted === 0 &&
    stats.contributors === 0
  );
}

export function ImpactCard3D({ stats }: { stats: Stats }) {
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const empty = isEmptyStats(stats);
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 140, damping: 20 });
  const sry = useSpring(ry, { stiffness: 140, damping: 20 });

  function onMove(e: React.MouseEvent) {
    if (reduce || !ref.current || flipped) return;
    const rect = ref.current.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * 10);
    rx.set(-py * 8);
  }

  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <div className="relative mx-auto w-full max-w-md [perspective:1200px]">
      {!reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70"
          style={{
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(14,124,102,0.22), transparent 65%)",
          }}
          animate={{ opacity: [0.45, 0.75, 0.45] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={
          reduce
            ? undefined
            : { rotateX: srx, rotateY: sry, transformPerspective: 1200 }
        }
        className="relative"
        initial={reduce ? false : { opacity: 0, y: 22 }}
        animate={
          reduce
            ? undefined
            : { opacity: 1, y: [0, -6, 0] }
        }
        transition={
          reduce
            ? undefined
            : {
                opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
                y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
              }
        }
      >
        <button
          type="button"
          className="block w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-pressed={flipped}
          aria-label={
            flipped
              ? "بازگشت به روی کارت اثر ONE GOOD"
              : "مشاهده پشت کارت اثر ONE GOOD"
          }
          onClick={() => {
            setFlipped((v) => !v);
            rx.set(0);
            ry.set(0);
          }}
        >
          <motion.div
            className="relative aspect-[1.586/1] w-full [transform-style:preserve-3d]"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Front */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_28px_60px_-24px_rgba(15,23,22,0.65)] [backface-visibility:hidden]">
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(145deg, #1a2422 0%, #0f1715 42%, #162820 100%)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-80"
                style={{
                  background:
                    "radial-gradient(circle at 18% 12%, rgba(201,162,69,0.28), transparent 32%), radial-gradient(circle at 88% 78%, rgba(14,124,102,0.45), transparent 40%)",
                }}
              />

              <div className="relative flex h-full flex-col justify-between p-5 text-[#faf7f2] md:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p
                      className="text-[11px] font-semibold tracking-[0.28em] text-[#f0e6d2]"
                      dir="ltr"
                    >
                      ONE GOOD
                    </p>
                    <p className="mt-1 text-sm text-[#d8c9a8]">یک خوبی</p>
                  </div>
                  <span
                    className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#c9a245] shadow-[0_0_12px_rgba(201,162,69,0.7)]"
                    aria-hidden
                  />
                </div>

                <div>
                  <p className="text-[10px] tracking-wide text-[#b7b0a4]">
                    مجموع خوبی‌ها
                  </p>
                  {empty ? (
                    <>
                      <p className="mt-3 text-2xl font-semibold md:text-3xl">
                        {toPersianDigits(0)} تومان
                      </p>
                      <p className="mt-3 text-sm leading-relaxed text-[#cfc7bb]">
                        هنوز کمکی ثبت نشده — منتظر اولین خوبی هستیم.
                      </p>
                    </>
                  ) : (
                    <p className="mt-2 text-xl font-semibold md:text-2xl">
                      <Money amount={stats.totalDonationsToman} />
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] md:text-xs">
                  <div>
                    <p className="text-[#b7b0a4]">دانش‌آموز</p>
                    <p className="mt-1 text-base font-semibold md:text-lg">
                      <AnimatedCounter value={stats.studentsHelped} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[#b7b0a4]">کمک تکمیل</p>
                    <p className="mt-1 text-base font-semibold md:text-lg">
                      <AnimatedCounter value={stats.campaignsCompleted} />
                    </p>
                  </div>
                  <div>
                    <p className="text-[#b7b0a4]">همراه</p>
                    <p className="mt-1 text-base font-semibold md:text-lg">
                      <AnimatedCounter value={stats.contributors} />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_28px_60px_-24px_rgba(15,23,22,0.65)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(160deg, #121816 0%, #1c2824 100%)",
                }}
              />
              <div className="relative flex h-full flex-col pt-5 text-[#faf7f2]">
                <div className="h-10 shrink-0 bg-black/70" aria-hidden />
                <div className="mt-5 flex flex-1 flex-col px-5 pb-5 md:px-6">
                  <p className="text-sm leading-relaxed text-[#d8d2c8]">
                    {empty
                      ? "آمارها فقط از کمک‌ها و هزینه‌های واقعی ساخته می‌شوند."
                      : "مشارکت ← اقدام ← اثر"}
                  </p>
                  <p className="mt-3 text-xs text-[#a8a29a]">
                    یک خوبی کوچک می‌تواند بزرگ‌تر شود.
                  </p>
                  <div className="mt-auto flex items-end justify-between pt-6">
                    <p className="text-[11px] text-[#c9a245]">حافظ خوبی‌ها</p>
                    <p
                      className="text-[10px] tracking-[0.2em] text-[#b7b0a4]"
                      dir="ltr"
                    >
                      ONE GOOD CO.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </button>
        <p className="mt-3 text-center text-xs text-muted">
          {empty
            ? "آمار واقعی بعد از اولین مشارکت اینجا می‌آید"
            : "برای دیدن پشت کارت کلیک کنید"}
        </p>
      </motion.div>
    </div>
  );
}
