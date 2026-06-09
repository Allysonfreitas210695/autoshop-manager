import { getInventoryMetrics, listParts } from "@/_lib/queries/inventory";

import { InventoryClient } from "./inventory-client";

export const metadata = { title: "Estoque — Precision Auto" };

export default async function InventoryPage() {
  const [parts, metrics] = await Promise.all([
    listParts(),
    getInventoryMetrics(),
  ]);
  return <InventoryClient initialParts={parts} metrics={metrics} />;
}
