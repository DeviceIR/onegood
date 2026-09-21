import Link from "next/link";
import { auth, signOut } from "@/server/auth/auth";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { roleHasMin } from "@/server/auth/roles";
import { adminRoleFa } from "@/lib/admin-labels";
import { prisma } from "@/server/db/prisma";
import { toPersianDigits } from "@/lib/money";

const nav: { href: string; label: string; minRole: AdminRole }[] = [
  { href: "/admin", label: "داشبورد", minRole: "VIEWER" },
  { href: "/admin/campaigns", label: "کمپین‌ها", minRole: "VIEWER" },
  { href: "/admin/donations", label: "کمک‌ها", minRole: "VIEWER" },
  { href: "/admin/payments", label: "پرداخت‌ها", minRole: "VIEWER" },
  { href: "/admin/ledger", label: "دفترکل", minRole: "ADMIN" },
  { href: "/admin/expenses", label: "هزینه‌ها", minRole: "ADMIN" },
  { href: "/admin/media", label: "رسانه", minRole: "CAMPAIGN_MANAGER" },
  { href: "/admin/testimonials", label: "نظرات", minRole: "CAMPAIGN_MANAGER" },
  { href: "/admin/beneficiaries", label: "ذی‌نفعان", minRole: "CAMPAIGN_MANAGER" },
  { href: "/admin/consents", label: "رضایت‌ها", minRole: "CAMPAIGN_MANAGER" },
  { href: "/admin/volunteers", label: "داوطلبان", minRole: "ADMIN" },
  { href: "/admin/messages", label: "پیام‌ها", minRole: "ADMIN" },
  { href: "/admin/audit", label: "ممیزی", minRole: "ADMIN" },
  { href: "/admin/settings", label: "تنظیمات", minRole: "VIEWER" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  const role = session.user.role ?? "VIEWER";
  const visible = nav.filter((n) => roleHasMin(role, n.minRole));
  let unreadMessages = 0;
  let unreadVolunteers = 0;
  if (roleHasMin(role, "ADMIN")) {
    try {
      [unreadMessages, unreadVolunteers] = await Promise.all([
        prisma.contactMessage.count({ where: { handled: false } }),
        prisma.volunteerApplication.count({ where: { handled: false } }),
      ]);
    } catch {
      /* inbox counts are optional */
    }
  }

  const badgeFor = (href: string) => {
    if (href === "/admin/messages" && unreadMessages > 0) return unreadMessages;
    if (href === "/admin/volunteers" && unreadVolunteers > 0) {
      return unreadVolunteers;
    }
    return 0;
  };

  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="w-full border-b border-border md:w-56 md:border-b-0 md:border-e">
        <div className="p-4">
          <p className="font-bold">پنل ONE GOOD</p>
          <p className="text-xs text-muted">{session.user.name}</p>
          <p className="text-xs text-muted">{adminRoleFa(role)}</p>
        </div>
        <nav className="flex flex-wrap gap-2 px-3 pb-4 md:flex-col" aria-label="ادمین">
          {visible.map((n) => {
            const badge = badgeFor(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                className="rounded px-2 py-1.5 text-sm text-muted hover:bg-border/50 hover:text-foreground"
              >
                {n.label}
                {badge > 0 ? (
                  <span className="ms-2 inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">
                    {toPersianDigits(badge)}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <form
          className="px-3 pb-4"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/admin/login" });
          }}
        >
          <button type="submit" className="text-sm text-muted hover:text-foreground">
            خروج
          </button>
        </form>
      </aside>
      <div className="flex-1 p-6">{children}</div>
    </div>
  );
}
