import { Router } from "express";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { env } from "../config/env.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export const contentRouter = Router();
contentRouter.get("/resume", asyncHandler(async (_request, response) => {
  let resumeUrl = env.PUBLIC_CV_URL;
  try {
    const profile = await prisma.profile.findUnique({ where: { id: "singleton" }, select: { resumeFile: true } });
    if (profile?.resumeFile) resumeUrl = profile.resumeFile;
  } catch (error) {
    logger.warn({ err: error }, "Using configured public CV because profile storage is unavailable");
  }

  if (
    resumeUrl === "/Mubarek-Mohammed-CV.pdf" ||
    (resumeUrl.startsWith("/manus-storage/") &&
      !resumeUrl.includes("?") &&
      !resumeUrl.includes("#") &&
      !resumeUrl.split("/").some((segment) => segment === "." || segment === ".."))
  ) {
    response.redirect(302, resumeUrl);
    return;
  }

  const parsedUrl = new URL(resumeUrl);
  if (!["raw.githubusercontent.com", "res.cloudinary.com"].includes(parsedUrl.hostname)) {
    throw new HttpError(503, "The configured CV host is not supported.");
  }
  let fileResponse: Response;
  try {
    fileResponse = await fetch(parsedUrl, { redirect: "error", signal: AbortSignal.timeout(10_000), headers: { Accept: "application/pdf" } });
  } catch {
    throw new HttpError(502, "The CV file is temporarily unavailable.");
  }
  if (!fileResponse.ok || !fileResponse.body) throw new HttpError(502, "The CV file is temporarily unavailable.");
  const maxFileSize = 10 * 1024 * 1024;
  const declaredSize = Number(fileResponse.headers.get("content-length"));
  if (Number.isFinite(declaredSize) && declaredSize > maxFileSize) {
    throw new HttpError(502, "The CV file exceeds the 10 MB limit.");
  }

  const reader = fileResponse.body.getReader();
  const chunks: Buffer[] = [];
  let fileSize = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      fileSize += value.byteLength;
      if (fileSize > maxFileSize) {
        await reader.cancel();
        throw new HttpError(502, "The CV file exceeds the 10 MB limit.");
      }
      chunks.push(Buffer.from(value));
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  const file = Buffer.concat(chunks, fileSize);
  if (file.subarray(0, 5).toString("ascii") !== "%PDF-") {
    throw new HttpError(502, "The configured CV file is not a valid PDF.");
  }
  response.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": 'attachment; filename="Mubarek-Mohammed-CV.pdf"',
    "Content-Length": String(file.length),
    "Cache-Control": "public, max-age=300",
    "X-Content-Type-Options": "nosniff",
  }).send(file);
}));

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(80).optional(),
});

contentRouter.get("/profile", asyncHandler(async (_request, response) => {
  const profile = await prisma.profile.findUnique({ where: { id: "singleton" } });
  response.json({ data: profile });
}));

contentRouter.get("/projects", asyncHandler(async (request, response) => {
  const query = paginationSchema.extend({ featured: z.stringbool().optional() }).parse(request.query);
  const where = {
    status: { not: "DRAFT" as const },
    ...(query.category ? { category: query.category } : {}),
    ...(query.featured === undefined ? {} : { featured: query.featured }),
    ...(query.search ? { OR: [
      { title: { contains: query.search } },
      { shortDescription: { contains: query.search } },
      { technologies: { array_contains: query.search } },
    ] } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.project.findMany({ where, include: { images: { orderBy: { displayOrder: "asc" } } }, orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }], skip: (query.page - 1) * query.limit, take: query.limit }),
    prisma.project.count({ where }),
  ]);
  response.json({ data: items, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } });
}));

contentRouter.get("/projects/:slug", asyncHandler(async (request, response) => {
  const project = await prisma.project.findFirst({
    where: { slug: z.string().min(1).max(200).parse(request.params.slug), status: { not: "DRAFT" } },
    include: { images: { orderBy: { displayOrder: "asc" } } },
  });
  if (!project) throw new HttpError(404, "Project not found.");
  response.json({ data: project });
}));

contentRouter.get("/skills", asyncHandler(async (_request, response) => {
  const skills = await prisma.skill.findMany({ where: { visibility: true }, orderBy: [{ displayOrder: "asc" }, { name: "asc" }] });
  response.json({ data: skills });
}));

contentRouter.get("/education", asyncHandler(async (_request, response) => {
  const items = await prisma.education.findMany({ orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }] });
  response.json({ data: items });
}));

contentRouter.get("/experience", asyncHandler(async (_request, response) => {
  const items = await prisma.experience.findMany({ orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }] });
  response.json({ data: items });
}));

contentRouter.get("/services", asyncHandler(async (_request, response) => {
  const items = await prisma.service.findMany({ where: { active: true }, orderBy: { displayOrder: "asc" } });
  response.json({ data: items });
}));
