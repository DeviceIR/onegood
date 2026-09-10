"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/server/db/prisma";
import { requireAdminMutation } from "@/server/auth/guards";
import { writeAudit } from "@/server/audit";
import { slugifyFa } from "@/lib/slug";
import { CAMPAIGNS_TAG, campaignTag } from "@/server/campaigns/queries";
import { parseTomanInput } from "@/lib/money";
import { isCampaignStatus } from "@/lib/campaign-status";

function bustCampaignCache(slug?: string | null) {
  try {
    revalidateTag(CAMPAIGNS_TAG);
    if (slug) revalidateTag(campaignTag(slug));
    revalidatePath("/");
    revalidatePath("/campaigns");
    if (slug) revalidatePath(`/campaigns/${slug}`);
    revalidatePath("/admin/campaigns");
  } catch {
    /* ignore cache errors — DB write already succeeded */
  }
}

async function safeAudit(...args: Parameters<typeof writeAudit>) {
  try {
    await writeAudit(...args);
  } catch (e) {
    console.error("audit write failed", e);
  }
}

export async function createCampaignAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const titleFa = String(formData.get("titleFa") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? titleFa).trim();
  const slug = slugifyFa(rawSlug) || `campaign-${Date.now()}`;
  const summaryFa = String(formData.get("summaryFa") ?? "").trim();
  const storyFa = String(formData.get("storyFa") ?? "").trim();
  const target = parseTomanInput(String(formData.get("targetAmountToman") ?? "0"));
  if (!titleFa || !summaryFa || !storyFa || !target || target <= 0n) {
    throw new Error("داده‌های کمپین نامعتبر است");
  }

  const campaign = await prisma.campaign.create({
    data: {
      titleFa,
      slug,
      summaryFa,
      storyFa,
      targetAmountToman: target,
      status: "DRAFT",
    },
  });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.create",
    entityType: "Campaign",
    entityId: campaign.id,
    afterJson: { slug },
  });
  bustCampaignCache(slug);
  redirect(`/admin/campaigns/${campaign.id}?ok=created`);
}

export async function updateCampaignAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const id = String(formData.get("id"));
  const before = await prisma.campaign.findUnique({ where: { id } });
  if (!before) throw new Error("کمپین پیدا نشد");

  const titleFa = String(formData.get("titleFa") ?? "").trim();
  const summaryFa = String(formData.get("summaryFa") ?? "").trim();
  const storyFa = String(formData.get("storyFa") ?? "").trim();
  const target = parseTomanInput(String(formData.get("targetAmountToman") ?? "0"));
  const deadlineRaw = String(formData.get("deadline") ?? "").trim();
  const isFeatured = String(formData.get("isFeatured") ?? "") === "on";
  const sortOrder = Number(formData.get("sortOrder") ?? before.sortOrder) || 0;
  const seoTitle = String(formData.get("seoTitle") ?? "").trim() || null;
  const seoDescription = String(formData.get("seoDescription") ?? "").trim() || null;

  if (!titleFa || !summaryFa || !storyFa || !target || target <= 0n) {
    throw new Error("داده‌های کمپین نامعتبر است");
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      titleFa,
      summaryFa,
      storyFa,
      targetAmountToman: target,
      deadline: deadlineRaw ? new Date(deadlineRaw) : null,
      isFeatured,
      sortOrder,
      seoTitle,
      seoDescription,
    },
  });

  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.update",
    entityType: "Campaign",
    entityId: id,
  });
  bustCampaignCache(before.slug);
  revalidatePath(`/admin/campaigns/${id}`);
  redirect(`/admin/campaigns/${id}?ok=saved`);
}

