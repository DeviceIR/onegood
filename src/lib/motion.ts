export const ease = [0.22, 1, 0.36, 1] as const;

export const duration = {
  fast: 0.28,
  base: 0.5,
  slow: 0.7,
} as const;

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: duration.base, ease },
  },
};

export const stagger = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const hoverLift = {
  y: -4,
  transition: { duration: duration.fast, ease },
};

export const tapPress = { scale: 0.98 };

export const viewportOnce = {
  once: true,
  amount: 0.16,
  margin: "0px 0px -32px 0px",
} as const;

export function motionLinkClass(variant: "primary" | "secondary" | "ghost" = "primary") {
  const base =
    "inline-flex h-11 items-center justify-center rounded-xl px-5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
  if (variant === "secondary") {
    return `${base} border border-border/80 bg-card/80 backdrop-blur-sm hover:border-accent/40`;
  }
  if (variant === "ghost") {
    return `${base} text-accent hover:underline`;
  }
  return `${base} bg-accent text-accent-foreground shadow-sm`;
}
