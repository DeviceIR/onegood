import type { AdminRole } from "@prisma/client";

export const roleRank: Record<AdminRole, number> = {
  VIEWER: 1,
  CAMPAIGN_MANAGER: 2,
  ADMIN: 3,
  OWNER: 4,
};

export function roleHasMin(role: AdminRole, minRole: AdminRole): boolean {
  return (roleRank[role] ?? 0) >= roleRank[minRole];
}

export function canPublishLedger(role: AdminRole) {
  return roleHasMin(role, "ADMIN");
}

export function canManagePayments(role: AdminRole) {
  return roleHasMin(role, "ADMIN");
}

export function canManageAdmins(role: AdminRole) {
  return roleHasMin(role, "OWNER");
}
