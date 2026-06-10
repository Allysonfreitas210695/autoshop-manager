"use client";

import {
  AlertTriangle,
  ArrowRight,
  Package,
  ShoppingCart,
  XOctagon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/_components/ui/button";
import type { Part } from "@/_data-access/inventory";

type Props = { criticalParts: Part[]; lowParts: Part[] };

export function AlertsClient({ criticalParts, lowParts }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface font-bold">
            Alertas de Estoque
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Itens abaixo do estoque mínimo que precisam de reposição
          </p>
        </div>
        <Link href="/inventory/purchase-orders/new">
          <Button className="flex items-center gap-2">
            <ShoppingCart className="size-4" />
            Nova Ordem de Compra
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="bg-error/10 border-error/20 rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2">
            <XOctagon className="text-error size-4" />
            <span className="text-label-sm text-error font-mono tracking-wider uppercase">
              Crítico
            </span>
          </div>
          <p className="text-display-sm text-error font-mono font-bold">
            {criticalParts.length}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            itens abaixo do mínimo
          </p>
        </div>
        <div className="bg-tertiary/10 border-tertiary/20 rounded-xl border p-4">
          <div className="mb-2 flex items-center gap-2">
            <AlertTriangle className="text-tertiary size-4" />
            <span className="text-label-sm text-tertiary font-mono tracking-wider uppercase">
              Atenção
            </span>
          </div>
          <p className="text-display-sm text-tertiary font-mono font-bold">
            {lowParts.length}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            itens no limite
          </p>
        </div>
        <div className="bg-surface-container border-outline-variant/30 col-span-2 rounded-xl border p-4 sm:col-span-1">
          <div className="mb-2 flex items-center gap-2">
            <Package className="text-secondary size-4" />
            <span className="text-label-sm text-secondary font-mono tracking-wider uppercase">
              Total
            </span>
          </div>
          <p className="text-display-sm text-secondary font-mono font-bold">
            {criticalParts.length + lowParts.length}
          </p>
          <p className="text-label-sm text-on-surface-variant mt-0.5">
            itens para repor
          </p>
        </div>
      </div>

      {criticalParts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <XOctagon className="text-error size-4" />
            <h2 className="text-title-sm text-error font-mono font-semibold tracking-wider uppercase">
              Estoque Crítico
            </h2>
          </div>
          <div className="space-y-2">
            {criticalParts.map((part) => (
              <AlertRow key={part.id} part={part} severity="critical" />
            ))}
          </div>
        </section>
      )}

      {lowParts.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-tertiary size-4" />
            <h2 className="text-title-sm text-tertiary font-mono font-semibold tracking-wider uppercase">
              Estoque no Limite
            </h2>
          </div>
          <div className="space-y-2">
            {lowParts.map((part) => (
              <AlertRow key={part.id} part={part} severity="low" />
            ))}
          </div>
        </section>
      )}

      {criticalParts.length === 0 && lowParts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <Package className="text-status-completed/60 size-12" />
          <p className="text-title-sm text-on-surface">Estoque normalizado</p>
          <p className="text-body-sm text-on-surface-variant max-w-xs">
            Todos os itens estão acima do estoque mínimo configurado.
          </p>
        </div>
      )}
    </div>
  );
}

function AlertRow({
  part,
  severity,
}: {
  part: Part;
  severity: "critical" | "low";
}) {
  const isCritical = severity === "critical";
  const shortage = part.minStock - part.stock;
  const fillPct = Math.min((part.stock / part.minStock) * 100, 100);

  return (
    <div
      className={`bg-surface-container hover:border-outline-variant/50 flex flex-col gap-4 rounded-xl border p-4 transition-colors sm:flex-row sm:items-center ${isCritical ? "border-error/30" : "border-tertiary/30"}`}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${isCritical ? "bg-error/15 text-error border-error/30" : "bg-tertiary/15 text-tertiary border-tertiary/30"}`}
          >
            {isCritical ? "CRÍTICO" : "ATENÇÃO"}
          </span>
          {part.sku && (
            <span className="text-label-xs text-on-surface-variant font-mono">
              {part.sku}
            </span>
          )}
          <span className="text-label-xs text-on-surface-variant font-mono">
            {part.category}
          </span>
        </div>
        <p className="text-body-md text-on-surface truncate font-medium">
          {part.name}
        </p>
        <div className="flex items-center gap-3 pt-1">
          <div className="bg-outline-variant/30 h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className={`h-full rounded-full transition-all ${isCritical ? "bg-error" : "bg-tertiary"}`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <span
            className={`text-label-xs shrink-0 font-mono ${isCritical ? "text-error" : "text-tertiary"}`}
          >
            {part.stock}/{part.minStock}
          </span>
        </div>
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 sm:flex-col sm:items-end sm:justify-center">
        <div className="text-center sm:text-right">
          <p
            className={`text-title-sm font-mono font-bold ${isCritical ? "text-error" : "text-tertiary"}`}
          >
            -{shortage}
          </p>
          <p className="text-label-xs text-on-surface-variant">faltando</p>
        </div>
        <Link href="/inventory/purchase-orders/new">
          <Button
            size="sm"
            variant="outline"
            className="flex shrink-0 items-center gap-1.5"
          >
            <ShoppingCart className="size-3.5" />
            Pedir
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
