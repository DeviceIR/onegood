import { prisma } from "@/server/db/prisma";
import { Money } from "@/components/Money";
import { JalaliDate } from "@/components/JalaliDate";
import { AdminDataTable, AdminTableRow } from "@/components/admin/AdminDataTable";
import {
  PAYMENT_GATEWAY_FA,
  paymentStatusFa,
} from "@/lib/admin-labels";

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const rows = await prisma.payment.findMany({
    where: status
      ? { status: status as "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED" | "EXPIRED" }
      : undefined,
    include: { campaign: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">پرداخت‌ها (فقط خواندنی)</h1>
      <p className="mt-2 text-sm text-muted">
        رکوردهای تأییدشده از این پنل ویرایش نمی‌شوند. اصلاح مالی فقط با سند معکوس در
        دفترکل و ثبت ممیزی.
      </p>
      <form className="mt-4 flex flex-wrap gap-2 text-sm">
        <select
          name="status"
          defaultValue={status ?? ""}
          className="h-10 rounded border border-border px-2"
        >
          <option value="">همه وضعیت‌ها</option>
          <option value="PENDING">در انتظار</option>
          <option value="SUCCESS">موفق</option>
          <option value="FAILED">ناموفق</option>
          <option value="CANCELLED">لغو شده</option>
          <option value="REFUNDED">بازگشت وجه</option>
          <option value="EXPIRED">منقضی</option>
        </select>
        <button type="submit" className="h-10 rounded border border-border px-3">
          فیلتر
        </button>
      </form>
      <AdminDataTable
        headers={["وضعیت", "کمپین", "درگاه", "مبلغ", "Authority", "Ref", "تاریخ"]}
      >
        {rows.map((r) => (
          <AdminTableRow
            key={r.id}
            cells={[
              paymentStatusFa(r.status),
              r.campaign.titleFa,
              PAYMENT_GATEWAY_FA[r.gateway] ?? r.gateway,
              <Money key="m" amount={r.amountToman} />,
              <span key="a" className="font-mono text-xs" dir="ltr">
                {r.gatewayAuthority ?? "—"}
              </span>,
              <span key="r" className="font-mono text-xs" dir="ltr">
                {r.gatewayRefId ?? "—"}
              </span>,
              <JalaliDate key="d" date={r.createdAt} />,
            ]}
          />
        ))}
      </AdminDataTable>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">پرداختی نیست.</p>
      ) : null}
    </div>
  );
}
