import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Phase 10 finance actions: static source-assertion tests for finance.ts wiring.
// No DB connection, no pg mock — mirrors customers.test.ts / orders.test.ts pattern.

const ACTIONS_DIR = dirname(fileURLToPath(import.meta.url));

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

describe("Phase 10 finance actions wiring", () => {
  const source = readFileSync(join(ACTIONS_DIR, "finance.ts"), "utf8");
  const blocks = exportBlocks(source);

  const create = blocks.find((b) => b.name === "createTransactionAction");
  const update = blocks.find((b) => b.name === "updateTransactionAction");
  const remove = blocks.find((b) => b.name === "deleteTransactionAction");

  it("exporta as três actions de transação", () => {
    expect(create, "createTransactionAction deve existir").toBeDefined();
    expect(update, "updateTransactionAction deve existir").toBeDefined();
    expect(remove, "deleteTransactionAction deve existir").toBeDefined();
  });

  it("todas usam authActionClient + .schema()", () => {
    for (const block of [create, update, remove]) {
      expect(block?.body.includes("authActionClient")).toBe(true);
      expect(block?.body.includes(".schema(")).toBe(true);
    }
  });

  it("update e delete escopam por id (uuid)", () => {
    expect(update?.body.includes("z.string().uuid()")).toBe(true);
    expect(remove?.body.includes("z.string().uuid()")).toBe(true);
    expect(update?.body.includes("eq(transactions.id")).toBe(true);
    expect(remove?.body.includes("eq(transactions.id")).toBe(true);
  });

  it("create/update/delete revalidam /finance e /analytics", () => {
    for (const block of [create, update, remove]) {
      expect(block?.body.includes('revalidatePath("/finance")')).toBe(true);
      expect(block?.body.includes('revalidatePath("/analytics")')).toBe(true);
    }
  });

  it("amount é coerciado para número positivo", () => {
    expect(source.includes("z.coerce.number().positive(")).toBe(true);
  });
});
