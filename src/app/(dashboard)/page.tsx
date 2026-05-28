import { CalendarClock, ClipboardList, DollarSign, Wrench } from "lucide-react";

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
  mockMetrics,
  type MockOrder,
  mockOrders,
  mockStatusDistribution,
  mockUpcomingDeliveries,
} from "@/_lib/mock-data";

const orderColumns: DataTableColumn<MockOrder>[] = [
  {
    id: "id",
    header: "O.S.",
    cell: (row) => (
      <span className="text-label-md text-secondary font-mono">{row.id}</span>
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
        <p className="text-body-md text-on-surface">{row.customer}</p>
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
        {row.mechanic}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <StatusChip status={row.status} />,
  },
  {
    id: "total",
    header: "Total",
    align: "right",
    cell: (row) => (
      <span className="text-label-md text-on-surface font-mono">
        {row.total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </span>
    ),
  },
];

export default function DashboardPage() {
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
          label="Faturamento do dia"
          value={mockMetrics.revenueToday}
          icon={DollarSign}
          format="currency"
          hint="↑ 12% ontem"
          hintTone="positive"
          accent="secondary"
        />
        <MetricCard
          label="Ordens Abertas"
          value={mockMetrics.openOrders}
          icon={ClipboardList}
          hint="4 atrasadas"
          accent="tertiary"
        />
        <MetricCard
          label="Veículos Prontos"
          value={mockMetrics.readyVehicles}
          icon={Wrench}
          hint="Aguardando retirada"
          accent="completed"
        />
        <MetricCard
          label="Agendamentos"
          value={mockMetrics.appointments}
          icon={CalendarClock}
          hint="Próximos 3 dias"
          accent="secondary"
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
            data={mockOrders.slice(0, 4)}
            getRowId={(row) => row.id}
          />
        </Card>

        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
              Status da Oficina
            </h2>
            <StatusChart data={mockStatusDistribution} />
          </Card>

          <Card className="p-4">
            <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
              Próximas Entregas
            </h2>
            <ServiceTimeline
              nodes={mockUpcomingDeliveries.map((d) => ({
                id: d.id,
                title: d.title,
                subtitle: d.subtitle,
                state: d.state as TimelineNode["state"],
              }))}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
