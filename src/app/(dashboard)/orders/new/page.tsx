import { listCustomers } from "@/_data-access/customers";
import { listParts } from "@/_data-access/inventory";

import { OrderWizard } from "./order-wizard";

export const metadata = {
  title: "Nova Ordem de Serviço — Precision Auto",
};

type Props = {
  searchParams: Promise<{ customerId?: string }>;
};

export default async function NewOrderPage({ searchParams }: Props) {
  const sp = await searchParams;
  const [result, parts] = await Promise.all([listCustomers(), listParts()]);
  const customers = result.customers;

  const preselectedCustomer = sp.customerId
    ? customers.find((c) => c.id === sp.customerId)
    : undefined;

  const defaultStep1 = preselectedCustomer
    ? {
        customerId: preselectedCustomer.id,
        customerName: preselectedCustomer.name,
        plate: preselectedCustomer.lastPlate ?? "",
        vehicleModel: preselectedCustomer.lastVehicle ?? "",
        mileage: 0,
      }
    : undefined;

  return (
    <OrderWizard
      customers={customers}
      parts={parts}
      defaultStep1={defaultStep1}
    />
  );
}
