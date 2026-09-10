import { prisma } from "@/server/db/prisma";
import { getBalances } from "@/server/ledger";
import { Money } from "@/components/Money";
import { toPersianDigits } from "@/lib/money";
import { JalaliDate } from "@/components/JalaliDate";
import Link from "next/link";

export default async function AdminDashboardPage() {
  let stats = {
    donations: 0,
    success: 0,
    failed: 0,
    active: 0,
    completed: 0,
    studentsHelped: 0,
    balances: { received: 0n, spent: 0n, remaining: 0n },
  };
  let recent: {
    id: string;
    action: string;
    createdAt: Date;
    actorAdmin: { name: string } | null;
  }[] = [];
  try {
    const [donations, success, failed, active, completed, balances, snap, audit] =
      await Promise.all([
        prisma.donation.count(),
        prisma.payment.count({ where: { status: "SUCCESS" } }),
        prisma.payment.count({ where: { status: "FAILED" } }),
        prisma.campaign.count({ where: { status: "PUBLISHED" } }),
        prisma.campaign.count({ where: { status: "COMPLETED" } }),
        getBalances(),
        prisma.statsSnapshot.findFirst({ orderBy: { capturedAt: "desc" } }),
        prisma.auditLog.findMany({
          orderBy: { createdAt: "desc" },
          take: 8,
          include: { actorAdmin: { select: { name: true } } },
        }),
      ]);
    stats = {
      donations,
      success,
      failed,
      active,
      completed,
      studentsHelped: snap?.studentsHelped ?? 0,
      balances,
    };
    recent = audit;
  } catch {
    /* empty */
  }

  const cards = [
    { label: "کمک‌های ثبت‌شده", value: toPersianDigits(stats.donations) },
    { label: "پرداخت موفق", value: toPersianDigits(stats.success) },
    { label: "پرداخت ناموفق", value: toPersianDigits(stats.failed) },
    { label: "کمپین فعال", value: toPersianDigits(stats.active) },
    { label: "تکمیل‌شده", value: toPersianDigits(stats.completed) },
    { label: "دانش‌آموزان کمک‌شده", value: toPersianDigits(stats.studentsHelped) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">داشبورد</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-2 text-2xl font-semibold">{c.value}</p>
          </div>
        ))}
        <div className="rounded-lg border border-border bg-card p-4 sm:col-span-2">
          <p className="text-sm text-muted">مانده دفترکل</p>
          <p className="mt-2 text-2xl font-semibold">
            <Money amount={stats.balances.remaining} />
          </p>
          <p className="mt-1 text-sm text-muted">
            دریافتی <Money amount={stats.balances.received} /> — هزینه{" "}
            <Money amount={stats.balances.spent} />
          </p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">فعالیت اخیر</h2>
          <Link href="/admin/audit" className="text-sm text-accent">
            همه ممیزی‌ها
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-border text-sm">
          {recent.length === 0 ? (
            <li className="py-3 text-muted">هنوز فعالیتی ثبت نشده.</li>
          ) : (
            recent.map((a) => (
              <li key={a.id} className="flex flex-wrap justify-between gap-2 py-3">
                <span>
                  {a.action}
                  {a.actorAdmin?.name ? (
                    <span className="text-muted"> — {a.actorAdmin.name}</span>
                  ) : null}
                </span>
                <JalaliDate date={a.createdAt} className="text-muted" />
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
