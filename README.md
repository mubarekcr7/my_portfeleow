# Mubarek Mohammed Portfolio

A React and TypeScript portfolio with a versioned Express API, a cookie-authenticated administrator area, GitHub repository data, durable contact messages, and optional Cloudinary/SMTP integrations. The original PostgreSQL schema has been adapted for MySQL-compatible storage. The site retains its existing pages, project content, and dark technical visual style.

## Requirements

- Node.js 24 LTS and npm 11.6.2 (pinned in `packageManager`)
- Docker with MySQL 8.4 for a local database, or another MySQL-compatible `DATABASE_URL`
- Git

On Windows, use `npm.cmd` in PowerShell if the `npm.ps1` shim is blocked; no PowerShell execution-policy change is needed.

## Local setup

Copy `.env.example` to `.env`, then replace `SESSION_SECRET` with a random value of at least 32 characters. Keep `.env` out of Git. The example's `SESSION_COOKIE_SECURE=false` and `SESSION_COOKIE_SAME_SITE=lax` are only for plain-HTTP localhost; do not use them for HTTPS Preview or the public website.

Start MySQL and set up the project:

```sh
npm run db:up
npm ci
npm run prisma:generate --workspace @mubarek/api
npm run db:migrate
npm run db:seed
npm run admin:create
npm run dev
```

The website and admin login run at `http://localhost:3000`. Vite proxies `/api` and `/healthz` to the API at `http://localhost:4001`. The API does not expose public administrator registration. Create the first administrator through the interactive terminal prompt; its password is hashed with Argon2id and never written to project files. Seed records include in-progress and draft projects; review their details and publish only the work you want visible from the admin area.

To use the included local profile image, keep `apps/web/public/profile.jpg`; the homepage falls back to initials artwork when that image is absent. The admin profile also accepts a hosted profile-image URL.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | MySQL/MariaDB DSN used by Prisma and persistent admin sessions. |
| `SESSION_SECRET` | At least 32 characters; use a protected project value for managed Preview and production. |
| `SESSION_COOKIE_SECURE` / `SESSION_COOKIE_SAME_SITE` | Managed default: `true` / `none`. The local `.env.example` sets `false` / `lax` for localhost HTTP only. |
| `WEB_ORIGIN` | Exact frontend origin for credentialed CORS; local default is `http://localhost:3000`. Published frontend and API share one origin. |
| `PUBLIC_CONTACT_EMAIL` | Optional contact-notification recipient. |
| `PUBLIC_LINKEDIN_URL` | Optional LinkedIn profile URL. |
| `PUBLIC_CV_URL` | Public PDF fallback served by `/api/v1/resume`. |
| `GITHUB_USERNAME` / `GITHUB_TOKEN` | Public repository account and optional server-side token for higher GitHub API limits. |
| `SMTP_*` | Optional outbound email transport; contact messages remain in the database if delivery is unavailable. |
| `CLOUDINARY_*` | Optional credentials for profile/project media uploads. |
| `SITE_URL` | Optional public URL used when generating canonical/sitemap build metadata. |

Never put credentials in `VITE_*` variables. Only public, non-secret frontend settings belong there.

## Data and migrations

Prisma uses the MySQL provider and MariaDB driver adapter. Project `features` and `technologies` remain JSON arrays; existing relations and status enums are retained. The old PostgreSQL migration history is archived under `apps/api/prisma/migrations-postgresql-archive`, and a fresh MySQL migration is used by the managed database. No PostgreSQL instance or export was supplied, so this conversion does not copy rows from an external database. The seed upserts the repository's starter profile, skills, education, settings, and projects without overwriting existing records.

`npm run db:migrate` is for local Prisma development. To apply the committed schema to the managed database, use `npm run db:deploy`; `npm run db:seed` adds the initial content. The initial MySQL migration and idempotent repository seed have already been applied to this project's managed database. The managed development and published application share the same database. Do not run tests or cleanup scripts that write/delete sample content against it.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite and Express. |
| `npm run build` | Build the frontend and API. |
| `npm run typecheck` | Typecheck both workspaces. |
| `npm test` | Run database-independent unit and API tests. |
| `npm run test:e2e` | Run Playwright public-site tests. |
| `npm run db:up` / `npm run db:down` | Start/stop local MySQL. |
| `npm run db:migrate` | Create/apply a local Prisma migration. |
| `npm run db:deploy` | Apply committed migrations (also used for a fresh managed schema). |
| `npm run db:seed` | Idempotently add starter portfolio content. |
| `npm run admin:create` | Securely create the first administrator. |

The existing API unit suite avoids database writes. Database-integrated admin/contact verification requires a separate isolated MySQL instance.

## Administrator and integrations

The admin area provides database-backed overview counts, paginated/searchable projects, skills, education, experience, services and messages, create/edit/delete flows, message status updates, project feature/order fields, project galleries, profile and SEO settings, and protected Cloudinary upload controls. Every admin API route checks the session; browser mutations also require a CSRF token. Uploaded files are not stored on the container filesystem.

Cloudinary and SMTP remain optional. Leave credentials unset if uploads/email are unused. GitHub repository data is fetched server-side from the public profile, with an optional token to raise API limits.

## Managed hosting

The site uses the platform's managed MySQL database. The static host serves the built React output and routes `/api/*` and `/healthz` to the Express container; the SPA fallback supports direct visits to portfolio, project-detail, and nested admin routes. The container binds to the platform-provided `PORT` (3000 by default). `/healthz/ready` is unauthenticated and checks the database connection.

For any fresh target database, apply `npm run db:deploy` and `npm run db:seed` before publication. The existing `npm run admin:create` command securely prompts for the first administrator in a trusted terminal; public registration is not enabled. Managed Preview and production default to `SameSite=None; Secure` cookies and trust one platform reverse proxy. Database records live in MySQL, not the temporary container filesystem.
