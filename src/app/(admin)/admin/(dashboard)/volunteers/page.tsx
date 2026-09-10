import { prisma } from "@/server/db/prisma";

export default async function AdminVolunteersPage() {
  const rows = await prisma.volunteerApplication.findMany({
    orderBy: { createdAt: "desc" },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold">داوطلبان</h1>
      <ul className="mt-6 divide-y">
        {rows.map((v) => (
          <li key={v.id} className="py-3">
            <p>
              {v.name} — {v.phone}
            </p>
            <p className="text-sm text-muted">{v.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
