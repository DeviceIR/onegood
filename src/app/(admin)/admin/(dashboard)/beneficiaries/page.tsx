import { prisma } from "@/server/db/prisma";
import { createBeneficiaryAction } from "@/features/media/media-actions";

const AGE_FA: Record<string, string> = {
  UNDER_7: "زیر ۷",
  AGE_7_10: "۷–۱۰",
  AGE_11_14: "۱۱–۱۴",
  AGE_15_17: "۱۵–۱۷",
  ADULT: "بزرگسال",
};

export default async function AdminBeneficiariesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const rows = await prisma.beneficiary.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { consents: true } } },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">ذی‌نفعان</h1>
        <p className="mt-2 text-sm text-muted">
          فقط کد داخلی و نام مستعار — بدون نام کامل یا آدرس دقیق در سامانه عمومی.
        </p>
      </div>
      {ok ? (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          ذی‌نفع ثبت شد.
        </p>
      ) : null}
      {err ? (
        <p className="text-sm text-red-700">کد و نام مستعار الزامی است.</p>
      ) : null}

      <form action={createBeneficiaryAction} className="grid gap-2 rounded-lg border border-border p-4">
        <input
          name="internalCode"
          required
          placeholder="کد داخلی (مثل S-002)"
          className="h-10 rounded border px-3"
          dir="ltr"
        />
        <input
          name="pseudonymFa"
          required
          placeholder="نام مستعار فارسی"
          className="h-10 rounded border px-3"
        />
        <select name="ageRange" className="h-10 rounded border px-2">
          <option value="">بازه سنی</option>
          {Object.entries(AGE_FA).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input name="gradeLevel" placeholder="پایه (اختیاری)" className="h-10 rounded border px-3" />
        <input
          name="regionCoarse"
          placeholder="منطقه کلی (مثلاً محله محلی)"
          className="h-10 rounded border px-3"
        />
        <textarea
          name="notesInternal"
          placeholder="یادداشت داخلی"
          className="rounded border px-3 py-2"
        />
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          افزودن ذی‌نفع
        </button>
      </form>

      <ul className="divide-y divide-border">
        {rows.map((b) => (
          <li key={b.id} className="py-3">
            <p className="font-mono text-sm" dir="ltr">
              {b.internalCode}
            </p>
            <p className="font-medium">{b.pseudonymFa}</p>
            <p className="text-sm text-muted">
              {b.ageRange ? AGE_FA[b.ageRange] : "—"}
              {b.regionCoarse ? ` — ${b.regionCoarse}` : ""}
              {` — ${b._count.consents} رضایت`}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
