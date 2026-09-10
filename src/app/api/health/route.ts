import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

/**
 * Liveness + shallow readiness for uptime monitors and load balancers.
 * Does not expose secrets or stack traces.
 */
export async function GET() {
  const started = Date.now();
  let db: "ok" | "error" = "ok";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    db = "error";
  }

  const body = {
    status: db === "ok" ? "ok" : "degraded",
    service: "one-good",
    db,
    uptimeSec: Math.floor(process.uptime()),
    ms: Date.now() - started,
    time: new Date().toISOString(),
  };

  return NextResponse.json(body, {
    status: db === "ok" ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
