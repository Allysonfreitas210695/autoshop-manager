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

describe("Appointments Actions Wiring", () => {
  const source = readFileSync(join(ACTIONS_DIR, "appointments.ts"), "utf8");
  const blocks = exportBlocks(source);

  const createBlock = blocks.find((b) => b.name === "createAppointmentAction");
  const updateBlock = blocks.find(
    (b) => b.name === "updateAppointmentStatusAction",
  );

  it("createAppointmentAction uses db.insert and revalidates path", () => {
    expect(createBlock?.body.includes("insert(appointments)")).toBe(true);
    expect(createBlock?.body.includes('revalidatePath("/appointments")')).toBe(
      true,
    );
  });

  it("updateAppointmentAction uses db.update and revalidates path", () => {
    expect(updateBlock?.body.includes("update(appointments)")).toBe(true);
    expect(updateBlock?.body.includes('revalidatePath("/appointments")')).toBe(
      true,
    );
  });
});
