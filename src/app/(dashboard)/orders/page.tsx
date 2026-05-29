import { listOrders } from "@/_lib/queries/orders";

import { OrdersClient } from "./_components/OrdersClient";

export const metadata = { title: "Ordens de Serviço — Precision Auto" };

export default async function OrdersPage() {
  const orders = await listOrders();
  return <OrdersClient orders={orders} />;
}
