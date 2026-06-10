import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ServiceTimeline } from "@/_components/ui/service-timeline";
import type { serviceOrderStatus } from "@/_db/schema";
import { getOrderById } from "@/_lib/queries/orders";

type OrderStatus = (typeof serviceOrderStatus.enumValues)[number];

type Props = { params: Promise<{ id: string }> };

const statusLabel: Record<OrderStatus, string> = {
  pending: "Aguardando",
  in_progress: "Em Execução",
  completed: "Concluído",
  delayed: "Atrasado",
};

const statusStyle: Record<OrderStatus, string> = {
  pending:
    "bg-status-pending/20 text-on-surface-variant border-status-pending/30",
  in_progress: "bg-secondary/20 text-secondary border-secondary/30",
  completed:
    "bg-status-completed/20 text-status-completed border-status-completed/30",
  delayed: "bg-tertiary/20 text-tertiary border-tertiary/30",
};

function getTimelineNodes(status: OrderStatus) {
  const steps: {
    id: string;
    title: string;
    subtitle: string;
    state: "done" | "active" | "upcoming";
  }[] = [
    {
      id: "entry",
      title: "Recebido",
      subtitle: "O.S. aberta",
      state: "upcoming",
    },
    {
      id: "diag",
      title: "Diagnóstico",
      subtitle: "Avaliação técnica",
      state: "upcoming",
    },
    {
      id: "exec",
      title: "Execução",
      subtitle: "Serviço em andamento",
      state: "upcoming",
    },
    {
      id: "done",
      title: "Concluído",
      subtitle: "Pronto para retirada",
      state: "upcoming",
    },
  ];

  if (status === "pending") {
    steps[0].state = "active";
  } else if (status === "in_progress") {
    steps[0].state = "done";
    steps[1].state = "done";
    steps[2].state = "active";
  } else if (status === "delayed") {
    steps[0].state = "done";
    steps[1].state = "done";
    steps[2].state = "active";
  } else if (status === "completed") {
    steps[0].state = "done";
    steps[1].state = "done";
    steps[2].state = "done";
    steps[3].state = "done";
  }

  return steps;
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) return { title: "Ordem não encontrada" };
  return {
    title: `Rastreamento · O.S. ${id}`,
    description: `Acompanhe o status do seu veículo ${order.vehicle} na Precision Auto.`,
    robots: { index: false, follow: false },
  };
}

