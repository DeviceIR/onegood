import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SkipToContent } from "@/components/SkipToContent";

export default function NotFound() {
  return (
    <>
      <SkipToContent />
      <SiteHeader />
      <main id="main-content" tabIndex={-1} className="pt-[4.75rem]">
        <div className="mx-auto max-w-lg px-4 py-24 text-center">
          <p className="text-sm font-medium text-accent">۴۰۴</p>
          <h1 className="mt-3 text-3xl font-semibold">صفحه پیدا نشد</h1>
          <p className="mt-3 text-muted">
            این آدرس وجود ندارد یا جابه‌جا شده است. می‌توانید به خانه یا فهرست
            کمک‌ها برگردید.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm text-accent-foreground"
            >
              بازگشت به خانه
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm"
            >
              کمک‌ها
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
