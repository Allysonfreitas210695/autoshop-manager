"use client";

import {
  AlertTriangle,
  Package,
  PackageSearch,
  Plus,
  Search,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { buttonVariants } from "@/_components/ui/button";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import { Input } from "@/_components/ui/input";
import {
  inventoryCategories,
  type InventoryCategory,
  mockInventoryMetrics,
  type MockPart,
  mockParts,
} from "@/_lib/mock-data";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function StockBadge({ stock, minStock }: { stock: number; minStock: number }) {
  const isCritical = stock < minStock;
  const isLow = stock === minStock;

  if (isCritical) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <AlertTriangle className="text-error size-3.5 shrink-0" />
        <span className="text-label-sm text-error font-mono font-bold">
          {stock}
        </span>
        <span className="text-on-surface-variant/60 font-mono text-[10px]">
          mín {minStock}
        </span>
      </div>
    );
  }
  if (isLow) {
    return (
      <div className="flex flex-wrap items-center gap-1">
        <TrendingDown className="text-warning size-3.5 shrink-0" />
        <span className="text-label-sm text-warning font-mono font-bold">
          {stock}
        </span>
        <span className="text-on-surface-variant/60 font-mono text-[10px]">
          mín {minStock}
        </span>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-1">
      <span className="text-label-sm text-on-surface font-mono font-bold">
        {stock}
      </span>
      <span className="text-on-surface-variant/60 font-mono text-[10px]">
        mín {minStock}
      </span>
    </div>
  );
}

const columns: DataTableColumn<MockPart>[] = [
  {
    id: "name",
    header: "Peça / SKU",
    cell: (row) => (
      <div className="min-w-0">
        <p className="text-body-sm text-on-surface max-w-[160px] truncate font-medium sm:max-w-none">
          {row.name}
        </p>
        <p className="text-label-sm text-on-surface-variant font-mono">
          {row.sku}
        </p>
      </div>
    ),
  },
  {
    id: "category",
    header: "Categoria",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <span className="border-outline-variant bg-surface-container text-on-surface-variant inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[11px]">
        {row.category}
      </span>
    ),
  },
  {
    id: "location",
    header: "Local",
    className: "hidden lg:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {row.location ?? "—"}
      </span>
    ),
  },
  {
    id: "supplier",
    header: "Fornecedor",
    className: "hidden xl:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {row.supplier ?? "—"}
      </span>
    ),
  },
  {
    id: "stock",
    header: "Estoque",
    cell: (row) => <StockBadge stock={row.stock} minStock={row.minStock} />,
  },
  {
    id: "unitPrice",
    header: "Unit.",
    align: "right",
    className: "hidden md:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {brl(row.unitPrice)}
      </span>
    ),
  },
  {
    id: "totalValue",
    header: "Total",
    align: "right",
    cell: (row) => (
      <span className="text-label-sm text-on-surface sm:text-label-md font-mono font-semibold">
        {brl(row.stock * row.unitPrice)}
      </span>
    ),
  },
];

