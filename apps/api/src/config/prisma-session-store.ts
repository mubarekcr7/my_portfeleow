import session from "express-session";
import type { SessionData } from "express-session";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "./database.js";

const fallbackSessionLifetimeMs = 8 * 60 * 60 * 1000;
type GetCallback = Parameters<session.Store["get"]>[1];
type SetCallback = Parameters<session.Store["set"]>[2];
type DestroyCallback = Parameters<session.Store["destroy"]>[1];

function sessionExpiry(value: SessionData): Date {
  const cookieExpiry = value.cookie.expires;
  if (cookieExpiry instanceof Date) return new Date(cookieExpiry.getTime());
  return new Date(Date.now() + Number(value.cookie.originalMaxAge ?? fallbackSessionLifetimeMs));
}

export class PrismaSessionStore extends session.Store {
  override get(sid: string, callback: GetCallback): void {
    void prisma.session.findUnique({ where: { sid } }).then((stored) => {
      if (!stored || stored.expires.getTime() <= Date.now()) {
        if (stored) void prisma.session.deleteMany({ where: { sid } }).catch(() => undefined);
        callback(null, null);
        return;
      }
      callback(null, stored.data as unknown as SessionData);
    }).catch((error: unknown) => callback(error));
  }

  override set(sid: string, value: SessionData, callback?: SetCallback): void {
    const complete = callback ?? (() => undefined);
    let data: Prisma.InputJsonValue;
    try {
      data = JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
    } catch (error) {
      complete(error);
      return;
    }
    const expires = sessionExpiry(value);
    if (Number.isNaN(expires.getTime())) {
      complete(new Error("The session expiry is invalid."));
      return;
    }
    void prisma.session.upsert({
      where: { sid },
      create: { sid, data, expires },
      update: { data, expires },
    }).then(() => complete(null), (error: unknown) => complete(error));
  }

  override destroy(sid: string, callback?: DestroyCallback): void {
    const complete = callback ?? (() => undefined);
    void prisma.session.deleteMany({ where: { sid } })
      .then(() => complete(null), (error: unknown) => complete(error));
  }

  override touch(sid: string, value: SessionData, callback?: SetCallback): void {
    const complete = callback ?? (() => undefined);
    const expires = sessionExpiry(value);
    void prisma.session.updateMany({ where: { sid }, data: { expires } })
      .then(() => complete(null), (error: unknown) => complete(error));
  }
}
