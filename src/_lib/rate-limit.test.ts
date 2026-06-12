import { beforeEach, describe, expect, it, vi } from "vitest";

// Ensure the env guard sees Upstash as configured BEFORE the module evaluates,
// so the limiter singletons are created (against the mocked client below).
process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

const limitMock = vi.fn();

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: () => ({ __mockRedis: true }) },
}));

vi.mock("@upstash/ratelimit", () => {
  class Ratelimit {
    limit = limitMock;
    static slidingWindow = vi.fn(() => ({ __mockLimiter: true }));
  }
  return { Ratelimit };
});

const {
  clientIp,
  limiterFor,
  loginLimiter,
  passwordRecoveryLimiter,
  registerLimiter,
} = await import("@/_lib/rate-limit");

function reqWith(forwardedFor?: string): Request {
  const headers = new Headers();
  if (forwardedFor !== undefined) {
    headers.set("x-forwarded-for", forwardedFor);
  }
  return new Request("http://localhost/api/auth/sign-in/email", { headers });
}

describe("clientIp", () => {
  it("returns the first hop of x-forwarded-for, trimmed", () => {
    expect(clientIp(reqWith("203.0.113.7, 70.41.3.18, 150.172.238.178"))).toBe(
      "203.0.113.7",
    );
  });

  it("falls back to a constant when x-forwarded-for is absent", () => {
    expect(clientIp(reqWith())).toBe("127.0.0.1");
  });
});

describe("limiterFor", () => {
  it("maps the verified Better Auth segments to the right limiter", () => {
    expect(limiterFor("/api/auth/sign-in/email")).toBe(loginLimiter);
    expect(limiterFor("/api/auth/sign-up/email")).toBe(registerLimiter);
    expect(limiterFor("/api/auth/request-password-reset")).toBe(
      passwordRecoveryLimiter,
    );
    expect(limiterFor("/api/auth/forget-password")).toBe(
      passwordRecoveryLimiter,
    );
    expect(limiterFor("/api/auth/reset-password")).toBe(
      passwordRecoveryLimiter,
    );
  });

  it("returns null for non-rate-limited auth paths", () => {
    expect(limiterFor("/api/auth/get-session")).toBeNull();
    expect(limiterFor("/api/auth/sign-out")).toBeNull();
  });
});

describe("limit result", () => {
  beforeEach(() => {
    limitMock.mockReset();
  });

  it("surfaces a { success: false } result to drive the 429 path", async () => {
    limitMock.mockResolvedValue({ success: false });
    const limiter = limiterFor("/api/auth/sign-in/email");
    expect(limiter).not.toBeNull();

    const result = await limiter!.limit("203.0.113.7");
    expect(result.success).toBe(false);
    expect(limitMock).toHaveBeenCalledWith("203.0.113.7");
  });

  it("surfaces a { success: true } result to allow the request through", async () => {
    limitMock.mockResolvedValue({ success: true });
    const limiter = limiterFor("/api/auth/sign-up/email");
    const result = await limiter!.limit("203.0.113.7");
    expect(result.success).toBe(true);
  });
});
