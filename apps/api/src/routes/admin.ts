import { Router } from "express";
import { Prisma } from "../generated/prisma/client.js";
import { z } from "zod";
import { prisma } from "../config/database.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireAdmin, requireCsrf } from "../middleware/auth.js";
import { HttpError } from "../utils/http-error.js";

export const adminRouter = Router();
adminRouter.use(requireAdmin);
adminRouter.use((request, response, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return next();
  return requireCsrf(request, response, next);
});

const slug = z.string().trim().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const optionalUrl = (maxLength: number) => z.preprocess((value) => value === "" ? null : value, z.url().max(maxLength).nullable().optional());
const order = z.number().int().min(0).max(100_000).default(0);
const projectSchema = z.object({
  title: z.string().trim().min(2).max(180),
  slug,
  shortDescription: z.string().trim().min(5).max(320),
  fullDescription: z.string().trim().min(10).max(20_000),
  problem: z.string().max(10_000).nullable().optional(),
  solution: z.string().max(10_000).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(180)).max(30).default([]),
  technologies: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  category: z.string().trim().min(2).max(80),
  coverImage: optionalUrl(1000),
  githubUrl: optionalUrl(500),
  liveDemoUrl: optionalUrl(500),
  status: z.enum(["DRAFT", "IN_PROGRESS", "COMPLETED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  displayOrder: order,
}).strict();
const skillSchema = z.object({ name: z.string().trim().min(1).max(100), category: z.string().trim().min(1).max(80), description: z.string().max(1000).nullable().optional(), icon: z.string().max(80).nullable().optional(), displayOrder: order, visibility: z.boolean().default(true) }).strict();
const educationSchema = z.object({ institution: z.string().trim().min(1).max(180), qualification: z.string().trim().min(1).max(180), fieldOfStudy: z.string().trim().min(1).max(180), startDate: z.iso.datetime().nullable().optional(), endDate: z.iso.datetime().nullable().optional(), description: z.string().max(4000).nullable().optional(), displayOrder: order }).strict();
const experienceSchema = z.object({ organization: z.string().trim().min(1).max(180), role: z.string().trim().min(1).max(180), employmentType: z.string().trim().min(1).max(80), startDate: z.iso.datetime().nullable().optional(), endDate: z.iso.datetime().nullable().optional(), description: z.string().max(4000).nullable().optional(), displayOrder: order }).strict();
const serviceSchema = z.object({ title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(4000), icon: z.string().max(80).nullable().optional(), active: z.boolean().default(true), displayOrder: order }).strict();
const messageSchema = z.object({ status: z.enum(["UNREAD", "READ", "ARCHIVED"]) }).strict();

type AdminModel = {
  findMany(args: { where?: unknown; skip?: number; take?: number; orderBy?: unknown; include?: unknown }): Promise<unknown[]>;
  findUnique(args: { where: { id: string }; include?: unknown }): Promise<unknown | null>;
  create(args: { data: Record<string, unknown> }): Promise<unknown>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
  count(args: { where?: unknown }): Promise<number>;
};

type ResourceSchema = typeof projectSchema | typeof skillSchema | typeof educationSchema | typeof experienceSchema | typeof serviceSchema | typeof messageSchema;
type ResourceConfig = { model: AdminModel; schema: ResourceSchema; searchable: string[]; orderBy: unknown; include?: unknown };
const resources: Record<string, ResourceConfig> = {
  projects: { model: prisma.project as unknown as AdminModel, schema: projectSchema, searchable: ["title", "shortDescription", "category"], orderBy: [{ featured: "desc" }, { displayOrder: "asc" }, { createdAt: "desc" }], include: { images: { orderBy: { displayOrder: "asc" } } } },
  skills: { model: prisma.skill as unknown as AdminModel, schema: skillSchema, searchable: ["name", "category"], orderBy: [{ displayOrder: "asc" }, { name: "asc" }] },
  education: { model: prisma.education as unknown as AdminModel, schema: educationSchema, searchable: ["institution", "qualification", "fieldOfStudy"], orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }] },
  experience: { model: prisma.experience as unknown as AdminModel, schema: experienceSchema, searchable: ["organization", "role"], orderBy: [{ displayOrder: "asc" }, { startDate: "desc" }] },
  services: { model: prisma.service as unknown as AdminModel, schema: serviceSchema, searchable: ["title", "description"], orderBy: [{ displayOrder: "asc" }] },
  messages: { model: prisma.contactMessage as unknown as AdminModel, schema: messageSchema, searchable: ["senderName", "senderEmail", "subject"], orderBy: [{ createdAt: "desc" }] },
};

const getResource = (name: string): ResourceConfig => {
  const config = resources[name];
  if (!config) throw new HttpError(404, "Admin resource not found.");
  return config;
};
const bodyRecord = (schema: z.ZodType, value: unknown): Record<string, unknown> => schema.parse(value) as Record<string, unknown>;
const idSchema = z.string().min(1).max(100);

