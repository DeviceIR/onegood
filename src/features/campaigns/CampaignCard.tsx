import Link from "next/link";
import { Money } from "@/components/Money";
import { CampaignProgress } from "@/features/campaigns/CampaignProgress";
import { toPersianDigits } from "@/lib/money";

export type CampaignCardData = {
  slug: string;
  titleFa: string;
  summaryFa: string;
  targetAmountToman: bigint | number;
  collectedAmountToman: bigint | number;
  donorCount: number;
  deadline?: Date | null;
};

export function CampaignCard({ campaign }: { campaign: CampaignCardData }) {
  const target = BigInt(campaign.targetAmountToman);
  const collected = BigInt(campaign.collectedAmountToman);
  const pct =
    target > 0n ? Math.min(100, Number((collected * 100n) / target)) : 0;

  return (
    <article className="flex flex-col border-b border-border py-6 md:flex-row md:items-end md:justify-between md:gap-8">
      <div className="max-w-xl">
        <h3 className="text-xl font-semibold">{campaign.titleFa}</h3>
        <p className="mt-2 text-muted">{campaign.summaryFa}</p>
        <p className="mt-3 text-sm text-muted">
          {toPersianDigits(campaign.donorCount)} مشارکت‌کننده
        </p>
      </div>
      <div className="mt-4 w-full max-w-sm md:mt-0">
        <div className="mb-2 flex justify-between text-sm">
          <Money amount={collected} />
          <span className="text-muted">
            از <Money amount={target} />
          </span>
        </div>
        <CampaignProgress percent={pct} />
        <Link
          href={`/campaigns/${campaign.slug}`}
          className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-accent px-5 text-sm text-accent-foreground"
        >
          مشارکت در یک خوبی
        </Link>
      </div>
    </article>
  );
}
