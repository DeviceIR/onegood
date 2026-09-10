import { prisma } from "@/server/db/prisma";
import { JalaliDate } from "@/components/JalaliDate";
import { AdminDataTable, AdminTableRow } from "@/components/admin/AdminDataTable";

export default async function AdminAuditPage() {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 150,
    include: { actorAdmin: { select: { name: true, email: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">ممیزی</h1>
      <p className="mt-2 text-sm text-muted">
        فقط خواندنی و الحاقی — هر تغییر مدیریتی اینجا ثبت می‌شود.
      </p>
      <AdminDataTable headers={["زمان", "عامل", "عمل", "موجودیت", "جزئیات"]}>
        {rows.map((a) => (
          <AdminTableRow
            key={a.id}
            cells={[
              <JalaliDate key="d" date={a.createdAt} />,
              a.actorAdmin?.name ?? a.actorType,
              <span key="act" className="font-mono text-xs">
                {a.action}
              </span>,
              `${a.entityType}${a.entityId ? ` · ${a.entityId.slice(0, 8)}` : ""}`,
              <span key="j" className="block max-w-xs truncate text-xs text-muted" dir="ltr">
                {a.afterJson
                  ? JSON.stringify(a.afterJson)
                  : a.beforeJson
                    ? JSON.stringify(a.beforeJson)
                    : "—"}
              </span>,
            ]}
          />
        ))}
      </AdminDataTable>
      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">رکوردی نیست.</p>
      ) : null}
    </div>
  );
}
