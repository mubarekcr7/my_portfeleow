import { randomBytes, timingSafeEqual } from "node:crypto";
import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import argon2 from "argon2";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { sessionCookieAttributes } from "../config/session-cookie.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireAdmin, requireCsrf } from "../middleware/auth.js";
import { HttpError } from "../utils/http-error.js";

export const authRouter = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 8, standardHeaders: "draft-8", legacyHeaders: false });
const loginSchema = z.object({ email: z.email().max(320), password: z.string().min(1).max(256) }).strict();

authRouter.get("/csrf", (request, response, next) => {
  const token = randomBytes(32).toString("hex");
  request.session.csrfToken = token;
  request.session.save((error) => {
    if (error) return next(error);
    response.json({ data: { csrfToken: token } });
  });
});

authRouter.get("/session", (request, response) => {
  response.json({ data: { authenticated: Boolean(request.session.adminId), role: request.session.adminRole ?? null } });
});

authRouter.post("/login", loginLimiter, requireCsrf, asyncHandler(async (request, response) => {
  const input = loginSchema.parse(request.body);
  const admin = await prisma.adminUser.findUnique({ where: { email: input.email.toLowerCase() } });
  const valid = admin ? await argon2.verify(admin.passwordHash, input.password) : false;
  if (!admin || !valid) throw new HttpError(401, "Email or password is incorrect.");

  await new Promise<void>((resolve, reject) => {
    request.session.regenerate((error) => error ? reject(error) : resolve());
  });
  request.session.adminId = admin.id;
  request.session.adminRole = admin.role;
  request.session.csrfToken = randomBytes(32).toString("hex");
  await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
  response.json({ data: { authenticated: true, role: admin.role, csrfToken: request.session.csrfToken } });
}));

authRouter.post("/logout", requireAdmin, requireCsrf, (request, response, next) => {
  request.session.destroy((error) => {
    if (error) return next(error);
    response.clearCookie("mubarek.sid", sessionCookieAttributes);
    response.status(204).end();
  });
});

export const safeTokenEqual = (left: string, right: string): boolean => {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
};
