import Link from "next/link";
import { SectionHeading } from "@/components/SectionHeading";
import {
  BalanceSummary,
  ExpenseItem,
  LedgerTable,
} from "@/features/transparency/LedgerViews";
import { getTransparencyOverview } from "@/server/transparency/queries";
import { buildPageMetadata } from "@/lib/seo";

export const metadata = buildPageMetadata({
  title: "شفافیت مالی",
  description: "دفترکل الحاقی و مانده‌ها — اصلاح فقط با سند معکوس.",
  path: "/transparency",
});

export default async function TransparencyPage() {
  let data: Awaited<ReturnType<typeof getTransparencyOverview>> | null = null;
  try {
    data = await getTransparencyOverview();
  } catch {
    data = null;
  }

  const balances = data?.balances ?? { received: 0n, spent: 0n, remaining: 0n };
  const entries = data?.entries ?? [];
  const expenses = data?.expenses ?? [];
  const campaigns = data?.campaigns ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <SectionHeading
        title="شفافیت مالی"
        subtitle="همه مبالغ از دفترکل الحاقی محاسبه می‌شوند؛ اصلاح فقط با سند معکوس."
      />
      <BalanceSummary {...balances} />
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">آخرین ردیف‌های دفترکل</h2>
        <LedgerTable rows={entries} />
      </div>
      <div className="mt-10">
        <h2 className="mb-4 text-lg font-semibold">هزینه‌های منتشرشده</h2>
        {expenses.length === 0 ? (
          <p className="text-sm text-muted">هنوز هزینه‌ای منتشر نشده.</p>
        ) : (
          <ul>
            {expenses.map((e) => (
              <ExpenseItem key={e.id} expense={e} />
            ))}
          </ul>
        )}
      </div>
      {campaigns.length > 0 ? (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">شفافیت به تفکیک کمپین</h2>
          <ul className="space-y-2">
            {campaigns.map((c) => (
              <li key={c.slug}>
                <Link href={`/transparency/${c.slug}`} className="text-accent">
                  {c.titleFa}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
