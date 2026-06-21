import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

// Phase 7 D-01..D-02, CLI-01: static source-assertion tests for customers.ts wiring.
// No DB connection, no pg mock — mirrors orders.test.ts pattern exactly.

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

describe("Phase 7 customers actions wiring (D-01..D-07)", () => {
  const actionsSource = readFileSync(join(ACTIONS_DIR, "customers.ts"), "utf8");
  const dataAccessSource = readFileSync(
    join(ACTIONS_DIR, "..", "_data-access", "customers.ts"),
    "utf8",
  );

  const blocks = exportBlocks(actionsSource);

  const createBlock = blocks.find((b) => b.name === "createCustomerAction");
  const updateBlock = blocks.find((b) => b.name === "updateCustomerAction");

  // D-01: email guard in createCustomerAction
  it("D-01: createCustomerAction contém email guard antes de db.insert", () => {
    expect(
      createBlock?.body.includes("ActionError"),
      "createCustomerAction must contain ActionError",
    ).toBe(true);

    expect(
      createBlock?.body.includes("E-mail já cadastrado"),
      'createCustomerAction must contain "E-mail já cadastrado"',
    ).toBe(true);
  });

  // D-02: email guard in updateCustomerAction (atomic via constraint catch, not pre-check)
  it("D-02: updateCustomerAction contém email guard via catch de constraint", () => {
    expect(
      updateBlock?.body.includes("ActionError"),
      "updateCustomerAction must contain ActionError",
    ).toBe(true);

    expect(
      updateBlock?.body.includes("E-mail já cadastrado"),
      'updateCustomerAction must contain "E-mail já cadastrado"',
    ).toBe(true);

    expect(
      updateBlock?.body.includes("isUniqueConstraintError"),
      "updateCustomerAction must use isUniqueConstraintError for atomic email guard",
    ).toBe(true);
  });

  // CLI-01: searchCustomers covers CPF and plate
  it("CLI-01: searchCustomers cobre CPF e placa", () => {
    expect(
      dataAccessSource.includes("user.cpf"),
      "searchCustomers must reference user.cpf in WHERE clause",
    ).toBe(true);

    expect(
      dataAccessSource.includes("vehicles.plate"),
      "searchCustomers must reference vehicles.plate",
    ).toBe(true);
  });
});
