"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { prisma } from "@/server/db/prisma";
import {
  requireAdminMutation,
  canPublishLedger,
} from "@/server/auth/guards";
import { writeAudit } from "@/server/audit";
import { postLedgerEntry, TRANSPARENCY_TAG } from "@/server/ledger";
import { processAndStoreImage } from "@/server/storage/image-pipeline";

function bustTransparency(campaignId?: string | null) {
  try {
    revalidateTag(TRANSPARENCY_TAG);
    revalidatePath("/transparency");
    if (campaignId) {
      // slug looked up below when needed
    }
  } catch {
    /* ignore */
  }
}

async function bustTransparencyForCampaign(campaignId?: string | null) {
  bustTransparency();
  if (!campaignId) return;
  try {
    const c = await prisma.campaign.findUnique({
      where: { id: campaignId },
      select: { slug: true },
    });
    if (c) {
      revalidateTag(`transparency:${c.slug}`);
      revalidatePath(`/transparency/${c.slug}`);
    }
  } catch {
    /* ignore */
  }
}

export async function publishExpenseAction(formData: FormData) {
  const admin = await requireAdminMutation("ADMIN");
  if (!canPublishLedger(admin.role)) throw new Error("FORBIDDEN");
  const id = String(formData.get("id"));
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new Error("not found");
  if (expense.status === "PUBLISHED") throw new Error("ALREADY_PUBLISHED");

  await prisma.$transaction(async (tx) => {
    await tx.expense.update({ where: { id }, data: { status: "PUBLISHED" } });
    await postLedgerEntry(
      {
        campaignId: expense.campaignId,
        type: "EXPENSE",
        direction: "OUT",
        amountToman: expense.amountToman,
        descriptionFa: expense.descriptionFa,
        expenseId: expense.id,
        createdByAdminId: admin.id,
        occurredAt: expense.occurredAt,
      },
      tx,
    );
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "expense.publish",
    entityType: "Expense",
    entityId: id,
  });
  revalidatePath("/admin/expenses");
  await bustTransparencyForCampaign(expense.campaignId);
}

export async function createExpenseAction(formData: FormData) {
  const admin = await requireAdminMutation("ADMIN");
  const amountRaw = String(formData.get("amountToman") || "0").replace(/,/g, "");
  const amountToman = BigInt(amountRaw || "0");
  if (amountToman <= 0n) throw new Error("INVALID_AMOUNT");

  const expense = await prisma.expense.create({
    data: {
      campaignId: String(formData.get("campaignId") || "") || null,
      category: String(formData.get("category") || "OTHER") as "OTHER",
      amountToman,
      vendor: String(formData.get("vendor") || "") || null,
      occurredAt: new Date(String(formData.get("occurredAt") || Date.now())),
      descriptionFa: String(formData.get("descriptionFa") || ""),
      status: "DRAFT",
      createdByAdminId: admin.id,
    },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "expense.create",
    entityType: "Expense",
    entityId: expense.id,
    afterJson: { amountToman: expense.amountToman.toString() },
  });
  revalidatePath("/admin/expenses");
}

export async function attachReceiptAction(formData: FormData) {
  const admin = await requireAdminMutation("ADMIN");
  const expenseId = String(formData.get("expenseId") ?? "");
  const note = String(formData.get("note") ?? "").trim() || null;
  const file = formData.get("file");
  if (!expenseId || !(file instanceof File)) throw new Error("INVALID");

  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) throw new Error("not found");

  const buffer = Buffer.from(await file.arrayBuffer());
  const visibility = expense.status === "PUBLISHED" ? "PUBLIC" : "INTERNAL";
  const processed = await processAndStoreImage({
    buffer,
    mimeType: file.type,
    altTextFa: note ?? `رسید ${expense.descriptionFa}`,
    visibility,
  });

  const media = await prisma.media.create({
    data: {
      kind: "IMAGE",
      bucket: processed.bucket,
      storageKey: processed.storageKey,
      mimeType: processed.mimeType,
      sizeBytes: processed.sizeBytes,
      width: processed.width,
      height: processed.height,
      blurDataUrl: processed.blurDataUrl,
      altTextFa: note ?? `رسید ${expense.descriptionFa}`,
      checksum: processed.checksum,
      visibility,
      campaignId: expense.campaignId,
      uploadedByAdminId: admin.id,
      variants: {
        create: processed.variants.map((v) => ({
          width: v.width,
          format: v.format,
          storageKey: v.storageKey,
        })),
      },
    },
  });

  const receipt = await prisma.receipt.create({
    data: {
      expenseId,
      mediaId: media.id,
      note,
    },
  });

  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "receipt.attach",
    entityType: "Receipt",
    entityId: receipt.id,
    afterJson: { expenseId },
  });

  revalidatePath("/admin/expenses");
  if (expense.status === "PUBLISHED") {
    await bustTransparencyForCampaign(expense.campaignId);
  }
}

export async function reverseLedgerAction(formData: FormData) {
  const admin = await requireAdminMutation("ADMIN");
  if (!canPublishLedger(admin.role)) throw new Error("FORBIDDEN");
  const entryId = String(formData.get("entryId"));
  const reason = String(formData.get("reason") || "اصلاح");
  const { reverseLedgerEntry } = await import("@/server/ledger");
  const original = await prisma.ledgerEntry.findUnique({ where: { id: entryId } });
  const reversal = await reverseLedgerEntry(entryId, admin.id, reason);
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "ledger.reverse",
    entityType: "LedgerEntry",
    entityId: entryId,
    afterJson: { reason, reversalId: reversal.id },
  });
  revalidatePath("/admin/ledger");
  await bustTransparencyForCampaign(original?.campaignId);
}

// Media upload lives in @/features/media/media-actions (Phase 7)
