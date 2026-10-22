import "../../src/config/env.js";
import argon2 from "argon2";
import { confirm, input, password } from "@inquirer/prompts";
import { prisma } from "../config/database.js";

async function main(): Promise<void> {
  const email = (await input({ message: "Administrator email", validate: (value) => /^\S+@\S+\.\S+$/.test(value) || "Enter a valid email address." })).trim().toLowerCase();
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) throw new Error("An administrator with this email already exists.");
  const secret = await password({ message: "Administrator password (minimum 14 characters)", mask: "*", validate: (value) => value.length >= 14 || "Use at least 14 characters." });
  const repeated = await password({ message: "Confirm password", mask: "*" });
  if (secret !== repeated) throw new Error("Passwords did not match.");
  if (!await confirm({ message: `Create administrator ${email}?`, default: false })) return;
  const passwordHash = await argon2.hash(secret, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  await prisma.adminUser.create({ data: { email, passwordHash } });
  console.info("Administrator created. No password was written to the project files.");
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Administrator setup failed.");
  process.exitCode = 1;
}).finally(async () => prisma.$disconnect());