"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function PublicErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <h1 className="text-3xl font-semibold">مشکلی پیش آمد</h1>
      <p className="mt-3 text-muted">
        بارگذاری این صفحه کامل نشد. یک‌بار دیگر تلاش کنید یا به خانه برگردید.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="inline-flex h-11 items-center rounded-xl bg-accent px-5 text-sm text-accent-foreground"
        >
          تلاش دوباره
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm"
        >
          خانه
        </Link>
      </div>
    </div>
  );
}
