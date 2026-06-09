import { listPurchaseOrders } from "@/_lib/queries/inventory";

import { PurchaseOrdersClient } from "./_components/PurchaseOrdersClient";

export const metadata = { title: "Ordens de Compra — Precision Auto" };

export default async function PurchaseOrdersPage() {
  const orders = await listPurchaseOrders();
  return <PurchaseOrdersClient orders={orders} />;
}