export function InventoryClient() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] =
    useState<InventoryCategory>("Todos");

  const filtered = mockParts.filter((part) => {
    const matchesCategory =
      activeCategory === "Todos" || part.category === activeCategory;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q.length < 2 ||
      part.name.toLowerCase().includes(q) ||
      part.sku.toLowerCase().includes(q) ||
      (part.supplier ?? "").toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const filteredLowStock = filtered.filter((p) => p.stock <= p.minStock).length;
  const filteredValue = filtered.reduce(
    (sum, p) => sum + p.stock * p.unitPrice,
    0,
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Controle de Estoque
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            {filtered.length} ite{filtered.length !== 1 ? "ns" : "m"} &middot;{" "}
            {brl(filteredValue)}
          </p>
        </div>
        <Link
          href="/inventory/new"
          className={buttonVariants({ className: "w-full gap-2 sm:w-auto" })}
        >
          <Plus className="size-4" />
          Adicionar Peça
        </Link>
      </div>

      {/* Metric cards — 2 cols mobile, 4 cols desktop */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="border-outline-variant bg-surface-container rounded-lg border p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <Package className="text-secondary size-4 shrink-0 sm:size-5" />
            <p className="text-on-surface-variant font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              Total de Itens
            </p>
          </div>
          <p className="text-headline-sm text-on-surface sm:text-display-sm mt-2 font-mono font-bold">
            {mockInventoryMetrics.totalItems}
          </p>
        </div>
        <div className="border-outline-variant bg-surface-container rounded-lg border p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <TrendingDown className="text-warning size-4 shrink-0 sm:size-5" />
            <p className="text-on-surface-variant font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              Est. Baixo
            </p>
          </div>
          <p className="text-headline-sm text-warning sm:text-display-sm mt-2 font-mono font-bold">
            {mockInventoryMetrics.lowStockCount}
          </p>
        </div>
        <div className="border-outline-variant bg-surface-container rounded-lg border p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="text-error size-4 shrink-0 sm:size-5" />
            <p className="text-on-surface-variant font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              Críticos
            </p>
          </div>
          <p className="text-headline-sm text-error sm:text-display-sm mt-2 font-mono font-bold">
            {mockInventoryMetrics.criticalCount}
          </p>
        </div>
        <div className="border-outline-variant bg-surface-container rounded-lg border p-3 sm:p-4">
          <div className="flex items-center gap-1.5">
            <PackageSearch className="text-tertiary size-4 shrink-0 sm:size-5" />
            <p className="text-on-surface-variant font-mono text-[9px] tracking-wider uppercase sm:text-[10px]">
              Valor Total
            </p>
          </div>
          <p className="text-label-lg text-on-surface sm:text-headline-sm lg:text-display-sm mt-2 font-mono font-bold break-all">
            {brl(mockInventoryMetrics.totalValue)}
          </p>
        </div>
      </div>

      {/* Alert banner */}
      {mockInventoryMetrics.criticalCount > 0 &&
        activeCategory === "Todos" &&
        search === "" && (
          <div className="border-error/30 bg-error/5 flex items-start gap-3 rounded-lg border px-4 py-3">
            <AlertTriangle className="text-error mt-0.5 size-4 shrink-0 sm:size-5" />
            <p className="text-body-sm text-error">
              <span className="font-semibold">
                {mockInventoryMetrics.criticalCount} ite
                {mockInventoryMetrics.criticalCount !== 1 ? "ns" : "m"} abaixo
                do mínimo.
              </span>{" "}
              Reponha o estoque para evitar atrasos nas ordens de serviço.
            </p>
          </div>
        )}

      {/* Category tabs + search */}
      <div className="space-y-3">
        {/* Tabs — edge-to-edge scroll on mobile */}
        <div className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {inventoryCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-label-sm shrink-0 rounded-md px-3 py-1.5 font-mono transition-colors ${
                activeCategory === cat
                  ? "bg-secondary text-surface"
                  : "border-outline-variant text-on-surface-variant hover:bg-surface-container border"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nome, SKU ou fornecedor..."
            className="w-full pl-9 sm:max-w-sm"
            aria-label="Buscar peças"
          />
        </div>
      </div>

      {/* Table */}
      <div className="border-outline-variant overflow-hidden rounded-lg border">
        <DataTable
          columns={columns}
          data={filtered}
          getRowId={(row) => row.id}
          emptyMessage="Nenhuma peça encontrada para os filtros aplicados."
        />
      </div>

      {/* Footer count */}
      {filteredLowStock > 0 && (
        <p className="text-label-sm text-on-surface-variant font-mono">
          {filteredLowStock} ite{filteredLowStock !== 1 ? "ns" : "m"} com
          estoque baixo ou crítico
        </p>
      )}
    </div>
  );
}
