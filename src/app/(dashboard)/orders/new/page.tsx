import { listCustomers } from "@/_data-access/customers";
import { listParts } from "@/_data-access/inventory";

import { OrderWizard } from "./order-wizard";

export const metadata = {
  title: "Nova Ordem de Serviço — Precision Auto",
};

export default async function NewOrderPage() {
  const [customers, parts] = await Promise.all([listCustomers(), listParts()]);
  return <OrderWizard customers={customers} parts={parts} />;
}
