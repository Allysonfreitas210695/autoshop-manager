"use client";

import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import { StatusChip } from "@/_components/ui/status-chip";
import type { OrderRow } from "@/_lib/queries/orders";

import { NewOrderDrawer } from "../new-order-drawer";

type OrderStatus = OrderRow["status"];

const STATUS_FILTER_TABS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "Todas", value: "all" },
  { label: "Pendente", value: "pending" },
  { label: "Em Progresso", value: "in_progress" },
  { label: "Concluído", value: "completed" },
  { label: "Atrasado", value: "delayed" },
];

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const columns: DataTableColumn<OrderRow>[] = [
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
    id: "plate",
    header: "Placa",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <span className="text-label-md text-on-surface font-mono tracking-wider uppercase">
        {row.plate}
      </span>
    ),
  },
  {
    id: "customer",
    header: "Cliente / Veículo",
    cell: (row) => (
      <div>
        <p className="text-body-md text-on-surface font-medium">
          {row.customer ?? "—"}
        </p>
        <p className="text-label-sm text-on-surface-variant">{row.vehicle}</p>
      </div>
    ),
  },
  {
    id: "mechanic",
    header: "Mecânico",
    className: "hidden md:table-cell",
    cell: (row) => (
      <span className="text-body-md text-on-surface-variant">
        {row.mechanic ?? "Não atribuído"}
      </span>
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
  {
    id: "updatedAt",
    header: "Atualização",
    align: "right",
    className: "hidden md:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {new Date(row.updatedAt).toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    ),
  },
];

type Props = { orders: OrderRow[] };

export function OrdersClient({ orders }: Props) {
  const [activeFilter, setActiveFilter] = useState<OrderStatus | "all">("all");

  const filtered =
    activeFilter === "all"
      ? orders
      : orders.filter((o) => o.status === activeFilter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Gestão de Ordens de Serviço
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            {filtered.length} ordem{filtered.length !== 1 ? "s" : ""} encontrada
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <NewOrderDrawer />
      </div>

      <div
        role="tablist"
        aria-label="Filtrar por status"
        className="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {STATUS_FILTER_TABS.map((tab) => {
          const isActive = activeFilter === tab.value;
          const count =
            tab.value === "all"
              ? orders.length
              : orders.filter((o) => o.status === tab.value).length;
          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveFilter(tab.value)}
              className={`text-label-sm flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono transition-colors ${
                isActive
                  ? "border-secondary bg-secondary/10 text-secondary"
                  : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-secondary/50 hover:text-on-surface"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  isActive
                    ? "bg-secondary text-surface"
                    : "bg-surface-container-highest text-on-surface-variant"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="border-outline-variant overflow-hidden rounded-lg border">
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          emptyMessage="Nenhuma ordem encontrada para este filtro."
        />
      </div>

      <div className="border-outline-variant flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label-sm text-on-surface-variant font-mono">
          Exibindo {filtered.length} de {orders.length} resultados
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="border-outline-variant text-label-sm text-on-surface-variant rounded border px-3 py-1 font-mono disabled:opacity-40"
          >
            ← Ant.
          </button>
          <span className="border-secondary bg-secondary/10 text-label-sm text-secondary rounded border px-3 py-1 font-mono">
            1
          </span>
          <button
            disabled
            className="border-outline-variant text-label-sm text-on-surface-variant rounded border px-3 py-1 font-mono disabled:opacity-40"
          >
            Próx. →
          </button>
        </div>
      </div>
    </div>
  );
}
