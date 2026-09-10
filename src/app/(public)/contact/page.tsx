"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SITE_NAME_EN, SITE_NAME_FA } from "@/lib/seo";

export default function ContactPage() {
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        message: fd.get("message"),
      }),
    });
    setStatus(res.ok ? "پیام شما ثبت شد. به‌زودی پاسخ می‌دهیم." : "ارسال نشد. بعداً دوباره تلاش کنید.");
    if (res.ok) e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold">تماس با ما</h1>
      <p className="mt-3 text-muted">
        برای پرسش درباره کمپین‌ها، همکاری داوطلبانه، یا شفافیت مالی با تیم{" "}
        {SITE_NAME_FA} در ارتباط باشید.
      </p>

      <div className="mt-8 grid gap-4 rounded-2xl border border-border bg-card/80 p-5 text-sm md:grid-cols-2">
        <div>
          <p className="text-xs text-muted">برند</p>
          <p className="mt-1 font-medium" dir="ltr">
            {SITE_NAME_EN}
          </p>
          <p className="text-muted">{SITE_NAME_FA}</p>
        </div>
        <div>
          <p className="text-xs text-muted">ایمیل پشتیبانی</p>
          <p className="mt-1 font-medium">support@onegood.ir</p>
          <p className="mt-3 text-xs text-muted">
            این ایمیل را با دامنه واقعی خودتان در پنل هاست جایگزین کنید.
          </p>
        </div>
        <div>
          <p className="text-xs text-muted">ساعت پاسخ‌گویی</p>
          <p className="mt-1 font-medium">شنبه تا چهارشنبه، ۹ تا ۱۷</p>
        </div>
        <div>
          <p className="text-xs text-muted">موضوعات</p>
          <p className="mt-1 font-medium">کمک‌ها · داوطلبی · شفافیت · رسانه</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <Input name="name" required placeholder="نام" aria-label="نام" />
        <Input name="email" type="email" placeholder="ایمیل" aria-label="ایمیل" />
        <Input name="phone" placeholder="تلفن" aria-label="تلفن" />
        <Textarea name="message" required placeholder="پیام شما" aria-label="پیام" rows={5} />
        <Button type="submit" className="w-full">
          ارسال پیام
        </Button>
        {status ? <p className="text-sm text-muted">{status}</p> : null}
      </form>
    </div>
  );
}
