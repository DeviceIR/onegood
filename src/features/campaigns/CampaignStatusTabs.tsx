import Link from "next/link";
import { toPersianDigits } from "@/lib/money";

export type CampaignListFilter = "active" | "completed" | "all";

export function parseCampaignListFilter(raw?: string): CampaignListFilter {
  if (raw === "completed" || raw === "all") return raw;
  return "active";
}

export function CampaignStatusTabs({
  current,
  activeCount,
  completedCount,
}: {
  current: CampaignListFilter;
  activeCount: number;
  completedCount: number;
}) {
  const tabs: { id: CampaignListFilter; href: string; label: string; count: number }[] = [
    {
      id: "active",
      href: "/campaigns",
      label: "فعال",
      count: activeCount,
    },
    {
      id: "completed",
      href: "/campaigns?status=completed",
      label: "تکمیل‌شده",
      count: completedCount,
    },
    {
      id: "all",
      href: "/campaigns?status=all",
      label: "همه",
      count: activeCount + completedCount,
    },
  ];

  return (
    <nav
      className="mb-8 flex flex-wrap gap-2"
      aria-label="فیلتر وضعیت کمک‌ها"
    >
      {tabs.map((tab) => {
        const active = tab.id === current;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={[
              "inline-flex h-9 items-center rounded-full border px-4 text-sm transition-colors",
              active
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-card text-muted hover:text-foreground",
            ].join(" ")}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
            <span className="ms-2 text-xs opacity-80">
              {toPersianDigits(tab.count)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
