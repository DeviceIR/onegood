import { notFound } from "next/navigation";
import Link from "next/link";
import {
  BalanceSummary,
  ExpenseItem,
  LedgerTable,
} from "@/features/transparency/LedgerViews";
import { getCampaignTransparency } from "@/server/transparency/queries";

type Props = { params: Promise<{ campaign: string }> };

export async function generateMetadata({ params }: Props) {
  const { campaign: slug } = await params;
  try {
    const data = await getCampaignTransparency(slug);
    if (!data) return { title: "شفافیت" };
    return { title: `شفافیت — ${data.campaign.titleFa}` };
  } catch {
    return { title: "شفافیت" };
  }
}

export default async function CampaignTransparencyPage({ params }: Props) {
  const { campaign: slug } = await params;
  let data: Awaited<ReturnType<typeof getCampaignTransparency>> = null;
  try {
    data = await getCampaignTransparency(slug);
  } catch {
    notFound();
  }
  if (!data) notFound();

  const { campaign, balances, entries, expenses } = data;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/transparency" className="text-sm text-accent">
        ← همه شفافیت
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">شفافیت — {campaign.titleFa}</h1>
      <p className="mt-2 text-sm text-muted">
        مانده و دریافتی دقیقاً از جمع ردیف‌های دفترکل همین کمپین است.
      </p>
      <div className="mt-8">
        <BalanceSummary {...balances} />
      </div>
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">دفترکل کمپین</h2>
        <LedgerTable rows={entries} />
      </div>
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">هزینه‌ها و رسیدها</h2>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted">هزینه منتشرشده‌ای نیست.</p>
        ) : (
          <ul>
            {expenses.map((e) => (
              <ExpenseItem key={e.id} expense={e} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
