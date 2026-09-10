import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/server/db/prisma";

describe("ledger/audit table grants", () => {
  it("harden-grants.sql revokes UPDATE/DELETE on LedgerEntry and AuditLog", () => {
    const sql = readFileSync(
      path.join(process.cwd(), "docker", "harden-grants.sql"),
      "utf8",
    );
    expect(sql).toMatch(/REVOKE UPDATE, DELETE ON TABLE "LedgerEntry"/);
    expect(sql).toMatch(/REVOKE UPDATE, DELETE ON TABLE "AuditLog"/);
    expect(sql).toMatch(/GRANT SELECT, INSERT ON TABLE "LedgerEntry"/);
    expect(sql).toMatch(/GRANT SELECT, INSERT ON TABLE "AuditLog"/);
  });

  it("hafez_app role cannot UPDATE LedgerEntry after harden grants", async () => {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'hafez_app') THEN
          CREATE ROLE hafez_app LOGIN PASSWORD 'hafez_app';
        END IF;
      END
      $$;
    `);
    const dbName = new URL(process.env.DATABASE_URL!).pathname
      .replace(/^\//, "")
      .split("?")[0];
    await prisma.$executeRawUnsafe(
      `GRANT CONNECT ON DATABASE "${dbName}" TO hafez_app`,
    );
    await prisma.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO hafez_app`);
    await prisma.$executeRawUnsafe(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO hafez_app`,
    );
    await prisma.$executeRawUnsafe(
      `REVOKE UPDATE, DELETE ON TABLE "LedgerEntry" FROM hafez_app`,
    );
    await prisma.$executeRawUnsafe(
      `REVOKE UPDATE, DELETE ON TABLE "AuditLog" FROM hafez_app`,
    );
    await prisma.$executeRawUnsafe(
      `GRANT SELECT, INSERT ON TABLE "LedgerEntry" TO hafez_app`,
    );
    await prisma.$executeRawUnsafe(
      `GRANT SELECT, INSERT ON TABLE "AuditLog" TO hafez_app`,
    );

    const entry = await prisma.ledgerEntry.create({
      data: {
        type: "OTHER",
        direction: "IN",
        amountToman: 1000n,
        descriptionFa: "grants-test",
      },
    });

    const base = process.env.DATABASE_URL ?? "";
    const appUrl = base.replace(
      /\/\/([^:]+):([^@]+)@/,
      "//hafez_app:hafez_app@",
    );
    expect(appUrl).not.toBe(base);

    const app = new PrismaClient({ datasources: { db: { url: appUrl } } });
    try {
      await expect(
        app.ledgerEntry.update({
          where: { id: entry.id },
          data: { descriptionFa: "tampered" },
        }),
      ).rejects.toThrow();
    } finally {
      await app.$disconnect();
    }

    const untouched = await prisma.ledgerEntry.findUnique({
      where: { id: entry.id },
    });
    expect(untouched?.descriptionFa).toBe("grants-test");
  });
});
