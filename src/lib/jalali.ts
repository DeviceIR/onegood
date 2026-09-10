import { format as formatJalali } from "date-fns-jalali";
import { faIR } from "date-fns-jalali/locale";
import { toPersianDigits } from "./money";

export function formatJalaliDate(date: Date | string, pattern = "d MMMM yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return toPersianDigits(formatJalali(d, pattern, { locale: faIR }));
}
