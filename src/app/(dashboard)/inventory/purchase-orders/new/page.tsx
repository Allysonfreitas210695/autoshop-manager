import { listParts } from "@/_data-access/inventory";

import { NewPurchaseOrderClient } from "./_components/NewPurchaseOrderClient";

export const metadata = { title: "Nova Ordem de Compra — Precision Auto" };

export default async function NewPurchaseOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ partId?: string }>;
}) {
  const [parts, { partId }] = await Promise.all([listParts(), searchParams]);
  return <NewPurchaseOrderClient parts={parts} preselectedPartId={partId} />;
}
