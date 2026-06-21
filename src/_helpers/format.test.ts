import { describe, expect, it } from "vitest";

import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatLongDate,
  formatPlate,
  formatTime,
} from "./format";

describe("Format Helpers", () => {
  describe("formatCurrency", () => {
    it("formats numbers as BRL currency", () => {
      // In JS, toLocaleString spaces can vary (breaking spaces). We use normalized tests.
      expect(formatCurrency(1234.56).replace(/\s/g, " ")).toContain(
        "R$ 1.234,56",
      );
      expect(formatCurrency(0).replace(/\s/g, " ")).toContain("R$ 0,00");
    });
  });

  describe("formatDate", () => {
    it("formats date to DD/MM/YYYY in BR timezone", () => {
      const date = new Date("2026-06-09T12:00:00Z");
      expect(formatDate(date)).toBe("09/06/2026");
    });
  });

  describe("formatDateTime", () => {
    it("formats datetime properly", () => {
      // Using UTC time to avoid local machine timezone issues.
      // BR_TIME_ZONE is UTC-3, so 15:00 UTC is 12:00 BRT
      const date = new Date("2026-06-09T15:00:00Z");
      expect(formatDateTime(date)).toBe("09/06/2026, 12:00");
    });
  });

  describe("formatTime", () => {
    it("formats time properly", () => {
      const date = new Date("2026-06-09T15:30:00Z");
      expect(formatTime(date)).toBe("12:30");
    });
  });

  describe("formatLongDate", () => {
    it("formats long date properly", () => {
      const date = new Date("2026-06-09T12:00:00Z");
      expect(formatLongDate(date)).toMatch(/9 de junho de 2026/i);
    });
  });

  describe("formatPlate", () => {
    it("adds hyphen to old format plates", () => {
      expect(formatPlate("abc1234")).toBe("ABC-1234");
      expect(formatPlate("ABC-1234")).toBe("ABC-1234");
    });

    it("does not add hyphen to Mercosul plates", () => {
      expect(formatPlate("abc1d23")).toBe("ABC1D23");
      expect(formatPlate("ABC1D23")).toBe("ABC1D23");
    });

    it("removes invalid characters and truncates to 7 chars", () => {
      expect(formatPlate("ab-c12345")).toBe("ABC-1234");
      expect(formatPlate("!@#abc1d23")).toBe("ABC1D23");
    });
  });
});
