"use client";

import { JalaliDate } from "@/components/JalaliDate";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";
import { hoverLift } from "@/lib/motion";

export function TestimonialCard({
  authorDisplayName,
  authorRole,
  bodyFa,
}: {
  authorDisplayName: string;
  authorRole: string;
  bodyFa: string;
}) {
  const reduce = useReducedMotion();
  const roleFa: Record<string, string> = {
    DONOR: "خیر",
    VOLUNTEER: "داوطلب",
    TEACHER: "معلم",
    COMMUNITY: "عضو جامعه",
    GUARDIAN: "سرپرست",
  };

  return (
    <motion.blockquote
      className="relative border-s-2 border-accent ps-5"
      whileHover={reduce ? undefined : { y: -2 }}
    >
      <span
        className="pointer-events-none absolute -top-3 end-0 text-5xl font-serif leading-none text-accent/20"
        aria-hidden
      >
        «
      </span>
      <p className="text-lg leading-relaxed text-foreground/90">«{bodyFa}»</p>
      <footer className="mt-4 text-sm text-muted">
        <cite className="not-italic font-medium text-foreground">
          {authorDisplayName}
        </cite>
        <span className="mx-2">·</span>
        <span>{roleFa[authorRole] ?? authorRole}</span>
      </footer>
    </motion.blockquote>
  );
}

export function ImpactGalleryGrid({
  items,
}: {
  items: {
    id: string;
    itemsSummaryFa: string;
    publicDescriptionFa: string;
    deliveredAt: Date;
    campaignTitle: string;
    imageUrl?: string | null;
    imageAlt?: string | null;
  }[];
}) {
  const reduce = useReducedMotion();

  if (!items.length) return null;

  return (
    <Stagger as="ul" className="grid gap-8 sm:grid-cols-2">
      {items.map((item) => (
        <FadeItem key={item.id} as="li" className="overflow-hidden rounded-2xl border border-border/70 bg-card/70 p-0 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.3)]">
          {item.imageUrl ? (
            <div className="aspect-[4/3] overflow-hidden bg-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                src={item.imageUrl}
                alt={item.imageAlt ?? item.itemsSummaryFa}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
                whileHover={reduce ? undefined : { scale: 1.04 }}
                transition={{ duration: 0.5 }}
              />
            </div>
          ) : null}
          <div className="p-5">
            <p className="text-sm text-muted">{item.campaignTitle}</p>
            <h3 className="mt-1 text-lg font-medium">{item.itemsSummaryFa}</h3>
            <p className="mt-2 text-muted">{item.publicDescriptionFa}</p>
            <JalaliDate date={item.deliveredAt} className="mt-3 block text-sm text-muted" />
          </div>
        </FadeItem>
      ))}
    </Stagger>
  );
}

export function VideoTeaser({
  videos,
}: {
  videos: { id: string; title: string; href?: string }[];
}) {
  const reduce = useReducedMotion();

  if (!videos.length) return null;

  return (
    <Stagger as="ul" className="grid gap-4 sm:grid-cols-2">
      {videos.map((v) => (
        <FadeItem key={v.id} as="li">
          <motion.div whileHover={reduce ? undefined : hoverLift}>
            <Link
              href={v.href ?? "/impact/videos"}
              className="flex aspect-video items-center justify-center rounded-2xl bg-border/60 text-sm text-muted transition hover:bg-border"
            >
              {v.title}
            </Link>
          </motion.div>
        </FadeItem>
      ))}
    </Stagger>
  );
}
