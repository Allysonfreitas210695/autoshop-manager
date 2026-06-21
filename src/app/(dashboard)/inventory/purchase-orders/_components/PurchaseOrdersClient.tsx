"use client";

import { FileText, Package, Plus, Truck } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getPurchaseOrderItemsAction,
  updatePurchaseOrderStatusAction,
} from "@/_actions/inventory";
import { Button } from "@/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import type {
  PurchaseOrderItem,
  PurchaseOrderRow,
} from "@/_data-access/inventory";
import { formatCurrency, formatDate } from "@/_helpers/format";

type PurchaseOrderStatus = PurchaseOrderRow["status"];

const statusLabels: Record<PurchaseOrderStatus, string> = {
  draft: "Rascunho",
  sent: "Enviada",
  received: "Recebida",
  cancelled: "Cancelada",
  confirmed: "Confirmada",
};

const statusColor: Record<PurchaseOrderStatus, string> = {
  draft:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  sent: "bg-secondary/20 text-secondary border-secondary/30",
  received:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  cancelled: "bg-error/20 text-error border-error/30",
  confirmed:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
};

type StatusTransition = {
  from: PurchaseOrderStatus[];
  to: PurchaseOrderStatus;
  label: string;
  variant: "default" | "outline" | "ghost" | "destructive";
};

const statusTransitions: StatusTransition[] = [
  {
    from: ["draft"],
    to: "sent",
    label: "Marcar como Enviada",
    variant: "default",
  },
  {
    from: ["sent"],
    to: "received",
    label: "Marcar como Recebida",
    variant: "default",
  },
  {
    from: ["draft", "sent"],
    to: "cancelled",
    label: "Cancelar",
    variant: "destructive",
  },
];

function PurchaseOrderDetailPanel({
  order,
  open,
  onOpenChange,
  onStatusChange,
}: {
  order: PurchaseOrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: PurchaseOrderStatus) => void;
}) {
  const [items, setItems] = useState<PurchaseOrderItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  const { execute: fetchItems } = useAction(getPurchaseOrderItemsAction, {
    onSuccess: ({ data }) => {
      setItems(data?.items ?? []);
      setLoadingItems(false);
    },
    onError: () => setLoadingItems(false),
  });

  const [pendingStatus, setPendingStatus] =
    useState<PurchaseOrderStatus | null>(null);

  const { execute: updateStatus, status: updateStatus_ } = useAction(
    updatePurchaseOrderStatusAction,
    {
      onSuccess: () => {
        if (pendingStatus) {
          toast.success(
            `Status atualizado para ${statusLabels[pendingStatus]}.`,
          );
          onStatusChange(order!.id, pendingStatus);
          setPendingStatus(null);
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError ?? "Erro ao atualizar status.");
        setPendingStatus(null);
      },
    },
  );

  useEffect(() => {
    if (!open || !order) return;
    setLoadingItems(true); // eslint-disable-line react-hooks/set-state-in-effect
    fetchItems({ id: order.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id]);

  if (!order) return null;

  const availableTransitions = statusTransitions.filter((t) =>
    t.from.includes(order.status),
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-outline-variant bg-surface-container border-b px-6 py-5">
          <SheetTitle className="text-body-lg text-on-surface font-semibold">
            OC-{order.id.slice(0, 8).toUpperCase()}
          </SheetTitle>
          <SheetDescription className="text-label-sm text-on-surface-variant font-mono">
            {order.supplier}
          </SheetDescription>
        </SheetHeader>
        <div className="divide-outline-variant/30 flex-1 divide-y overflow-y-auto">
          <div className="space-y-3 px-6 py-4">
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Detalhes
            </p>
            <div className="space-y-2.5">
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Fornecedor</span>
                <span className="text-on-surface font-medium">
                  {order.supplier}
                </span>
              </div>
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Itens</span>
                <span className="text-on-surface font-mono">
                  {order.itemCount} iten{order.itemCount !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Valor Total</span>
                <span className="text-secondary font-mono font-bold">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Prev. Entrega</span>
                <span className="text-on-surface font-mono">
                  {order.expectedDelivery
                    ? formatDate(order.expectedDelivery)
                    : "—"}
                </span>
              </div>
              <div className="text-body-sm flex items-center justify-between">
                <span className="text-on-surface-variant">Status</span>
                <span
                  className={`rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase ${statusColor[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
            </div>
          </div>

          {/* Items list */}
          <div className="space-y-3 px-6 py-4">
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Itens do Pedido
            </p>
            {loadingItems && (
              <p className="text-label-sm text-on-surface-variant font-mono">
                Carregando...
              </p>
            )}
            {!loadingItems && items.length === 0 && (
              <p className="text-label-sm text-on-surface-variant font-mono">
                Nenhum item.
              </p>
            )}
            {!loadingItems && items.length > 0 && (
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="border-outline-variant/30 flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-body-sm text-on-surface truncate font-medium">
                        {item.description}
                      </p>
                      <p className="text-label-xs text-on-surface-variant font-mono">
                        {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                    </div>
                    <span className="text-label-sm text-on-surface shrink-0 font-mono font-semibold">
                      {formatCurrency(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Status transitions */}
          {availableTransitions.length > 0 && (
            <div className="space-y-2 px-6 py-4">
              <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                Ações
              </p>
              <div className="flex flex-col gap-2">
                {availableTransitions.map((t) => (
                  <Button
                    key={t.to}
                    variant={t.variant}
                    size="sm"
                    disabled={updateStatus_ === "executing"}
                    onClick={() => {
                      setPendingStatus(t.to);
                      updateStatus({ id: order.id, status: t.to });
                    }}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

type Props = { orders: PurchaseOrderRow[] };

export function PurchaseOrdersClient({ orders: initialOrders }: Props) {
  const [orders, setOrders] = useState<PurchaseOrderRow[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderRow | null>(
    null,
  );
  const [panelOpen, setPanelOpen] = useState(false);

  const totals = {
    draft: orders.filter((o) => o.status === "draft").length,
    sent: orders.filter((o) => o.status === "sent").length,
    received: orders.filter((o) => o.status === "received").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  function handleStatusChange(id: string, status: PurchaseOrderStatus) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    setSelectedOrder((prev) => (prev?.id === id ? { ...prev, status } : prev));
  }

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
                  onClick={() => {
                    setSelectedOrder(order);
                    setPanelOpen(true);
                  }}
                  className="border-outline-variant/20 hover:bg-surface/40 cursor-pointer border-b transition-colors last:border-0"
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
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-label-sm text-on-surface-variant font-mono">
                      {order.expectedDelivery
                        ? formatDate(order.expectedDelivery)
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

      <PurchaseOrderDetailPanel
        order={selectedOrder}
        open={panelOpen}
        onOpenChange={setPanelOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
