import { describe, expect, it } from "vitest";
import { contactSchema } from "../pages/PublicPages";

describe("contact form validation", () => {
  it("accepts a complete valid message", () => {
    const result = contactSchema.safeParse({
      name: "Mubarek",
      email: "mubarek@example.com",
      subject: "Internship question",
      message: "I would like to discuss an opportunity.",
      website: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email and short messages", () => {
    const result = contactSchema.safeParse({ name: "M", email: "invalid", subject: "Hi", message: "Short", website: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a filled honeypot field", () => {
    const result = contactSchema.safeParse({ name: "Mubarek", email: "mubarek@example.com", subject: "Hello", message: "A message long enough.", website: "spam" });
    expect(result.success).toBe(false);
  });
});