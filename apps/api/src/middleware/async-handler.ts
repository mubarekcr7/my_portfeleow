import type { Request, RequestHandler, Response } from "express";

type AsyncRoute = (request: Request, response: Response) => Promise<unknown>;

export const asyncHandler = (handler: AsyncRoute): RequestHandler => (request, response, next) => {
  void handler(request, response).catch(next);
};