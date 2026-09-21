"use client";

import { CopyButton } from "@/components/CopyButton";

export function ShareActions({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={telegram}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-9 items-center rounded-lg bg-accent px-3 text-sm text-accent-foreground"
      >
        اشتراک در تلگرام
      </a>
      <CopyButton text={url} label="کپی پیوند" />
    </div>
  );
}
