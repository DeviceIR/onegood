import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { LedgerTable } from "@/features/transparency/LedgerViews";
import { reverseLedgerAction } from "../actions";
import { canPublishLedger } from "@/server/auth/roles";

export default async function AdminLedgerPage() {
  const session = await auth();
  const canMutate = session?.user?.role
    ? canPublishLedger(session.user.role)
    : false;

  const rows = await prisma.ledgerEntry.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">دفترکل</h1>
      <p className="mt-2 text-sm text-muted">
        الحاقی — اصلاح فقط با معکوس. انتشار دفترکل فقط برای مدیر/مالک.
      </p>
      <div className="mt-6">
        <LedgerTable rows={rows} />
      </div>
      {canMutate ? (
        <form
          action={reverseLedgerAction}
          className="mt-8 max-w-md space-y-2 rounded border border-border p-4"
        >
          <p className="font-medium">سند معکوس</p>
          <input
            name="entryId"
            required
            placeholder="شناسه ردیف"
            className="h-10 w-full rounded border px-3"
          />
          <input
            name="reason"
            required
            placeholder="دلیل"
            className="h-10 w-full rounded border px-3"
          />
          <button type="submit" className="h-10 rounded bg-accent px-4 text-accent-foreground">
            ثبت معکوس
          </button>
        </form>
      ) : (
        <p className="mt-6 text-sm text-muted">
          نقش شما اجازه ثبت معکوس یا انتشار هزینه در دفترکل را ندارد.
        </p>
      )}
    </div>
  );
}
