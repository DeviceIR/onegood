"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      totp: String(fd.get("totp") || ""),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("ورود ناموفق — ایمیل، رمز یا کد دومرحله‌ای را بررسی کنید.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="text-2xl font-semibold">ورود مدیران</h1>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input name="email" type="email" required placeholder="ایمیل" />
        <Input name="password" type="password" required placeholder="رمز" />
        <Input name="totp" placeholder="کد TOTP (در صورت فعال بودن)" />
        <Button type="submit" className="w-full" disabled={loading}>
          ورود
        </Button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>
    </div>
  );
}
