export function PublishChecklist({
  items,
  status,
}: {
  items: { ok: boolean; label: string }[];
  status: string;
}) {
  const ready = items.every((item) => item.ok);
  const unpublished = status !== "PUBLISHED" && status !== "COMPLETED";

  return (
    <section className="rounded-lg border border-border p-4">
      <h2 className="font-medium">چک‌لیست انتشار</h2>
      <ul className="mt-3 space-y-1.5 text-sm">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              className={item.ok ? "text-accent" : "text-muted"}
              aria-hidden
            >
              {item.ok ? "●" : "○"}
            </span>
            <span className={item.ok ? "text-foreground" : "text-muted"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
      {ready ? (
        <p className="mt-3 text-sm text-accent">
          {unpublished
            ? "محتوا کامل است؛ می‌توانید وضعیت را روی منتشرشده بگذارید."
            : "موارد اصلی این کمپین کامل است."}
        </p>
      ) : (
        <p className="mt-3 text-sm text-muted">
          موارد ناقص را کامل کنید تا صفحه عمومی قابل اعتمادتر باشد. انتشار هنوز
          مسدود نشده است.
        </p>
      )}
    </section>
  );
}
