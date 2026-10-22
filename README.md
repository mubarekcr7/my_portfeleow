# Mubarek Mohammed Portfolio

A React and TypeScript portfolio with a versioned Express API, PostgreSQL through Prisma, a cookie-authenticated administrator area, GitHub repository data, contact-message persistence, and optional Cloudinary/SMTP integrations.

## Requirements

- Windows 10/11 with PowerShell 5.1 or PowerShell 7
- Node.js 24 LTS and npm 11
- Docker Desktop with Linux containers, or a PostgreSQL 16+ server
- Git

Use `npm.cmd` in PowerShell if your execution policy blocks the `npm.ps1` shim. No PowerShell execution policy change is needed.

## Local Setup

From this folder:

```powershell
Copy-Item .env.example .env
```

Edit `.env` and replace `SESSION_SECRET` with a random value of at least 32 characters. Keep `.env` out of Git. The sample Compose database credentials are for local development only.

Start PostgreSQL with Docker Desktop:

```powershell
npm.cmd run db:up
```

Or create a PostgreSQL database and user yourself, then set `DATABASE_URL` in `.env` to that database.

Install, generate the client, migrate, and seed:

```powershell
npm.cmd install
npm.cmd run prisma:generate --workspace @mubarek/api
npm.cmd run db:migrate
npm.cmd run db:seed
```

Create the first administrator interactively. The password is entered in the terminal, hashed with Argon2id, and is never written to project files:

```powershell
npm.cmd run admin:create
```

Start the web app and API together:

```powershell
npm.cmd run dev
```

- Website: <http://localhost:5173>
- Admin login: <http://localhost:5173/admin/login>
- API health: <http://localhost:4000/healthz>
- API readiness: <http://localhost:4000/healthz/ready>
- OpenAPI docs: <http://localhost:4000/api/v1/docs>

The API does not expose administrator registration. Seed records contain only the supplied biography, skills, university, and project concepts. Projects begin as drafts and must be reviewed and published in the admin area.

To use a local profile photo, place the image at `apps/web/public/profile.jpg`; the homepage falls back to its initials artwork until that file is present. The admin profile also accepts a hosted profile-image URL.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by Prisma and sessions |
| `SESSION_SECRET` | At least 32 characters; rotate per environment |
| `WEB_ORIGIN` | Exact frontend origin for credentialed CORS |
| `PUBLIC_CONTACT_EMAIL` | Optional contact-notification recipient |
| `PUBLIC_LINKEDIN_URL` | Optional LinkedIn profile URL |
| `PUBLIC_CV_URL` | Public PDF fallback served by `/api/v1/resume`; defaults to the file in `my-cv` without listing that repository |
| `GITHUB_USERNAME` | Public repository account; defaults to `mubarekcr7` |
| `GITHUB_TOKEN` | Optional server-side token for higher GitHub API limits |
| `SMTP_*` | Optional outbound email transport; messages are still stored if email fails |
| `CLOUDINARY_*` | Optional production media storage; required to enable CV/image upload |
| `SITE_URL` | Public origin used to generate the sitemap and robots file during frontend build |

Never put credentials in `VITE_*` variables. Only public, non-secret frontend settings belong there.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm.cmd run dev` | Start Vite and Express |
| `npm.cmd run typecheck` | Typecheck both workspaces |
| `npm.cmd test` | Run Vitest unit and API tests |
| `npm.cmd run test:e2e` | Run Playwright public-site tests |
| `npm.cmd run build` | Build API and frontend for production |
| `npm.cmd run db:migrate` | Create/apply a local Prisma migration |
| `npm.cmd run db:seed` | Add initial portfolio records idempotently |
| `npm.cmd run admin:create` | Securely create an administrator |
| `npm.cmd audit --omit=dev` | Audit production dependencies |

For Playwright's first run, install a browser if required:

```powershell
npx playwright install chromium
```

## Admin Features

The administrator area provides database-backed overview counts, paginated and searchable projects/skills/education/experience/services/messages, create/edit/delete flows, message status updates, project feature/order fields, project gallery endpoints, profile and SEO settings, and protected Cloudinary upload controls. Every admin API route checks the session; browser mutations also require a CSRF token.

Image and CV uploads accept JPEG, PNG, WebP, or PDF (up to 10 MB), check file signatures, and require Cloudinary credentials. Local filesystem upload storage is intentionally not used because many production hosts have ephemeral disks. Project galleries can be uploaded, listed, and removed from the project editor.

## Tests and Database

Vitest includes contact-schema and database-independent API tests for health, authorization, route errors, and invalid contact input. Those tests do not require a running PostgreSQL server. Full migration, seed, contact-persistence, authenticated CRUD, and end-to-end admin workflow verification require a separate PostgreSQL test database and are not run automatically against production.

The Playwright suite covers public homepage navigation, a project not-found state, contact validation, and mobile navigation. It does not create or delete database content.

## Production Deployment

1. Provision managed PostgreSQL, a Node.js API host, and a static frontend host. Configure Cloudinary and SMTP accounts only if uploads/email are needed.
2. Configure API environment variables: production `DATABASE_URL`, a fresh `SESSION_SECRET`, exact `WEB_ORIGIN`, and optional integration credentials. Use HTTPS. The API sets `Secure`, `HttpOnly`, `SameSite=Lax` session cookies and trusts one reverse proxy.
3. Build/deploy the API with `npm ci`, `npm run prisma:generate --workspace @mubarek/api`, and `npm run build --workspace @mubarek/api`; start using `npm run start --workspace @mubarek/api`.
4. Before release, run `npm run prisma:deploy --workspace @mubarek/api` against the production database. Never use `migrate dev` against production.
5. Create the first administrator in a trusted one-off shell with `npm run admin:create --workspace @mubarek/api`.
6. Build the frontend with `SITE_URL=https://your-domain.example npm run build --workspace @mubarek/web`. Set the frontend API base to the API origin's `/api/v1` if deploying the web and API on different origins; also set API `WEB_ORIGIN` to the frontend origin.
7. Configure static-host rewrites to serve `index.html` for React Router routes. The API's `/healthz` is a liveness endpoint and `/healthz/ready` checks PostgreSQL.

The frontend/API split must use HTTPS and a credentialed CORS allowlist. If cross-site cookie deployment is required, configure `SameSite=None; Secure`, explicit CSRF validation, and matching CORS origins before launch; do not use wildcard origins. Back up PostgreSQL regularly and test restoration. Keep media credentials and SMTP secrets on the API only.

## Security Notes

This is a deployable foundation, not a claim of perfect security. Before a public launch, run the full integration/e2e suites against an isolated database, configure HTTPS and production CORS, rotate secrets, set up email and media providers, review hosting proxy/cookie behavior, and add operational monitoring/backups. Uploaded media deletion should be reconciled with project/gallery deletion as the media lifecycle is finalized.