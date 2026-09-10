import { toPersianDigits } from "@/lib/money";
import { Money } from "@/components/Money";
import { EXPENSE_CATEGORY_FA } from "@/lib/admin-labels";

export function CampaignNeedsList({
  needs,
}: {
  needs: {
    id: string;
    titleFa: string;
    quantity: number;
    unitPriceEstimateToman: bigint | number | null;
    note: string | null;
  }[];
}) {
  if (!needs.length) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface-soft/80 text-muted">
          <tr>
            <th className="px-4 py-3 text-start font-medium">قلم</th>
            <th className="px-4 py-3 text-center font-medium">تعداد</th>
            <th className="px-4 py-3 text-end font-medium">قیمت واحد</th>
            <th className="px-4 py-3 text-end font-medium">جمع</th>
          </tr>
        </thead>
        <tbody>
          {needs.map((n) => {
            const unit =
              n.unitPriceEstimateToman != null
                ? BigInt(n.unitPriceEstimateToman)
                : null;
            const line =
              unit != null ? unit * BigInt(n.quantity) : null;
            return (
              <tr key={n.id} className="border-t border-border">
                <td className="px-4 py-3">
                  <p className="font-medium">{n.titleFa}</p>
                  {n.note ? (
                    <p className="mt-1 text-xs text-muted">{n.note}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-center text-muted">
                  {toPersianDigits(n.quantity)}
                </td>
                <td className="px-4 py-3 text-end text-muted">
                  {unit != null ? <Money amount={unit} /> : "—"}
                </td>
                <td className="px-4 py-3 text-end font-medium">
                  {line != null ? <Money amount={line} /> : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CampaignUpdateTimeline({
  updates,
}: {
  updates: {
    id: string;
    titleFa: string;
    bodyFa: string;
    publishedAt: Date | null;
  }[];
}) {
  if (!updates.length) return null;
  return (
    <ul className="space-y-4">
      {updates.map((u) => (
        <li key={u.id} className="border-b border-border pb-4">
          <p className="font-medium">{u.titleFa}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-muted">{u.bodyFa}</p>
        </li>
      ))}
    </ul>
  );
}

export function CampaignExpenseSummary({
  expenses,
}: {
  expenses: {
    id: string;
    descriptionFa: string;
    amountToman: bigint | number;
    category: string;
  }[];
}) {
  if (!expenses.length) return null;
  return (
    <ul className="divide-y divide-border">
      {expenses.map((e) => (
        <li key={e.id} className="flex justify-between gap-4 py-3 text-sm">
          <span>
            {e.descriptionFa}
            <span className="ms-2 text-muted">
              ({EXPENSE_CATEGORY_FA[e.category] ?? e.category})
            </span>
          </span>
          <Money amount={e.amountToman} />
        </li>
      ))}
    </ul>
  );
}
