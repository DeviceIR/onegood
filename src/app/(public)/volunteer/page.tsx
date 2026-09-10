"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function VolunteerPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/volunteer", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        phone: fd.get("phone"),
        email: fd.get("email"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "درخواست داوطلبی ثبت شد." : "خطا در ارسال.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">داوطلبی</h1>
      <p className="mt-2 text-sm text-muted">
        اگر می‌خواهید در خرید، بسته‌بندی یا هماهنگی کمک کنید، پیام بگذارید.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input name="name" required placeholder="نام" />
        <Input name="phone" required placeholder="تلفن" />
        <Input name="email" type="email" placeholder="ایمیل" />
        <Textarea name="message" required placeholder="چطور می‌توانید کمک کنید؟" />
        <Button type="submit" className="w-full">
          ارسال درخواست
        </Button>
        {status ? <p className="text-sm text-muted">{status}</p> : null}
      </form>
    </div>
  );
}
