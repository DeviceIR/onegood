"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { AgeRange, ConsentScope, ConsentSubjectType } from "@prisma/client";
import { prisma } from "@/server/db/prisma";
import { requireAdminMutation } from "@/server/auth/guards";
import { writeAudit } from "@/server/audit";
import { assertCanPublishMedia } from "@/server/privacy/consent-gate";
import { processAndStoreImage } from "@/server/storage/image-pipeline";
import { processAndStoreVideo } from "@/server/storage/video-pipeline";

import { MEDIA_TAG } from "@/server/media/tags";

function bustMedia(campaignSlug?: string | null) {
  try {
    revalidateTag(MEDIA_TAG);
    revalidatePath("/impact");
    revalidatePath("/impact/videos");
    revalidatePath("/");
    revalidatePath("/admin/media");
    if (campaignSlug) revalidatePath(`/campaigns/${campaignSlug}`);
  } catch {
    /* ignore */
  }
}

async function loadConsent(id: string | null) {
  if (!id) return null;
  return prisma.consent.findUnique({ where: { id } });
}

export async function uploadMediaAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("FILE_REQUIRED");

  const kindRaw = String(formData.get("kind") || "IMAGE");
  const kind = kindRaw === "VIDEO" ? "VIDEO" : "IMAGE";
  const visibility = String(formData.get("visibility") || "INTERNAL") as
    | "PUBLIC"
    | "INTERNAL";
  const consentId = String(formData.get("consentId") || "") || null;
  const depictsBeneficiary =
    String(formData.get("depictsBeneficiary") || "") === "true";
  const campaignId = String(formData.get("campaignId") || "") || null;
  const altTextFa = String(formData.get("altTextFa") || "").trim() || null;

  const consent = await loadConsent(consentId);
  try {
    assertCanPublishMedia({
      media: { visibility, consentId, depictsBeneficiary },
      consent,
      depictsBeneficiary,
      kind,
    });
  } catch (e) {
    if (e instanceof Error && e.message === "CONSENT_REQUIRED") {
      redirect("/admin/media?err=consent");
    }
    throw e;
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (kind === "IMAGE") {
    const processed = await processAndStoreImage({
      buffer,
      mimeType: file.type,
      altTextFa: altTextFa ?? undefined,
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
        altTextFa,
        checksum: processed.checksum,
        visibility,
        depictsBeneficiary,
        consentId,
        campaignId,
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
    await writeAudit({
      actorType: "ADMIN",
      actorAdminId: admin.id,
      action: "media.upload",
      entityType: "Media",
      entityId: media.id,
      afterJson: { kind, visibility, depictsBeneficiary },
    });
  } else {
    const processed = await processAndStoreVideo({
      buffer,
      mimeType: file.type,
      visibility,
    });
    const media = await prisma.media.create({
      data: {
        kind: "VIDEO",
        bucket: processed.bucket,
        storageKey: processed.storageKey,
        mimeType: processed.mimeType,
        sizeBytes: processed.sizeBytes,
        altTextFa,
        checksum: processed.checksum,
        visibility,
        depictsBeneficiary,
        consentId,
        campaignId,
        uploadedByAdminId: admin.id,
      },
    });
    await writeAudit({
      actorType: "ADMIN",
      actorAdminId: admin.id,
      action: "media.upload",
      entityType: "Media",
      entityId: media.id,
      afterJson: { kind, visibility, depictsBeneficiary },
    });
  }

  bustMedia();
  redirect("/admin/media?ok=uploaded");
}

export async function setMediaVisibilityAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const id = String(formData.get("id") ?? "");
  const visibility = String(formData.get("visibility") || "") as
    | "PUBLIC"
    | "INTERNAL";
  if (!id || (visibility !== "PUBLIC" && visibility !== "INTERNAL")) {
    throw new Error("INVALID");
  }

  const media = await prisma.media.findUnique({
    where: { id },
    include: { consent: true },
  });
  if (!media) throw new Error("NOT_FOUND");

  try {
    assertCanPublishMedia({
      media: {
        visibility,
        consentId: media.consentId,
        depictsBeneficiary: media.depictsBeneficiary,
      },
      consent: media.consent,
      depictsBeneficiary: media.depictsBeneficiary,
      kind: media.kind === "VIDEO" ? "VIDEO" : "IMAGE",
    });
  } catch (e) {
    if (e instanceof Error && e.message === "CONSENT_REQUIRED") {
      redirect("/admin/media?err=consent");
    }
    throw e;
  }

  await prisma.media.update({ where: { id }, data: { visibility } });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "media.visibility",
    entityType: "Media",
    entityId: id,
    beforeJson: { visibility: media.visibility },
    afterJson: { visibility },
  });
  bustMedia();
  redirect("/admin/media?ok=visibility");
}

