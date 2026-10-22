import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  WEB_ORIGIN: z.url().default("http://localhost:5173"),
  DATABASE_URL: z.url().startsWith("postgresql://").or(z.url().startsWith("postgres://")),
  SESSION_SECRET: z.string().min(32),
  PUBLIC_CONTACT_EMAIL: z.email().optional().or(z.literal("")),
  PUBLIC_LINKEDIN_URL: z.url().optional().or(z.literal("")),
  PUBLIC_CV_URL: z.url().default("https://raw.githubusercontent.com/mubarekcr7/my-cv/main/%2B123-456-7890.pdf"),
  GITHUB_USERNAME: z.string().min(1).default("mubarekcr7"),
  GITHUB_TOKEN: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(587),
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.email().optional().or(z.literal("")),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
export const smtpConfigured = Boolean(env.SMTP_HOST && env.SMTP_FROM);