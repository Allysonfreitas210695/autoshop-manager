import { describe, expect, it } from "vitest";

import {
  loginSchema,
  passwordSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/_schemas/auth";

describe("passwordSchema (SEC-01 / D-08)", () => {
  it("rejects a password shorter than 8 characters", () => {
    expect(passwordSchema.safeParse("abc12").success).toBe(false);
  });

  it("rejects a password with no number", () => {
    expect(passwordSchema.safeParse("abcdefgh").success).toBe(false);
  });

  it("rejects a password with no letter", () => {
    expect(passwordSchema.safeParse("12345678").success).toBe(false);
  });

  it("accepts a password with >=8 chars, a letter and a number", () => {
    expect(passwordSchema.safeParse("abcd1234").success).toBe(true);
  });
});

describe("registerSchema / resetPasswordSchema reuse the policy", () => {
  it("registerSchema rejects a password with no number", () => {
    const result = registerSchema.safeParse({
      name: "Allyson",
      email: "user@example.com",
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    });
    expect(result.success).toBe(false);
  });

  it("resetPasswordSchema rejects a password with no number", () => {
    const result = resetPasswordSchema.safeParse({
      password: "abcdefgh",
      confirmPassword: "abcdefgh",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema does NOT leak the complexity policy", () => {
  it("accepts an 8-char letters-only password at login", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "abcdefgh",
    });
    expect(result.success).toBe(true);
  });
});
