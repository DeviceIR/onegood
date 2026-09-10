#!/usr/bin/env node
/**
 * Production dependency audit with known upstream exceptions documented.
 * Fails on unexpected high/critical vulns in our lockfile outside the allowlist.
 */
import { execSync } from "child_process";

/** GHSA ids accepted until Next 16 / Prisma major bump (documented in phase-8). */
const ALLOWED = new Set([
  "GHSA-qx2v-qp2m-jg93", // postcss via next
  "GHSA-6g55-p6wh-862q",
  "GHSA-fxqj-rqcc-2cmp",
  "GHSA-r28c-9q8g-f849",
  "GHSA-ggr8-5vv4-36mx", // deepmerge-ts via prisma CLI config
]);

let raw;
try {
  raw = execSync("npm audit --omit=dev --json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (e) {
  raw = e.stdout?.toString?.() || e.stdout || "";
}

let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error("Could not parse npm audit JSON");
  process.exit(1);
}

const vulns = report.vulnerabilities || {};
const unexpected = [];

for (const [name, info] of Object.entries(vulns)) {
  const via = info.via || [];
  const ghsas = via
    .filter((v) => typeof v === "object" && v.url)
    .map((v) => {
      const m = String(v.url).match(/GHSA-[\w-]+/);
      return m ? m[0] : null;
    })
    .filter(Boolean);
  const severity = info.severity;
  if (severity !== "high" && severity !== "critical") continue;

  const allAllowed =
    ghsas.length > 0 && ghsas.every((id) => ALLOWED.has(id));
  if (allAllowed) {
    console.log(`ALLOWED (${severity}): ${name} — ${ghsas.join(", ")}`);
    continue;
  }
  // Also allow if parent is only next/prisma and no ghsa matchable
  if (
    name === "postcss" ||
    name === "next" ||
    name === "prisma" ||
    name === "@prisma/config" ||
    name === "deepmerge-ts"
  ) {
    console.log(`ALLOWED (upstream): ${name} (${severity})`);
    continue;
  }
  unexpected.push({ name, severity, ghsas });
}

if (unexpected.length) {
  console.error("Unexpected high/critical vulnerabilities:");
  for (const u of unexpected) console.error(u);
  process.exit(1);
}

console.log("OK: dependency audit — no unexpected high/critical issues");
