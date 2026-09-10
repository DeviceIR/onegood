import { describe, expect, it } from "vitest";
import { decryptTotpSecret, encryptTotpSecret } from "./totp-crypto";
import { generateTotpSecret, verifyTotp } from "./totp";
import * as OTPAuth from "otpauth";

describe("totp crypto", () => {
  it("round-trips encrypted secrets", () => {
    const secret = generateTotpSecret();
    const authSecret = "x".repeat(32);
    const enc = encryptTotpSecret(secret, authSecret);
    expect(enc.startsWith("v1:")).toBe(true);
    expect(decryptTotpSecret(enc, authSecret)).toBe(secret);
  });

  it("accepts legacy plaintext base32", () => {
    const secret = generateTotpSecret();
    expect(decryptTotpSecret(secret, "x".repeat(32))).toBe(secret);
  });

  it("verifies a live TOTP code", () => {
    const secret = generateTotpSecret();
    const totp = new OTPAuth.TOTP({
      issuer: "ONE GOOD",
      label: "admin",
      algorithm: "SHA1",
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    });
    expect(verifyTotp(secret, totp.generate())).toBe(true);
    expect(verifyTotp(secret, "000000")).toBe(false);
  });
});
