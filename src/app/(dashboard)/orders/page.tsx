import { listOrders } from "@/_data-access/orders";

import { OrdersClient } from "./_components/OrdersClient";

export const metadata = { title: "Ordens de Serviço — Precision Auto" };

type Props = {
  searchParams: Promise<{ page?: string; status?: string }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const result = await listOrders(undefined, page, 20);
  return <OrdersClient result={result} />;
}
