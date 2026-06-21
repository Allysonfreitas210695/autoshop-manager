import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Phase 6 D-01..D-06: static source-assertion tests for orders.ts wiring.
// No DB connection, no pg mock — mirrors _audit.test.ts pattern exactly.

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

describe("Phase 6 orders actions wiring (D-01..D-06)", () => {
  const source = readFileSync(join(ACTIONS_DIR, "orders.ts"), "utf8");
  const blocks = exportBlocks(source);

  const updateBlock = blocks.find((b) => b.name === "updateOrderStatusAction");
  const approveBlock = blocks.find((b) => b.name === "approveOrderItemAction");
  const addOrderItemBlock = blocks.find((b) => b.name === "addOrderItemAction");

  // D-01: transaction insert guarded by completed check
  it('D-01: updateOrderStatusAction inserts a transactions row guarded by status === "completed"', () => {
    expect(
      updateBlock?.body.includes("db.insert(transactions)"),
      "updateOrderStatusAction must contain db.insert(transactions)",
    ).toBe(true);

    expect(
      updateBlock?.body.includes('"completed"') ||
        updateBlock?.body.includes("'completed'"),
      'updateOrderStatusAction must guard the insert with a === "completed" check',
    ).toBe(true);
  });

  // D-02: transaction row fields
  it("D-02: transactions row has correct fields (description with O.S. #, category, type, status, serviceOrderId)", () => {
    expect(
      updateBlock?.body.includes("O.S. #"),
      'transactions description must use "O.S. #" with orderNumber',
    ).toBe(true);

    expect(
      updateBlock?.body.includes('category: "Serviço"'),
      'transactions row must set category: "Serviço"',
    ).toBe(true);

    expect(
      updateBlock?.body.includes('type: "income"'),
      'transactions row must set type: "income"',
    ).toBe(true);

    expect(
      updateBlock?.body.includes('status: "paid"'),
      'transactions row must set status: "paid"',
    ).toBe(true);

    expect(
      updateBlock?.body.includes("serviceOrderId"),
      "transactions row must set serviceOrderId",
    ).toBe(true);
  });

  // D-01 + D-02: returning clause captures orderNumber and totalAmount
  it("D-01/D-02: serviceOrders update uses .returning( capturing orderNumber and totalAmount", () => {
    expect(
      updateBlock?.body.includes(".returning("),
      "updateOrderStatusAction must use .returning( to capture orderNumber and totalAmount",
    ).toBe(true);

    expect(
      updateBlock?.body.includes("orderNumber"),
      ".returning( must capture orderNumber",
    ).toBe(true);

    expect(
      updateBlock?.body.includes("totalAmount"),
      ".returning( must capture totalAmount",
    ).toBe(true);
  });

  // OS-03: updatedAt set on status change
  it("OS-03: updateOrderStatusAction sets updatedAt: new Date() on the serviceOrders update", () => {
    expect(
      updateBlock?.body.includes("updatedAt: new Date()"),
      "updateOrderStatusAction must set updatedAt: new Date()",
    ).toBe(true);
  });

  // D-05: revalidatePath for finance and analytics
  it("D-05: updateOrderStatusAction revalidates /orders, /orders/[id], /finance, /analytics", () => {
    expect(
      updateBlock?.body.includes('revalidatePath("/orders")'),
      'must revalidatePath("/orders")',
    ).toBe(true);

    expect(
      updateBlock?.body.includes('revalidatePath("/finance")'),
      'must revalidatePath("/finance")',
    ).toBe(true);

    expect(
      updateBlock?.body.includes('revalidatePath("/analytics")'),
      'must revalidatePath("/analytics")',
    ).toBe(true);
  });

  // D-03: totalAmount recalculated from approved items via re-query
  it("D-03/D-04: approveOrderItemAction re-queries approved items and reduces with Number(unitPrice)", () => {
    expect(
      approveBlock?.body.includes("approved"),
      "approveOrderItemAction must re-query items filtered by approved",
    ).toBe(true);

    expect(
      approveBlock?.body.includes("Number("),
      "approveOrderItemAction must use Number() on unitPrice",
    ).toBe(true);

    expect(
      approveBlock?.body.includes(".reduce("),
      "approveOrderItemAction must compute total via .reduce(",
    ).toBe(true);
  });

  // D-03: db.update(serviceOrders) with totalAmount: String( and updatedAt
  it("D-03: approveOrderItemAction calls db.update(serviceOrders) with totalAmount: String( and updatedAt: new Date()", () => {
    expect(
      approveBlock?.body.match(/db\s*\.\s*update\(serviceOrders\)/) !== null,
      "approveOrderItemAction must call db.update(serviceOrders)",
    ).toBe(true);

    expect(
      approveBlock?.body.includes("totalAmount: String("),
      "approveOrderItemAction must set totalAmount: String(...)",
    ).toBe(true);

    expect(
      approveBlock?.body.includes("updatedAt: new Date()"),
      "approveOrderItemAction must set updatedAt: new Date()",
    ).toBe(true);
  });

  // D-06: revalidatePath for budget and order detail
  it("D-06: approveOrderItemAction revalidates /orders/[id]/budget and /orders/[id]", () => {
    expect(
      approveBlock?.body.includes("/budget"),
      "approveOrderItemAction must revalidatePath the /budget path",
    ).toBe(true);

    // Check for the detail path revalidation (second revalidatePath call without /budget)
    const revalidateCalls =
      approveBlock?.body.match(/revalidatePath\(`[^`]+`\)/g) ?? [];
    const hasDetailPath = revalidateCalls.some(
      (call) => !call.includes("/budget") && call.includes("/orders/"),
    );
    expect(
      hasDetailPath,
      "approveOrderItemAction must also revalidatePath the /orders/[id] detail path",
    ).toBe(true);
  });

  // Gap Analysis 2: addOrderItemAction
  it("addOrderItemAction checks stock and deducts if order is in progress", () => {
    expect(
      addOrderItemBlock?.body.includes("Estoque insuficiente"),
      "addOrderItemAction must check for insufficient stock",
    ).toBe(true);

    expect(
      addOrderItemBlock?.body.includes('status === "in_progress"'),
      "addOrderItemAction must check if order is in_progress to deduct stock",
    ).toBe(true);

    expect(
      addOrderItemBlock?.body.includes("db.transaction"),
      "addOrderItemAction must use db.transaction for atomic operations",
    ).toBe(true);
  });
});
