import { describe, expect, it } from "vitest";
import {
  assertImageMagic,
  assertVideoMagic,
  sniffMagicBytes,
} from "./magic-bytes";
import { processAndStoreImage } from "@/server/storage/image-pipeline";

describe("upload magic-byte fuzz", () => {
  it("sniffs real JPEG/PNG/WEBP", async () => {
    const sharp = (await import("sharp")).default;
    const jpeg = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#123" },
    })
      .jpeg()
      .toBuffer();
    expect(sniffMagicBytes(jpeg)).toBe("jpeg");
    expect(assertImageMagic(jpeg, "image/jpeg")).toBe("image/jpeg");

    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#456" },
    })
      .png()
      .toBuffer();
    expect(sniffMagicBytes(png)).toBe("png");
  });

  it("rejects PDF renamed as JPEG", async () => {
    const pdf = Buffer.from("%PDF-1.4 fake pdf content that is long enough!!");
    expect(sniffMagicBytes(pdf)).toBe("unknown");
    expect(() => assertImageMagic(pdf, "image/jpeg")).toThrow("INVALID_MAGIC");
    await expect(
      processAndStoreImage({
        buffer: pdf,
        mimeType: "image/jpeg",
        visibility: "INTERNAL",
      }),
    ).rejects.toThrow(/INVALID_MAGIC|INVALID_MIME/);
  });

  it("rejects HTML polyglot claiming image/png", async () => {
    const html = Buffer.from(
      "<!DOCTYPE html><html><body>not an image</body></html>",
    );
    expect(() => assertImageMagic(html, "image/png")).toThrow("INVALID_MAGIC");
  });

  it("rejects ZIP/EXE headers as images", () => {
    const zip = Buffer.from([0x50, 0x4b, 0x03, 0x04, ...Buffer.alloc(20)]);
    expect(sniffMagicBytes(zip)).toBe("unknown");
    const exe = Buffer.from([0x4d, 0x5a, ...Buffer.alloc(30)]);
    expect(sniffMagicBytes(exe)).toBe("unknown");
  });

  it("rejects MIME mismatch (PNG bytes + jpeg claim)", async () => {
    const sharp = (await import("sharp")).default;
    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: "#789" },
    })
      .png()
      .toBuffer();
    expect(() => assertImageMagic(png, "image/jpeg")).toThrow("MIME_MISMATCH");
  });

  it("rejects random bytes as video", () => {
    const junk = Buffer.alloc(64, 0x41);
    expect(() => assertVideoMagic(junk, "video/mp4")).toThrow("INVALID_MAGIC");
  });
});
