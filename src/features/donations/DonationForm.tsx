"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { parseTomanInput, formatToman, toPersianDigits } from "@/lib/money";
import { generateIdempotencyKey } from "@/lib/crypto-helpers";

const PRESETS = [200_000n, 500_000n, 1_000_000n];

export function DonationForm({
  campaignId,
  campaignSlug,
}: {
  campaignId: string;
  campaignSlug: string;
}) {
  const formId = useId();
  const amountId = `${formId}-amount`;
  const statusId = `${formId}-status`;
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [showName, setShowName] = useState(false);
  const [showAmount, setShowAmount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [idempotencyKey] = useState(() => generateIdempotencyKey());

  const parsedAmount = parseTomanInput(amount);
  const selectedPreset =
    parsedAmount != null
      ? PRESETS.find((p) => p === parsedAmount)?.toString()
      : undefined;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = parseTomanInput(amount);
    if (!parsed || parsed < 10000n) {
      setError("حداقل مبلغ ۱۰٬۰۰۰ تومان است.");
      setStatus("خطا: مبلغ نامعتبر");
      return;
    }
    setLoading(true);
    setStatus("در حال ایجاد درخواست پرداخت…");
    try {
      const res = await fetch("/api/donations/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          campaignId,
          campaignSlug,
          amountToman: parsed.toString(),
          donorDisplayName: name || undefined,
          message: message || undefined,
          showName,
          showAmount,
          idempotencyKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ایجاد پرداخت");
        setStatus("خطا در ایجاد پرداخت");
        setLoading(false);
        return;
      }
      setStatus("انتقال به درگاه پرداخت…");
      window.location.href = data.redirectUrl;
    } catch {
      setError("ارتباط با سرور برقرار نشد.");
      setStatus("خطای ارتباط");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-5"
      noValidate
      aria-describedby={statusId}
    >
      <p id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
        {status}
      </p>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">مبلغ کمک</legend>
        <div
          className="mb-3 flex flex-wrap gap-2"
          role="group"
          aria-label="مبالغ پیشنهادی"
        >
          {PRESETS.map((p) => {
            const key = p.toString();
            const pressed = selectedPreset === key;
            return (
              <button
                key={key}
                type="button"
                className={`rounded-md border bg-card px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  pressed
                    ? "border-accent text-accent"
                    : "border-border hover:border-accent"
                }`}
                aria-pressed={pressed}
                onClick={() => {
                  setAmount(key);
                  setStatus(`مبلغ ${formatToman(p)} انتخاب شد`);
                }}
              >
                {formatToman(p)}
              </button>
            );
          })}
        </div>
        <label className="mb-1 block text-sm" htmlFor={amountId}>
          مبلغ به تومان
        </label>
        <Input
          id={amountId}
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="مثلاً ۵۰۰۰۰۰"
          aria-required="true"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${formId}-err` : undefined}
        />
      </fieldset>

      <div>
        <label className="mb-1 block text-sm" htmlFor={`${formId}-name`}>
          نام نمایشی (اختیاری)
        </label>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="nickname"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm" htmlFor={`${formId}-msg`}>
          پیام (اختیاری)
        </label>
        <Textarea
          id={`${formId}-msg`}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
        />
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">حریم خصوصی نمایش عمومی</legend>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <Checkbox
            checked={showName}
            onCheckedChange={(v) => setShowName(v === true)}
          />
          نمایش نام من
        </label>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <Checkbox
            checked={showAmount}
            onCheckedChange={(v) => setShowAmount(v === true)}
          />
          نمایش مبلغ کمک من
        </label>
        <p className="text-xs text-muted">
          در صورت عدم انتخاب، به‌صورت «یک همراه» و «مبلغ نامشخص» نمایش داده می‌شود.
        </p>
      </fieldset>

      {error ? (
        <p id={`${formId}-err`} className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={loading} className="w-full">
        {loading ? "در حال انتقال…" : "ادامه و پرداخت"}
      </Button>
      <p className="text-center text-xs text-muted">
        حداقل {toPersianDigits("10000")} تومان — تأیید پرداخت فقط در سرور انجام
        می‌شود. این فرم با صفحه‌کلید قابل تکمیل است.
      </p>
    </form>
  );
}
