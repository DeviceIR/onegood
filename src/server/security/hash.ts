import { createHash } from "crypto";

export function hashIpSha256(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
