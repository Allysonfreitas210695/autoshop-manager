import { listParts } from "@/_lib/queries/inventory";

import { NewPurchaseOrderClient } from "./_components/NewPurchaseOrderClient";

export const metadata = { title: "Nova Ordem de Compra — Precision Auto" };

export default async function NewPurchaseOrderPage() {
  const parts = await listParts();
  return <NewPurchaseOrderClient parts={parts} />;
}
