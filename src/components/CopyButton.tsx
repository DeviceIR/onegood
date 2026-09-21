"use client";

import { useState } from "react";

export function CopyButton({
  text,
  label = "کپی",
  copiedLabel = "کپی شد",
  className,
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const write = async () => {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
      throw new Error("clipboard unavailable");
    };

    try {
      await write();
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "fixed";
      el.style.opacity = "0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={
        className ??
        "inline-flex h-9 items-center rounded-lg border border-border bg-card px-3 text-sm text-foreground hover:border-accent/40"
      }
    >
      <span aria-live="polite">{copied ? copiedLabel : label}</span>
    </button>
  );
}
