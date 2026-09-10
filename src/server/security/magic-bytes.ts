/** Magic-byte sniffing for upload allowlists (no trust of Content-Type alone). */

export type SniffedKind = "jpeg" | "png" | "webp" | "mp4" | "webm" | "unknown";

export function sniffMagicBytes(buf: Buffer): SniffedKind {
  if (buf.length < 12) return "unknown";

  // JPEG FF D8 FF
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";

  // PNG
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }

  // WEBP: RIFF....WEBP
  if (
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }

  // WebM / Matroska EBML
  if (
    buf[0] === 0x1a &&
    buf[1] === 0x45 &&
    buf[2] === 0xdf &&
    buf[3] === 0xa3
  ) {
    return "webm";
  }

  // MP4 / ISO BMFF — ftyp at offset 4
  if (buf.toString("ascii", 4, 8) === "ftyp") return "mp4";

  return "unknown";
}

const IMAGE_MIME: Record<string, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const VIDEO_MIME: Record<string, string> = {
  mp4: "video/mp4",
  webm: "video/webm",
};

export function assertImageMagic(buf: Buffer, claimedMime: string): string {
  const kind = sniffMagicBytes(buf);
  const expected = IMAGE_MIME[kind];
  if (!expected) throw new Error("INVALID_MAGIC");
  // Claimed MIME must match sniffed family (jpeg/jpg alias ok)
  const claim = claimedMime.toLowerCase();
  if (kind === "jpeg" && (claim === "image/jpeg" || claim === "image/jpg")) {
    return expected;
  }
  if (expected !== claim) throw new Error("MIME_MISMATCH");
  return expected;
}

export function assertVideoMagic(buf: Buffer, claimedMime: string): string {
  const kind = sniffMagicBytes(buf);
  const expected = VIDEO_MIME[kind];
  if (!expected) throw new Error("INVALID_MAGIC");
  if (expected !== claimedMime.toLowerCase()) throw new Error("MIME_MISMATCH");
  return expected;
}
