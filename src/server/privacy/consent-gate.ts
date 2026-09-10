import type { Consent, ConsentScope, Media } from "@prisma/client";

export function isConsentActive(consent: Consent | null | undefined): boolean {
  if (!consent) return false;
  if (consent.revokedAt) return false;
  if (consent.expiresAt && consent.expiresAt.getTime() < Date.now()) return false;
  return true;
}

export function consentCovers(consent: Consent, required: ConsentScope[]): boolean {
  if (!isConsentActive(consent)) return false;
  return required.every((s) => consent.scopes.includes(s));
}

/**
 * Publishing media that depicts a beneficiary (esp. minors) requires active
 * PHOTO/VIDEO consent. INTERNAL visibility always allowed.
 */
export function assertCanPublishMedia(input: {
  media: Pick<Media, "visibility" | "consentId"> & {
    depictsBeneficiary?: boolean;
  };
  consent: Consent | null;
  depictsBeneficiary: boolean;
  kind: "IMAGE" | "VIDEO";
}) {
  if (input.media.visibility !== "PUBLIC") return;
  if (!input.depictsBeneficiary) return;
  const need: ConsentScope[] = input.kind === "VIDEO" ? ["VIDEO"] : ["PHOTO"];
  if (!input.consent || !consentCovers(input.consent, need)) {
    throw new Error("CONSENT_REQUIRED");
  }
}

export function requiredScopeForKind(kind: "IMAGE" | "VIDEO"): ConsentScope {
  return kind === "VIDEO" ? "VIDEO" : "PHOTO";
}
