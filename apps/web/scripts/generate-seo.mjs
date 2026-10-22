import { mkdir, writeFile } from "node:fs/promises";

const siteUrl = process.env.SITE_URL?.replace(/\/$/, "");
if (!siteUrl || !URL.canParse(siteUrl)) {
  console.warn("SITE_URL is not configured; skipping sitemap generation. Set SITE_URL for production builds.");
  process.exit(0);
}

const routes = ["/", "/about", "/skills", "/projects", "/education", "/experience", "/services", "/contact", "/resume"];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((path) => `<url><loc>${siteUrl}${path}</loc></url>`).join("")}</urlset>\n`;
await mkdir("dist", { recursive: true });
await writeFile("dist/sitemap.xml", sitemap, "utf8");
await writeFile("dist/robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${siteUrl}/sitemap.xml\n`, "utf8");