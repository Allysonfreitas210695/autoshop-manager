import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ACTIONS_DIR = dirname(fileURLToPath(import.meta.url));

interface ExportBlock {
  name: string;
  body: string;
}

function exportBlocks(source: string): ExportBlock[] {
  const matches = [...source.matchAll(/export const (\w+)\s*=/g)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? source.length;
    return { name: match[1], body: source.slice(start, end) };
  });
}

describe("Inventory Actions Wiring", () => {
  const source = readFileSync(join(ACTIONS_DIR, "inventory.ts"), "utf8");
  const blocks = exportBlocks(source);

  const createPartBlock = blocks.find((b) => b.name === "createPartAction");
  const updateStockBlock = blocks.find((b) => b.name === "updateStockAction");
  const createPurchaseOrderBlock = blocks.find(
    (b) => b.name === "createPurchaseOrderAction",
  );

  it("createPartAction uses db.insert and revalidates inventory", () => {
    expect(createPartBlock?.body.includes("insert(services)")).toBe(true);
    expect(createPartBlock?.body.includes('revalidatePath("/inventory")')).toBe(
      true,
    );
  });

  it("updateStockAction uses db.update and revalidates inventory", () => {
    expect(updateStockBlock?.body.includes("update(services)")).toBe(true);
    expect(
      updateStockBlock?.body.includes('revalidatePath("/inventory")'),
    ).toBe(true);
  });

  it("createPurchaseOrderAction inserts order and items", () => {
    expect(
      createPurchaseOrderBlock?.body.includes("insert(purchaseOrders)"),
    ).toBe(true);
    expect(
      createPurchaseOrderBlock?.body.includes("insert(purchaseOrderItems)"),
    ).toBe(true);
  });
});
