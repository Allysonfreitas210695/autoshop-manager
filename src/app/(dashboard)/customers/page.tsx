import { listCustomers } from "@/_data-access/customers";

import { CustomersClient } from "./customers-client";

export const metadata = { title: "Clientes — Precision Auto" };

export default async function CustomersPage() {
  const customers = await listCustomers();
  return <CustomersClient customers={customers} />;
}
