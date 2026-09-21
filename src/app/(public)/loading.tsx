export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20" aria-busy="true">
      <p className="text-sm text-muted">در حال بارگذاری…</p>
      <div className="mt-8 space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-border/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-border/50" />
        <div className="h-40 animate-pulse rounded-2xl bg-border/50" />
      </div>
    </div>
  );
}