adminRouter.get("/overview", asyncHandler(async (_request, response) => {
  const [projects, featuredProjects, skills, unreadMessages, recentMessages] = await prisma.$transaction([
    prisma.project.count(),
    prisma.project.count({ where: { featured: true } }),
    prisma.skill.count(),
    prisma.contactMessage.count({ where: { status: "UNREAD" } }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  response.json({ data: { projects, featuredProjects, skills, unreadMessages, recentMessages } });
}));

adminRouter.get("/profile", asyncHandler(async (_request, response) => {
  response.json({ data: await prisma.profile.findUnique({ where: { id: "singleton" } }) });
}));
const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  professionalTitle: z.string().trim().min(1).max(180).optional(),
  biography: z.string().max(5000).optional(),
  email: z.preprocess((value) => value === "" ? null : value, z.email().nullable().optional()),
  location: z.string().trim().min(1).max(120).optional(),
  githubUrl: optionalUrl(500),
  linkedInUrl: optionalUrl(500),
  profileImage: optionalUrl(1000),
  resumeFile: z.string().max(1000).nullable().optional(),
  seoTitle: z.string().max(180).nullable().optional(),
  seoDescription: z.string().max(320).nullable().optional(),
}).strict();
adminRouter.patch("/profile", asyncHandler(async (request, response) => {
  const data = profileUpdateSchema.parse(request.body);
  const updated = await prisma.profile.upsert({ where: { id: "singleton" }, create: {
    name: "Mubarek Mohammed", professionalTitle: "Software Engineering Student | Aspiring Full-Stack Developer", biography: "", location: "Ethiopia", ...data,
  }, update: data });
  response.json({ data: updated });
}));

const settingsSchema = z.object({
  siteTitle: z.string().trim().min(1).max(180).optional(),
  siteDescription: z.string().trim().min(1).max(320).optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
  contactEmail: z.email().nullable().optional(),
  themePreferences: z.record(z.string(), z.unknown()).optional(),
}).strict();
adminRouter.get("/settings", asyncHandler(async (_request, response) => {
  response.json({ data: await prisma.siteSettings.findUnique({ where: { id: "singleton" } }) });
}));
adminRouter.patch("/settings", asyncHandler(async (request, response) => {
  const data = settingsSchema.parse(request.body);
  const { socialLinks, themePreferences, ...scalarSettings } = data;
  const updated = await prisma.siteSettings.upsert({ where: { id: "singleton" }, create: {
    siteTitle: "Mubarek Mohammed | Portfolio", siteDescription: "Software Engineering student and aspiring full-stack developer.",
    ...scalarSettings, socialLinks: (socialLinks ?? {}) as Prisma.InputJsonValue,
    themePreferences: (themePreferences ?? {}) as Prisma.InputJsonValue,
  }, update: {
    ...scalarSettings,
    ...(socialLinks ? { socialLinks: socialLinks as Prisma.InputJsonValue } : {}),
    ...(themePreferences ? { themePreferences: themePreferences as Prisma.InputJsonValue } : {}),
  } });
  response.json({ data: updated });
}));

adminRouter.post("/projects/reorder", asyncHandler(async (request, response) => {
  const { ids } = z.object({ ids: z.array(idSchema).min(1).max(200) }).strict().parse(request.body);
  await prisma.$transaction(ids.map((id, displayOrder) => prisma.project.update({ where: { id }, data: { displayOrder } })));
  response.json({ data: { updated: ids.length } });
}));

adminRouter.post("/projects/:id/images", asyncHandler(async (request, response) => {
  const projectId = idSchema.parse(request.params.id);
  const input = z.object({ imageUrl: z.url().max(1000), altText: z.string().trim().min(1).max(240), displayOrder: z.number().int().min(0).default(0) }).strict().parse(request.body);
  const image = await prisma.projectImage.create({ data: { projectId, ...input } });
  response.status(201).json({ data: image });
}));
adminRouter.get("/projects/:id/images", asyncHandler(async (request, response) => {
  const images = await prisma.projectImage.findMany({ where: { projectId: idSchema.parse(request.params.id) }, orderBy: { displayOrder: "asc" } });
  response.json({ data: images });
}));
adminRouter.delete("/projects/:id/images/:imageId", asyncHandler(async (request, response) => {
  await prisma.projectImage.delete({ where: { id: idSchema.parse(request.params.imageId), projectId: idSchema.parse(request.params.id) } });
  response.status(204).end();
}));

adminRouter.get("/:resource", asyncHandler(async (request, response) => {
  const resourceName = String(request.params.resource);
  const config = getResource(resourceName);
  const query = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), search: z.string().trim().max(100).optional(), status: z.string().max(40).optional() }).parse(request.query);
  const where = {
    ...(query.search ? { OR: config.searchable.map((field) => ({ [field]: { contains: query.search, mode: "insensitive" } })) } : {}),
    ...(query.status && resourceName === "messages" ? { status: query.status } : {}),
  };
  const [items, total] = await Promise.all([
    config.model.findMany({ where, orderBy: config.orderBy, skip: (query.page - 1) * query.limit, take: query.limit, ...(config.include ? { include: config.include } : {}) }),
    config.model.count({ where }),
  ]);
  response.json({ data: items, pagination: { page: query.page, limit: query.limit, total, pages: Math.ceil(total / query.limit) } });
}));

adminRouter.get("/:resource/:id", asyncHandler(async (request, response) => {
  const config = getResource(String(request.params.resource));
  const item = await config.model.findUnique({ where: { id: idSchema.parse(request.params.id) }, ...(config.include ? { include: config.include } : {}) });
  if (!item) throw new HttpError(404, "Item not found.");
  response.json({ data: item });
}));

adminRouter.post("/:resource", asyncHandler(async (request, response) => {
  const config = getResource(String(request.params.resource));
  const data = bodyRecord(config.schema, request.body);
  const item = await config.model.create({ data });
  response.status(201).json({ data: item });
}));

adminRouter.patch("/:resource/:id", asyncHandler(async (request, response) => {
  const config = getResource(String(request.params.resource));
  const data = bodyRecord(config.schema.partial(), request.body);
  const item = await config.model.update({ where: { id: idSchema.parse(request.params.id) }, data });
  response.json({ data: item });
}));

adminRouter.delete("/:resource/:id", asyncHandler(async (request, response) => {
  const config = getResource(String(request.params.resource));
  await config.model.delete({ where: { id: idSchema.parse(request.params.id) } });
  response.status(204).end();
}));