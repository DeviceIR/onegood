"use client";

import { useRef, useState } from "react";

/**
 * Lazy video: no autoplay, no sound until user starts playback.
 * preload="none" — source attached after first interaction.
 */
export function LazyVideo({
  src,
  mimeType,
  title,
  poster,
}: {
  src: string;
  mimeType: string;
  title?: string | null;
  poster?: string | null;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-border">
      <video
        ref={ref}
        className="h-full w-full"
        controls
        playsInline
        preload="none"
        poster={poster ?? undefined}
        onPlay={(e) => {
          e.currentTarget.muted = false;
        }}
      >
        {ready ? <source src={src} type={mimeType} /> : null}
      </video>
      {!ready ? (
        <button
          type="button"
          onClick={() => setReady(true)}
          className="absolute inset-0 flex items-center justify-center bg-foreground/40 text-sm text-background"
          aria-label={title ? `پخش ${title}` : "بارگذاری و پخش ویدیو"}
        >
          بارگذاری و پخش
        </button>
      ) : null}
    </div>
  );
}
