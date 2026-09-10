"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  SITE_EXPRESSION_FA,
  SITE_NAME_EN,
  SITE_NAME_FA,
  SITE_TAGLINE_FA,
} from "@/lib/seo";

const links = [
  { href: "/", label: "خانه" },
  { href: "/campaigns", label: "کمک‌ها" },
  { href: "/packages", label: "بسته‌ها و قیمت‌ها" },
  { href: "/impact", label: "اثر ما" },
  { href: "/transparency", label: "شفافیت" },
  { href: "/about", label: "درباره ما" },
  { href: "/volunteer", label: "همکاری" },
  { href: "/contact", label: "تماس با ما" },
];

const legalLinks = [
  { href: "/privacy", label: "حریم خصوصی" },
  { href: "/terms", label: "شرایط استفاده" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function useScrollChrome() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => {
      const y = window.scrollY;
      const progress = Math.min(1, Math.max(0, y / 420));
      document.documentElement.style.setProperty(
        "--scroll-mix",
        `${Math.round(progress * 100)}%`,
      );
      setScrolled(y > 48);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      document.documentElement.style.removeProperty("--scroll-mix");
    };
  }, []);

  return scrolled;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrollChrome();
  const reduce = useReducedMotion();
  const solid = scrolled || open;

  return (
    <motion.header
      className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 md:px-4 md:pt-4"
      initial={reduce ? false : { opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease }}
    >
      <motion.div
        layout
        className={[
          "pointer-events-auto mx-auto flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 transition-[max-width] duration-300",
          solid
            ? "max-w-6xl border border-border/70 bg-background/70 shadow-[0_12px_40px_-18px_rgba(21,32,28,0.35)] backdrop-blur-xl"
            : "max-w-[calc(72rem*1.01)] border border-transparent bg-transparent shadow-none backdrop-blur-none",
        ].join(" ")}
        transition={{ duration: 0.35, ease }}
      >
        <motion.div
          initial={reduce ? false : { opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease, delay: 0.05 }}
        >
          <Link href="/" className="group shrink-0" onClick={() => setOpen(false)}>
            <span
              className="block text-lg font-bold tracking-[0.14em] text-foreground"
              dir="ltr"
            >
              {SITE_NAME_EN}
            </span>
            <span className="block text-sm text-muted transition-colors group-hover:text-accent">
              {SITE_NAME_FA}
            </span>
          </Link>
        </motion.div>

        <nav
          className="hidden items-center gap-0.5 text-sm md:flex"
          aria-label="اصلی"
        >
          {links.map((l, i) => (
            <motion.div
              key={l.href}
              initial={reduce ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease, delay: 0.1 + i * 0.04 }}
            >
              <Link
                href={l.href}
                className="rounded-xl px-2.5 py-2 text-muted transition-colors hover:bg-surface-soft/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                {l.label}
              </Link>
            </motion.div>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease, delay: 0.28 }}
            className="hidden sm:block"
          >
            <Link
              href="/campaigns"
              className="inline-flex rounded-xl bg-accent px-4 py-2 text-sm text-accent-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
            >
              مشارکت در {SITE_EXPRESSION_FA}
            </Link>
          </motion.div>
          <button
            type="button"
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-xl border md:hidden",
              solid
                ? "border-border bg-card/80"
                : "border-border/50 bg-background/40 backdrop-blur-sm",
            ].join(" ")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "بستن منو" : "باز کردن منو"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav"
            key="mobile-nav"
            className="pointer-events-auto mx-auto mt-2 max-w-6xl overflow-hidden rounded-2xl border border-border/70 bg-background/70 px-3 py-3 shadow-[0_16px_40px_-20px_rgba(21,32,28,0.35)] backdrop-blur-xl md:hidden"
            aria-label="موبایل"
            initial={reduce ? undefined : { opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={reduce ? undefined : { opacity: 0, y: -8, height: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <ul className="flex flex-col gap-1">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="block rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-surface-soft"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/campaigns"
                  className="mt-2 block rounded-xl bg-accent px-3 py-2.5 text-center text-sm text-accent-foreground"
                  onClick={() => setOpen(false)}
                >
                  مشارکت در {SITE_EXPRESSION_FA}
                </Link>
              </li>
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

export function SiteFooter() {
  return (
    <footer className="section-fade-soft-top mt-16">
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p
          className="text-center text-lg font-semibold tracking-[0.14em] text-foreground"
          dir="ltr"
        >
          {SITE_NAME_EN}
        </p>

        <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-12">
          {/* RTL: first column sits on the right */}
          <div className="max-w-sm sm:text-start">
            <p className="font-medium text-foreground">{SITE_NAME_FA}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {SITE_TAGLINE_FA}
            </p>
          </div>

          {/* RTL: second column sits on the left — both nav groups together */}
          <div className="flex flex-wrap gap-x-10 gap-y-8">
            <nav aria-label="پیمایش سایت">
              <p className="mb-4 text-xs font-semibold tracking-wide text-foreground">
                پیمایش
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="اطلاعات حقوقی">
              <p className="mb-4 text-xs font-semibold tracking-wide text-foreground">
                قانونی
              </p>
              <ul className="flex flex-col gap-2.5 text-sm text-muted">
                {legalLinks.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
