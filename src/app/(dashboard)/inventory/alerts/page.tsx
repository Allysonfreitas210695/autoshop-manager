import { getLowStockParts } from "@/_lib/queries/inventory";

import { AlertsClient } from "./_components/AlertsClient";

export const metadata = { title: "Alertas de Estoque — Precision Auto" };

export default async function AlertsPage() {
  const parts = await getLowStockParts();
  const criticalParts = parts.filter((p) => p.stock < p.minStock);
  const lowParts = parts.filter((p) => p.stock === p.minStock);
  return <AlertsClient criticalParts={criticalParts} lowParts={lowParts} />;
}
