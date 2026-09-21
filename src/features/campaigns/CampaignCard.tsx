"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Money } from "@/components/Money";
import { CampaignProgress } from "@/features/campaigns/CampaignProgress";
import { toPersianDigits } from "@/lib/money";
import { fadeUp, hoverLift, tapPress } from "@/lib/motion";
import { MotionLink } from "@/components/motion/MotionLink";
import { motionLinkClass } from "@/lib/motion";

export type CampaignCardData = {
  slug: string;
  titleFa: string;
  summaryFa: string;
  targetAmountToman: bigint | number;
  collectedAmountToman: bigint | number;
  donorCount: number;
  deadline?: Date | null;
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const reduce = useReducedMotion();
  const target = BigInt(campaign.targetAmountToman);
  const collected = BigInt(campaign.collectedAmountToman);
  const pct =
    target > 0n ? Math.min(100, Number((collected * 100n) / target)) : 0;

  return (
    <motion.article
      variants={fadeUp}
      whileHover={reduce ? undefined : hoverLift}
      whileTap={reduce ? undefined : tapPress}
      className="rounded-2xl border border-border/70 bg-card/80 p-5 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.32)] md:p-6"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between md:gap-8">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-accent">کمپین فعال</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">
            {campaign.titleFa}
          </h3>
          <p className="mt-2 text-muted">{campaign.summaryFa}</p>
          <p className="mt-3 text-sm text-muted">
            {toPersianDigits(campaign.donorCount)} مشارکت‌کننده
          </p>
        </div>
        <div className="mt-5 w-full max-w-sm md:mt-0">
          <div className="mb-2 flex justify-between text-sm">
            <Money amount={collected} />
            <span className="text-muted">
              از <Money amount={target} />
            </span>
          </div>
          <CampaignProgress percent={pct} />
          <div className="mt-4">
            <MotionLink
              href={`/campaigns/${campaign.slug}`}
              className={motionLinkClass("primary")}
            >
              مشارکت در یک خوبی
            </MotionLink>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
