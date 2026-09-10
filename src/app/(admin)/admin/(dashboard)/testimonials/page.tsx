import { prisma } from "@/server/db/prisma";

function ListPage({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; label: string; meta?: string }[];
}) {
  return (
    <div>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <ul className="mt-6 divide-y">
        {rows.map((r) => (
          <li key={r.id} className="py-3">
            <p>{r.label}</p>
            {r.meta ? <p className="text-sm text-muted">{r.meta}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function AdminTestimonialsPage() {
  const rows = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <ListPage
      title="نظرات"
      rows={rows.map((t) => ({
        id: t.id,
        label: `${t.authorDisplayName} — ${t.status}`,
        meta: t.bodyFa.slice(0, 120),
      }))}
    />
  );
}
