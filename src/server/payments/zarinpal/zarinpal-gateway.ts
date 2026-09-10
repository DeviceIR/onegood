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

type ZarinPalConfig = {
  merchantId: string;
  sandbox: boolean;
};

/**
 * ZarinPal REST v4. Hosts and codes must be re-confirmed against official docs at go-live.
 * See docs/payments-zarinpal.md
 */
export class ZarinPalGateway implements PaymentGateway {
  constructor(private readonly config: ZarinPalConfig) {}

  private get baseUrl() {
    // Prefer payment.zarinpal.com per recent docs; sandbox uses sandbox host when enabled.
    return this.config.sandbox
      ? "https://sandbox.zarinpal.com"
      : "https://payment.zarinpal.com";
  }

  private startPayUrl(authority: string) {
    const host = this.config.sandbox
      ? "https://sandbox.zarinpal.com"
      : "https://www.zarinpal.com";
    return `${host}/pg/StartPay/${authority}`;
  }

  async createPayment(input: CreatePaymentInput): Promise<CreatePaymentResult> {
    const res = await fetch(`${this.baseUrl}/pg/v4/payment/request.json`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: this.config.merchantId,
        amount: Number(input.amountToman),
        currency: "IRT",
        callback_url: input.callbackUrl,
        description: input.description,
        metadata: {
          ...(input.metadata?.mobile ? { mobile: input.metadata.mobile } : {}),
          ...(input.metadata?.email ? { email: input.metadata.email } : {}),
        },
      }),
    });
    const json = (await res.json()) as {
      data?: { code?: number; authority?: string; message?: string };
      errors?: unknown;
    };
    if (json.data?.code === 100 && json.data.authority) {
      return {
        authority: json.data.authority,
        redirectUrl: this.startPayUrl(json.data.authority),
      };
    }
    throw new Error(
      `ZarinPal request failed: ${JSON.stringify(json.errors ?? json.data ?? json)}`,
    );
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult> {
    const res = await fetch(`${this.baseUrl}/pg/v4/payment/verify.json`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        merchant_id: this.config.merchantId,
        amount: Number(input.amountToman),
        authority: input.authority,
      }),
    });
    const json = (await res.json()) as {
      data?: {
        code?: number;
        message?: string;
        ref_id?: number | string;
        card_pan?: string;
        card_hash?: string;
        fee_type?: string;
        fee?: number;
      };
      errors?: { code?: number; message?: string } | unknown;
    };
    const code = json.data?.code;
    if (code === 100 || code === 101) {
      return {
        ok: true,
        alreadyVerified: code === 101,
        refId: String(json.data?.ref_id ?? ""),
        cardPanMasked: json.data?.card_pan,
        cardHash: json.data?.card_hash,
        feeType: json.data?.fee_type,
        feeToman: json.data?.fee != null ? BigInt(json.data.fee) : undefined,
        raw: json,
      };
    }
    const err = json.errors as { code?: number; message?: string } | undefined;
    return {
      ok: false,
      code: String(err?.code ?? code ?? "unknown"),
      message: err?.message ?? json.data?.message ?? "Verification failed",
      raw: json,
    };
  }

  async refundPayment(_input: RefundPaymentInput): Promise<RefundPaymentResult> {
    void _input;
    throw new NotSupportedError(
      "ZarinPal programmatic refund not confirmed; record manual REFUND ledger entry",
    );
  }
}
