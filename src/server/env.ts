import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  AUTH_URL: z.string().url(),
  PAYMENT_GATEWAY: z.enum(["mock", "zarinpal"]).default("mock"),
  ZARINPAL_MERCHANT_ID: z.string().optional().default(""),
  ZARINPAL_SANDBOX: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
  S3_ENDPOINT: z.string().optional().default(""),
  S3_REGION: z.string().optional().default("ir-thr-at1"),
  S3_ACCESS_KEY: z.string().optional().default(""),
  S3_SECRET_KEY: z.string().optional().default(""),
  S3_PUBLIC_BUCKET: z.string().optional().default("hafez-public"),
  S3_PRIVATE_BUCKET: z.string().optional().default("hafez-private"),
  S3_FORCE_PATH_STYLE: z
    .string()
    .optional()
    .transform((v) => v !== "false"),
  CDN_BASE_URL: z.string().optional().default(""),
  CRON_SECRET: z.string().min(8),
  STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment variables");
  }
  cached = parsed.data;
  return cached;
}
