import Link from "next/link";

/** First focusable control for keyboard users. */
export function SkipToContent() {
  return (
    <Link
      href="#main-content"
      className="sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:inline-flex focus:h-auto focus:w-auto focus:items-center focus:overflow-visible focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
    >
      پرش به محتوای اصلی
    </Link>
  );
}
