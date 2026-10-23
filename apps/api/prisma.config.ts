import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../../.env") });

function migrationDatasourceUrl(): string | undefined {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return undefined;
  const url = new URL(connectionString);
  // Prisma's native MySQL schema engine uses sslaccept; the managed URL also
  // carries the MariaDB connector's strict certificate option. Leave local
  // plain-HTTP MySQL connection strings unchanged.
  if (url.searchParams.has("ssl") && !url.searchParams.has("sslaccept")) {
    url.searchParams.set("sslaccept", "strict");
  }
  return url.toString();
}

const datasourceUrl = migrationDatasourceUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(datasourceUrl ? { datasource: { url: datasourceUrl } } : {}),
});
