import { prisma } from "../db/prisma";
import { generateReferenceCode } from "@/lib/crypto-helpers";
import { getPaymentGateway } from "./index";
import type { PaymentStatus, Prisma } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { CAMPAIGNS_TAG, campaignTag } from "@/server/campaigns/queries";

function mockRedirect(callbackUrl: string, authority: string) {
  const join = callbackUrl.includes("?") ? "&" : "?";
  return `${callbackUrl}${join}Authority=${encodeURIComponent(authority)}&Status=OK`;
}

function zarinpalRedirect(authority: string, sandbox: boolean) {
  const host = sandbox ? "https://sandbox.zarinpal.com" : "https://www.zarinpal.com";
  return `${host}/pg/StartPay/${authority}`;
}

export async function createDonationIntent(input: {
  campaignId: string;
  amountToman: bigint;
  donorDisplayName?: string;
  message?: string;
  showName: boolean;
  showAmount: boolean;
  idempotencyKey: string;
  callbackUrl: string;
  clientIpHash?: string;
}) {
  if (input.amountToman <= 0n) {
    throw new Error("Amount must be positive");
  }

  const existing = await prisma.payment.findUnique({
    where: { idempotencyKey: input.idempotencyKey },
  });

  if (existing) {
    if (existing.status === "SUCCESS") {
      const donation = await prisma.donation.findUnique({
        where: { paymentId: existing.id },
      });
      return {
        paymentId: existing.id,
        redirectUrl: `/donation/success?ref=${encodeURIComponent(donation?.referenceCode ?? "")}`,
        authority: existing.gatewayAuthority ?? "",
        alreadyPaid: true as const,
      };
    }
    if (existing.status === "PENDING" && existing.gatewayAuthority) {
      const redirectUrl =
        existing.gateway === "MOCK"
          ? mockRedirect(input.callbackUrl, existing.gatewayAuthority)
          : zarinpalRedirect(
              existing.gatewayAuthority,
              process.env.ZARINPAL_SANDBOX !== "false",
            );
      return {
        paymentId: existing.id,
        redirectUrl,
        authority: existing.gatewayAuthority,
      };
    }
  }

  const campaign = await prisma.campaign.findFirst({
    where: { id: input.campaignId, status: { in: ["PUBLISHED", "COMPLETED"] } },
  });
  if (!campaign) throw new Error("Campaign not found");

  const gateway = getPaymentGateway();
  const envGateway = process.env.PAYMENT_GATEWAY === "zarinpal" ? "ZARINPAL" : "MOCK";

  const created = await gateway.createPayment({
    amountToman: input.amountToman,
    description: `کمک به کمپین ${campaign.titleFa}`,
    callbackUrl: input.callbackUrl,
  });

  let payment;
  try {
    payment = await prisma.payment.create({
      data: {
        campaignId: input.campaignId,
        gateway: envGateway,
        amountToman: input.amountToman,
        status: "PENDING",
        idempotencyKey: input.idempotencyKey,
        gatewayAuthority: created.authority,
        clientIpHash: input.clientIpHash,
      },
    });
  } catch (e) {
    // Race on idempotency key — return the winner
    const raced = await prisma.payment.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    });
    if (raced?.gatewayAuthority && raced.status === "PENDING") {
      return {
        paymentId: raced.id,
        redirectUrl:
          raced.gateway === "MOCK"
            ? mockRedirect(input.callbackUrl, raced.gatewayAuthority)
            : zarinpalRedirect(raced.gatewayAuthority, true),
        authority: raced.gatewayAuthority,
      };
    }
    throw e;
  }

  await prisma.siteSetting.upsert({
    where: { key: `payment_intent_${payment.id}` },
    create: {
      key: `payment_intent_${payment.id}`,
      valueJson: {
        donorDisplayName: input.donorDisplayName ?? null,
        message: input.message ?? null,
        showName: input.showName,
        showAmount: input.showAmount,
      },
    },
    update: {
      valueJson: {
        donorDisplayName: input.donorDisplayName ?? null,
        message: input.message ?? null,
        showName: input.showName,
        showAmount: input.showAmount,
      },
    },
  });

  return {
    paymentId: payment.id,
    redirectUrl: created.redirectUrl,
    authority: created.authority,
  };
}

export type VerifyResult =
  | {
      ok: true;
      already: boolean;
      referenceCode?: string;
      paymentId: string;
      campaignSlug?: string;
    }
  | {
      ok: false;
      reason: string;
      paymentId?: string;
    };

