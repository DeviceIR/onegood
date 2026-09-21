"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/server/db/prisma";
import { requireAdminMutation } from "@/server/auth/guards";

function bustInbox() {
  revalidatePath("/admin", "layout");
  revalidatePath("/admin/messages");
  revalidatePath("/admin/volunteers");
}

export async function setContactHandledAction(formData: FormData) {
  await requireAdminMutation("ADMIN");
  const id = String(formData.get("id") ?? "").trim();
  const handled = String(formData.get("handled") ?? "") === "1";
  if (!id) throw new Error("پیام پیدا نشد");
  await prisma.contactMessage.update({ where: { id }, data: { handled } });
  bustInbox();
}

export async function setVolunteerHandledAction(formData: FormData) {
  await requireAdminMutation("ADMIN");
  const id = String(formData.get("id") ?? "").trim();
  const handled = String(formData.get("handled") ?? "") === "1";
  if (!id) throw new Error("درخواست پیدا نشد");
  await prisma.volunteerApplication.update({ where: { id }, data: { handled } });
  bustInbox();
}
