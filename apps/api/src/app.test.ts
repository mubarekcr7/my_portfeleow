import { beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";

process.env.NODE_ENV = "test";
process.env.PORT = "4001";
process.env.WEB_ORIGIN = "http://localhost:3000";
process.env.DATABASE_URL = "mysql://portfolio:portfolio_dev_password@localhost:3306/mubarek_portfolio";
process.env.SESSION_SECRET = "test-only-session-secret-that-is-long-enough";
process.env.SESSION_COOKIE_SECURE = "false";
process.env.SESSION_COOKIE_SAME_SITE = "lax";
process.env.GITHUB_USERNAME = "mubarekcr7";

let app: (typeof import("./app.js"))["app"];
beforeAll(async () => { ({ app } = await import("./app.js")); });

describe("HTTP API without a database connection", () => {
  it("returns a liveness response", async () => {
    const response = await request(app).get("/healthz");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
    expect(response.headers["x-frame-options"]).toBeUndefined();
  });

  it("does not allow anonymous dashboard access", async () => {
    const response = await request(app).get("/api/v1/admin/overview");
    expect(response.status).toBe(401);
    expect(response.body.error.message).toBe("Authentication required.");
  });

  it("validates a contact message before database persistence", async () => {
    const response = await request(app).post("/api/v1/contact").send({
      name: "x", email: "not-an-email", subject: "?", message: "small",
    });
    expect(response.status).toBe(400);
    expect(response.body.error.message).toBe("Request validation failed.");
  });

  it("does not reveal unknown route details", async () => {
    const response = await request(app).get("/api/v1/not-a-route");
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Route not found.");
  });

  it("returns newly added public GitHub repositories", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([
      { id: 1, name: "fresh-learning-project", full_name: "mubarekcr7/fresh-learning-project", description: "A new project", html_url: "https://github.com/mubarekcr7/fresh-learning-project", language: "TypeScript", stargazers_count: 0, forks_count: 0, updated_at: "2026-10-19T00:00:00Z", fork: false, private: false },
      { id: 2, name: "forked-project", full_name: "mubarekcr7/forked-project", description: null, html_url: "https://github.com/mubarekcr7/forked-project", language: null, stargazers_count: 0, forks_count: 0, updated_at: "2026-10-19T00:00:00Z", fork: true, private: false },
      { id: 3, name: "private-project", full_name: "mubarekcr7/private-project", description: null, html_url: "https://github.com/mubarekcr7/private-project", language: null, stargazers_count: 0, forks_count: 0, updated_at: "2026-10-19T00:00:00Z", fork: false, private: true },
    ]), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    try {
      const response = await request(app).get("/api/v1/github/repositories");
      expect(response.status).toBe(200);
      expect(response.body.data.map((repository: { name: string }) => repository.name)).toEqual(["fresh-learning-project"]);
      expect(response.headers["cache-control"]).toBe("public, max-age=60");
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/users/mubarekcr7/repos?sort=updated&per_page=100"), expect.any(Object));
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
