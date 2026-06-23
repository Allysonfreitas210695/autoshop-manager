import { formatCurrency } from "@/_helpers/format";
export const metadata = { title: "Relatórios Financeiros — Precision Auto" };

import { ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card } from "@/_components/ui/card";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import {
  type CategoryReport,
  getCategoryReport,
  getCostBreakdown,
  getFinanceMetrics,
  getMonthlyCashFlow,
} from "@/_data-access/finance";
import { getReportOrderCount } from "@/_data-access/finance";

import { CostDonutChart, MonthlyLineChart } from "../finance-charts";
import { ExportPdfButton } from "./export-pdf-button";

type StatusKey = "positive" | "neutral" | "negative";

const statusClass: Record<StatusKey, string> = {
  positive: "bg-status-completed/15 text-status-completed",
  neutral: "bg-secondary/15 text-secondary",
  negative: "bg-error/15 text-error",
};

const statusLabel: Record<StatusKey, string> = {
  positive: "Lucrativo",
  neutral: "Neutro",
  negative: "Deficitário",
};

type CategoryRow = CategoryReport & { id: string };

const columns: DataTableColumn<CategoryRow>[] = [
  {
    id: "category",
    header: "Categoria",
    cell: (row) => (
      <span className="text-body-sm text-on-surface font-medium">
        {row.category}
      </span>
    ),
  },
  {
    id: "grossRevenue",
    header: "Fat. Bruto",
    className: "hidden sm:table-cell",
    align: "right",
    cell: (row) => (
      <span className="text-label-sm text-on-surface font-mono">
        {formatCurrency(row.grossRevenue)}
      </span>
    ),
  },
  {
    id: "totalExpenses",
    header: "Despesas",
    className: "hidden md:table-cell",
    align: "right",
    cell: (row) => (
      <span className="text-label-sm text-error font-mono">
        -{formatCurrency(row.totalExpenses)}
      </span>
    ),
  },
  {
    id: "netProfit",
    header: "Lucro Líq.",
    align: "right",
    cell: (row) => (
      <span
        className={`text-label-md font-mono font-bold ${row.status === "negative" ? "text-error" : "text-status-completed"}`}
      >
        {formatCurrency(row.netProfit)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${statusClass[row.status]}`}
      >
        {statusLabel[row.status]}
      </span>
    ),
  },
];

type Period = "mensal" | "trimestral" | "anual";

function getPeriodDays(period: Period): number {
  if (period === "trimestral") return 90;
  if (period === "anual") return 365;
  return 30;
}

const PERIODS: { key: Period; label: string }[] = [
  { key: "mensal", label: "Mensal" },
  { key: "trimestral", label: "Trimestral" },
  { key: "anual", label: "Anual" },
];

type Props = { searchParams: Promise<{ periodo?: string }> };

export default async function FinanceReportsPage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const activePeriod: Period =
    periodo === "trimestral" || periodo === "anual" ? periodo : "mensal";
  const days = getPeriodDays(activePeriod);

  const [monthlyCashFlow, costBreakdown, metrics, categoryRows, orderCount] =
    await Promise.all([
      getMonthlyCashFlow(6),
      getCostBreakdown(),
      getFinanceMetrics(days),
      getCategoryReport(days),
      getReportOrderCount(6),
    ]);

  const categoryRowsWithId: CategoryRow[] = categoryRows.map((r, i) => ({
    ...r,
    id: String(i),
  }));

  const lastMonth = monthlyCashFlow[monthlyCashFlow.length - 1];
  const totalRevenue = lastMonth?.receitas ?? metrics.monthlyRevenue;
  const totalExpenses = lastMonth?.despesas ?? 0;
  const totalProfit = lastMonth?.lucro ?? metrics.monthlyProfit;

  // M10: usar contagem real de O.S. como denominador do ticket médio
  const avgTicket = orderCount > 0 ? totalRevenue / orderCount : 0;
  const netMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0.0";

  const reportKpis = [
    { label: "Ticket Médio O.S.", value: formatCurrency(avgTicket) },
    { label: "Margem Líquida", value: `${netMargin}%` },
    { label: "O.S. no Período", value: String(orderCount) },
    { label: "Lucro Líquido", value: formatCurrency(totalProfit) },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/finance"
            className="text-label-sm text-on-surface-variant hover:text-secondary mb-2 inline-flex items-center gap-1.5 font-mono"
          >
            <ArrowLeft className="size-3.5" />
            Voltar para Financeiro
          </Link>
          <h1 className="text-headline-md text-on-surface font-bold">
            Relatório de Lucratividade
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            Últimos 6 meses
          </p>
        </div>
        <ExportPdfButton />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {reportKpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
              {kpi.label}
            </p>
            <p className="text-headline-sm text-secondary mt-2 font-mono font-bold">
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Gráfico de linha + Donut */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-outline-variant border-b p-4">
            <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
              Fluxo de Caixa Mensal
            </h2>
            <div className="text-label-sm text-on-surface-variant mt-1 flex flex-wrap gap-4 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="bg-secondary size-2.5 rounded-full" />
                Receitas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-tertiary size-2.5 rounded-full" />
                Despesas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-status-completed size-2.5 rounded-full" />
                Lucro
              </span>
            </div>
          </div>
          <div className="overflow-x-auto p-4">
            <div className="min-w-[360px]">
              <MonthlyLineChart data={monthlyCashFlow} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
            Custos por Categoria
          </h2>
          <div className="overflow-x-auto">
            <div className="min-w-[280px]">
              <CostDonutChart data={costBreakdown} />
            </div>
          </div>
          <div className="border-outline-variant mt-4 space-y-2 border-t pt-4">
            <div className="text-body-sm text-on-surface-variant flex justify-between">
              <span>Total custos</span>
              <span className="text-error font-mono font-bold">
                -
                {formatCurrency(costBreakdown.reduce((s, d) => s + d.value, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo mensal */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Receita Bruta",
            value: totalRevenue,
            icon: TrendingUp,
            color: "text-status-completed",
            bg: "bg-status-completed/10",
          },
          {
            label: "Despesas Totais",
            value: totalExpenses,
            icon: TrendingDown,
            color: "text-error",
            bg: "bg-error/10",
          },
          {
            label: "Lucro Líquido",
            value: totalProfit,
            icon: TrendingUp,
            color: "text-secondary",
            bg: "bg-secondary/10",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="flex items-center gap-4 p-4">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full ${bg}`}
            >
              <Icon className={`size-5 ${color}`} />
            </span>
            <div>
              <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
                {label}
              </p>
              <p className={`text-headline-sm font-mono font-bold ${color}`}>
                {formatCurrency(value)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabela por categoria */}
      <Card>
        <div className="border-outline-variant border-b p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
                Detalhamento por Categoria
              </h2>
              <p className="text-label-sm text-on-surface-variant font-mono">
                Lucratividade por tipo de transação
              </p>
            </div>
            {/* Filtros de período */}
            <div className="flex gap-2">
              {PERIODS.map(({ key, label }) => (
                <Link
                  key={key}
                  href={`/finance/reports?periodo=${key}`}
                  className={`text-label-sm shrink-0 rounded-full border px-4 py-1.5 font-mono transition-colors ${
                    activePeriod === key
                      ? "border-secondary bg-secondary/10 text-secondary"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <DataTable
          columns={columns}
          data={categoryRowsWithId}
          getRowId={(row) => row.id}
          emptyMessage="Nenhum dado disponível."
        />
      </Card>
    </div>
  );
}
