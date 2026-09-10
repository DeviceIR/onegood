"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatToman } from "@/lib/money";
import { formatJalaliDate } from "@/lib/jalali";

export default function TrackDonationPage() {
  const [ref, setRef] = useState("");
  const [result, setResult] = useState<{
    ok: boolean;
    campaign?: string;
    amount?: string;
    date?: string;
    error?: string;
  } | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/donations/track?ref=${encodeURIComponent(ref)}`);
    const data = await res.json();
    if (!res.ok) {
      setResult({ ok: false, error: data.error ?? "یافت نشد" });
      return;
    }
    setResult({
      ok: true,
      campaign: data.campaignTitle,
      amount: formatToman(BigInt(data.amountToman)),
      date: formatJalaliDate(data.verifiedAt ?? data.createdAt),
    });
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">پیگیری کمک</h1>
      <p className="mt-2 text-sm text-muted">کد پیگیری را وارد کنید (مثلاً HFZ-…).</p>
      <form onSubmit={onSubmit} className="mt-6 flex gap-2">
        <Input value={ref} onChange={(e) => setRef(e.target.value)} required />
        <Button type="submit">جستجو</Button>
      </form>
      {result ? (
        <div className="mt-6 rounded-md border border-border bg-card p-4 text-sm">
          {result.ok ? (
            <>
              <p>کمپین: {result.campaign}</p>
              <p className="mt-1">مبلغ: {result.amount}</p>
              <p className="mt-1">تاریخ: {result.date}</p>
            </>
          ) : (
            <p>{result.error}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
