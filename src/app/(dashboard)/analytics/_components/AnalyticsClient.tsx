"use client";

import { BarChart3, Star, TrendingUp, Users } from "lucide-react";

import {
  mockAnalyticsKpis,
  mockMechanicPerformance,
  mockMonthlyRevenue,
  mockServiceCategories,
} from "@/_lib/mock-data";

import {
  MechanicBarChart,
  RevenueLineChart,
  ServicePieChart,
} from "./AnalyticsCharts";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function shortBrl(v: number) {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return brl(v);
}

const kpis = [
  {
    label: "Receita 12 meses",
    value: shortBrl(mockAnalyticsKpis.totalRevenue12m),
    sub: "+12% vs ano anterior",
    icon: TrendingUp,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    label: "Total de O.S.",
    value: mockAnalyticsKpis.totalOrders12m.toString(),
    sub: `Ticket médio ${brl(mockAnalyticsKpis.avgTicket)}`,
    icon: BarChart3,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    label: "Margem Líquida",
    value: `${mockAnalyticsKpis.netMargin}%`,
    sub: "Sobre o faturamento bruto",
    icon: TrendingUp,
    color: "text-status-completed",
    bg: "bg-status-completed/10",
  },
  {
    label: "NPS",
    value: mockAnalyticsKpis.nps.toString(),
    sub: `${mockAnalyticsKpis.returnRate}% taxa de retorno`,
    icon: Star,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    label: "Clientes Ativos",
    value: mockAnalyticsKpis.activeCustomers.toString(),
    sub: `${mockAnalyticsKpis.newCustomers} novos este ano`,
    icon: Users,
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
];

export function AnalyticsClient() {
  const currentMonth = mockMonthlyRevenue[mockMonthlyRevenue.length - 1];
  const prevMonth = mockMonthlyRevenue[mockMonthlyRevenue.length - 2];
  const revenueGrowth = (
    ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-headline-md text-on-surface font-bold">
          Dashboard Estratégico
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-0.5">
          Visão analítica de desempenho — últimos 12 meses
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-container border-outline-variant/30 space-y-2 rounded-xl border p-4"
          >
            <div
              className={`size-8 rounded-lg ${kpi.bg} flex items-center justify-center`}
            >
              <kpi.icon className={`size-4 ${kpi.color}`} />
            </div>
            <p className={`text-display-xs font-mono font-bold ${kpi.color}`}>
              {kpi.value}
            </p>
            <div>
              <p className="text-label-sm text-on-surface leading-tight font-medium">
                {kpi.label}
              </p>
              <p className="text-label-xs text-on-surface-variant mt-0.5">
                {kpi.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue trend */}
      <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-sm text-on-surface font-semibold">
              Evolução da Receita
            </h2>
            <p className="text-label-sm text-on-surface-variant">
              Receita · Despesas · Lucro Líquido
            </p>
          </div>
          <div className="text-label-sm flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="bg-secondary inline-block size-2.5 rounded-full" />
              <span className="text-on-surface-variant">Receita</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-tertiary inline-block size-2.5 rounded-full" />
              <span className="text-on-surface-variant">Despesas</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-status-completed inline-block size-2.5 rounded-full" />
              <span className="text-on-surface-variant">Lucro</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6 pb-1">
          <div>
            <p className="text-label-sm text-on-surface-variant">Mês atual</p>
            <p className="text-title-md text-on-surface font-mono font-bold">
              {shortBrl(currentMonth.revenue)}
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">
              vs. mês anterior
            </p>
            <p
              className={`text-title-sm font-mono font-bold ${Number(revenueGrowth) >= 0 ? "text-status-completed" : "text-error"}`}
            >
              {Number(revenueGrowth) >= 0 ? "+" : ""}
              {revenueGrowth}%
            </p>
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant">O.S. no mês</p>
            <p className="text-title-sm text-on-surface font-mono font-bold">
              {currentMonth.orders}
            </p>
          </div>
        </div>
        <RevenueLineChart data={mockMonthlyRevenue} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mechanic performance */}
        <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
          <h2 className="text-title-sm text-on-surface font-semibold">
            Performance por Mecânico
          </h2>
          <MechanicBarChart data={mockMechanicPerformance} />
          <div className="space-y-2">
            {mockMechanicPerformance.map((m) => (
              <div
                key={m.name}
                className="border-outline-variant/20 flex items-center justify-between border-b py-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-secondary/10 text-label-xs text-secondary flex size-7 items-center justify-center rounded-full font-mono font-bold">
                    {m.name[0]}
                  </div>
                  <div>
                    <p className="text-body-sm text-on-surface font-medium">
                      {m.name}
                    </p>
                    <p className="text-label-xs text-on-surface-variant font-mono">
                      {m.orders} O.S. · {m.completionRate}% conclusão
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-body-sm text-on-surface font-mono font-medium">
                    {shortBrl(m.revenue)}
                  </p>
                  <div className="flex items-center justify-end gap-0.5">
                    <Star className="text-tertiary fill-tertiary size-3" />
                    <span className="text-label-xs text-tertiary font-mono">
                      {m.avgRating}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service breakdown */}
        <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
          <h2 className="text-title-sm text-on-surface font-semibold">
            Receita por Categoria de Serviço
          </h2>
          <ServicePieChart data={mockServiceCategories} />
          <div className="space-y-2">
            {mockServiceCategories.map((cat, i) => {
              const colors = [
                "#adc6ff",
                "#ffb690",
                "#22C55E",
                "#a78bfa",
                "#f472b6",
                "#94a3b8",
              ];
              return (
                <div
                  key={cat.category}
                  className="border-outline-variant/20 flex items-center justify-between border-b py-1.5 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: colors[i % colors.length] }}
                    />
                    <span className="text-body-sm text-on-surface">
                      {cat.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-label-sm text-on-surface-variant hidden font-mono sm:inline">
                      {cat.orders} O.S.
                    </span>
                    <span className="text-body-sm text-on-surface font-mono font-medium">
                      {cat.percentage}%
                    </span>
                    <span className="text-label-sm text-on-surface-variant w-16 text-right font-mono">
                      {shortBrl(cat.revenue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Predictive alerts */}
      <div className="bg-surface-container border-outline-variant/30 space-y-3 rounded-2xl border p-5">
        <h2 className="text-title-sm text-on-surface font-semibold">
          Alertas Estratégicos
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            {
              label: "Receita acima da meta",
              detail: "Abr/26 superou a projeção em R$4.2k",
              variant: "success",
            },
            {
              label: "Pico de demanda previsto",
              detail: "Jun/26 tende a crescer 8% com base no histórico",
              variant: "info",
            },
            {
              label: "Custo de peças elevado",
              detail: "Despesas com estoque subiram 5% em 2 meses",
              variant: "warning",
            },
          ].map((alert) => (
            <div
              key={alert.label}
              className={`rounded-xl border p-4 ${
                alert.variant === "success"
                  ? "bg-status-completed/10 border-status-completed/20"
                  : alert.variant === "info"
                    ? "bg-secondary/10 border-secondary/20"
                    : "bg-tertiary/10 border-tertiary/20"
              }`}
            >
              <p
                className={`text-label-sm font-semibold ${
                  alert.variant === "success"
                    ? "text-status-completed"
                    : alert.variant === "info"
                      ? "text-secondary"
                      : "text-tertiary"
                }`}
              >
                {alert.label}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-1">
                {alert.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
