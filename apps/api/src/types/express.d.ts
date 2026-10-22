import "express-session";

declare module "express-session" {
  interface SessionData {
    adminId?: string;
    adminRole?: "ADMIN";
    csrfToken?: string;
  }
}