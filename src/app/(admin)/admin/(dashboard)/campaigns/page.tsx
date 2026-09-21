import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { Money } from "@/components/Money";
import {
  createCampaignAction,
  setCampaignStatusAction,
  toggleCampaignFeaturedAction,
} from "@/features/campaigns/campaign-actions";
import {
  CAMPAIGN_STATUS_FA,
  CAMPAIGN_STATUSES,
  campaignStatusFa,
} from "@/lib/campaign-status";

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>;
}) {
  const { ok } = await searchParams;
  const campaigns = await prisma.campaign.findMany({
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">کمپین‌ها</h1>
      {ok === "featured" ? (
        <p className="mt-3 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          نمایش در صفحه اول به‌روز شد.
        </p>
      ) : ok ? (
        <p className="mt-3 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          تغییرات با موفقیت ذخیره شد.
        </p>
      ) : null}

      <form
        action={createCampaignAction}
        className="mt-6 grid max-w-xl gap-2 rounded-lg border border-border p-4"
      >
        <p className="font-medium">کمپین جدید</p>
        <input
          name="titleFa"
          required
          placeholder="عنوان"
          className="h-10 rounded border border-border px-3"
        />
        <input
          name="slug"
          required
          placeholder="شناسه انگلیسی آدرس (مثل lavazem-tahrir)"
          className="h-10 rounded border border-border px-3"
          dir="ltr"
        />
        <textarea
          name="summaryFa"
          required
          placeholder="خلاصه"
          className="rounded border border-border px-3 py-2"
        />
        <textarea
          name="storyFa"
          required
          placeholder="داستان"
          className="rounded border border-border px-3 py-2"
        />
        <input
          name="targetAmountToman"
          required
          placeholder="هدف (تومان)"
          className="h-10 rounded border border-border px-3"
          dir="ltr"
        />
        <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
          ایجاد پیش‌نویس
        </button>
      </form>

      <ul className="mt-8 divide-y divide-border">
        {campaigns.map((c) => (
          <li
            key={`${c.id}-${c.status}-${c.updatedAt.toISOString()}`}
            className="flex flex-wrap items-center justify-between gap-2 py-4"
          >
            <div>
              <Link
                href={`/admin/campaigns/${c.id}`}
                className="font-medium hover:text-accent"
              >
                {c.titleFa}
              </Link>
              <p className="text-sm text-muted">
                {campaignStatusFa(c.status)}
                {c.isFeatured ? " · ویژه صفحه اول" : ""} —{" "}
                <Money amount={c.collectedAmountToman} /> /{" "}
                <Money amount={c.targetAmountToman} />
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <form action={toggleCampaignFeaturedAction}>
                <input type="hidden" name="id" value={c.id} />
                <input
                  type="hidden"
                  name="featured"
                  value={c.isFeatured ? "0" : "1"}
                />
                <button type="submit" className="text-sm text-accent">
                  {c.isFeatured ? "حذف از صفحه اول" : "نمایش در صفحه اول"}
                </button>
              </form>
              <form action={setCampaignStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input type="hidden" name="returnTo" value="list" />
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
          </li>
        ))}
      </ul>
    </div>
  );
}
