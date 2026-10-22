import { z } from "zod";

const base = import.meta.env.VITE_API_BASE ?? "/api/v1";
let csrfToken = "";

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (["POST", "PATCH", "DELETE"].includes(method)) {
    if (!csrfToken) await refreshCsrf();
    headers.set("X-CSRF-Token", csrfToken);
  }
  const response = await fetch(`${base}${path}`, { ...init, method, headers, credentials: "include" });
  if (response.status === 204) return undefined as T;
  const body = await response.json() as { data?: T; error?: { message?: string } };
  if (!response.ok) throw new ApiError(body.error?.message ?? "The request could not be completed.", response.status);
  return body.data as T;
}

export async function refreshCsrf(): Promise<string> {
  const response = await fetch(`${base}/auth/csrf`, { credentials: "include" });
  if (!response.ok) throw new ApiError("Could not establish a secure session.", response.status);
  const parsed = z.object({ data: z.object({ csrfToken: z.string() }) }).parse(await response.json());
  csrfToken = parsed.data.csrfToken;
  return csrfToken;
}

export function setCsrfToken(token: string): void {
  csrfToken = token;
}

export function getCsrfToken(): string {
  return csrfToken;
}

export type Page<T> = { data: T[]; pagination: { page: number; limit: number; total: number; pages: number } };
export type Project = {
  id: string; title: string; slug: string; shortDescription: string; fullDescription: string;
  problem?: string | null; solution?: string | null; features: string[]; technologies: string[];
  category: string; coverImage?: string | null; githubUrl?: string | null; liveDemoUrl?: string | null;
  status: "DRAFT" | "IN_PROGRESS" | "COMPLETED"; featured: boolean; displayOrder: number;
  images: { id: string; imageUrl: string; altText: string }[];
};
export type Profile = {
  name: string; professionalTitle: string; biography: string; email?: string | null; location: string;
  githubUrl?: string | null; linkedInUrl?: string | null; profileImage?: string | null; resumeFile?: string | null;
};