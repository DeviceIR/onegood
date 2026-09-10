#!/usr/bin/env node
/**
 * Backup + restore drill for HAFEZ Postgres.
 * Uses local pg_* tools, or falls back to `docker compose exec postgres`.
 */
import { execFileSync, execSync } from "child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

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

function which(bin) {
  try {
    const out = execFileSync(
      process.platform === "win32" ? "where" : "which",
      [bin],
      { encoding: "utf8" },
    );
    const line = out
      .split(/\r?\n/)
      .map((s) => s.trim())
      .find((s) => s && !s.toLowerCase().includes("info:"));
    return line || null;
  } catch {
    return null;
  }
}

function dockerAvailable() {
  try {
    execSync("docker compose ps", { cwd: root, stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync("docker-compose ps", { cwd: root, stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}

function dockerExec(args, opts = {}) {
  const base = ["compose", "exec", "-T", "postgres"];
  try {
    return execFileSync("docker", [...base, ...args], {
      cwd: root,
      encoding: "utf8",
      ...opts,
    });
  } catch (e) {
    // try docker-compose
    return execFileSync("docker-compose", ["exec", "-T", "postgres", ...args], {
      cwd: root,
      encoding: "utf8",
      ...opts,
    });
  }
}

function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const dumpDir = path.join(root, "backups");
  mkdirSync(dumpDir, { recursive: true });
  const stamp = new Date().toISOString().slice(0, 10);
  const dumpFile = path.join(dumpDir, `hafez-drill-${stamp}.dump`);
  const drillDb = "hafez_drill";

  const pgDump = which("pg_dump");
  const psql = which("psql");
  const pgRestore = which("pg_restore");
  const useDocker = !(pgDump && psql && pgRestore) && dockerAvailable();

  if (!pgDump && !useDocker) {
    console.error(
      "Need pg_dump/psql/pg_restore on PATH, or a running docker compose postgres service.",
    );
    process.exit(1);
  }

  if (useDocker) {
    console.log("Using docker compose postgres for restore drill");
    console.log("1) Dump");
    const dumpBuf = dockerExec(
      ["pg_dump", "-U", "hafez", "-Fc", "hafez"],
      { encoding: "buffer", maxBuffer: 64 * 1024 * 1024 },
    );
    writeFileSync(dumpFile, dumpBuf);

    console.log("2) Recreate drill DB");
    try {
      dockerExec(["psql", "-U", "hafez", "-d", "postgres", "-c", `DROP DATABASE IF EXISTS ${drillDb};`]);
    } catch {
      /* ignore */
    }
    dockerExec(["psql", "-U", "hafez", "-d", "postgres", "-c", `CREATE DATABASE ${drillDb};`]);

    console.log("3) Restore");
    // Copy dump into container via stdin
    execFileSync(
      "docker",
      ["compose", "exec", "-T", "postgres", "pg_restore", "-U", "hafez", "-d", drillDb, "--no-owner", "--no-acl"],
      { cwd: root, input: dumpBuf, stdio: ["pipe", "pipe", "pipe"] },
    );

    console.log("4) Compare counts");
    const countSql = `SELECT COUNT(*)::text FROM "LedgerEntry";`;
    const srcCount = dockerExec([
      "psql", "-U", "hafez", "-d", "hafez", "-t", "-A", "-c", countSql,
    ]).trim();
    const drillCount = dockerExec([
      "psql", "-U", "hafez", "-d", drillDb, "-t", "-A", "-c", countSql,
    ]).trim();
    console.log(`   source=${srcCount} drill=${drillCount}`);
    if (srcCount !== drillCount) {
      console.error("FAIL: ledger counts differ");
      process.exit(1);
    }

    const balSql = `SELECT COALESCE(SUM(CASE WHEN direction='IN' THEN "amountToman" ELSE -"amountToman" END),0)::text FROM "LedgerEntry";`;
    const srcBal = dockerExec([
      "psql", "-U", "hafez", "-d", "hafez", "-t", "-A", "-c", balSql,
    ]).trim();
    const drillBal = dockerExec([
      "psql", "-U", "hafez", "-d", drillDb, "-t", "-A", "-c", balSql,
    ]).trim();
    console.log(`   balance source=${srcBal} drill=${drillBal}`);
    if (srcBal !== drillBal) {
      console.error("FAIL: balances differ");
      process.exit(1);
    }

    console.log("5) Cleanup");
    dockerExec(["psql", "-U", "hafez", "-d", "postgres", "-c", `DROP DATABASE IF EXISTS ${drillDb};`]);
    console.log("OK: restore drill succeeded (docker)");
    return;
  }

  // Native client path
  const u = new URL(process.env.DATABASE_URL);
  const env = {
    PGPASSWORD: decodeURIComponent(u.password),
    PGHOST: u.hostname,
    PGPORT: u.port || "5432",
    PGUSER: decodeURIComponent(u.username),
  };
  const database = u.pathname.replace(/^\//, "").split("?")[0];

  console.log(`1) Dumping ${database}`);
  execFileSync(pgDump, ["-Fc", "-d", database, "-f", dumpFile], { env: { ...process.env, ...env } });

  console.log("2) Recreate drill DB");
  try {
    execFileSync(psql, ["-d", "postgres", "-c", `DROP DATABASE IF EXISTS ${drillDb};`], {
      env: { ...process.env, ...env },
    });
  } catch {
    /* ignore */
  }
  execFileSync(psql, ["-d", "postgres", "-c", `CREATE DATABASE ${drillDb};`], {
    env: { ...process.env, ...env },
  });

  console.log("3) Restore");
  try {
    execFileSync(pgRestore, ["-d", drillDb, "--no-owner", "--no-acl", dumpFile], {
      env: { ...process.env, ...env },
    });
  } catch (e) {
    console.warn(String(e.stderr || e.message || "").slice(0, 300));
  }

  const countSql = `SELECT COUNT(*)::text FROM "LedgerEntry";`;
  const srcCount = execFileSync(psql, ["-d", database, "-t", "-A", "-c", countSql], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  }).trim();
  const drillCount = execFileSync(psql, ["-d", drillDb, "-t", "-A", "-c", countSql], {
    env: { ...process.env, ...env },
    encoding: "utf8",
  }).trim();
  console.log(`   source=${srcCount} drill=${drillCount}`);
  if (srcCount !== drillCount) {
    console.error("FAIL: ledger counts differ");
    process.exit(1);
  }

  console.log("5) Cleanup");
  execFileSync(psql, ["-d", "postgres", "-c", `DROP DATABASE IF EXISTS ${drillDb};`], {
    env: { ...process.env, ...env },
  });
  console.log("OK: restore drill succeeded");
}

main();
