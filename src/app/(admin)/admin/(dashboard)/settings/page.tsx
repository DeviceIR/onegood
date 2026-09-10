import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { canManageAdmins } from "@/server/auth/roles";
import { ADMIN_ROLE_FA, adminRoleFa } from "@/lib/admin-labels";
import {
  beginEnableTotpAction,
  changeOwnPasswordAction,
  confirmEnableTotpAction,
  createAdminAction,
  disableTotpAction,
  setAdminActiveAction,
  setAdminRoleAction,
} from "@/features/admin/admin-actions";
import { decryptTotpSecret } from "@/server/auth/totp-crypto";
import { totpUri } from "@/server/auth/totp";
import type { AdminRole } from "@prisma/client";

const okFa: Record<string, string> = {
  "totp-on": "تأیید دو مرحله‌ای فعال شد.",
  "totp-off": "تأیید دو مرحله‌ای غیرفعال شد.",
  "admin-created": "مدیر جدید ایجاد شد.",
  "admin-updated": "تغییرات مدیر ذخیره شد.",
  password: "رمز عبور به‌روز شد.",
};

const errFa: Record<string, string> = {
  "totp-already": "تأیید دو مرحله‌ای از قبل فعال است.",
  "totp-missing": "ابتدا راه‌اندازی را شروع کنید.",
  "totp-invalid": "کد تأیید نامعتبر است.",
  password: "رمز فعلی نادرست است.",
  "password-short": "رمز جدید باید حداقل ۱۰ کاراکتر باشد.",
  "admin-invalid": "داده‌های مدیر نامعتبر است.",
  self: "نمی‌توانید حساب خود را تغییر دهید.",
  missing: "مدیر پیدا نشد.",
  role: "نقش نامعتبر است.",
};

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; err?: string; totpSetup?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  if (!session?.user?.id) return null;

  const me = await prisma.admin.findUnique({ where: { id: session.user.id } });
  if (!me) return null;

  const isOwner = canManageAdmins(me.role);
  const admins = isOwner
    ? await prisma.admin.findMany({ orderBy: { createdAt: "asc" } })
    : [];

  let setupSecret: string | null = null;
  let setupUri: string | null = null;
  if (
    sp.totpSetup === "1" &&
    me.role === "OWNER" &&
    !me.totpEnabled &&
    me.totpSecretEnc
  ) {
    setupSecret = decryptTotpSecret(me.totpSecretEnc, process.env.AUTH_SECRET ?? "");
    setupUri = totpUri(setupSecret, me.email);
  }

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">تنظیمات</h1>
        <p className="mt-2 text-sm text-muted">
          نقش شما: {adminRoleFa(me.role)} — متغیرهای درگاه و ذخیره‌سازی فقط از محیط سرور
          تنظیم می‌شوند.
        </p>
      </div>

      {sp.ok && okFa[sp.ok] ? (
        <p className="rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
          {okFa[sp.ok]}
        </p>
      ) : null}
      {sp.err && errFa[sp.err] ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errFa[sp.err]}
        </p>
      ) : null}

      <section className="space-y-3 rounded-lg border border-border p-4">
        <h2 className="font-medium">تغییر رمز عبور</h2>
        <form action={changeOwnPasswordAction} className="grid max-w-md gap-2">
          <input
            type="password"
            name="currentPassword"
            required
            placeholder="رمز فعلی"
            className="h-10 rounded border border-border px-3"
          />
          <input
            type="password"
            name="newPassword"
            required
            minLength={10}
            placeholder="رمز جدید (حداقل ۱۰)"
            className="h-10 rounded border border-border px-3"
          />
          <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
            ذخیره رمز
          </button>
        </form>
      </section>

      {me.role === "OWNER" ? (
        <section className="space-y-3 rounded-lg border border-border p-4">
          <h2 className="font-medium">تأیید دو مرحله‌ای (TOTP)</h2>
          <p className="text-sm text-muted">
            برای نقش مالک اجباری در تولید توصیه می‌شود. از Google Authenticator یا مشابه
            استفاده کنید.
          </p>
          {me.totpEnabled ? (
            <form action={disableTotpAction} className="grid max-w-md gap-2">
              <p className="text-sm text-accent">وضعیت: فعال</p>
              <input
                type="password"
                name="password"
                required
                placeholder="رمز عبور"
                className="h-10 rounded border border-border px-3"
              />
              <input
                name="totp"
                required
                placeholder="کد ۶ رقمی"
                className="h-10 rounded border border-border px-3"
                dir="ltr"
              />
              <button type="submit" className="h-10 rounded border border-border">
                غیرفعال‌سازی
              </button>
            </form>
          ) : setupSecret && setupUri ? (
            <div className="space-y-3">
              <p className="text-sm">
                کلید را در اپلیکیشن احراز هویت وارد کنید، سپس کد را تأیید کنید:
              </p>
              <p className="break-all font-mono text-xs" dir="ltr">
                {setupSecret}
              </p>
              <p className="break-all font-mono text-[10px] text-muted" dir="ltr">
                {setupUri}
              </p>
              <form action={confirmEnableTotpAction} className="flex max-w-md gap-2">
                <input
                  name="totp"
                  required
                  placeholder="کد ۶ رقمی"
                  className="h-10 flex-1 rounded border border-border px-3"
                  dir="ltr"
                />
                <button type="submit" className="h-10 rounded bg-accent px-4 text-accent-foreground">
                  تأیید و فعال‌سازی
                </button>
              </form>
            </div>
          ) : (
            <form action={beginEnableTotpAction}>
              <button type="submit" className="h-10 rounded bg-accent px-4 text-accent-foreground">
                شروع راه‌اندازی TOTP
              </button>
            </form>
          )}
        </section>
      ) : null}

      {isOwner ? (
        <section className="space-y-4 rounded-lg border border-border p-4">
          <h2 className="font-medium">مدیران</h2>
          <form action={createAdminAction} className="grid max-w-md gap-2">
            <input
              name="name"
              required
              placeholder="نام"
              className="h-10 rounded border border-border px-3"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="ایمیل"
              className="h-10 rounded border border-border px-3"
              dir="ltr"
            />
            <input
              name="password"
              type="password"
              required
              minLength={10}
              placeholder="رمز موقت (حداقل ۱۰)"
              className="h-10 rounded border border-border px-3"
            />
            <select name="role" defaultValue="CAMPAIGN_MANAGER" className="h-10 rounded border px-2">
              {(Object.keys(ADMIN_ROLE_FA) as AdminRole[]).map((r) => (
                <option key={r} value={r}>
                  {ADMIN_ROLE_FA[r]}
                </option>
              ))}
            </select>
            <button type="submit" className="h-10 rounded bg-accent text-accent-foreground">
              ایجاد مدیر
            </button>
          </form>

          <ul className="divide-y divide-border text-sm">
            {admins.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">
                    {a.name}{" "}
                    <span className="text-muted">({adminRoleFa(a.role)})</span>
                  </p>
                  <p className="text-xs text-muted" dir="ltr">
                    {a.email}
                    {!a.isActive ? " — غیرفعال" : ""}
                    {a.totpEnabled ? " — TOTP" : ""}
                  </p>
                </div>
                {a.id !== me.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={setAdminRoleAction} className="flex gap-1">
                      <input type="hidden" name="id" value={a.id} />
                      <select
                        name="role"
                        defaultValue={a.role}
                        className="rounded border px-1 text-xs"
                      >
                        {(Object.keys(ADMIN_ROLE_FA) as AdminRole[]).map((r) => (
                          <option key={r} value={r}>
                            {ADMIN_ROLE_FA[r]}
                          </option>
                        ))}
                      </select>
                      <button type="submit" className="text-xs text-accent">
                        نقش
                      </button>
                    </form>
                    <form action={setAdminActiveAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <input
                        type="hidden"
                        name="isActive"
                        value={a.isActive ? "false" : "true"}
                      />
                      <button type="submit" className="text-xs text-accent">
                        {a.isActive ? "غیرفعال" : "فعال"}
                      </button>
                    </form>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
