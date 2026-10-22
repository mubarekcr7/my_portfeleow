import type { RequestHandler } from "express";
import { HttpError } from "../utils/http-error.js";

export const requireAdmin: RequestHandler = (request, _response, next) => {
  if (!request.session.adminId || request.session.adminRole !== "ADMIN") {
    next(new HttpError(401, "Authentication required."));
    return;
  }
  next();
};

export const requireCsrf: RequestHandler = (request, _response, next) => {
  const token = request.get("x-csrf-token");
  if (!token || !request.session.csrfToken || token !== request.session.csrfToken) {
    next(new HttpError(403, "Invalid CSRF token."));
    return;
  }
  next();
};