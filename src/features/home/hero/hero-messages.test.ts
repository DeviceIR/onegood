import { describe, expect, it } from "vitest";
import { HERO_MESSAGES, heroMessageText } from "./hero-messages";

describe("HERO_MESSAGES brand copy", () => {
  it("keeps MESSAGE 01 exactly", () => {
    expect(heroMessageText(HERO_MESSAGES[0]!)).toBe(
      [
        "نمی‌توان همه‌ی بدی‌ها را از بین برد؛",
        "اما می‌توان خوبی‌ها را حفظ کرد.",
        "",
        "حتی اگر کوچک باشند،",
        "حتی اگر سهم ما فقط یک کیف،",
        "یک مداد،",
        "یا یک لبخند باشد.",
      ].join("\n"),
    );
  });

  it("keeps MESSAGE 02 exactly", () => {
    expect(heroMessageText(HERO_MESSAGES[1]!)).toBe(
      [
        "شاید نتوانیم همه‌ی بدی‌ها را از بین ببریم،",
        "اما می‌توانیم خوبی‌های کوچکی را که هنوز باقی مانده‌اند،",
        "حفظ کنیم؛",
        "بزرگ‌ترشان کنیم،",
        "و به دیگری بسپاریم.",
      ].join("\n"),
    );
  });
});
