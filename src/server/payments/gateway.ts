export type CreatePaymentInput = {
  amountToman: bigint;
  description: string;
  callbackUrl: string;
  metadata?: { mobile?: string; email?: string };
};

export type CreatePaymentResult = {
  authority: string;
  redirectUrl: string;
};

export type VerifyPaymentInput = {
  authority: string;
  amountToman: bigint;
};

export type VerifyPaymentResult =
  | {
      ok: true;
      alreadyVerified: boolean;
      refId: string;
      cardPanMasked?: string;
      cardHash?: string;
      feeType?: string;
      feeToman?: bigint;
      raw: unknown;
    }
  | {
      ok: false;
      code: string;
      message: string;
      raw: unknown;
    };

export type RefundPaymentInput = {
  authority: string;
  amountToman: bigint;
};

export type RefundPaymentResult = {
  ok: boolean;
  message: string;
};

export class NotSupportedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotSupportedError";
  }
}

export interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult>;
  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;
  refundPayment(input: RefundPaymentInput): Promise<RefundPaymentResult>;
}
