import { CalendarClock, ClipboardList, DollarSign, Wrench } from "lucide-react";

export const metadata = { title: "Dashboard — Precision Auto" };

import { MetricCard } from "@/_components/dashboard/metric-card";
import { StatusChart } from "@/_components/dashboard/status-chart";
import { Card } from "@/_components/ui/card";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import {
  ServiceTimeline,
  type TimelineNode,
} from "@/_components/ui/service-timeline";
import { StatusChip } from "@/_components/ui/status-chip";
import {
  getDashboardMetrics,
  getStatusDistribution,
} from "@/_lib/queries/dashboard";
import { listOrders, type OrderRow } from "@/_lib/queries/orders";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const orderColumns: DataTableColumn<OrderRow>[] = [
  {
    id: "id",
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
    header: "Cliente",
    cell: (row) => (
      <div>
        <p className="text-body-md text-on-surface">{row.customer ?? "—"}</p>
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
      <span className="text-label-md text-on-surface font-mono">
        {brl(Number(row.totalAmount))}
      </span>
    ),
  },
];

export default async function DashboardPage() {
  const [metrics, orders, statusDist] = await Promise.all([
    getDashboardMetrics(),
    listOrders(),
    getStatusDistribution(),
  ]);

  const statusChartData = statusDist.map((s) => ({
    status: s.status,
    label:
      s.status === "in_progress"
        ? "Em Progresso"
        : s.status === "completed"
          ? "Concluído"
          : s.status === "delayed"
            ? "Atrasado"
            : "Pendente",
    value: s.count,
  }));

  const upcomingDeliveries: TimelineNode[] = orders
    .filter((o) => o.status !== "completed")
    .slice(0, 4)
    .map((o, i) => ({
      id: o.id,
      title: o.plate,
      subtitle: o.customer ?? o.vehicle,
      state: i === 0 ? "active" : "upcoming",
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          Dashboard Operacional
        </h1>
        <p className="text-label-md text-on-surface-variant mt-1 font-mono">
          Visão geral da oficina em tempo real
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Ordens Abertas"
          value={metrics.openOrders}
          icon={ClipboardList}
          hint="Em andamento"
          accent="secondary"
        />
        <MetricCard
          label="Veículos Prontos"
          value={metrics.readyVehicles}
          icon={Wrench}
          hint="Aguardando retirada"
          accent="completed"
        />
        <MetricCard
          label="Agendamentos Hoje"
          value={metrics.todayAppointments}
          icon={CalendarClock}
          hint="No dia de hoje"
          accent="secondary"
        />
        <MetricCard
          label="Total de O.S."
          value={orders.length}
          icon={DollarSign}
          hint="Todas as ordens"
          accent="tertiary"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <div className="border-outline-variant flex items-center justify-between border-b p-4">
            <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
              Ordens Recentes
            </h2>
            <a
              href="/orders"
              className="text-label-sm text-secondary font-mono hover:underline"
            >
              Ver todas
            </a>
          </div>
          <DataTable
            columns={orderColumns}
            data={orders.slice(0, 4)}
            getRowId={(row) => row.id}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
              Status da Oficina
            </h2>
            <StatusChart data={statusChartData} />
          </Card>

          <Card className="p-4">
            <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
              Próximas Entregas
            </h2>
            <ServiceTimeline nodes={upcomingDeliveries} />
          </Card>
        </div>
      </div>
    </div>
  );
}
