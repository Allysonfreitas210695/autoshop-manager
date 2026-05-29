import {
  ArrowLeft,
  Car,
  Edit,
  FileText,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import { StatusChip } from "@/_components/ui/status-chip";
import { getCustomerById } from "@/_lib/queries/customers";
import { getOrdersByCustomer } from "@/_lib/queries/orders";

type Props = { params: Promise<{ id: string }> };

type OrderRow = {
  id: string;
  orderNumber: number;
  status: "pending" | "in_progress" | "completed" | "delayed";
  totalAmount: string;
  openedAt: Date;
  description: string | null;
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const orderColumns: DataTableColumn<OrderRow>[] = [
  {
    id: "orderNumber",
    header: "O.S.",
    cell: (row) => (
      <span className="text-label-md text-secondary font-mono">
        #{row.orderNumber}
      </span>
    ),
  },
  {
    id: "openedAt",
    header: "Data",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {new Date(row.openedAt).toLocaleDateString("pt-BR")}
      </span>
    ),
  },
  {
    id: "description",
    header: "Serviço",
    cell: (row) => (
      <p className="text-body-sm text-on-surface max-w-xs truncate">
        {row.description ?? "—"}
      </p>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusChip status={row.status} />,
  },
  {
    id: "totalAmount",
    header: "Total",
    align: "right",
    cell: (row) => (
      <span className="text-label-md text-on-surface font-mono font-semibold">
        {brl(Number(row.totalAmount))}
      </span>
    ),
  },
];

export default async function CustomerProfilePage({ params }: Props) {
  const { id } = await params;
  const [customer, orders] = await Promise.all([
    getCustomerById(id),
    getOrdersByCustomer(id),
  ]);

  if (!customer) notFound();

  const initials = customer.name
    .split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Link
          href="/customers"
          className="text-label-sm text-on-surface-variant hover:text-on-surface flex items-center gap-1.5 font-mono transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar para Clientes
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Ficha Técnica do Cliente
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            {customer.visits} visita{customer.visits !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2 rounded-md border px-4 py-2 font-mono transition-colors">
            <Edit className="size-4" />
            Editar Cadastro
          </button>
          <Link
            href="/orders/new"
            className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 flex items-center gap-2 rounded-md px-4 py-2 font-mono font-bold transition-colors"
          >
            <FileText className="size-4" />
            Nova Ordem de Serviço
          </Link>
        </div>
      </div>

      <div className="border-outline-variant bg-surface-container rounded-lg border p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="bg-secondary/15 text-display-sm text-secondary flex size-20 shrink-0 items-center justify-center rounded-full font-mono font-bold">
            {initials}
          </div>

          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-headline-sm text-on-surface font-bold">
                {customer.name}
              </h2>
              <p className="text-label-md text-on-surface-variant font-mono">
                {customer.cpf ?? "CPF não informado"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customer.phone && (
                <div className="text-body-sm text-on-surface-variant flex items-center gap-2">
                  <Phone className="text-secondary size-4 shrink-0" />
                  {customer.phone}
                </div>
              )}
              <div className="text-body-sm text-on-surface-variant flex items-center gap-2">
                <Mail className="text-secondary size-4 shrink-0" />
                {customer.email}
              </div>
              {customer.address && (
                <div className="text-body-sm text-on-surface-variant flex items-start gap-2">
                  <MapPin className="text-secondary mt-0.5 size-4 shrink-0" />
                  {customer.address}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 sm:flex-col sm:gap-3">
            <div className="border-outline-variant bg-surface-container-highest rounded-md border p-3 text-center">
              <p className="text-headline-sm text-secondary font-mono font-bold">
                {brl(customer.totalSpent)}
              </p>
              <p className="text-on-surface-variant font-mono text-[10px] tracking-wider uppercase">
                Total Gasto
              </p>
            </div>
            <div className="border-outline-variant bg-surface-container-highest rounded-md border p-3 text-center">
              <p className="text-headline-sm text-secondary font-mono font-bold">
                {customer.visits}
              </p>
              <p className="text-on-surface-variant font-mono text-[10px] tracking-wider uppercase">
                Visitas
              </p>
            </div>
          </div>
        </div>
      </div>

      {customer.vehicles.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-label-lg text-on-surface flex items-center gap-2 font-mono tracking-wider uppercase">
            <Car className="text-secondary size-5" />
            Frota de Veículos ({customer.vehicles.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {customer.vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="border-outline-variant bg-surface-container space-y-3 rounded-lg border p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-body-md text-on-surface font-semibold">
                      {vehicle.make} {vehicle.model}
                    </p>
                    <p className="text-label-sm text-on-surface-variant font-mono">
                      {vehicle.year ?? "—"} · {vehicle.color ?? "—"}
                    </p>
                  </div>
                  <span className="border-secondary/30 bg-secondary/10 text-label-sm text-secondary rounded-full border px-2 py-0.5 font-mono font-bold">
                    {vehicle.plate}
                  </span>
                </div>
                {vehicle.mileage !== null && (
                  <div className="border-outline-variant flex items-center justify-between border-t pt-2">
                    <span className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                      KM Atual
                    </span>
                    <span className="text-label-sm text-on-surface font-mono font-bold">
                      {vehicle.mileage.toLocaleString("pt-BR")} km
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-label-lg text-on-surface font-mono tracking-wider uppercase">
          Histórico de Ordens de Serviço ({orders.length})
        </h2>
        <div className="border-outline-variant overflow-hidden rounded-lg border">
          <DataTable
            columns={orderColumns}
            data={orders}
            getRowId={(row) => row.id}
            emptyMessage="Nenhuma ordem de serviço registrada."
          />
        </div>
      </section>
    </div>
  );
}
