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

describe("Feedbacks Actions Wiring", () => {
  const source = readFileSync(join(ACTIONS_DIR, "feedbacks.ts"), "utf8");
  const blocks = exportBlocks(source);

  const submitBlock = blocks.find((b) => b.name === "submitFeedbackAction");

  it("submitFeedbackAction checks for existing feedback and order status", () => {
    expect(submitBlock?.body.includes("existingFeedback")).toBe(true);
    expect(submitBlock?.body.includes("ActionError")).toBe(true);
  });

  it("submitFeedbackAction inserts into feedbacks and revalidates analytics", () => {
    expect(submitBlock?.body.includes("insert(feedbacks)")).toBe(true);
    expect(submitBlock?.body.includes('revalidatePath("/analytics")')).toBe(
      true,
    );
  });
});
