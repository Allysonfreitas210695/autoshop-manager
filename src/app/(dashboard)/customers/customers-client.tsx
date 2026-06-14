"use client";

import { Download, Filter, Search, UserPlus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/_components/ui/button";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import { Input } from "@/_components/ui/input";
import type { CustomerRow } from "@/_data-access/customers";
import { formatCurrency, formatDate } from "@/_helpers/format";

import { NewCustomerDrawer } from "./_components/NewCustomerDrawer";
import { CustomerDetailPanel } from "./customer-detail-panel";

const columns: DataTableColumn<CustomerRow>[] = [
  {
    id: "name",
    header: "Cliente",
    cell: (row) => (
      <div className="flex items-center gap-3">
        <div className="bg-secondary/10 text-label-md text-secondary flex size-9 shrink-0 items-center justify-center rounded-full font-mono font-bold">
          {row.name[0]}
        </div>
        <div>
          <p className="text-body-md text-on-surface font-medium">{row.name}</p>
          <p className="text-label-sm text-on-surface-variant font-mono">
            {row.email}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "cpf",
    header: "CPF / CNPJ",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {row.cpf ?? "—"}
      </span>
    ),
  },
  {
    id: "phone",
    header: "Telefone",
    className: "hidden md:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {row.phone ?? "—"}
      </span>
    ),
  },
  {
    id: "vehicle",
    header: "Veículo Principal",
    className: "hidden lg:table-cell",
    cell: (row) => (
      <div>
        <p className="text-body-sm text-on-surface">{row.lastVehicle ?? "—"}</p>
        <p className="text-label-sm text-secondary font-mono">
          {row.lastPlate ?? ""}
        </p>
      </div>
    ),
  },
  {
    id: "lastVisit",
    header: "Última Visita",
    className: "hidden md:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {row.lastVisit ? formatDate(row.lastVisit) : "—"}
      </span>
    ),
  },
  {
    id: "totalSpent",
    header: "Total Gasto",
    align: "right",
    cell: (row) => (
      <span className="text-label-md text-on-surface font-mono font-semibold">
        {formatCurrency(row.totalSpent)}
      </span>
    ),
  },
];

type Props = { customers: CustomerRow[] };

export function CustomersClient({ customers }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null,
  );
  const [panelOpen, setPanelOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered =
    search.trim().length >= 2
      ? customers.filter(
          (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.cpf ?? "").includes(search) ||
            (c.lastPlate ?? "").toLowerCase().includes(search.toLowerCase()),
        )
      : customers;

  function openPanel(customer: CustomerRow) {
    setSelectedCustomer(customer);
    setPanelOpen(true);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-headline-lg text-on-surface font-bold">
              Gestão de Clientes
            </h1>
            <p className="text-label-md text-on-surface-variant mt-1 font-mono">
              {filtered.length} cliente{filtered.length !== 1 ? "s" : ""}{" "}
              encontrado{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button onClick={() => setDrawerOpen(true)} className="gap-2">
            <UserPlus className="size-4" />
            Cadastrar Novo Cliente
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, CPF ou placa..."
              className="pl-9"
              aria-label="Buscar clientes"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-on-surface-variant gap-2"
              aria-label="Filtros"
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button
              variant="ghost"
              className="text-on-surface-variant gap-2"
              aria-label="Exportar"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        <div className="border-outline-variant overflow-hidden rounded-lg border">
          <DataTable
            columns={columns}
            data={filtered}
            getRowId={(row) => row.id}
            onRowClick={openPanel}
            emptyMessage="Nenhum cliente encontrado."
          />
        </div>

        <div className="border-outline-variant flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-label-sm text-on-surface-variant font-mono">
            Exibindo {filtered.length} de {customers.length} clientes
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

      <CustomerDetailPanel
        customer={selectedCustomer}
        open={panelOpen}
        onOpenChange={setPanelOpen}
      />
      <NewCustomerDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  );
}
