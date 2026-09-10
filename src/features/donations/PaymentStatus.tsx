import type { ReactNode } from "react";

export function DonationReference({ code }: { code: string }) {
  return (
    <p className="rounded-md border border-border bg-card px-4 py-3 font-mono text-lg tracking-wide">
      {code}
    </p>
  );
}

export function PaymentStatusBanner({
  variant,
  title,
  children,
}: {
  variant: "success" | "failed";
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <h1
        className={`text-3xl font-semibold ${
          variant === "success" ? "text-accent" : "text-foreground"
        }`}
      >
        {title}
      </h1>
      <div className="mt-4 text-muted">{children}</div>
    </div>
  );
}
