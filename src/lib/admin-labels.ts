import type { AdminRole, PaymentStatus } from "@prisma/client";

export const ADMIN_ROLE_FA: Record<AdminRole, string> = {
  OWNER: "مالک",
  ADMIN: "مدیر",
  CAMPAIGN_MANAGER: "مدیر کمپین",
  VIEWER: "بازدیدکننده",
};

export const PAYMENT_STATUS_FA: Record<PaymentStatus, string> = {
  PENDING: "در انتظار",
  SUCCESS: "موفق",
  FAILED: "ناموفق",
  CANCELLED: "لغو شده",
  REFUNDED: "بازگشت وجه",
  EXPIRED: "منقضی",
};

export const PAYMENT_GATEWAY_FA: Record<string, string> = {
  MOCK: "آزمایشی",
  ZARINPAL: "زرین‌پال",
};

export const EXPENSE_CATEGORY_FA: Record<string, string> = {
  SUPPLIES: "لوازم",
  TRANSPORT: "حمل‌ونقل",
  CLOTHING: "پوشاک",
  FOOD: "غذا",
  GATEWAY_FEE: "کارمزد درگاه",
  OTHER: "سایر",
};

export const EXPENSE_STATUS_FA: Record<string, string> = {
  DRAFT: "پیش‌نویس",
  PUBLISHED: "منتشرشده",
};

export const LEDGER_TYPE_FA: Record<string, string> = {
  DONATION: "کمک",
  EXPENSE: "هزینه",
  REFUND: "بازگشت",
  TRANSFER: "انتقال",
  OTHER: "سایر",
};

export const LEDGER_DIRECTION_FA: Record<string, string> = {
  IN: "ورود",
  OUT: "خروج",
};

export function adminRoleFa(role: string): string {
  return ADMIN_ROLE_FA[role as AdminRole] ?? role;
}

export function paymentStatusFa(status: string): string {
  return PAYMENT_STATUS_FA[status as PaymentStatus] ?? status;
}
