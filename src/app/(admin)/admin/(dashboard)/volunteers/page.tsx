import { prisma } from "@/server/db/prisma";
import { JalaliDate } from "@/components/JalaliDate";
import { setVolunteerHandledAction } from "@/features/admin/inbox-actions";
import { toPersianDigits } from "@/lib/money";

export default async function AdminVolunteersPage() {
  const rows = await prisma.volunteerApplication.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });
  const unread = rows.filter((v) => !v.handled).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">داوطلبان</h1>
      <p className="mt-2 text-sm text-muted">
        {unread > 0
          ? `${toPersianDigits(unread)} درخواست رسیدگی‌نشده`
          : "درخواست رسیدگی‌نشده‌ای نیست"}
      </p>
      <ul className="mt-6 divide-y">
        {rows.length === 0 ? (
          <li className="py-3 text-muted">درخواستی ثبت نشده است.</li>
        ) : (
          rows.map((v) => (
            <li key={v.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {v.name} — {v.phone}
                  {!v.handled ? (
                    <span className="ms-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                      جدید
                    </span>
                  ) : null}
                </p>
                {v.email ? <p className="text-sm text-muted">{v.email}</p> : null}
                <p className="mt-1 text-sm text-muted">{v.message}</p>
                <JalaliDate date={v.createdAt} className="mt-1 block text-xs text-muted" />
              </div>
              <form action={setVolunteerHandledAction}>
                <input type="hidden" name="id" value={v.id} />
                <input type="hidden" name="handled" value={v.handled ? "0" : "1"} />
                <button type="submit" className="text-sm text-accent">
                  {v.handled ? "برگرداندن به نخوانده" : "علامت رسیدگی"}
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
