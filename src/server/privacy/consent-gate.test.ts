import { describe, expect, it } from "vitest";
import { assertCanPublishMedia, consentCovers } from "./consent-gate";
import type { Consent } from "@prisma/client";

function consent(partial: Partial<Consent> & Pick<Consent, "scopes">): Consent {
  return {
    id: "c1",
    subjectType: "BENEFICIARY",
    subjectRef: "S-001",
    beneficiaryId: null,
    grantedAt: new Date(),
    expiresAt: null,
    revokedAt: null,
    evidenceMediaId: null,
    note: null,
    createdAt: new Date(),
    ...partial,
  };
}

/** Mirrors setMediaVisibility / upload publish path. */
function tryPublishMinorMedia(opts: {
  visibility: "PUBLIC" | "INTERNAL";
  depictsBeneficiary: boolean;
  consent: Consent | null;
  kind: "IMAGE" | "VIDEO";
}) {
  assertCanPublishMedia({
    media: {
      visibility: opts.visibility,
      consentId: opts.consent?.id ?? null,
      depictsBeneficiary: opts.depictsBeneficiary,
    },
    consent: opts.consent,
    depictsBeneficiary: opts.depictsBeneficiary,
    kind: opts.kind,
  });
}

describe("consent gate", () => {
  it("blocks public beneficiary image without photo consent (UI + direct action)", () => {
    expect(() =>
      tryPublishMinorMedia({
        visibility: "PUBLIC",
        depictsBeneficiary: true,
        consent: null,
        kind: "IMAGE",
      }),
    ).toThrow("CONSENT_REQUIRED");

    expect(() =>
      tryPublishMinorMedia({
        visibility: "PUBLIC",
        depictsBeneficiary: true,
        consent: consent({ scopes: ["STORY"] }),
        kind: "IMAGE",
      }),
    ).toThrow("CONSENT_REQUIRED");
  });

  it("blocks public beneficiary video without VIDEO scope", () => {
    expect(() =>
      tryPublishMinorMedia({
        visibility: "PUBLIC",
        depictsBeneficiary: true,
        consent: consent({ scopes: ["PHOTO"] }),
        kind: "VIDEO",
      }),
    ).toThrow("CONSENT_REQUIRED");
  });

  it("allows publish with matching consent", () => {
    expect(() =>
      tryPublishMinorMedia({
        visibility: "PUBLIC",
        depictsBeneficiary: true,
        consent: consent({ scopes: ["PHOTO"] }),
        kind: "IMAGE",
      }),
    ).not.toThrow();
  });

  it("allows internal upload without consent", () => {
    expect(() =>
      tryPublishMinorMedia({
        visibility: "INTERNAL",
        depictsBeneficiary: true,
        consent: null,
        kind: "IMAGE",
      }),
    ).not.toThrow();
  });

  it("detects revoked consent", () => {
    expect(
      consentCovers(consent({ scopes: ["PHOTO"], revokedAt: new Date() }), ["PHOTO"]),
    ).toBe(false);
  });
});
