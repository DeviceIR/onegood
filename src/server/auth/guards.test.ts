import { describe, expect, it } from "vitest";
import {
  canManageAdmins,
  canPublishLedger,
  roleHasMin,
  roleRank,
} from "./roles";

describe("admin role guards", () => {
  it("ranks OWNER above ADMIN above CAMPAIGN_MANAGER above VIEWER", () => {
    expect(roleRank.OWNER).toBeGreaterThan(roleRank.ADMIN);
    expect(roleRank.ADMIN).toBeGreaterThan(roleRank.CAMPAIGN_MANAGER);
    expect(roleRank.CAMPAIGN_MANAGER).toBeGreaterThan(roleRank.VIEWER);
  });

  it("blocks CAMPAIGN_MANAGER from ledger publication", () => {
    expect(canPublishLedger("CAMPAIGN_MANAGER")).toBe(false);
    expect(canPublishLedger("VIEWER")).toBe(false);
    expect(canPublishLedger("ADMIN")).toBe(true);
    expect(canPublishLedger("OWNER")).toBe(true);
  });

  it("requires ADMIN+ for ledger publish min role checks", () => {
    expect(roleHasMin("CAMPAIGN_MANAGER", "ADMIN")).toBe(false);
    expect(roleHasMin("ADMIN", "ADMIN")).toBe(true);
  });

  it("restricts admin user management to OWNER", () => {
    expect(canManageAdmins("OWNER")).toBe(true);
    expect(canManageAdmins("ADMIN")).toBe(false);
    expect(canManageAdmins("CAMPAIGN_MANAGER")).toBe(false);
  });
});
