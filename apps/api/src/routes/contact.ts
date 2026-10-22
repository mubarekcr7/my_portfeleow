import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import nodemailer from "nodemailer";
import { z } from "zod";
import { env, smtpConfigured } from "../config/env.js";
import { prisma } from "../config/database.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export const contactRouter = Router();
const contactLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false });
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(320),
  subject: z.string().trim().min(3).max(180),
  message: z.string().trim().min(10).max(5000),
  website: z.string().max(0).optional(),
}).strict();

contactRouter.post("/", contactLimiter, asyncHandler(async (request, response) => {
  const input = contactSchema.parse(request.body);
  if (input.website) {
    response.status(202).json({ data: { received: true } });
    return;
  }

  let contactEmail = env.PUBLIC_CONTACT_EMAIL;
  try {
    const configuredContact = (await prisma.siteSettings.findUnique({ where: { id: "singleton" } }))?.contactEmail;
    if (configuredContact) contactEmail = configuredContact;
  } catch {
    // Database might be offline; continue to email notification
  }

  let savedId: string | undefined;
  try {
    const saved = await prisma.contactMessage.create({ data: {
      senderName: input.name,
      senderEmail: input.email,
      subject: input.subject,
      message: input.message,
    } });
    savedId = saved.id;
  } catch (error) {
    logger.warn({ err: error }, "Could not store contact message in database; attempting email delivery");
  }

  let notificationStatus: "sent" | "failed" | "not_configured" = "not_configured";
  if (smtpConfigured && contactEmail) {
    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
        ...(env.SMTP_USER && env.SMTP_PASSWORD ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } } : {}),
      });
      await transporter.sendMail({
        from: env.SMTP_FROM,
        to: contactEmail,
        replyTo: input.email,
        subject: `Portfolio message: ${input.subject}`,
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      });
      notificationStatus = "sent";
    } catch (error) {
      notificationStatus = "failed";
      logger.error({ err: error, messageId: savedId }, "Contact message email notification failed");
    }
  } else if (!smtpConfigured) {
    logger.warn("SMTP is not configured; skipping email notification");
  } else if (!contactEmail) {
    logger.warn("No recipient contact email configured; skipping email notification");
  }

  response.status(201).json({ data: { received: true, id: savedId ?? null, notificationStatus } });
}));