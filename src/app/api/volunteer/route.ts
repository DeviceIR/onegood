import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import {
  clientIpFromHeaders,
  enforceRateLimit,
} from "@/server/security/http";

const schema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().min(8).max(20),
  email: z.string().email().optional().or(z.literal("")),
  message: z.string().min(5).max(2000),
});

export async function POST(req: NextRequest) {
  const ip = clientIpFromHeaders(req.headers);
  const limited = await enforceRateLimit(`volunteer:${ip}`, 8, 60_000);
  if (limited) return limited;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  await prisma.volunteerApplication.create({
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      message: parsed.data.message,
    },
  });
  return NextResponse.json({ ok: true });
}
