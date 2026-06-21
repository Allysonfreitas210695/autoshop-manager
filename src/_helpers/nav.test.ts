import { describe, expect, it } from "vitest";

import { navItems } from "./nav";

describe("Navigation Helpers", () => {
  it("exports an array of navigation items", () => {
    expect(Array.isArray(navItems)).toBe(true);
    expect(navItems.length).toBeGreaterThan(0);
  });

  it("navItems have required properties", () => {
    navItems.forEach((item) => {
      expect(item).toHaveProperty("label");
      expect(typeof item.label).toBe("string");
      expect(item).toHaveProperty("href");
      expect(typeof item.href).toBe("string");
      expect(item).toHaveProperty("icon");
    });
  });
});
