import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import {
  attachReceiptAction,
  createExpenseAction,
  publishExpenseAction,
} from "../actions";
import { Money } from "@/components/Money";
import { canPublishLedger } from "@/server/auth/roles";
import {
  EXPENSE_CATEGORY_FA,
  EXPENSE_STATUS_FA,
} from "@/lib/admin-labels";

export default async function AdminExpensesPage() {
  const session = await auth();
  const canPublish = session?.user?.role
    ? canPublishLedger(session.user.role)
    : false;

  const [expenses, campaigns] = await Promise.all([
    prisma.expense.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { receipts: true },
    }),
    prisma.campaign.findMany({ select: { id: true, titleFa: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">هزینه‌ها</h1>
      <form
        action={createExpenseAction}
        className="mt-6 grid max-w-lg gap-2 rounded border border-border p-4"
      >
        <select name="campaignId" className="h-10 rounded border px-2">
          <option value="">صندوق عمومی</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleFa}
            </option>
          ))}
        </select>
        <select name="category" className="h-10 rounded border px-2" defaultValue="SUPPLIES">
          {Object.entries(EXPENSE_CATEGORY_FA).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          name="amountToman"
          required
          placeholder="مبلغ تومان"
          className="h-10 rounded border px-3"
        />
        <input name="vendor" placeholder="فروشنده" className="h-10 rounded border px-3" />
        <input name="occurredAt" type="date" className="h-10 rounded border px-3" />
        <input
          name="descriptionFa"
          required
          placeholder="شرح"
          className="h-10 rounded border px-3"
        />
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          پیش‌نویس هزینه
        </button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {expenses.map((e) => (
          <li key={e.id} className="space-y-3 py-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p>{e.descriptionFa}</p>
                <p className="text-sm text-muted">
                  {EXPENSE_STATUS_FA[e.status] ?? e.status} —{" "}
                  {EXPENSE_CATEGORY_FA[e.category] ?? e.category} —{" "}
                  <Money amount={e.amountToman} />
                  {e.receipts.length
                    ? ` — ${e.receipts.length} رسید`
                    : ""}
                </p>
              </div>
              {e.status === "DRAFT" && canPublish ? (
                <form action={publishExpenseAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button type="submit" className="text-sm text-accent">
                    انتشار + ثبت دفترکل
                  </button>
                </form>
              ) : null}
            </div>
            {canPublish ? (
              <form
                action={attachReceiptAction}
                encType="multipart/form-data"
                className="flex flex-wrap items-end gap-2 rounded border border-border/60 p-3 text-sm"
              >
                <input type="hidden" name="expenseId" value={e.id} />
                <label className="grid gap-1">
                  <span className="text-muted">رسید تصویر</span>
                  <input
                    type="file"
                    name="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                  />
                </label>
                <input
                  name="note"
                  placeholder="یادداشت (اختیاری)"
                  className="h-9 rounded border px-2"
                />
                <button type="submit" className="h-9 rounded border border-border px-3">
                  پیوست رسید
                </button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
