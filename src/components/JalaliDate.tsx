import { formatJalaliDate } from "@/lib/jalali";

export function JalaliDate({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  return <time className={className}>{formatJalaliDate(date)}</time>;
}
