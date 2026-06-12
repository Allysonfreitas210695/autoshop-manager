import { describe, expect, it } from "vitest";

import nextConfig from "../../next.config";

async function headerMapForRootRule(): Promise<Record<string, string>> {
  const rules = (await nextConfig.headers?.()) ?? [];
  const rootRule = rules.find((rule) => rule.source === "/(.*)");
  expect(rootRule).toBeDefined();
  return Object.fromEntries(
    rootRule!.headers.map((header) => [header.key, header.value]),
  );
}

describe("security headers (SEC-04 / D-01 + D-02)", () => {
  it("applies a /(.*) rule with the baseline security headers", async () => {
    const headers = await headerMapForRootRule();

    expect(headers["Strict-Transport-Security"]).toContain("includeSubDomains");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Permissions-Policy"]).toContain("microphone=()");
    expect(headers["Permissions-Policy"]).toContain("geolocation=()");
  });

  it("ships a report-only CSP and NO enforcing CSP", async () => {
    const headers = await headerMapForRootRule();

    expect(headers["Content-Security-Policy-Report-Only"]).toBeDefined();
    expect(headers["Content-Security-Policy"]).toBeUndefined();
    expect(headers["Content-Security-Policy-Report-Only"]).toContain(
      "report-uri /api/csp-report",
    );
  });
});
