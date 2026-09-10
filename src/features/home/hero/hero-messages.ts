/**
 * Permanent core brand copy. Do not rewrite, shorten, paraphrase, or translate.
 */
export const HERO_MESSAGES = Object.freeze([
  Object.freeze({
    id: "message-01" as const,
    lines: Object.freeze([
      "نمی‌توان همه‌ی بدی‌ها را از بین برد؛",
      "اما می‌توان خوبی‌ها را حفظ کرد.",
      "",
      "حتی اگر کوچک باشند،",
      "حتی اگر سهم ما فقط یک کیف،",
      "یک مداد،",
      "یا یک لبخند باشد.",
    ]),
  }),
  Object.freeze({
    id: "message-02" as const,
    lines: Object.freeze([
      "شاید نتوانیم همه‌ی بدی‌ها را از بین ببریم،",
      "اما می‌توانیم خوبی‌های کوچکی را که هنوز باقی مانده‌اند،",
      "حفظ کنیم؛",
      "بزرگ‌ترشان کنیم،",
      "و به دیگری بسپاریم.",
    ]),
  }),
]);

export type HeroMessage = (typeof HERO_MESSAGES)[number];

export function heroMessageText(m: HeroMessage): string {
  return m.lines.join("\n");
}
