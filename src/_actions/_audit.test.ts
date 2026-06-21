import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// SEC-02 / D-09: every exported server action must be built from
// `authActionClient` and declare a `.schema(...)`. This static guard reads each
// action source and fails if ANY current or future export skips that shape, so
// coverage cannot silently regress. No edits to the action files themselves.

const ACTIONS_DIR = dirname(fileURLToPath(import.meta.url));
const ACTION_FILES = [
  "appointments",
  "customers",
  "feedbacks",
  "inventory",
  "orders",
];

interface ExportBlock {
  name: string;
  body: string;
}

/** Split a source file into `export const NAME = ...` blocks (name + body). */
function exportBlocks(source: string): ExportBlock[] {
  const matches = [...source.matchAll(/export const (\w+)\s*=/g)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? source.length;
    return { name: match[1], body: source.slice(start, end) };
  });
}

describe("SEC-02 server-action coverage audit (D-09)", () => {
  for (const file of ACTION_FILES) {
    it(`every export in ${file}.ts uses authActionClient + .schema()`, () => {
      const source = readFileSync(join(ACTIONS_DIR, `${file}.ts`), "utf8");
      const blocks = exportBlocks(source);

      expect(blocks.length).toBeGreaterThan(0);

      for (const { name, body } of blocks) {
        expect(
          body.includes("authActionClient") || body.includes("actionClient"),
          `${file}.ts → "${name}" does not use an action client`,
        ).toBe(true);
        expect(
          body.includes(".schema("),
          `${file}.ts → "${name}" does not declare .schema()`,
        ).toBe(true);
      }
    });
  }

  it("covers all 18 known server actions across the five files", () => {
    const total = ACTION_FILES.reduce((sum, file) => {
      const source = readFileSync(join(ACTIONS_DIR, `${file}.ts`), "utf8");
      return sum + exportBlocks(source).length;
    }, 0);
    expect(total).toBe(18);
  });
});
