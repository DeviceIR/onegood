import { prisma } from "@/server/db/prisma";
import { isConsentActive } from "@/server/privacy/consent-gate";
import {
  createConsentAction,
  revokeConsentAction,
} from "@/features/media/media-actions";
import { JalaliDate } from "@/components/JalaliDate";

const SCOPE_FA: Record<string, string> = {
  PHOTO: "عکس",
  VIDEO: "ویدیو",
  STORY: "داستان",
  NAME: "نام",
};

const SUBJECT_FA: Record<string, string> = {
  BENEFICIARY: "ذی‌نفع",
  GUARDIAN: "سرپرست",
  TESTIMONIAL_AUTHOR: "نویسنده نظر",
};

export default async function AdminConsentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const [rows, beneficiaries] = await Promise.all([
    prisma.consent.findMany({
      orderBy: { createdAt: "desc" },
      include: { beneficiary: true },
    }),
    prisma.beneficiary.findMany({
      select: { id: true, internalCode: true, pseudonymFa: true },
      orderBy: { internalCode: "asc" },
    }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">رضایت‌نامه‌ها</h1>
        <p className="mt-2 text-sm text-muted">
          باطل کردن رضایت، رسانه‌های عمومی وابسته را داخلی می‌کند.
        </p>
      </div>
      {ok === "created" ? (
        <p className="text-sm text-accent">رضایت ثبت شد.</p>
      ) : null}
      {ok === "revoked" ? (
        <p className="text-sm text-accent">رضایت باطل و رسانه‌ها داخلی شدند.</p>
      ) : null}
      {err ? <p className="text-sm text-red-700">محدوده یا مرجع نامعتبر.</p> : null}

      <form action={createConsentAction} className="grid gap-2 rounded-lg border border-border p-4">
        <select name="subjectType" defaultValue="BENEFICIARY" className="h-10 rounded border px-2">
          {Object.entries(SUBJECT_FA).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input
          name="subjectRef"
          required
          placeholder="مرجع (کد یا شناسه)"
          className="h-10 rounded border px-3"
        />
        <select name="beneficiaryId" className="h-10 rounded border px-2">
          <option value="">بدون پیوند ذی‌نفع</option>
          {beneficiaries.map((b) => (
            <option key={b.id} value={b.id}>
              {b.internalCode} — {b.pseudonymFa}
            </option>
          ))}
        </select>
        <fieldset className="flex flex-wrap gap-3 text-sm">
          <legend className="mb-1 text-muted">محدوده‌ها</legend>
          {Object.entries(SCOPE_FA).map(([k, v]) => (
            <label key={k} className="flex items-center gap-1">
              <input type="checkbox" name={`scope_${k}`} />
              {v}
            </label>
          ))}
        </fieldset>
        <input name="note" placeholder="یادداشت" className="h-10 rounded border px-3" />
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          ثبت رضایت
        </button>
      </form>

      <ul className="divide-y divide-border text-sm">
        {rows.map((c) => {
          const active = isConsentActive(c);
          return (
            <li key={c.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
              <div>
                <p>
                  {SUBJECT_FA[c.subjectType] ?? c.subjectType} / {c.subjectRef}
                  {c.beneficiary ? ` — ${c.beneficiary.pseudonymFa}` : ""}
                </p>
                <p className="text-muted">
                  {c.scopes.map((s) => SCOPE_FA[s] ?? s).join("، ")} —{" "}
                  {active ? "فعال" : "باطل/منقضی"}
                </p>
                <JalaliDate date={c.grantedAt} className="text-xs text-muted" />
              </div>
              {active ? (
                <form action={revokeConsentAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs text-red-700">
                    ابطال
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
