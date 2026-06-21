import { listCustomers } from "@/_data-access/customers";

import { CustomersClient } from "./customers-client";

export const metadata = { title: "Clientes — Precision Auto" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const result = await listCustomers(page);
  return <CustomersClient result={result} />;
}
