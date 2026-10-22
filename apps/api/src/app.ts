import cors from "cors";
import { rateLimit } from "express-rate-limit";
import express from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { sessionPool } from "./config/database.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { contentRouter } from "./routes/content.js";
import { githubRouter } from "./routes/github.js";
import { uploadsRouter } from "./routes/uploads.js";
import { errorHandler, notFound } from "./middleware/error-handler.js";
import { openApiDocument } from "./openapi.js";
import { logger } from "./utils/logger.js";

const PgStore = connectPgSimple(session);
export const app = express();
if (env.NODE_ENV === "production") app.set("trust proxy", 1);

app.disable("x-powered-by");
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: env.NODE_ENV === "production" ? { directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    styleSrcAttr: ["'unsafe-inline'"], fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"], imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'", env.WEB_ORIGIN], objectSrc: ["'none'"], baseUri: ["'self'"], frameAncestors: ["'none'"],
  } } : false,
}));
app.use(cors({ origin: env.WEB_ORIGIN, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: ["Content-Type", "X-CSRF-Token"] }));
app.use(express.json({ limit: "10kb" }));
app.use(pinoHttp({ logger }));
app.use(session({
  name: "mubarek.sid",
  store: new PgStore({ pool: sessionPool, tableName: "session", createTableIfMissing: true }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, secure: env.NODE_ENV === "production", sameSite: "lax", maxAge: 1000 * 60 * 60 * 8 },
}));

const apiLimiter = rateLimit({ windowMs: 15 * 60_000, limit: 180, standardHeaders: "draft-8", legacyHeaders: false });
app.get("/healthz", (_request, response) => response.json({ status: "ok", service: "portfolio-api" }));
app.get("/healthz/ready", async (_request, response) => {
  try {
    await sessionPool.query("SELECT 1");
    response.json({ status: "ready", database: "connected" });
  } catch {
    response.status(503).json({ status: "not-ready", database: "unavailable" });
  }
});
app.get("/api/v1/openapi.json", (_request, response) => response.json(openApiDocument));
app.use("/api/v1/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/v1", apiLimiter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1", contentRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/github", githubRouter);
app.use("/api/v1/admin/uploads", uploadsRouter);
app.use("/api/v1/admin", adminRouter);
app.use(notFound, errorHandler);