import { randomUUID } from "node:crypto";
import { Router } from "express";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { z } from "zod";
import { cloudinaryConfigured, env } from "../config/env.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { requireAdmin, requireCsrf } from "../middleware/auth.js";
import { HttpError } from "../utils/http-error.js";

export const uploadsRouter = Router();
uploadsRouter.use(requireAdmin, requireCsrf);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_request, file, callback) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.mimetype)) {
      callback(new HttpError(400, "Only JPEG, PNG, WebP, or PDF files are allowed."));
      return;
    }
    callback(null, true);
  },
});

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

const hasValidSignature = (buffer: Buffer, mime: string): boolean => {
  if (mime === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mime === "image/webp") return buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";
  if (mime === "application/pdf") return buffer.subarray(0, 5).toString("ascii") === "%PDF-";
  return false;
};

uploadsRouter.post("/", upload.single("file"), asyncHandler(async (request, response) => {
  if (!cloudinaryConfigured) throw new HttpError(503, "Media storage is not configured. Set the Cloudinary environment variables.");
  if (!request.file || !hasValidSignature(request.file.buffer, request.file.mimetype)) {
    throw new HttpError(400, "File content does not match an allowed image or PDF type.");
  }
  const kind = z.enum(["image", "resume"]).parse(request.body.kind);
  const isPdf = request.file.mimetype === "application/pdf";
  if ((kind === "resume") !== isPdf) throw new HttpError(400, "Resumes must be PDF files; project media must be an image.");
  const folder = kind === "resume" ? "mubarek-portfolio/resumes" : "mubarek-portfolio/projects";
  const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
    cloudinary.uploader.upload_stream({
      folder,
      public_id: randomUUID(),
      resource_type: isPdf ? "raw" : "image",
      ...(isPdf ? {} : { transformation: [{ width: 1800, height: 1800, crop: "limit", quality: "auto", fetch_format: "auto" }] }),
    }, (error, uploaded) => {
      if (error || !uploaded) return reject(error ?? new Error("Cloudinary upload returned no result."));
      resolve({ secure_url: uploaded.secure_url, public_id: uploaded.public_id });
    }).end(request.file!.buffer);
  });
  response.status(201).json({ data: result });
}));

uploadsRouter.delete("/", asyncHandler(async (request, response) => {
  if (!cloudinaryConfigured) throw new HttpError(503, "Media storage is not configured.");
  const publicId = z.string().min(1).max(300).regex(/^mubarek-portfolio\/(projects|resumes)\/[a-f0-9-]+$/).parse(request.body.publicId);
  const folder = publicId.split("/")[1];
  const result = await cloudinary.uploader.destroy(publicId, { resource_type: folder === "resumes" ? "raw" : "image" });
  response.json({ data: result });
}));