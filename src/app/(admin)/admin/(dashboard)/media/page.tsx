import { prisma } from "@/server/db/prisma";
import { isConsentActive } from "@/server/privacy/consent-gate";
import {
  createImpactRecordAction,
  setMediaVisibilityAction,
  uploadMediaAction,
} from "@/features/media/media-actions";
import { MediaImage } from "@/components/media/MediaImage";
import { mediaDisplayUrl } from "@/components/media/MediaImage";

const okFa: Record<string, string> = {
  uploaded: "رسانه آپلود شد.",
  visibility: "وضعیت انتشار به‌روز شد.",
  impact: "گزارش اثر ثبت شد.",
};

export default async function AdminMediaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string }>;
}) {
  const { ok, err } = await searchParams;
  const [media, consents, campaigns, beneficiaries] = await Promise.all([
    prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { variants: true, consent: true },
    }),
    prisma.consent.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { beneficiary: true },
    }),
    prisma.campaign.findMany({
      select: { id: true, titleFa: true },
      orderBy: { titleFa: "asc" },
    }),
    prisma.beneficiary.findMany({
      select: { id: true, internalCode: true, pseudonymFa: true },
      orderBy: { internalCode: "asc" },
    }),
  ]);

  const activeConsents = consents.filter((c) => isConsentActive(c));

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">رسانه</h1>
        <p className="mt-2 text-sm text-muted">
          تصاویر با حذف EXIF ذخیره می‌شوند. انتشار تصویر ذی‌نفع بدون رضایت فعال ممکن نیست.
        </p>
      </div>

      {ok && okFa[ok] ? (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {okFa[ok]}
        </p>
      ) : null}
      {err === "consent" ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          انتشار رسانه ذی‌نفع بدون رضایت فعال (عکس/ویدیو) ممکن نیست.
        </p>
      ) : err ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          خطا در ثبت — رضایت یا داده‌ها را بررسی کنید.
        </p>
      ) : null}

      <form
        action={uploadMediaAction}
        encType="multipart/form-data"
        className="grid gap-2 rounded-lg border border-border p-4"
      >
        <p className="font-medium">آپلود</p>
        <select name="kind" defaultValue="IMAGE" className="h-10 rounded border px-2">
          <option value="IMAGE">تصویر</option>
          <option value="VIDEO">ویدیو</option>
        </select>
        <input
          type="file"
          name="file"
          accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
          required
        />
        <input
          name="altTextFa"
          placeholder="متن جایگزین / عنوان"
          className="h-10 rounded border border-border px-3"
        />
        <select name="visibility" className="h-10 rounded border px-2" defaultValue="INTERNAL">
          <option value="INTERNAL">داخلی</option>
          <option value="PUBLIC">عمومی</option>
        </select>
        <select name="campaignId" className="h-10 rounded border px-2">
          <option value="">بدون کمپین</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleFa}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="depictsBeneficiary" value="true" />
          تصویر/ویدیو ذی‌نفع (کودک) — نیاز به رضایت
        </label>
        <select name="consentId" className="h-10 rounded border px-2">
          <option value="">بدون رضایت</option>
          {activeConsents.map((c) => (
            <option key={c.id} value={c.id}>
              {c.beneficiary?.pseudonymFa ?? c.subjectRef} —{" "}
              {c.scopes.join("، ")}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          آپلود (EXIF حذف می‌شود)
        </button>
      </form>

      <form
        action={createImpactRecordAction}
        className="grid gap-2 rounded-lg border border-border p-4"
      >
        <p className="font-medium">گزارش اثر (+ گالری)</p>
        <select name="campaignId" required className="h-10 rounded border px-2">
          <option value="">انتخاب کمپین</option>
          {campaigns.map((c) => (
            <option key={c.id} value={c.id}>
              {c.titleFa}
            </option>
          ))}
        </select>
        <select name="beneficiaryId" className="h-10 rounded border px-2">
          <option value="">بدون ذی‌نفع</option>
          {beneficiaries.map((b) => (
            <option key={b.id} value={b.id}>
              {b.internalCode} — {b.pseudonymFa}
            </option>
          ))}
        </select>
        <input
          name="itemsSummaryFa"
          required
          placeholder="خلاصه اقلام"
          className="h-10 rounded border px-3"
        />
        <textarea
          name="publicDescriptionFa"
          required
          placeholder="توضیح عمومی (بدون هویت)"
          className="rounded border px-3 py-2"
        />
        <input name="deliveredAt" type="date" className="h-10 rounded border px-3" />
        <select name="mediaId" className="h-10 rounded border px-2">
          <option value="">بدون تصویر</option>
          {media
            .filter((m) => m.kind === "IMAGE")
            .map((m) => (
              <option key={m.id} value={m.id}>
                {m.altTextFa ?? m.storageKey.slice(0, 24)}
                {m.depictsBeneficiary ? " (ذی‌نفع)" : ""}
              </option>
            ))}
        </select>
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          ثبت گزارش اثر
        </button>
      </form>

      <ul className="divide-y divide-border">
        {media.map((m) => (
          <li key={m.id} className="flex flex-wrap items-start gap-4 py-4">
            {m.kind === "IMAGE" ? (
              <div className="h-20 w-28 overflow-hidden rounded border">
                <MediaImage
                  media={m}
                  preferredWidth={400}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-20 w-28 items-center justify-center rounded border text-xs text-muted">
                ویدیو
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-medium">{m.altTextFa ?? "بدون عنوان"}</p>
              <p className="text-xs text-muted">
                {m.kind === "VIDEO" ? "ویدیو" : "تصویر"} —{" "}
                {m.visibility === "PUBLIC" ? "عمومی" : "داخلی"}
                {m.depictsBeneficiary ? " — ذی‌نفع" : ""}
              </p>
              <p className="truncate font-mono text-[10px] text-muted" dir="ltr">
                {mediaDisplayUrl(m, 400)}
              </p>
            </div>
            <form action={setMediaVisibilityAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={m.id} />
              <select
                name="visibility"
                defaultValue={m.visibility}
                className="rounded border px-1 text-xs"
              >
                <option value="INTERNAL">داخلی</option>
                <option value="PUBLIC">عمومی</option>
              </select>
              <button type="submit" className="text-xs text-accent">
                ذخیره
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
