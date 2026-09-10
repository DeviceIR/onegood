/**
 * Next.js RSC / Flight cannot JSON-serialize BigInt.
 * Prisma money fields are BigInt — enable a safe toJSON once at startup.
 */
if (
  typeof BigInt !== "undefined" &&
  !Object.prototype.hasOwnProperty.call(BigInt.prototype, "toJSON")
) {
  Object.defineProperty(BigInt.prototype, "toJSON", {
    value: function toJSON(this: bigint) {
      // Charity toman amounts fit safely in Number.MAX_SAFE_INTEGER.
      return Number(this);
    },
    writable: true,
    configurable: true,
  });
}
