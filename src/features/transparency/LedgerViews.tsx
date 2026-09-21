"use client";

import { Money } from "@/components/Money";
import { JalaliDate } from "@/components/JalaliDate";
import type { Expense } from "@prisma/client";
import {
  EXPENSE_CATEGORY_FA,
  LEDGER_DIRECTION_FA,
  LEDGER_TYPE_FA,
} from "@/lib/admin-labels";
import type { PublicExpense, PublicReceipt } from "@/server/transparency/queries";
import { Stagger, FadeItem } from "@/features/home/motion/Reveal";

export function BalanceSummary({
  received,
  spent,
  remaining,
}: {
  received: bigint | number;
  spent: bigint | number;
  remaining: bigint | number;
}) {
  return (
    <Stagger className="grid gap-4 sm:grid-cols-3" as="div">
      {(
        [
          { label: "دریافتی", amount: received, accent: "border-accent" },
          { label: "هزینه‌شده", amount: spent, accent: "border-border" },
          { label: "مانده", amount: remaining, accent: "border-gold" },
        ] as const
      ).map((item) => (
        <FadeItem key={item.label}>
          <div className={`border-s-2 ${item.accent} ps-4`}>
            <p className="text-sm text-muted">{item.label}</p>
            <p className="mt-1 text-xl font-semibold">
              <Money amount={item.amount} />
            </p>
          </div>
        </FadeItem>
      ))}
    </Stagger>
  );
}

export function LedgerTable({
  rows,
}: {
  rows: {
    id: string;
    type: string;
    direction: string;
    amountToman: bigint | number;
    descriptionFa: string;
    occurredAt: Date;
    reversesEntryId?: string | null;
  }[];
}) {
  if (!rows.length) {
    return <p className="text-sm text-muted">هنوز ردیفی در دفترکل نیست.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-muted">
            <th className="py-3 text-start font-medium">تاریخ</th>
            <th className="py-3 text-start font-medium">شرح</th>
            <th className="py-3 text-start font-medium">نوع</th>
            <th className="py-3 text-start font-medium">مبلغ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-border/70">
              <td className="py-3">
                <JalaliDate date={r.occurredAt} />
              </td>
              <td className="py-3">
                {r.descriptionFa}
                {r.reversesEntryId ? (
                  <span className="ms-2 text-xs text-muted">(معکوس)</span>
                ) : null}
              </td>
              <td className="py-3 text-muted">
                {LEDGER_TYPE_FA[r.type] ?? r.type} /{" "}
                {LEDGER_DIRECTION_FA[r.direction] ?? r.direction}
              </td>
              <td className="py-3">
                <Money amount={r.amountToman} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ReceiptViewer({ receipt }: { receipt: PublicReceipt }) {
  return (
    <figure className="mt-3 max-w-xs">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={receipt.url}
        alt={receipt.altTextFa ?? "رسید هزینه"}
        className="w-full rounded border border-border object-cover"
        loading="lazy"
      />
      {receipt.note ? (
        <figcaption className="mt-1 text-xs text-muted">{receipt.note}</figcaption>
      ) : null}
    </figure>
  );
}

export function ExpenseItem({
  expense,
}: {
  expense: PublicExpense | (Expense & { receipts?: PublicReceipt[] });
}) {
  const receipts = "receipts" in expense ? expense.receipts ?? [] : [];
  return (
    <li className="border-b border-border py-4">
      <p className="font-medium">{expense.descriptionFa}</p>
      <p className="mt-1 text-sm text-muted">
        {EXPENSE_CATEGORY_FA[expense.category] ?? expense.category}
        {expense.vendor ? ` — ${expense.vendor}` : ""}
        {"occurredAt" in expense && expense.occurredAt ? (
          <>
            {" "}
            — <JalaliDate date={expense.occurredAt} />
          </>
        ) : null}
      </p>
      <p className="mt-2">
        <Money amount={expense.amountToman} />
      </p>
      {receipts.map((r) => (
        <ReceiptViewer key={r.id} receipt={r} />
      ))}
    </li>
  );
}