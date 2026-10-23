import type { CookieOptions } from "express-session";
import { env } from "./env.js";

export const sessionCookieAttributes = {
  httpOnly: true,
  secure: env.SESSION_COOKIE_SECURE,
  sameSite: env.SESSION_COOKIE_SAME_SITE,
} satisfies CookieOptions;

export const sessionCookieOptions = {
  ...sessionCookieAttributes,
  maxAge: 1000 * 60 * 60 * 8,
} satisfies CookieOptions;