export async function createBeneficiaryAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const internalCode = String(formData.get("internalCode") ?? "").trim();
  const pseudonymFa = String(formData.get("pseudonymFa") ?? "").trim();
  const ageRange = String(formData.get("ageRange") || "") as AgeRange | "";
  const regionCoarse = String(formData.get("regionCoarse") ?? "").trim() || null;
  const gradeLevel = String(formData.get("gradeLevel") ?? "").trim() || null;
  const notesInternal = String(formData.get("notesInternal") ?? "").trim() || null;

  if (!internalCode || !pseudonymFa) {
    redirect("/admin/beneficiaries?err=invalid");
  }

  const b = await prisma.beneficiary.create({
    data: {
      internalCode,
      pseudonymFa,
      ageRange: ageRange || null,
      regionCoarse,
      gradeLevel,
      notesInternal,
    },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "beneficiary.create",
    entityType: "Beneficiary",
    entityId: b.id,
    afterJson: { internalCode, pseudonymFa },
  });
  revalidatePath("/admin/beneficiaries");
  redirect("/admin/beneficiaries?ok=created");
}

const ALL_SCOPES: ConsentScope[] = ["PHOTO", "VIDEO", "STORY", "NAME"];

export async function createConsentAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const subjectType = String(formData.get("subjectType") || "BENEFICIARY") as ConsentSubjectType;
  const subjectRef = String(formData.get("subjectRef") ?? "").trim();
  const beneficiaryId = String(formData.get("beneficiaryId") || "") || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const scopes = ALL_SCOPES.filter((s) => formData.get(`scope_${s}`) === "on");

  if (!subjectRef || scopes.length === 0) {
    redirect("/admin/consents?err=invalid");
  }

  const c = await prisma.consent.create({
    data: {
      subjectType,
      subjectRef,
      beneficiaryId,
      scopes,
      note,
    },
  });
  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "consent.create",
    entityType: "Consent",
    entityId: c.id,
    afterJson: { scopes, subjectRef },
  });
  revalidatePath("/admin/consents");
  redirect("/admin/consents?ok=created");
}

export async function revokeConsentAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("INVALID");

  await prisma.$transaction(async (tx) => {
    await tx.consent.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
    // Unpublish linked public media (privacy policy)
    await tx.media.updateMany({
      where: { consentId: id, visibility: "PUBLIC" },
      data: { visibility: "INTERNAL" },
    });
  });

  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "consent.revoke",
    entityType: "Consent",
    entityId: id,
  });
  bustMedia();
  revalidatePath("/admin/consents");
  redirect("/admin/consents?ok=revoked");
}

export async function createImpactRecordAction(formData: FormData) {
  const admin = await requireAdminMutation("CAMPAIGN_MANAGER");
  const campaignId = String(formData.get("campaignId") ?? "");
  const beneficiaryId = String(formData.get("beneficiaryId") || "") || null;
  const itemsSummaryFa = String(formData.get("itemsSummaryFa") ?? "").trim();
  const publicDescriptionFa = String(formData.get("publicDescriptionFa") ?? "").trim();
  const deliveredAt = new Date(String(formData.get("deliveredAt") || Date.now()));
  const mediaId = String(formData.get("mediaId") || "") || null;

  if (!campaignId || !itemsSummaryFa || !publicDescriptionFa) {
    redirect("/admin/media?err=impact");
  }

  if (mediaId) {
    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: { consent: true },
    });
    if (!media) throw new Error("MEDIA_NOT_FOUND");
    try {
      assertCanPublishMedia({
        media: {
          visibility: "PUBLIC",
          consentId: media.consentId,
          depictsBeneficiary: media.depictsBeneficiary,
        },
        consent: media.consent,
        depictsBeneficiary: media.depictsBeneficiary,
        kind: media.kind === "VIDEO" ? "VIDEO" : "IMAGE",
      });
    } catch (e) {
      if (e instanceof Error && e.message === "CONSENT_REQUIRED") {
        redirect("/admin/media?err=consent");
      }
      throw e;
    }
    if (media.visibility !== "PUBLIC") {
      await prisma.media.update({
        where: { id: media.id },
        data: { visibility: "PUBLIC" },
      });
    }
  }

  const record = await prisma.impactRecord.create({
    data: {
      campaignId,
      beneficiaryId,
      itemsSummaryFa,
      publicDescriptionFa,
      deliveredAt,
      media: mediaId
        ? { create: [{ mediaId }] }
        : undefined,
    },
  });

  await writeAudit({
    actorType: "ADMIN",
    actorAdminId: admin.id,
    action: "impact.create",
    entityType: "ImpactRecord",
    entityId: record.id,
  });
  bustMedia();
  redirect("/admin/media?ok=impact");
}
