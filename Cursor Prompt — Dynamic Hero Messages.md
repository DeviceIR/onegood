## HERO — ROTATING BRAND MESSAGE

The Hero section must use the following two Persian brand messages.

The messages should automatically switch between each other every few minutes.

IMPORTANT:
- Both messages are permanent core brand copy.
- Do not rewrite, shorten, paraphrase, or translate them.
- Display them exactly as provided below.
- The transition between messages must feel calm, elegant, emotional, and premium.
- Do not make the animation distracting.
- Do not use aggressive sliding, bouncing, or flashy effects.
- Prefer a subtle crossfade combined with a small vertical movement.
- Respect `prefers-reduced-motion`.
- The hero must remain visually stable while the text changes.
- The layout must not jump dramatically when switching between messages.
- Reserve enough vertical space for the longer message.
- The transition should not reset the rest of the Hero animation or affect the CTA.

### MESSAGE 01

نمی‌توان همه‌ی بدی‌ها را از بین برد؛
اما می‌توان خوبی‌ها را حفظ کرد.

حتی اگر کوچک باشند،
حتی اگر سهم ما فقط یک کیف،
یک مداد،
یا یک لبخند باشد.

### MESSAGE 02

شاید نتوانیم همه‌ی بدی‌ها را از بین ببریم،
اما می‌توانیم خوبی‌های کوچکی را که هنوز باقی مانده‌اند،
حفظ کنیم؛
بزرگ‌ترشان کنیم،
و به دیگری بسپاریم.

### ROTATION BEHAVIOR

Implement an automatic rotating message system.

Recommended behavior:

1. Show MESSAGE 01 when the page initially loads.
2. Keep it visible for approximately 3 minutes.
3. Fade it out smoothly.
4. Briefly transition.
5. Fade MESSAGE 02 in.
6. Keep MESSAGE 02 visible for approximately 3 minutes.
7. Repeat indefinitely.

The exact timing should be configurable through a single constant, for example:

HERO_MESSAGE_INTERVAL

Do not hard-code the interval in multiple places.

The component should be architected so the timing can easily be changed later.

### TRANSITION

Use a refined animation such as:

- opacity: 0 → 1
- slight translateY movement
- subtle blur reduction if appropriate

The animation should feel similar to a premium editorial / luxury brand website.

Avoid:

- typing animations
- character-by-character rendering
- excessive motion
- flashing
- bouncing
- large horizontal slides

The user should feel that the message is naturally changing rather than being replaced by an animation.

### ACCESSIBILITY

If the user has enabled reduced motion:

- disable movement
- use a simple opacity transition or instant change
- maintain full readability

The content must remain accessible to screen readers.

Do not continuously announce the changing message in a way that becomes disruptive for assistive technologies.

### MANUAL CONTROL

If appropriate for the final UX, provide subtle indicators allowing the user to understand that multiple messages exist.

However, do NOT make the Hero look like a traditional carousel.

The primary experience should remain automatic and minimal.

### RESPONSIVE BEHAVIOR

The Hero must work correctly in:

- Desktop
- Tablet
- Mobile

Persian text must remain RTL.

Make sure the Hero has sufficient reserved height so switching between the two messages does not cause layout shift.

### BRAND CONTEXT

These messages are central to the HAFEZ brand:

HAFEZ
حافظ خوبی‌ها

The purpose of the platform is to preserve and expand small acts of kindness.

The Hero should communicate:

We may not be able to eliminate every bad thing in the world.

But we can preserve the good that still exists.

Even something as small as:

یک کیف
یک مداد
یک لبخند

can become part of something bigger.

Do not add additional marketing copy to these messages.

Treat them as the emotional foundation of the homepage.