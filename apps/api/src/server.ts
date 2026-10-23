import { app } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./config/database.js";
import { logger } from "./utils/logger.js";

const server = app.listen(env.PORT, "0.0.0.0", () => logger.info({ port: env.PORT }, "Portfolio API listening"));

const shutdown = (signal: string): void => {
  logger.info({ signal }, "Shutting down portfolio API");
  server.close(() => {
    void prisma.$disconnect().finally(() => process.exit(0));
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
