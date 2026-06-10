"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Package, Plus, Truck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/_components/ui/button";
import type { PurchaseOrderRow } from "@/_data-access/inventory";

type PurchaseOrderStatus = PurchaseOrderRow["status"];

const statusLabels: Record<PurchaseOrderStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  received: "Recebida",
  cancelled: "Cancelada",
};

const statusColor: Record<PurchaseOrderStatus, string> = {
  draft:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  sent: "bg-secondary/20 text-secondary border-secondary/30",
  received:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  cancelled: "bg-error/20 text-error border-error/30",
};

type Props = { orders: PurchaseOrderRow[] };

export function PurchaseOrdersClient({ orders }: Props) {
  const totals = {
    draft: orders.filter((o) => o.status === "draft").length,
    sent: orders.filter((o) => o.status === "sent").length,
    received: orders.filter((o) => o.status === "received").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface font-bold">
            Ordens de Compra
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Gerencie pedidos de reposição de peças junto aos fornecedores
          </p>
        </div>
        <Link href="/inventory/purchase-orders/new">
          <Button className="flex items-center gap-2">
            <Plus className="size-4" />
            Nova Ordem
          </Button>
        </Link>
      </div>

      {/* Status KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            {
              label: "Enviadas",
              key: "sent",
              icon: Truck,
              color: "text-secondary",
            },
            {
              label: "Recebidas",
              key: "received",
              icon: Package,
              color: "text-status-completed",
            },
            {
              label: "Rascunhos",
              key: "draft",
              icon: FileText,
              color: "text-on-surface-variant",
            },
            {
              label: "Canceladas",
              key: "cancelled",
              icon: FileText,
              color: "text-error",
            },
          ] as const
        ).map(({ label, key, icon: Icon, color }) => (
          <div
            key={key}
            className="bg-surface-container border-outline-variant/30 rounded-xl border p-4"
          >
            <div className="mb-2 flex items-center gap-2">
              <Icon className={`size-4 ${color}`} />
              <span className="text-label-sm text-on-surface-variant">
                {label}
              </span>
            </div>
            <p className={`text-display-sm font-mono font-bold ${color}`}>
              {totals[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-container border-outline-variant/30 overflow-hidden rounded-2xl border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-outline-variant/30 border-b">
                {[
                  "Nº Pedido",
                  "Fornecedor",
                  "Itens",
                  "Valor Total",
                  "Prev. Entrega",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-label-xs text-on-surface-variant/60 px-4 py-3 text-left font-mono tracking-wider uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center">
                    <p className="text-body-sm text-on-surface-variant">
                      Nenhuma ordem de compra registrada.
                    </p>
                  </td>
                </tr>
              )}
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-outline-variant/20 hover:bg-surface/40 border-b transition-colors last:border-0"
                >
                  <td className="px-4 py-3">
                    <span className="text-label-sm text-secondary font-mono font-bold">
                      OC-{order.id.slice(0, 8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-body-sm text-on-surface font-medium">
                      {order.supplier}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-body-sm text-on-surface-variant">
                      {order.itemCount} iten{order.itemCount !== 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-body-sm text-on-surface font-mono font-medium">
                      {order.totalAmount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-label-sm text-on-surface-variant font-mono">
                      {order.expectedDelivery
                        ? format(
                            new Date(order.expectedDelivery),
                            "dd MMM yyyy",
                            { locale: ptBR },
                          )
                        : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${statusColor[order.status]}`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
