import { prisma } from "@/server/db/prisma";
import { Money } from "@/components/Money";
import { JalaliDate } from "@/components/JalaliDate";
import { AdminDataTable, AdminTableRow } from "@/components/admin/AdminDataTable";
import { paymentStatusFa, PAYMENT_GATEWAY_FA } from "@/lib/admin-labels";

export default async function AdminDonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rows = await prisma.donation.findMany({
    where: q
      ? {
          OR: [
            { referenceCode: { contains: q, mode: "insensitive" } },
            { campaign: { titleFa: { contains: q } } },
          ],
        }
      : undefined,
    include: { campaign: true, payment: true, donor: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">کمک‌ها</h1>
      <form className="mt-4 flex max-w-md gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="جستجو کد یا کمپین"
          className="h-10 flex-1 rounded border border-border px-3"
        />
        <button type="submit" className="h-10 rounded border border-border px-3 text-sm">
          فیلتر
        </button>
      </form>
      <AdminDataTable
        headers={[
          "کد",
          "کمپین",
          "مبلغ",
          "وضعیت پرداخت",
          "درگاه",
          "حریم",
          "تاریخ",
        ]}
      >
        {rows.map((r) => (
          <AdminTableRow
            key={r.id}
            cells={[
              <span key="ref" className="font-mono text-xs">
                {r.referenceCode}
              </span>,
              r.campaign.titleFa,
              <Money key="m" amount={r.amountToman} />,
              r.payment ? paymentStatusFa(r.payment.status) : "—",
              r.payment
                ? PAYMENT_GATEWAY_FA[r.payment.gateway] ?? r.payment.gateway
                : "—",
              `نام:${r.showName ? "بله" : "خیر"} / مبلغ:${r.showAmount ? "بله" : "خیر"}`,
              <JalaliDate key="d" date={r.createdAt} />,
            ]}
          />
        ))}
      </AdminDataTable>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">کمکی یافت نشد.</p>
      ) : null}
    </div>
  );
}
