import { NextResponse } from "next/server";
import { checkRateLimit } from "@/server/ratelimit";

export async function enforceRateLimit(
  key: string,
  limit: number,
  windowMs: number,
  messageFa = "تعداد درخواست زیاد است. کمی بعد دوباره تلاش کنید.",
): Promise<NextResponse | null> {
  const result = await checkRateLimit(key, limit, windowMs);
  if (result.ok) return null;
  return NextResponse.json(
    { error: messageFa },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil(windowMs / 1000)),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": "0",
      },
    },
  );
}

export function clientIpFromHeaders(h: Headers): string {
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown"
  );
}