export async function verifyAndCommitPayment(
  authority: string,
  statusParam: string,
): Promise<VerifyResult> {
  await prisma.gatewayCallbackLog.create({
    data: {
      authority,
      statusParam,
      rawQuery: { Authority: authority, Status: statusParam },
    },
  });

  const payment = await prisma.payment.findUnique({
    where: { gatewayAuthority: authority },
    include: { campaign: { select: { slug: true } } },
  });
  if (!payment) {
    return { ok: false, reason: "payment_not_found" };
  }

  if (statusParam !== "OK") {
    if (payment.status === "PENDING") {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: "CANCELLED",
          failureMessage: "User cancelled or gateway NOK",
        },
      });
    }
    return { ok: false, reason: "cancelled", paymentId: payment.id };
  }

  const result = await prisma.$transaction(async (tx) => {
    // Row lock — prevents double commit under concurrent callbacks
    await tx.$executeRaw`SELECT id FROM "Payment" WHERE id = ${payment.id} FOR UPDATE`;

    const locked = await tx.payment.findUnique({ where: { id: payment.id } });
    if (!locked) return { ok: false as const, reason: "payment_not_found" };

    if (locked.status === "SUCCESS") {
      const donation = await tx.donation.findUnique({
        where: { paymentId: locked.id },
      });
      return {
        ok: true as const,
        already: true,
        referenceCode: donation?.referenceCode,
        paymentId: locked.id,
      };
    }

    if (locked.status !== "PENDING") {
      return {
        ok: false as const,
        reason: "invalid_status",
        paymentId: locked.id,
      };
    }

    // Amount ALWAYS from DB — never from callback/query string
    const gateway = getPaymentGateway();
    const verify = await gateway.verifyPayment({
      authority,
      amountToman: locked.amountToman,
    });

    await tx.gatewayCallbackLog.create({
      data: {
        paymentId: locked.id,
        authority,
        statusParam,
        verifyResponse: verify as unknown as Prisma.InputJsonValue,
      },
    });

    if (!verify.ok) {
      await tx.payment.update({
        where: { id: locked.id },
        data: {
          status: "FAILED" satisfies PaymentStatus,
          failureCode: verify.code,
          failureMessage: verify.message,
        },
      });
      return {
        ok: false as const,
        reason: "verify_failed",
        paymentId: locked.id,
      };
    }

    const intent = await tx.siteSetting.findUnique({
      where: { key: `payment_intent_${locked.id}` },
    });
    const prefs = (intent?.valueJson ?? {}) as {
      donorDisplayName?: string | null;
      message?: string | null;
      showName?: boolean;
      showAmount?: boolean;
    };

    const referenceCode = generateReferenceCode();
    const now = new Date();

    await tx.payment.update({
      where: { id: locked.id },
      data: {
        status: "SUCCESS",
        gatewayRefId: verify.refId || `ref-${locked.id}`,
        cardPanMasked: verify.cardPanMasked,
        cardHash: verify.cardHash,
        feeType: verify.feeType,
        feeToman: verify.feeToman,
        verifiedAt: now,
      },
    });

    const donation = await tx.donation.create({
      data: {
        paymentId: locked.id,
        campaignId: locked.campaignId,
        amountToman: locked.amountToman,
        donorDisplayName: prefs.donorDisplayName ?? null,
        message: prefs.message ?? null,
        showName: Boolean(prefs.showName),
        showAmount: Boolean(prefs.showAmount),
        publicStatus: "APPROVED",
        referenceCode,
        verifiedAt: now,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        campaignId: locked.campaignId,
        type: "DONATION",
        direction: "IN",
        amountToman: locked.amountToman,
        occurredAt: now,
        descriptionFa: `کمک مالی تأییدشده — ${referenceCode}`,
        donationId: donation.id,
      },
    });

    await tx.campaign.update({
      where: { id: locked.campaignId },
      data: {
        collectedAmountToman: { increment: locked.amountToman },
        donorCount: { increment: 1 },
        aggregatesUpdatedAt: now,
      },
    });

    return {
      ok: true as const,
      already: false,
      referenceCode,
      paymentId: locked.id,
      campaignSlug: payment.campaign.slug,
    };
  });

  if (result.ok && "campaignSlug" in result && result.campaignSlug) {
    try {
      revalidateTag(CAMPAIGNS_TAG);
      revalidateTag(campaignTag(result.campaignSlug));
      revalidatePath("/");
      revalidatePath("/campaigns");
      revalidatePath(`/campaigns/${result.campaignSlug}`);
      revalidatePath("/transparency");
      revalidateTag("transparency");
    } catch {
      /* revalidate may fail outside Next request context (tests) */
    }
  }

  return result;
}

export async function reconcilePendingPayments(maxAgeMinutes = 30) {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60_000);
  const pending = await prisma.payment.findMany({
    where: { status: "PENDING", requestedAt: { lt: cutoff } },
    take: 50,
  });

  const results = [];
  for (const p of pending) {
    if (!p.gatewayAuthority) {
      await prisma.payment.update({
        where: { id: p.id },
        data: { status: "EXPIRED" },
      });
      results.push({ id: p.id, action: "expired" });
      continue;
    }
    try {
      const r = await verifyAndCommitPayment(p.gatewayAuthority, "OK");
      if (!r.ok) {
        await prisma.payment.update({
          where: { id: p.id },
          data: { status: "EXPIRED" },
        });
        results.push({ id: p.id, action: "expired_after_verify" });
      } else {
        results.push({ id: p.id, action: "verified" });
      }
    } catch {
      results.push({ id: p.id, action: "error" });
    }
  }
  return results;
}
