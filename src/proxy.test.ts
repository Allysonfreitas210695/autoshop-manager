import { beforeEach, describe, expect, it, vi } from "vitest";

const getSessionCookieMock = vi.fn();

vi.mock("better-auth/cookies", () => ({
  getSessionCookie: getSessionCookieMock,
}));

const { proxy } = await import("@/proxy");

function reqFor(pathname: string) {
  return {
    nextUrl: { pathname },
    url: `http://localhost:3000${pathname}`,
  } as unknown as Parameters<typeof proxy>[0];
}

function isRedirect(response: Awaited<ReturnType<typeof proxy>>) {
  return response.status === 307 || response.status === 308;
}

describe("proxy route gating (SEC-03 / D-03)", () => {
  beforeEach(() => {
    getSessionCookieMock.mockReset();
  });

  it("redirects an unauthenticated dashboard request to /login with redirect param", async () => {
    getSessionCookieMock.mockReturnValue(null);
    const response = await proxy(reqFor("/orders"));
    expect(isRedirect(response)).toBe(true);
    const location = response.headers.get("location");
    expect(location).toContain("/login");
    expect(location).toContain("redirect=%2Forders");
  });

  it("redirects an authenticated request to /login back to /", async () => {
    getSessionCookieMock.mockReturnValue("token");
    const response = await proxy(reqFor("/login"));
    expect(isRedirect(response)).toBe(true);
    expect(response.headers.get("location")).toMatch(/\/$/);
  });

  it("redirects an authenticated request to /forgot-password back to /", async () => {
    getSessionCookieMock.mockReturnValue("token");
    const response = await proxy(reqFor("/forgot-password"));
    expect(isRedirect(response)).toBe(true);
  });

  it("allows an unauthenticated request to /forgot-password", async () => {
    getSessionCookieMock.mockReturnValue(null);
    const response = await proxy(reqFor("/forgot-password"));
    expect(isRedirect(response)).toBe(false);
  });

  it("allows an unauthenticated request to /reset-password", async () => {
    getSessionCookieMock.mockReturnValue(null);
    const response = await proxy(reqFor("/reset-password"));
    expect(isRedirect(response)).toBe(false);
  });

  it("allows an unauthenticated request to /track/[id] (public tracking)", async () => {
    getSessionCookieMock.mockReturnValue(null);
    const response = await proxy(reqFor("/track/abc123"));
    expect(isRedirect(response)).toBe(false);
  });
});
