import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { Money } from "@/components/Money";
import {
  addCampaignNeedAction,
  addCampaignUpdateAction,
  deleteCampaignNeedAction,
  publishCampaignUpdateAction,
  setCampaignStatusAction,
  updateCampaignAction,
} from "@/features/campaigns/campaign-actions";
import {
  CAMPAIGN_STATUS_FA,
  CAMPAIGN_STATUSES,
  campaignStatusFa,
} from "@/lib/campaign-status";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
};

const okMessage: Record<string, string> = {
  created: "کمپین ایجاد شد.",
  saved: "محتوا ذخیره شد.",
  status: "وضعیت کمپین ذخیره شد.",
  need: "قلم نیاز افزوده شد.",
  "need-deleted": "قلم حذف شد.",
  update: "به‌روزرسانی افزوده شد.",
  "update-published": "به‌روزرسانی منتشر شد.",
};

export default async function AdminCampaignDetailPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { ok } = await searchParams;
  const c = await prisma.campaign.findUnique({
    where: { id },
    include: {
      needs: { orderBy: { sortOrder: "asc" } },
      updates: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!c) notFound();

  const deadlineValue = c.deadline
    ? c.deadline.toISOString().slice(0, 10)
    : "";

  return (
    <div className="max-w-3xl space-y-10">
      {ok && okMessage[ok] ? (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {okMessage[ok]}
        </p>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/campaigns" className="text-sm text-accent">
            ← بازگشت به فهرست
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{c.titleFa}</h1>
          <p className="mt-1 text-sm text-muted">
            شناسه آدرس: {c.slug} · وضعیت: {campaignStatusFa(c.status)}
          </p>
          <p className="mt-2">
            <Money amount={c.collectedAmountToman} /> /{" "}
            <Money amount={c.targetAmountToman} />
          </p>
        </div>
        <form action={setCampaignStatusAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={c.id} />
          <select
            key={c.status}
            name="status"
            defaultValue={c.status}
            className="rounded border border-border px-2 py-1 text-sm"
          >
            {CAMPAIGN_STATUSES.map((s) => (
              <option key={s} value={s}>
                {CAMPAIGN_STATUS_FA[s]}
              </option>
            ))}
          </select>
          <button type="submit" className="text-sm text-accent">
            ذخیره وضعیت
          </button>
        </form>
      </div>

      {c.status === "PUBLISHED" || c.status === "COMPLETED" ? (
        <p className="text-sm">
          صفحه عمومی:{" "}
          <Link
            href={`/campaigns/${c.slug}`}
            className="text-accent"
            target="_blank"
          >
            /campaigns/{c.slug}
          </Link>
        </p>
      ) : (
        <p className="text-sm text-muted">
          برای نمایش عمومی، وضعیت را روی «منتشرشده» بگذارید و ذخیره کنید.
        </p>
      )}

      <form
        action={updateCampaignAction}
        className="grid gap-3 rounded-lg border border-border p-4"
      >
        <h2 className="font-medium">ویرایش محتوا</h2>
        <input type="hidden" name="id" value={c.id} />
        <label className="text-sm">
          عنوان
          <input
            name="titleFa"
            defaultValue={c.titleFa}
            required
            className="mt-1 h-10 w-full rounded border border-border px-3"
          />
        </label>
        <label className="text-sm">
          خلاصه
          <textarea
            name="summaryFa"
            defaultValue={c.summaryFa}
            required
            className="mt-1 w-full rounded border border-border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          داستان
          <textarea
            name="storyFa"
            defaultValue={c.storyFa}
            required
            rows={6}
            className="mt-1 w-full rounded border border-border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          هدف (تومان)
          <input
            name="targetAmountToman"
            defaultValue={c.targetAmountToman.toString()}
            required
            dir="ltr"
            className="mt-1 h-10 w-full rounded border border-border px-3"
          />
        </label>
        <label className="text-sm">
          مهلت
          <input
            name="deadline"
            type="date"
            defaultValue={deadlineValue}
            className="mt-1 h-10 w-full rounded border border-border px-3"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={c.isFeatured}
          />
          ویژه در صفحه اول
        </label>
        <label className="text-sm">
          ترتیب نمایش
          <input
            name="sortOrder"
            type="number"
            defaultValue={c.sortOrder}
            className="mt-1 h-10 w-full rounded border border-border px-3"
            dir="ltr"
          />
        </label>
        <label className="text-sm">
          عنوان سئو
          <input
            name="seoTitle"
            defaultValue={c.seoTitle ?? ""}
            className="mt-1 h-10 w-full rounded border border-border px-3"
          />
        </label>
        <label className="text-sm">
          توضیح سئو
          <textarea
            name="seoDescription"
            defaultValue={c.seoDescription ?? ""}
            className="mt-1 w-full rounded border border-border px-3 py-2"
          />
        </label>
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          ذخیره تغییرات
        </button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">اقلام مورد نیاز</h2>
        <ul className="divide-y divide-border rounded border border-border">
          {c.needs.map((n) => (
            <li
              key={n.id}
              className="flex items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <span>
                {n.titleFa} × {n.quantity}
              </span>
              <form action={deleteCampaignNeedAction}>
                <input type="hidden" name="needId" value={n.id} />
                <button type="submit" className="text-red-700">
                  حذف
                </button>
              </form>
            </li>
          ))}
          {c.needs.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted">موردی ثبت نشده</li>
          ) : null}
        </ul>
        <form
          action={addCampaignNeedAction}
          className="grid gap-2 rounded border border-border p-3 sm:grid-cols-2"
        >
          <input type="hidden" name="campaignId" value={c.id} />
          <input
            name="titleFa"
            required
            placeholder="عنوان قلم"
            className="h-10 rounded border border-border px-3 sm:col-span-2"
          />
          <input
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            placeholder="تعداد"
            className="h-10 rounded border border-border px-3"
            dir="ltr"
          />
          <input
            name="unitPriceEstimateToman"
            placeholder="برآورد واحد (تومان)"
            className="h-10 rounded border border-border px-3"
            dir="ltr"
          />
          <input
            name="note"
            placeholder="یادداشت"
            className="h-10 rounded border border-border px-3 sm:col-span-2"
          />
          <button
            type="submit"
            className="h-10 rounded bg-accent text-accent-foreground sm:col-span-2"
          >
            افزودن قلم
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">به‌روزرسانی‌ها</h2>
        <ul className="space-y-3">
          {c.updates.map((u) => (
            <li key={u.id} className="rounded border border-border p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium">
                  {u.titleFa}{" "}
                  <span className="text-muted">
                    (
                    {u.status === "PUBLISHED" ? "منتشرشده" : "پیش‌نویس"}
                    )
                  </span>
                </p>
                {u.status === "DRAFT" ? (
                  <form action={publishCampaignUpdateAction}>
                    <input type="hidden" name="updateId" value={u.id} />
                    <button type="submit" className="text-accent">
                      انتشار
                    </button>
                  </form>
                ) : null}
              </div>
              <p className="mt-1 whitespace-pre-line text-muted">{u.bodyFa}</p>
            </li>
          ))}
        </ul>
        <form
          action={addCampaignUpdateAction}
          className="grid gap-2 rounded border border-border p-3"
        >
          <input type="hidden" name="campaignId" value={c.id} />
          <input
            name="titleFa"
            required
            placeholder="عنوان به‌روزرسانی"
            className="h-10 rounded border border-border px-3"
          />
          <textarea
            name="bodyFa"
            required
            placeholder="متن"
            className="rounded border border-border px-3 py-2"
            rows={4}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publishNow" />
            همین الان منتشر شود
          </label>
          <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
            افزودن به‌روزرسانی
          </button>
        </form>
      </section>
    </div>
  );
}
