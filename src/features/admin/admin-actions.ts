"use server";

import * as argon2 from "argon2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { AdminRole } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import {
  requireAdminMutation,
} from "@/server/auth/guards";
import { canManageAdmins } from "@/server/auth/roles";
import { writeAudit } from "@/server/audit";
import { generateTotpSecret, verifyTotp } from "@/server/auth/totp";
import {
  decryptTotpSecret,
  encryptTotpSecret,
} from "@/server/auth/totp-crypto";

const MANAGEABLE_ROLES: AdminRole[] = [
  "VIEWER",
  "CAMPAIGN_MANAGER",
  "ADMIN",
  "OWNER",
];

function isAdminRole(v: string): v is AdminRole {
  return (MANAGEABLE_ROLES as string[]).includes(v);
}

export async function beginEnableTotpAction() {
  const admin = await requireAdminMutation("OWNER");
  if (admin.role !== "OWNER") throw new Error("FORBIDDEN");

  const me = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!me) throw new Error("UNAUTHORIZED");
  if (me.totpEnabled) {
    redirect("/admin/settings?err=totp-already");
  }

  const secret = generateTotpSecret();
  const enc = encryptTotpSecret(secret, process.env.AUTH_SECRET ?? "");
  await prisma.admin.update({
    where: { id: admin.id },
    data: { totpSecretEnc: enc, totpEnabled: false },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "admin.totp.begin",
    entityType: "Admin",
    entityId: admin.id,
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?totpSetup=1");
}

export async function confirmEnableTotpAction(formData: FormData) {
  const admin = await requireAdminMutation("OWNER");
  if (admin.role !== "OWNER") throw new Error("FORBIDDEN");
  const code = String(formData.get("totp") ?? "").trim();
  const me = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!me?.totpSecretEnc) {
    redirect("/admin/settings?err=totp-missing");
  }
  const secret = decryptTotpSecret(me.totpSecretEnc, process.env.AUTH_SECRET ?? "");
  if (!verifyTotp(secret, code)) {
    redirect("/admin/settings?err=totp-invalid");
  }
  await prisma.admin.update({
    where: { id: admin.id },
    data: { totpEnabled: true },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "admin.totp.enable",
    entityType: "Admin",
    entityId: admin.id,
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=totp-on");
}

export async function disableTotpAction(formData: FormData) {
  const admin = await requireAdminMutation("OWNER");
  if (admin.role !== "OWNER") throw new Error("FORBIDDEN");
  const password = String(formData.get("password") ?? "");
  const code = String(formData.get("totp") ?? "").trim();
  const me = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!me) throw new Error("UNAUTHORIZED");
  const ok = await argon2.verify(me.passwordHash, password);
  if (!ok) redirect("/admin/settings?err=password");
  if (me.totpEnabled && me.totpSecretEnc) {
    const secret = decryptTotpSecret(me.totpSecretEnc, process.env.AUTH_SECRET ?? "");
    if (!verifyTotp(secret, code)) redirect("/admin/settings?err=totp-invalid");
  }
  await prisma.admin.update({
    where: { id: admin.id },
    data: { totpEnabled: false, totpSecretEnc: null },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "admin.totp.disable",
    entityType: "Admin",
    entityId: admin.id,
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=totp-off");
}

export async function createAdminAction(formData: FormData) {
  const actor = await requireAdminMutation("OWNER");
  if (!canManageAdmins(actor.role)) throw new Error("FORBIDDEN");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roleRaw = String(formData.get("role") ?? "VIEWER");
  if (!email || !name || password.length < 10 || !isAdminRole(roleRaw)) {
    redirect("/admin/settings?err=admin-invalid");
  }
  if (roleRaw === "OWNER" && actor.role !== "OWNER") {
    throw new Error("FORBIDDEN");
  }

  const passwordHash = await argon2.hash(password);
  const created = await prisma.admin.create({
    data: { email, name, passwordHash, role: roleRaw },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: actor.id,
    action: "admin.create",
    entityType: "Admin",
    entityId: created.id,
    afterJson: { email, role: roleRaw },
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=admin-created");
}

export async function setAdminActiveAction(formData: FormData) {
  const actor = await requireAdminMutation("OWNER");
  if (!canManageAdmins(actor.role)) throw new Error("FORBIDDEN");
  const id = String(formData.get("id") ?? "");
  const isActive = String(formData.get("isActive") ?? "") === "true";
  if (!id || id === actor.id) redirect("/admin/settings?err=self");

  const before = await prisma.admin.findUnique({ where: { id } });
  if (!before) redirect("/admin/settings?err=missing");
  await prisma.admin.update({ where: { id }, data: { isActive } });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: actor.id,
    action: isActive ? "admin.activate" : "admin.deactivate",
    entityType: "Admin",
    entityId: id,
    beforeJson: { isActive: before.isActive },
    afterJson: { isActive },
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=admin-updated");
}

export async function setAdminRoleAction(formData: FormData) {
  const actor = await requireAdminMutation("OWNER");
  if (!canManageAdmins(actor.role)) throw new Error("FORBIDDEN");
  const id = String(formData.get("id") ?? "");
  const roleRaw = String(formData.get("role") ?? "");
  if (!id || !isAdminRole(roleRaw) || id === actor.id) {
    redirect("/admin/settings?err=role");
  }
  const before = await prisma.admin.findUnique({ where: { id } });
  if (!before) redirect("/admin/settings?err=missing");
  await prisma.admin.update({ where: { id }, data: { role: roleRaw } });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: actor.id,
    action: "admin.role",
    entityType: "Admin",
    entityId: id,
    beforeJson: { role: before.role },
    afterJson: { role: roleRaw },
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=admin-updated");
}

export async function changeOwnPasswordAction(formData: FormData) {
  const admin = await requireAdminMutation("VIEWER");
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  if (next.length < 10) redirect("/admin/settings?err=password-short");
  const me = await prisma.admin.findUnique({ where: { id: admin.id } });
  if (!me) throw new Error("UNAUTHORIZED");
  const ok = await argon2.verify(me.passwordHash, current);
  if (!ok) redirect("/admin/settings?err=password");
  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await argon2.hash(next) },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "admin.password",
    entityType: "Admin",
    entityId: admin.id,
  });
  revalidatePath("/admin/settings");
  redirect("/admin/settings?ok=password");
}
