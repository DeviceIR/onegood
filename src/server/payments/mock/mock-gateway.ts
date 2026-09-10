import {
  NotSupportedError,
  type CreatePaymentInput,
  type CreatePaymentResult,
  type PaymentGateway,
  type RefundPaymentInput,
  type RefundPaymentResult,
  type VerifyPaymentInput,
  type VerifyPaymentResult,
} from "../gateway";

const store = new Map<
  string,
  { amountToman: bigint; verified: boolean; refId?: string }
>();

export class MockGateway implements PaymentGateway {
  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const authority = `MOCK${Date.now()}${Math.floor(Math.random() * 1000)}`;
    store.set(authority, { amountToman: input.amountToman, verified: false });
    const redirectUrl = `${input.callbackUrl}${input.callbackUrl.includes("?") ? "&" : "?"}Authority=${authority}&Status=OK`;
    return { authority, redirectUrl };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const row = store.get(input.authority);
    if (!row) {
      return { ok: false, code: "-51", message: "Session not found", raw: null };
    }
    if (row.amountToman !== input.amountToman) {
      return { ok: false, code: "-11", message: "Amount mismatch", raw: null };
    }
    if (row.verified) {
      return {
        ok: true,
        alreadyVerified: true,
        refId: row.refId ?? "0",
        raw: { code: 101 },
      };
    }
    row.verified = true;
    row.refId = String(Math.floor(Math.random() * 1_000_000));
    store.set(input.authority, row);
    return {
      ok: true,
      alreadyVerified: false,
      refId: row.refId,
      cardPanMasked: "502229******1234",
      feeToman: 0n,
      feeType: "Merchant",
      raw: { code: 100 },
    };
  }

  async refundPayment(_input: RefundPaymentInput): Promise<RefundPaymentResult> {
    void _input;
    throw new NotSupportedError("Mock refund not implemented; use ledger REFUND entry");
  }
}

/** Test helper */
export function __mockStore() {
  return store;
}
