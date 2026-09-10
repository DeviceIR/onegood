export function generateIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return `${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
}

export function generateReferenceCode(): string {
  const part = generateIdempotencyKey().slice(0, 8).toUpperCase();
  return `HFZ-${part}`;
}

export function hashIp(ip: string): string {
  // Server-only path should prefer Node crypto; this is a simple fallback for typed imports.
  let h = 0;
  for (let i = 0; i < ip.length; i++) h = (h * 31 + ip.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, "0");
}
