const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

export function toEnglishDigits(input: string): string {
  return input.replace(/[۰-۹٠-٩]/g, (ch) => {
    const p = persianDigits.indexOf(ch);
    if (p >= 0) return String(p);
    const a = arabicDigits.indexOf(ch);
    return a >= 0 ? String(a) : ch;
  });
}

export function toPersianDigits(input: string | number | bigint): string {
  return String(input).replace(/\d/g, (d) => persianDigits[Number(d)]!);
}

/** Format toman amount for display (Persian digits + separators). */
export function formatToman(amount: number | bigint, opts?: { withUnit?: boolean }): string {
  const n = typeof amount === "bigint" ? amount : BigInt(Math.trunc(amount));
  const withSep = n.toLocaleString("en-US");
  const fa = toPersianDigits(withSep);
  return opts?.withUnit === false ? fa : `${fa} تومان`;
}

export function parseTomanInput(raw: string): bigint | null {
  const cleaned = toEnglishDigits(raw).replace(/[^\d]/g, "");
  if (!cleaned) return null;
  try {
    return BigInt(cleaned);
  } catch {
    return null;
  }
}

/** Convert Prisma BigInt money fields into JSON/RSC-safe numbers. */
export function toMoneyNumber(amount: number | bigint | null | undefined): number {
  if (amount == null) return 0;
  return typeof amount === "bigint" ? Number(amount) : amount;
}
