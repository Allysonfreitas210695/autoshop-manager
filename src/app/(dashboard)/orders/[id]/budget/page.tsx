import { Download, FileText } from "lucide-react";
import { notFound } from "next/navigation";

import { Card } from "@/_components/ui/card";
import { getOrderById } from "@/_data-access/orders";
import { formatCurrency, formatDate } from "@/_helpers/format";

import {
  ApproveItemButton,
  ConfirmApprovalButton,
} from "./_components/BudgetClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return { title: `Aprovação de Orçamento · O.S. ${id}` };
}

export default async function BudgetPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const approvedItems = order.items.filter((i) => i.approved);
  const pendingItems = order.items.filter((i) => !i.approved);
  const approvedTotal = approvedItems.reduce(
    (s, i) => s + i.quantity * Number(i.unitPrice),
    0,
  );
  const pendingTotal = pendingItems.reduce(
    (s, i) => s + i.quantity * Number(i.unitPrice),
    0,
  );
  const grandTotal = approvedTotal + pendingTotal;

  return (
    <div className="bg-surface min-h-screen">
      {/* Header */}
      <div className="border-outline-variant bg-surface-container border-b px-6 py-5">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FileText className="text-secondary size-5" />
              <div>
                <h1 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
                  Aprovação de Orçamento
                </h1>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  O.S. {order.id}
                </p>
              </div>
            </div>
            <button className="border-outline-variant bg-surface text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2 rounded-md border px-3 py-2 font-mono transition-colors">
              <Download className="size-4" />
              <span className="hidden sm:inline">Baixar PDF</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-6">
        {/* Dados do cliente e veículo */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <p className="text-on-surface-variant/60 mb-3 font-mono text-[10px] tracking-wider uppercase">
              Cliente
            </p>
            <div className="flex items-center gap-3">
              <div className="bg-secondary/15 text-label-lg text-secondary flex size-10 shrink-0 items-center justify-center rounded-full font-mono font-bold">
                {order.customer?.[0] ?? "?"}
              </div>
              <div>
                <p className="text-on-surface font-medium">{order.customer}</p>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  {order.customerCpf}
                </p>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  {order.customerPhone}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-on-surface-variant/60 mb-3 font-mono text-[10px] tracking-wider uppercase">
              Veículo
            </p>
            <p className="text-on-surface font-medium">{order.vehicle}</p>
            <p className="text-label-sm text-on-surface-variant font-mono">
              {order.vehicleYear} · {order.vehicleColor}
            </p>
            <p className="text-label-md text-secondary font-mono font-bold">
              {order.plate}
            </p>
            <p className="text-label-sm text-on-surface-variant mt-1 font-mono">
              {(order.mileage ?? 0).toLocaleString("pt-BR")} km · Mec.{" "}
              {order.mechanic ?? "—"}
            </p>
          </Card>
        </div>

        {/* Diagnóstico */}
        <Card className="p-4">
          <p className="text-on-surface-variant/60 mb-2 font-mono text-[10px] tracking-wider uppercase">
            Diagnóstico Técnico
          </p>
          <p className="text-body-sm text-on-surface">{order.diagnosis}</p>
        </Card>

        {/* Itens do orçamento */}
        <Card>
          <div className="border-outline-variant border-b p-4">
            <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
              Itens do Orçamento
            </h2>
            <p className="text-label-sm text-on-surface-variant font-mono">
              {order.items.length} itens · {approvedItems.length} aprovados
            </p>
          </div>

          <div className="divide-outline-variant divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                  item.approved ? "bg-surface-container/30" : "opacity-50"
                }`}
              >
                <ApproveItemButton
                  itemId={item.id}
                  orderId={id}
                  approved={item.approved}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm text-on-surface font-medium">
                    {item.description}
                  </p>
                  <p className="text-label-sm text-on-surface-variant font-mono">
                    {item.itemType === "part" ? "Peça" : "Mão de obra"} · Qtd:{" "}
                    {item.quantity}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-label-md text-on-surface font-mono font-bold">
                    {formatCurrency(item.quantity * Number(item.unitPrice))}
                  </p>
                  {!item.approved && (
                    <p className="text-tertiary font-mono text-[10px] uppercase">
                      Pendente
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Resumo financeiro + ações */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="p-4">
            <h2 className="text-label-lg text-on-surface mb-3 font-mono font-semibold tracking-wider uppercase">
              Resumo Financeiro
            </h2>
            <div className="space-y-2">
              <div className="text-body-sm text-on-surface-variant flex justify-between">
                <span>Itens aprovados</span>
                <span className="text-status-completed font-mono">
                  {formatCurrency(approvedTotal)}
                </span>
              </div>
              {pendingTotal > 0 && (
                <div className="text-body-sm text-on-surface-variant flex justify-between">
                  <span>Itens pendentes</span>
                  <span className="text-tertiary font-mono">
                    {formatCurrency(pendingTotal)}
                  </span>
                </div>
              )}
              <div className="border-outline-variant text-on-surface flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span className="text-secondary font-mono">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
            <div className="bg-surface-container mt-3 rounded-md p-3 text-center">
              <p className="text-label-sm text-on-surface-variant font-mono">
                Previsão de entrega
              </p>
              <p className="text-label-md text-on-surface font-mono font-bold">
                {order.dueAt ? formatDate(order.dueAt) : "A definir"}
              </p>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-4">
            <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
              Ação do Cliente
            </h2>
            {order.description && (
              <p className="text-body-sm text-on-surface-variant">
                {order.description}
              </p>
            )}
            <div className="mt-auto space-y-2">
              <ConfirmApprovalButton
                orderId={id}
                itemIds={pendingItems.map((i) => i.id)}
              />
              <button className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest w-full rounded-md border px-4 py-2.5 font-mono transition-colors">
                Baixar PDF do Orçamento
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
