#!/usr/bin/env node
/** Nightly-style custom-format dump. */
import { execFileSync } from "child_process";
import { existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const k = t.slice(0, i).trim();
    let v = t.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadDotEnv();

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL required");
  process.exit(1);
}
const u = new URL(url);
const dumpDir = path.join(root, "backups");
mkdirSync(dumpDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const out = path.join(dumpDir, `hafez-${stamp}.dump`);

execFileSync(
  "pg_dump",
  [
    "-Fc",
    "-h",
    u.hostname,
    "-p",
    u.port || "5432",
    "-U",
    decodeURIComponent(u.username),
    "-d",
    u.pathname.replace(/^\//, "").split("?")[0],
    "-f",
    out,
  ],
  {
    env: { ...process.env, PGPASSWORD: decodeURIComponent(u.password) },
    stdio: "inherit",
  },
);
console.log("Wrote", out);
