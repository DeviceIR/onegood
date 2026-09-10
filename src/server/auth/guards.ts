import { auth } from "./auth";
import type { AdminRole } from "@prisma/client";
import { assertSameOrigin } from "./origin";
import {
  canManageAdmins,
  canManagePayments,
  canPublishLedger,
  roleHasMin,
  roleRank,
} from "./roles";

export {
  canManageAdmins,
  canManagePayments,
  canPublishLedger,
  roleHasMin,
  roleRank,
};

export async function requireAdmin(minRole: AdminRole = "VIEWER") {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  const role = session.user.role ?? "VIEWER";
  if (!roleHasMin(role, minRole)) {
    throw new Error("FORBIDDEN");
  }
  return { ...session.user, role };
}

/** Auth + same-origin for mutating server actions. */
export async function requireAdminMutation(minRole: AdminRole = "VIEWER") {
  await assertSameOrigin();
  return requireAdmin(minRole);
}
