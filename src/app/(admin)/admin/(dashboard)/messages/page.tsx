import { prisma } from "@/server/db/prisma";
import { JalaliDate } from "@/components/JalaliDate";
import { setContactHandledAction } from "@/features/admin/inbox-actions";
import { toPersianDigits } from "@/lib/money";

export default async function AdminMessagesPage() {
  const rows = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });
  const unread = rows.filter((m) => !m.handled).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold">پیام‌ها</h1>
      <p className="mt-2 text-sm text-muted">
        {unread > 0
          ? `${toPersianDigits(unread)} پیام خوانده‌نشده`
          : "پیام خوانده‌نشده‌ای نیست"}
      </p>
      <ul className="mt-6 divide-y">
        {rows.length === 0 ? (
          <li className="py-3 text-muted">پیامی ثبت نشده است.</li>
        ) : (
          rows.map((m) => (
            <li key={m.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {m.name}
                  {!m.handled ? (
                    <span className="ms-2 rounded-full bg-accent/15 px-2 py-0.5 text-xs text-accent">
                      جدید
                    </span>
                  ) : null}
                </p>
                <p className="text-sm text-muted">
                  {m.email ?? "بدون ایمیل"}
                  {m.phone ? ` · ${m.phone}` : ""}
                </p>
                <p className="mt-1 text-sm">{m.message}</p>
                <JalaliDate date={m.createdAt} className="mt-1 block text-xs text-muted" />
              </div>
              <form action={setContactHandledAction}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled ? "0" : "1"} />
                <button type="submit" className="text-sm text-accent">
                  {m.handled ? "برگرداندن به نخوانده" : "علامت رسیدگی"}
                </button>
              </form>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
