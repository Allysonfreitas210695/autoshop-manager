"use client";

import {
  Calendar,
  Car,
  Clipboard,
  ExternalLink,
  Trash2,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { deleteOrderAction, getOrderDetailAction } from "@/_actions/orders";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/_components/ui/alert-dialog";
import { Button } from "@/_components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import { StatusChip } from "@/_components/ui/status-chip";
import type { OrderDetail, OrderRow } from "@/_data-access/orders";
import { formatCurrency, formatDate, formatDateTime } from "@/_helpers/format";

import { AddOrderItemModal } from "./AddOrderItemModal";

type Props = {
  order: OrderRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function OrderDetailPanel({ order, open, onOpenChange }: Props) {
  const [detail, setDetail] = useState<OrderDetail | null>(null);

  const { execute: execDetail } = useAction(getOrderDetailAction, {
    onSuccess: ({ data }) => setDetail(data ?? null),
  });

  useEffect(() => {
    if (!open || !order) return;
    execDetail({ id: order.id });
  }, [open, order?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { execute: execDelete, status: deleteStatus } = useAction(
    deleteOrderAction,
    {
      onSuccess: () => {
        toast.success("Ordem excluída com sucesso.");
        onOpenChange(false);
      },
      onError: () => toast.error("Erro ao excluir ordem."),
    },
  );

  function handleDelete() {
    if (!order) return;
    execDelete({ id: order.id });
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {order ? (
          <>
            <SheetHeader className="border-outline-variant bg-surface-container border-b px-6 py-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <SheetTitle className="text-body-lg text-on-surface font-semibold">
                    O.S. #{order.orderNumber}
                  </SheetTitle>
                  <SheetDescription className="text-label-sm text-on-surface-variant mt-0.5 font-mono">
                    {order.plate} · {order.vehicle}
                  </SheetDescription>
                </div>
                <StatusChip status={order.status} />
              </div>
            </SheetHeader>

            <div className="divide-outline-variant/30 flex-1 divide-y overflow-y-auto">
              {/* Cliente / Mecânico */}
              <div className="space-y-3 px-6 py-4">
                <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                  Informações
                </p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <User className="text-on-surface-variant size-4 shrink-0" />
                    <span className="text-body-sm text-on-surface">
                      {order.customer ?? "Cliente não informado"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Car className="text-on-surface-variant size-4 shrink-0" />
                    <span className="text-body-sm text-on-surface font-mono">
                      {order.plate}
                    </span>
                    <span className="text-body-sm text-on-surface-variant">
                      {order.vehicle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Wrench className="text-on-surface-variant size-4 shrink-0" />
                    <span className="text-body-sm text-on-surface">
                      {order.mechanic ?? "Mecânico não atribuído"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Calendar className="text-on-surface-variant size-4 shrink-0" />
                    <span className="text-label-sm text-on-surface-variant font-mono">
                      {formatDateTime(order.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Diagnóstico / relato */}
              {detail &&
                (detail.diagnosis ||
                  detail.clientReport ||
                  detail.description) && (
                  <div className="space-y-2 px-6 py-4">
                    <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                      Detalhes
                    </p>
                    {detail.description && (
                      <p className="text-body-sm text-on-surface">
                        {detail.description}
                      </p>
                    )}
                    {detail.clientReport && (
                      <p className="text-body-sm text-on-surface-variant">
                        {detail.clientReport}
                      </p>
                    )}
                    {detail.diagnosis && (
                      <p className="text-body-sm text-on-surface italic">
                        {detail.diagnosis}
                      </p>
                    )}
                    {detail.dueAt && (
                      <p className="text-label-sm text-on-surface-variant font-mono">
                        Prazo: {formatDate(detail.dueAt)}
                      </p>
                    )}
                  </div>
                )}

              {/* Itens */}
              {detail && detail.items.length > 0 && (
                <div className="space-y-2 px-6 py-4">
                  <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                    Itens ({detail.items.length})
                  </p>
                  {detail.items.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-body-sm text-on-surface max-w-[60%] truncate">
                        {item.description}
                        {!item.approved && (
                          <span className="text-tertiary ml-2 text-[10px]">
                            (Pendente)
                          </span>
                        )}
                      </span>
                      <span className="text-label-sm text-on-surface-variant shrink-0 font-mono">
                        {item.quantity}×{" "}
                        {formatCurrency(Number(item.unitPrice))}
                      </span>
                    </div>
                  ))}
                  <AddOrderItemModal
                    orderId={order.id}
                    orderStatus={order.status}
                  />
                </div>
              )}
              {detail && detail.items.length === 0 && (
                <div className="space-y-2 px-6 py-4">
                  <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
                    Itens (0)
                  </p>
                  <AddOrderItemModal
                    orderId={order.id}
                    orderStatus={order.status}
                  />
                </div>
              )}

              {/* Total */}
              <div className="px-6 py-4">
                <div className="bg-surface-container border-outline-variant/30 flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    <Clipboard className="text-on-surface-variant size-4" />
                    <span className="text-label-sm text-on-surface-variant font-mono">
                      Total da O.S.
                    </span>
                  </div>
                  <span className="text-headline-sm text-secondary font-mono font-bold">
                    {formatCurrency(Number(order.totalAmount))}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-outline-variant space-y-2 border-t p-4">
              <Link
                href={`/orders/${order.id}/budget`}
                className="bg-secondary text-surface text-label-sm hover:bg-secondary/90 flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2.5 font-mono font-bold transition-colors"
              >
                <ExternalLink className="size-4" />
                Ver Ficha Completa
              </Link>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      className="text-error border-error/30 hover:bg-error/10 w-full gap-2"
                    >
                      <Trash2 className="size-4" />
                      Excluir Ordem
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Excluir Ordem de Serviço
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja excluir a O.S. #{order.orderNumber}
                      ? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogClose
                      render={<Button variant="outline">Cancelar</Button>}
                    />
                    <AlertDialogClose
                      render={
                        <Button
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={deleteStatus === "executing"}
                        >
                          {deleteStatus === "executing"
                            ? "Excluindo..."
                            : "Excluir"}
                        </Button>
                      }
                    />
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {order.status === "completed" && (
                <Button
                  variant="outline"
                  className="border-secondary/30 text-secondary hover:bg-secondary/10 mt-2 w-full gap-2"
                  onClick={() => {
                    const url = `${window.location.origin}/feedback/${order.id}`;
                    navigator.clipboard.writeText(url);
                    toast.success("Link de pesquisa copiado!");
                  }}
                >
                  <Clipboard className="size-4" />
                  Copiar Link de Pesquisa de NPS
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Detalhes da ordem</SheetTitle>
              <SheetDescription>
                Painel lateral com informações da O.S.
              </SheetDescription>
            </SheetHeader>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
