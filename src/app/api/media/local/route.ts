import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getEnv } from "@/server/env";

export async function GET(req: NextRequest) {
  const env = getEnv();
  if (env.STORAGE_DRIVER !== "local") {
    return NextResponse.json({ error: "not local" }, { status: 404 });
  }
  const bucket = req.nextUrl.searchParams.get("bucket");
  const key = req.nextUrl.searchParams.get("key");
  if (!bucket || !key) return NextResponse.json({ error: "bad" }, { status: 400 });
  const file = path.join(process.cwd(), "storage", bucket, key.replace(/\//g, "_"));
  try {
    const buf = await readFile(file);
    return new NextResponse(buf, {
      headers: { "content-type": "application/octet-stream", "cache-control": "public, max-age=3600" },
    });
  } catch {
    return NextResponse.json({ error: "missing" }, { status: 404 });
  }
}
