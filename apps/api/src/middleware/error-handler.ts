import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { HttpError } from "../utils/http-error.js";

export const notFound: RequestHandler = (_request, response) => {
  response.status(404).json({ error: { message: "Route not found." } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({ error: { message: "Request validation failed.", details: error.issues } });
    return;
  }
  if (error instanceof multer.MulterError) {
    response.status(400).json({ error: { message: error.code === "LIMIT_FILE_SIZE" ? "File exceeds the 10 MB upload limit." : "Upload contains too many or invalid files." } });
    return;
  }
  if (error instanceof HttpError) {
    response.status(error.statusCode).json({ error: { message: error.message, details: error.details } });
    return;
  }
  logger.error({ err: error, path: request.path }, "Unhandled request error");
  response.status(500).json({ error: { message: "An unexpected server error occurred." } });
};