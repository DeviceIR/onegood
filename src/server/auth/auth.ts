import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import * as argon2 from "argon2";
import { z } from "zod";
import { prisma } from "../db/prisma";
import type { AdminRole } from "@prisma/client";
import { verifyTotp } from "./totp";
import { decryptTotpSecret } from "./totp-crypto";
import { checkRateLimit } from "@/server/ratelimit";
import { headers } from "next/headers";

declare module "next-auth" {
  interface User {
    role?: AdminRole;
    totpEnabled?: boolean;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: AdminRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: AdminRole;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  totp: z.string().optional(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: {},
        password: {},
        totp: {},
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        let ip = "unknown";
        try {
          const h = await headers();
          ip =
            h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            h.get("x-real-ip") ||
            "unknown";
        } catch {
          /* outside request */
        }
        const ipLimit = await checkRateLimit(`login-ip:${ip}`, 30, 15 * 60_000);
        const emailLimit = await checkRateLimit(
          `login-email:${email}`,
          10,
          15 * 60_000,
        );
        if (!ipLimit.ok || !emailLimit.ok) return null;

        const admin = await prisma.admin.findUnique({
          where: { email },
        });
        if (!admin || !admin.isActive) return null;
        const ok = await argon2.verify(admin.passwordHash, parsed.data.password);
        if (!ok) return null;
        if (admin.totpEnabled && admin.totpSecretEnc) {
          const secret = decryptTotpSecret(
            admin.totpSecretEnc,
            process.env.AUTH_SECRET ?? "",
          );
          if (!parsed.data.totp || !verifyTotp(secret, parsed.data.totp)) {
            return null;
          }
        }
        await prisma.admin.update({
          where: { id: admin.id },
          data: { lastLoginAt: new Date() },
        });
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      if (!token.id && token.sub) {
        token.id = token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || (token.sub as string) || "";
        session.user.role = (token.role as AdminRole) || "VIEWER";
      }
      return session;
    },
  },
});
