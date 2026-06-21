"use client";

import { Download, Filter, Search, UserPlus } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Button } from "@/_components/ui/button";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import { Input } from "@/_components/ui/input";
import type {
  CustomerRow,
  ListCustomersResult,
} from "@/_data-access/customers";
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

type Props = { result: ListCustomersResult };

export function CustomersClient({ result }: Props) {
  const { customers, total, page, pageCount } = result;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
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

  const goToPage = useCallback(
    (p: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", String(p));
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  function exportCsv() {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "CPF",
      "Veículo",
      "Placa",
      "Total Gasto",
      "Visitas",
    ];
    const rows = customers.map((c) => [
      c.name,
      c.email,
      c.phone ?? "",
      c.cpf ?? "",
      c.lastVehicle ?? "",
      c.lastPlate ?? "",
      c.totalSpent.toFixed(2),
      String(c.visits),
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clientes.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-headline-md text-on-surface font-bold">
              Gestão de Clientes
            </h1>
            <p className="text-label-md text-on-surface-variant mt-1 font-mono">
              {total} cliente{total !== 1 ? "s" : ""} cadastrado
              {total !== 1 ? "s" : ""}
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
              onClick={() => setFilterOpen((v) => !v)}
            >
              <Filter className="size-4" />
              <span className="hidden sm:inline">Filtros</span>
            </Button>
            <Button
              variant="ghost"
              className="text-on-surface-variant gap-2"
              aria-label="Exportar"
              onClick={exportCsv}
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
          </div>
        </div>

        {filterOpen && (
          <div className="border-outline-variant bg-surface-container rounded-lg border p-4">
            <p className="text-label-sm text-on-surface-variant mb-2 font-mono">
              Filtrar por nome / e-mail
            </p>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite para filtrar..."
              aria-label="Filtro por nome"
            />
          </div>
        )}

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
            Exibindo {filtered.length} de {total} clientes
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
              className="border-outline-variant text-label-sm text-on-surface-variant rounded border px-3 py-1 font-mono disabled:opacity-40"
            >
              ← Ant.
            </button>
            {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={`text-label-sm rounded border px-3 py-1 font-mono ${p === page ? "border-secondary bg-secondary/10 text-secondary" : "border-outline-variant text-on-surface-variant"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page >= pageCount}
              onClick={() => goToPage(page + 1)}
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
