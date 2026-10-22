import { expect, test } from "@playwright/test";

test("homepage exposes portfolio navigation and contact actions", async ({ page }) => {
  await page.route("**/api/v1/github/repositories", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: [
      { id: 1, name: "ExamSchedulingSystem", html_url: "https://github.com/mubarekcr7/ExamSchedulingSystem", description: "Student exam scheduling system", language: "Java", stargazers_count: 0, forks_count: 0, updated_at: "2026-10-12T00:00:00Z", fork: false, private: false },
      { id: 2, name: "login-page-in-html-and-css", html_url: "https://github.com/mubarekcr7/login-page-in-html-and-css", description: "Login page", language: "CSS", stargazers_count: 0, forks_count: 0, updated_at: "2026-10-12T00:00:00Z", fork: false, private: false },
      { id: 3, name: "banking_management", html_url: "https://github.com/mubarekcr7/banking_management", description: "Banking management project", language: "C++", stargazers_count: 0, forks_count: 0, updated_at: "2026-10-12T00:00:00Z", fork: false, private: false },
    ] }),
  }));
  await page.route("**/api/v1/projects?featured=true*", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ data: [], pagination: { page: 1, limit: 3, total: 0, pages: 0 } }),
  }));
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /hello, i['’]m/i })).toBeVisible();
  await expect(page.locator(".hero-copy h1")).toContainText("Mubarek Mohammed.", { timeout: 5000 });
  await expect(page.getByRole("link", { name: /view my projects/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i }).first()).toHaveAttribute("href", "https://github.com/mubarekcr7");
  await expect(page.getByRole("heading", { name: "Student Exam Scheduler" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Banking Management System" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI-Based Surgical Monitoring System" })).toBeVisible();
  await expect(page.getByRole("link", { name: "AI-Based Surgical Monitoring System", exact: true })).toHaveAttribute("href", "https://github.com/mubarekcr7/ai_based_monitoring");
  await expect(page.getByText("Not clinically validated").first()).toBeVisible();
  await expect(page.getByText("Flutter", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("login-page-in-html-and-css")).toHaveCount(0);
  const role = page.locator(".role-line");
  await expect(role).toContainText("Software Engineering Student");
  await expect(role).toContainText("Aspiring Full-Stack Developer", { timeout: 5000 });
  await expect(role).toContainText("Flutter Developer", { timeout: 5000 });
});

test("project detail route reports a clear unavailable state when API is offline", async ({ page }) => {
  await page.route("**/api/v1/projects/example-project", (route) => route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: { message: "Project not found." } }) }));
  await page.goto("/projects/example-project", { waitUntil: "domcontentloaded" });
  await expect(page.getByText("Project not found")).toBeVisible();
  await expect(page.getByRole("link", { name: /back to projects/i })).toBeVisible();
});

test("contact form validates before submitting", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  await page.getByRole("button", { name: /send message/i }).click();
  await expect(page.getByText("Enter at least 2 characters.")).toBeVisible();
  await expect(page.getByText("Enter a valid email address.")).toBeVisible();
});

test("skills stay useful when PostgreSQL-backed content is unavailable", async ({ page }) => {
  await page.route("**/api/v1/skills", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Database unavailable" } }) }));
  await page.goto("/skills", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Skills I’m building." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Flutter" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Dart" })).toBeVisible();
  await expect(page.getByRole("status")).toContainText("Showing skills from the portfolio profile");
});

test("Journey shows education and active projects without database records", async ({ page }) => {
  await page.route("**/api/v1/education", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Database unavailable" } }) }));
  await page.route("**/api/v1/projects?limit=12", (route) => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: { message: "Database unavailable" } }) }));
  await page.goto("/journey", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Where I’m learning" })).toBeVisible();
  await expect(page.getByText("Wolkite University").first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Student Exam Scheduler" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "AI-Based Surgical Monitoring System" })).toBeVisible();
});

test("mobile navigation opens and closes after selecting a route", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const menu = page.locator(".mobile-menu");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  const skillsLink = page.locator('.nav-links.is-open a[href="/skills"]');
  await expect(skillsLink).toBeVisible();
  await skillsLink.click();
  await expect(page).toHaveURL(/\/skills$/);
  await expect(menu).toHaveAttribute("aria-expanded", "false");
});