"use client";

import { serializeDonationPublic } from "@/server/privacy/donation-serializer";
import { formatToman } from "@/lib/money";
import { JalaliDate } from "@/components/JalaliDate";
import type { Donation } from "@prisma/client";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";

type Row = Omit<Donation, "amountToman"> & {
  amountToman: bigint | number;
  campaign?: { titleFa: string };
};

export function DonationActivityFeed({ donations }: { donations: Row[] }) {
  const views = donations
    .map((d) => serializeDonationPublic(d, (n) => formatToman(n)))
    .filter(Boolean);

  if (!views.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/50 px-5 py-8 text-center">
        <p className="font-medium text-foreground">هنوز کمکی ثبت نشده است</p>
        <p className="mt-2 text-sm text-muted">
          فعالیت واقعی همراهان، بعد از اولین مشارکت اینجا دیده می‌شود.
        </p>
      </div>
    );
  }

  return (
    <Stagger className="divide-y divide-border overflow-hidden rounded-2xl border border-border/60 bg-card/50">
      {views.map((d) => (
        <FadeItem
          key={d!.id}
          as="div"
          className="flex flex-wrap items-baseline justify-between gap-2 px-4 py-4"
        >
          <div>
            <p className="font-medium">{d!.displayName}</p>
            {d!.campaignTitle ? (
              <p className="text-sm text-muted">{d!.campaignTitle}</p>
            ) : null}
          </div>
          <div className="text-start text-sm md:text-end">
            <p>
              {d!.amountHidden || !d!.displayAmount
                ? "مبلغ نامشخص"
                : d!.displayAmount}
            </p>
            <JalaliDate date={d!.createdAt} className="text-muted" />
          </div>
        </FadeItem>
      ))}
    </Stagger>
  );
}
