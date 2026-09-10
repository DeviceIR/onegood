import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createDonationIntent } from "@/server/payments/donation-service";
import { hashIpSha256 } from "@/server/security/hash";
import { getEnv } from "@/server/env";
import {
  clientIpFromHeaders,
  enforceRateLimit,
} from "@/server/security/http";

const bodySchema = z.object({
  campaignId: z.string().min(1),
  amountToman: z.string().regex(/^\d+$/),
  donorDisplayName: z.string().max(80).optional(),
  message: z.string().max(500).optional(),
  showName: z.boolean().default(false),
  showAmount: z.boolean().default(false),
  idempotencyKey: z.string().min(8).max(64),
});

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = await enforceRateLimit(`donate:${ip}`, 20, 60_000);
  if (limited) return limited;

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "داده نامعتبر" }, { status: 400 });
  }

  try {
    getEnv();
  } catch {
    return NextResponse.json({ error: "پیکربندی سرور ناقص است." }, { status: 500 });
  }

  const amountToman = BigInt(parsed.data.amountToman);
  if (amountToman < 10000n) {
    return NextResponse.json({ error: "حداقل مبلغ ۱۰٬۰۰۰ تومان" }, { status: 400 });
  }

  const base = getEnv().AUTH_URL.replace(/\/$/, "");
  const callbackUrl = `${base}/donation/callback`;

  try {
    const result = await createDonationIntent({
      campaignId: parsed.data.campaignId,
      amountToman,
      donorDisplayName: parsed.data.donorDisplayName,
      message: parsed.data.message,
      showName: parsed.data.showName,
      showAmount: parsed.data.showAmount,
      idempotencyKey: parsed.data.idempotencyKey,
      callbackUrl,
      clientIpHash: hashIpSha256(ip),
    });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطا";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
