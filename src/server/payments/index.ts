import { getEnv } from "../env";
import type { PaymentGateway } from "./gateway";
import { MockGateway } from "./mock/mock-gateway";
import { ZarinPalGateway } from "./zarinpal/zarinpal-gateway";

export function getPaymentGateway(): PaymentGateway {
  const env = getEnv();
  if (env.PAYMENT_GATEWAY === "zarinpal") {
    if (!env.ZARINPAL_MERCHANT_ID) {
      throw new Error("ZARINPAL_MERCHANT_ID is required when PAYMENT_GATEWAY=zarinpal");
    }
    return new ZarinPalGateway({
      merchantId: env.ZARINPAL_MERCHANT_ID,
      sandbox: Boolean(env.ZARINPAL_SANDBOX),
    });
  }
  return new MockGateway();
}

export * from "./gateway";
