import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
import { env } from "./env.js";

const connection = new URL(env.DATABASE_URL);
const tlsSetting = connection.searchParams.get("ssl");
if (!tlsSetting && env.NODE_ENV === "production") {
  throw new Error("The production MySQL connection must include TLS settings.");
}

const parsedTls = tlsSetting
  ? JSON.parse(tlsSetting) as boolean | { rejectUnauthorized?: boolean }
  : undefined;
if (parsedTls === false) throw new Error("The configured MySQL connection must require TLS.");
const ssl = parsedTls === undefined
  ? undefined
  : typeof parsedTls === "boolean"
    ? true
    : { ...parsedTls, rejectUnauthorized: true };

// The managed URI carries SSL as JSON; MariaDB Connector expects it as a pool option.
const adapter = new PrismaMariaDb({
  host: connection.hostname,
  port: Number(connection.port || 3306),
  user: decodeURIComponent(connection.username),
  password: decodeURIComponent(connection.password),
  database: decodeURIComponent(connection.pathname.slice(1)),
  ...(ssl === undefined ? {} : { ssl }),
  connectionLimit: 10,
});

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
});
