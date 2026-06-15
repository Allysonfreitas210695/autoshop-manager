"use client";

import { BarChart3, Star, TrendingUp, Users } from "lucide-react";

import type {
  AnalyticsKpis,
  MechanicPerformance,
  MonthlyRevenue,
  ServiceCategory,
} from "@/_data-access/analytics";
import { formatCurrency } from "@/_helpers/format";

import {
  MechanicBarChart,
  RevenueLineChart,
  ServicePieChart,
} from "./AnalyticsCharts";

function shortBrl(v: number) {
  if (v >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `R$${(v / 1_000).toFixed(0)}k`;
  return formatCurrency(v);
}

type Props = {
  kpis: AnalyticsKpis;
  monthlyRevenue: MonthlyRevenue[];
  mechanicPerformance: MechanicPerformance[];
  serviceCategories: ServiceCategory[];
};

export function AnalyticsClient({
  kpis: analyticsKpis,
  monthlyRevenue,
  mechanicPerformance,
  serviceCategories,
}: Props) {
  const kpis = [
    {
      label: "Receita 12 meses",
      value: shortBrl(analyticsKpis.totalRevenue12m),
      sub: "Receitas pagas no período",
      icon: TrendingUp,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Total de O.S.",
      value: analyticsKpis.totalOrders12m.toString(),
      sub: `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`,
      icon: BarChart3,
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
    {
      label: "Margem Líquida",
      value: `${analyticsKpis.netMargin}%`,
      sub: "Sobre o faturamento bruto",
      icon: TrendingUp,
      color: "text-status-completed",
      bg: "bg-status-completed/10",
    },
    {
      label: "NPS",
      value: analyticsKpis.nps.toString(),
      sub: `${analyticsKpis.returnRate}% taxa de retorno`,
      icon: Star,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      label: "Clientes Ativos",
      value: analyticsKpis.activeCustomers.toString(),
      sub: `${analyticsKpis.newCustomers} novos este ano`,
      icon: Users,
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
  ];

  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const revenueGrowth =
    currentMonth && prevMonth && prevMonth.revenue > 0
      ? (
          ((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) *
          100
        ).toFixed(1)
      : null;

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
        {currentMonth ? (
          <div className="flex items-center gap-6 pb-1">
            <div>
              <p className="text-label-sm text-on-surface-variant">Mês atual</p>
              <p className="text-title-md text-on-surface font-mono font-bold">
                {shortBrl(currentMonth.revenue)}
              </p>
            </div>
            {revenueGrowth !== null && (
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
            )}
            <div>
              <p className="text-label-sm text-on-surface-variant">
                O.S. no mês
              </p>
              <p className="text-title-sm text-on-surface font-mono font-bold">
                {currentMonth.orders}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant pb-1">
            Sem dados de receita no período.
          </p>
        )}
        <RevenueLineChart data={monthlyRevenue} />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Mechanic performance */}
        <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
          <h2 className="text-title-sm text-on-surface font-semibold">
            Performance por Mecânico
          </h2>
          {mechanicPerformance.length > 0 ? (
            <>
              <MechanicBarChart data={mechanicPerformance} />
              <div className="space-y-2">
                {mechanicPerformance.map((m) => (
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
            </>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              Nenhuma O.S. atribuída a mecânicos ainda.
            </p>
          )}
        </div>

        {/* Service breakdown */}
        <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
          <h2 className="text-title-sm text-on-surface font-semibold">
            Receita por Categoria de Serviço
          </h2>
          {serviceCategories.length > 0 ? (
            <>
              <ServicePieChart data={serviceCategories} />
              <div className="space-y-2">
                {serviceCategories.map((cat, i) => {
                  // chart-data palette — hex allowed here, not UI chrome
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
                          style={{
                            backgroundColor: colors[i % colors.length],
                          }}
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
            </>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              Nenhuma O.S. com tipo de serviço registrado.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
