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

  if (!items.length) {
    return (
      <Stagger as="ul" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: "کارهای خوب شما اینجا دیده می‌شود",
            body: "هنوز گزارشی ثبت نشده. بعد از اولین تحویل واقعی، اثر کمک‌ها اینجا می‌آید.",
          },
          {
            title: "منتظر اولین اثر هستیم",
            body: "تصاویر و توضیح‌ها فقط از کمک‌های واقعی و با حفظ کرامت منتشر می‌شوند.",
          },
          {
            title: "خوبی‌ها از صفر شروع می‌شوند",
            body: "وقتی اولین بسته برسد، داستانش را با احترام اینجا می‌گذاریم.",
          },
        ].map((card) => (
          <FadeItem
            key={card.title}
            as="li"
            className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.35)]"
          >
            <div
              className="aspect-[4/3] bg-gradient-to-br from-hero via-surface-soft to-card"
              aria-hidden
            >
              <div className="flex h-full items-end p-5">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-accent shadow-[0_0_12px_rgba(12,122,98,0.45)]" />
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {card.body}
              </p>
            </div>
          </FadeItem>
        ))}
      </Stagger>
    );
  }

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

  if (!videos.length) {
    return (
      <Stagger as="ul" className="grid gap-5 sm:grid-cols-2">
        {[
          {
            title: "هنوز ویدیویی نیست",
            body: "بعد از اولین کمک واقعی، روایت کوتاه اثر اینجا منتشر می‌شود.",
          },
          {
            title: "منتظر اولین داستان هستیم",
            body: "بدون پخش خودکار صدا — فقط وقتی محتوای واقعی آماده باشد.",
          },
        ].map((card) => (
          <FadeItem
            key={card.title}
            as="li"
            className="overflow-hidden rounded-2xl border border-border/70 bg-card/80 shadow-[0_16px_40px_-28px_rgba(21,32,28,0.35)]"
          >
            <div
              className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-[#15201c] via-[#1c2c27] to-[#0c7a62]/40"
              aria-hidden
            >
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur-sm">
                <span className="ms-0.5 h-0 w-0 border-y-[7px] border-y-transparent border-s-[12px] border-s-white/90" />
              </span>
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(184,151,74,0.18),transparent_45%)]" />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold text-foreground">
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {card.body}
              </p>
            </div>
          </FadeItem>
        ))}
      </Stagger>
    );
  }

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
