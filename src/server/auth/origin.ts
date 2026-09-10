import { headers } from "next/headers";

/** Reject cross-site form posts to admin mutations. */
export async function assertSameOrigin() {
  if (process.env.NODE_ENV === "test") return;

  const h = await headers();
  const origin = h.get("origin");
  const referer = h.get("referer");
  const base = process.env.AUTH_URL;
  if (!base) return;

  let allowed: string;
  try {
    allowed = new URL(base).origin;
  } catch {
    return;
  }

  if (origin) {
    if (origin !== allowed) throw new Error("INVALID_ORIGIN");
    return;
  }
  if (referer) {
    if (!referer.startsWith(allowed)) throw new Error("INVALID_ORIGIN");
    return;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("INVALID_ORIGIN");
  }
}