export default async function TrackPage({ params }: Props) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const timelineNodes = getTimelineNodes(order.status);
  const approvedItems = order.items.filter((i) => i.approved);
  const pendingItems = order.items.filter((i) => !i.approved);
  const approvedTotal = approvedItems.reduce(
    (s, i) => s + i.quantity * Number(i.unitPrice),
    0,
  );

  function brl(v: number) {
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const entryDateFormatted = format(
    new Date(order.openedAt),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  );

  const deliveryDateFormatted = order.dueAt
    ? format(new Date(order.dueAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "A definir";

  return (
    <div className="space-y-6">
      {/* O.S. Header */}
      <div className="bg-surface-container border-outline-variant/30 rounded-2xl border p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="text-secondary size-5" />
              <span className="text-label-lg text-on-surface font-mono font-bold tracking-wider uppercase">
                {order.id}
              </span>
            </div>
            <p className="text-label-sm text-on-surface-variant mt-1 font-mono">
              Entrada em {entryDateFormatted}
            </p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase ${statusStyle[order.status]}`}
          >
            {statusLabel[order.status]}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="text-secondary mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-label-xs text-on-surface-variant font-mono tracking-wider uppercase">
                Cliente
              </p>
              <p className="text-body-md text-on-surface font-medium">
                {order.customer}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Car className="text-secondary mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-label-xs text-on-surface-variant font-mono tracking-wider uppercase">
                Veículo
              </p>
              <p className="text-body-md text-on-surface font-medium">
                {order.vehicle} · {order.plate}
              </p>
              <p className="text-label-sm text-on-surface-variant font-mono">
                {order.vehicleYear} · {order.vehicleColor}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Wrench className="text-secondary mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-label-xs text-on-surface-variant font-mono tracking-wider uppercase">
                Mecânico Responsável
              </p>
              <p className="text-body-md text-on-surface font-medium">
                {order.mechanic}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="text-secondary mt-0.5 size-4 shrink-0" />
            <div>
              <p className="text-label-xs text-on-surface-variant font-mono tracking-wider uppercase">
                Previsão de Entrega
              </p>
              <p className="text-body-md text-on-surface font-medium">
                {deliveryDateFormatted}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-surface-container border-outline-variant/30 rounded-2xl border p-6">
        <h2 className="text-label-sm text-on-surface-variant mb-4 font-mono tracking-wider uppercase">
          Progresso do Serviço
        </h2>
        <ServiceTimeline nodes={timelineNodes} orientation="horizontal" />
      </div>

      {/* Pending budget approval */}
      {pendingItems.length > 0 && order.status !== "completed" && (
        <div className="border-tertiary/30 bg-tertiary/5 rounded-2xl border p-6">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="text-tertiary size-5" />
            <h2 className="text-label-sm text-tertiary font-mono font-bold tracking-wider uppercase">
              Aprovação Pendente
            </h2>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-4">
            {pendingItems.length}{" "}
            {pendingItems.length === 1 ? "item aguarda" : "itens aguardam"} sua
            aprovação para prosseguir com o serviço.
          </p>
          <Link
            href={`/orders/${order.id}/budget`}
            className="bg-tertiary text-surface hover:bg-tertiary/90 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-sm font-bold transition-colors"
          >
            <CheckCircle2 className="size-4" />
            Revisar e Aprovar Orçamento
          </Link>
        </div>
      )}

      {/* Service details */}
      <div className="bg-surface-container border-outline-variant/30 rounded-2xl border p-6">
        <h2 className="text-label-sm text-on-surface-variant mb-4 font-mono tracking-wider uppercase">
          Relato e Diagnóstico
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-label-xs text-on-surface-variant mb-1 font-mono tracking-wider uppercase">
              Relato do Cliente
            </p>
            <p className="text-body-sm text-on-surface">{order.clientReport}</p>
          </div>
          {order.diagnosis && (
            <div>
              <p className="text-label-xs text-on-surface-variant mb-1 font-mono tracking-wider uppercase">
                Diagnóstico Técnico
              </p>
              <p className="text-body-sm text-on-surface">{order.diagnosis}</p>
            </div>
          )}
        </div>
      </div>

      {/* Approved items */}
      <div className="bg-surface-container border-outline-variant/30 rounded-2xl border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
            Itens Aprovados
          </h2>
          <span className="text-label-sm text-secondary font-mono font-bold">
            {brl(approvedTotal)}
          </span>
        </div>

        {approvedItems.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant py-4 text-center">
            Nenhum item aprovado ainda.
          </p>
        ) : (
          <div className="divide-outline-variant/20 divide-y">
            {approvedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-2 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm text-on-surface truncate">
                    {item.description}
                  </p>
                  <p className="text-label-xs text-on-surface-variant font-mono">
                    {item.itemType === "part" ? "Peça" : "Mão de obra"} · Qtd:{" "}
                    {item.quantity}
                  </p>
                </div>
                <span className="text-body-sm text-on-surface shrink-0 font-mono font-medium">
                  {brl(item.quantity * Number(item.unitPrice))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR code / info box */}
      <div className="border-outline-variant/30 rounded-2xl border p-6 text-center">
        <div className="mx-auto mb-4 grid size-20 grid-cols-5 gap-0.5 rounded-lg border border-current p-2 opacity-40">
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${
                [0, 1, 2, 5, 10, 12, 14, 15, 16, 17, 20, 22, 24].includes(i)
                  ? "bg-on-surface"
                  : "bg-transparent"
              }`}
            />
          ))}
        </div>
        <p className="text-label-sm text-on-surface-variant font-mono">
          Código da O.S.:{" "}
          <span className="text-on-surface font-bold">{order.id}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 text-center">
          <div className="flex items-center gap-1.5">
            <Clock className="text-secondary size-3.5" />
            <span className="text-label-xs text-on-surface-variant font-mono">
              Seg–Sex 8h–18h
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-label-xs text-on-surface-variant font-mono">
              (11) 3456-7890
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
