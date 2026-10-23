# Portfolio Hosting and MySQL Conversion Plan

## Product and implementation

Turn the imported Mubarek Mohammed portfolio into a permanent publicly hosted website while preserving its existing React/TypeScript pages, API, content model, administrator experience, contact workflow, GitHub integration, and optional Cloudinary/SMTP integrations. Use Manus-managed hosting services: a static frontend build served from `apps/web/dist`, an Express API container from `Dockerfile`, and the provisioned MySQL-compatible managed database. Published `/api/*` and `/healthz*` requests go to the container; other page requests use the static app with SPA fallback so public details and nested admin pages can be loaded directly.

Keep the existing two-workspace npm project and API version structure. Convert Prisma's PostgreSQL provider to MySQL, store project arrays in MySQL JSON fields, use Prisma's MariaDB driver adapter, retain schema relations, and persist administrator sessions in the same database. The runtime reads the platform's MySQL/TLS URL without exposing credentials to frontend bundles; the Prisma CLI adds strict TLS certificate verification for migrations. A fresh MySQL migration establishes the schema, and the idempotent repository seed initializes profile, settings, education, skills, and starter projects. PostgreSQL data export was not available, so old database rows cannot be imported unless supplied separately.

Keep the existing password-hashed administrator login and CSRF-protected mutations. Preview/production session cookies use `SameSite=None; Secure` for HTTPS; local HTTP development retains its explicit separate settings. Do not add public registration. Durable portfolio/contact/session records live in the database; Cloudinary media remains optional external storage and SMTP remains optional outbound email.

The user-provided CV PDF is included as `apps/web/public/Mubarek-Mohammed-CV.pdf` so it is emitted into the static build and works in Preview without depending on the API. Persist the relative public path in the profile seed and managed database; the homepage and CV page link directly to the asset and request a download. Retain the API proxy for other supported external CV sources. The platform-storage URL returned during upload was denied in both stable-path and signed-download checks, so it is not used by the site.

## Design

Reuse the site's existing **dark technical editorial portfolio** rather than replacing its visual identity. The palette grounds content in near-black and deep blue-gray surfaces, with a crisp periwinkle-blue accent that signals links and interactive state. The layout pairs a roomy, asymmetrical hero with compact editorial section labels, project cards, and a responsive navigation system. Fine engineering-grid lines, framed M monogramography, and code-window details act as recurring signatures without competing with the writing.

Space Grotesk provides readable, contemporary headlines and body copy; DM Mono distinguishes technical labels, metadata, and code-inspired microcopy. Interactions stay direct and keyboard-accessible: clear focus states, short hover transitions, modest image/card movement, and reduced visual surprise. The existing code already defines the M-dot wordmark and portfolio monogram; retain it. Brand essence: a student developer's evidence-led portfolio for collaborators and early-career opportunities; curious, precise, and practical. The brand voice is concise and specific—for example, “Building, learning, and getting better one project at a time.” and “See what I’ve been working on.” The ownable brand color is the existing bright periwinkle blue (`#8ba7ff`).

## Project structure

- `apps/web/src`: React routes, portfolio pages, admin UI, shared components, API client, and existing dark technical styles.
- `apps/web/public`: favicon, robots file, and the route manifest used by the host.
- `apps/web/scripts`: static SEO and sitemap generation during builds.
- `apps/api/src`: Express server, validation/configuration, authentication/session middleware, portfolio/contact/admin/GitHub/upload routes, and API tests.
- `apps/api/prisma`: MySQL schema, migrations, and idempotent seed/bootstrap commands.
- `Dockerfile`: clean dependency install, full project compile, and production API image.
- Root `package.json`, lockfile, `docker-compose.yml`, `.env.example`, and `README.md`: pinned npm workspace, local MySQL development, deployment configuration, and operator guidance.
