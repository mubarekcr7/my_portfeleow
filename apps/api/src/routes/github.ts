import { Router } from "express";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const githubRouter = Router();
type Repository = { id: number; name: string; full_name: string; description: string | null; html_url: string; language: string | null; stargazers_count: number; forks_count: number; updated_at: string; fork: boolean; private: boolean };
let cache: { expiresAt: number; repositories: Repository[] } | undefined;
const cacheDurationMs = 5 * 60_000;

githubRouter.get("/repositories", async (_request, response) => {
  if (cache && cache.expiresAt > Date.now()) {
    response.setHeader("Cache-Control", "public, max-age=60");
    response.json({ data: cache.repositories, cached: true });
    return;
  }
  try {
    const result = await fetch(`https://api.github.com/users/${encodeURIComponent(env.GITHUB_USERNAME)}/repos?sort=updated&per_page=100`, {
      headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}) },
      signal: AbortSignal.timeout(5000),
    });
    if (!result.ok) {
      response.status(result.status === 403 ? 503 : 502).json({ error: { message: result.status === 403 ? "GitHub's API rate limit was reached." : "GitHub repositories are temporarily unavailable." } });
      return;
    }
    const repositories = (await result.json() as Repository[]).filter((repository) => !repository.fork && !repository.private);
    cache = { repositories, expiresAt: Date.now() + cacheDurationMs };
    response.setHeader("Cache-Control", "public, max-age=60");
    response.json({ data: repositories, cached: false });
  } catch (error) {
    logger.warn({ err: error }, "GitHub API request failed");
    response.status(503).json({ error: { message: "GitHub repositories are temporarily unavailable." } });
  }
});