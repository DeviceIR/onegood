import { prisma } from "@/server/db/prisma";

export default async function AdminMessagesPage() {
  const rows = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-2xl font-semibold">پیام‌ها</h1>
      <ul className="mt-6 divide-y">
        {rows.map((m) => (
          <li key={m.id} className="py-3">
            <p>{m.name}</p>
            <p className="text-sm text-muted">{m.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