export async function setCampaignStatusAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const id = String(formData.get("id") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "").trim();
  if (!id || !isCampaignStatus(statusRaw)) {
    throw new Error("وضعیت نامعتبر است");
  }
  const status = statusRaw;
  const before = await prisma.campaign.findUnique({ where: { id } });
  if (!before) throw new Error("کمپین پیدا نشد");

  const data: {
    status: typeof status;
    publishedAt?: Date | null;
    completedAt?: Date | null;
  } = { status };

  if (status === "PUBLISHED") data.publishedAt = before.publishedAt ?? new Date();
  if (status === "COMPLETED") data.completedAt = new Date();

  await prisma.campaign.update({ where: { id }, data });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.status",
    entityType: "Campaign",
    entityId: id,
    beforeJson: { status: before.status },
    afterJson: { status },
  });
  bustCampaignCache(before.slug);
  revalidatePath(`/admin/campaigns/${id}`);

  const returnTo = String(formData.get("returnTo") ?? "").trim();
  if (returnTo === "list") {
    redirect("/admin/campaigns?ok=status");
  }
  redirect(`/admin/campaigns/${id}?ok=status`);
}

export async function addCampaignNeedAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const campaignId = String(formData.get("campaignId"));
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("کمپین پیدا نشد");

  const titleFa = String(formData.get("titleFa") ?? "").trim();
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1) || 1);
  const unitRaw = String(formData.get("unitPriceEstimateToman") ?? "").trim();
  const unitPrice = unitRaw ? parseTomanInput(unitRaw) : null;
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!titleFa) throw new Error("عنوان قلم لازم است");

  await prisma.campaignNeedItem.create({
    data: {
      campaignId,
      titleFa,
      quantity,
      unitPriceEstimateToman: unitPrice,
      note,
    },
  });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.need.add",
    entityType: "Campaign",
    entityId: campaignId,
  });
  bustCampaignCache(campaign.slug);
  revalidatePath(`/admin/campaigns/${campaignId}`);
  redirect(`/admin/campaigns/${campaignId}?ok=need`);
}

export async function deleteCampaignNeedAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const needId = String(formData.get("needId"));
  const need = await prisma.campaignNeedItem.findUnique({ where: { id: needId } });
  if (!need) throw new Error("قلم پیدا نشد");
  const campaign = await prisma.campaign.findUnique({ where: { id: need.campaignId } });
  await prisma.campaignNeedItem.delete({ where: { id: needId } });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.need.delete",
    entityType: "CampaignNeedItem",
    entityId: needId,
  });
  bustCampaignCache(campaign?.slug);
  revalidatePath(`/admin/campaigns/${need.campaignId}`);
  redirect(`/admin/campaigns/${need.campaignId}?ok=need-deleted`);
}

export async function addCampaignUpdateAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const campaignId = String(formData.get("campaignId"));
  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) throw new Error("کمپین پیدا نشد");

  const titleFa = String(formData.get("titleFa") ?? "").trim();
  const bodyFa = String(formData.get("bodyFa") ?? "").trim();
  const publishNow = String(formData.get("publishNow") ?? "") === "on";

  if (!titleFa || !bodyFa) throw new Error("عنوان و متن به‌روزرسانی لازم است");

  await prisma.campaignUpdate.create({
    data: {
      campaignId,
      titleFa,
      bodyFa,
      status: publishNow ? "PUBLISHED" : "DRAFT",
      publishedAt: publishNow ? new Date() : null,
      createdById: admin.id,
    },
  });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.update.add",
    entityType: "Campaign",
    entityId: campaignId,
  });
  bustCampaignCache(campaign.slug);
  revalidatePath(`/admin/campaigns/${campaignId}`);
  redirect(`/admin/campaigns/${campaignId}?ok=update`);
}

export async function publishCampaignUpdateAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const updateId = String(formData.get("updateId"));
  const row = await prisma.campaignUpdate.findUnique({ where: { id: updateId } });
  if (!row) throw new Error("به‌روزرسانی پیدا نشد");
  const campaign = await prisma.campaign.findUnique({ where: { id: row.campaignId } });

  await prisma.campaignUpdate.update({
    where: { id: updateId },
    data: { status: "PUBLISHED", publishedAt: new Date() },
  });
  await safeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "campaign.update.publish",
    entityType: "CampaignUpdate",
    entityId: updateId,
  });
  bustCampaignCache(campaign?.slug);
  revalidatePath(`/admin/campaigns/${row.campaignId}`);
  redirect(`/admin/campaigns/${row.campaignId}?ok=update-published`);
}
