import { JalaliDate } from "@/components/JalaliDate";
import Link from "next/link";

export function TestimonialCard({
  authorDisplayName,
  authorRole,
  bodyFa,
}: {
  authorDisplayName: string;
  authorRole: string;
  bodyFa: string;
}) {
  const roleFa: Record<string, string> = {
    DONOR: "خیر",
    VOLUNTEER: "داوطلب",
    TEACHER: "معلم",
    COMMUNITY: "عضو جامعه",
    GUARDIAN: "سرپرست",
  };

  return (
    <blockquote className="border-s-2 border-accent ps-5">
      <p className="text-lg leading-relaxed text-foreground/90">«{bodyFa}»</p>
      <footer className="mt-4 text-sm text-muted">
        <cite className="not-italic font-medium text-foreground">
          {authorDisplayName}
        </cite>
        <span className="mx-2">·</span>
        <span>{roleFa[authorRole] ?? authorRole}</span>
      </footer>
    </blockquote>
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
  if (!items.length) {
    return (
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
          <li
            key={card.title}
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
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-8 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="border-b border-border pb-6">
          {item.imageUrl ? (
            <div className="mb-4 aspect-[4/3] overflow-hidden rounded-lg bg-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.imageUrl}
                alt={item.imageAlt ?? item.itemsSummaryFa}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <p className="text-sm text-muted">{item.campaignTitle}</p>
          <h3 className="mt-1 text-lg font-medium">{item.itemsSummaryFa}</h3>
          <p className="mt-2 text-muted">{item.publicDescriptionFa}</p>
          <JalaliDate date={item.deliveredAt} className="mt-3 block text-sm text-muted" />
        </li>
      ))}
    </ul>
  );
}

export function VideoTeaser({
  videos,
}: {
  videos: { id: string; title: string; href?: string }[];
}) {
  if (!videos.length) {
    return (
      <ul className="grid gap-5 sm:grid-cols-2">
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
          <li
            key={card.title}
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
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {videos.map((v) => (
        <li key={v.id}>
          <Link
            href={v.href ?? "/impact/videos"}
            className="flex aspect-video items-center justify-center rounded-2xl bg-border/60 text-sm text-muted transition hover:bg-border"
          >
            {v.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
