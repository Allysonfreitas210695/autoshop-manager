import { ArrowLeft, Download, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { Card } from "@/_components/ui/card";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import {
  mockCostBreakdown,
  mockMonthlyCashFlow,
  mockReportKpis,
  type MockServiceDetail,
  mockServiceDetails,
} from "@/_lib/mock-data";

import { CostDonutChart, MonthlyLineChart } from "../finance-charts";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const statusClass: Record<MockServiceDetail["status"], string> = {
  positive: "bg-status-completed/15 text-status-completed",
  neutral: "bg-secondary/15 text-secondary",
  negative: "bg-error/15 text-error",
};

const statusLabel: Record<MockServiceDetail["status"], string> = {
  positive: "Lucrativo",
  neutral: "Neutro",
  negative: "Deficitário",
};

const columns: DataTableColumn<MockServiceDetail>[] = [
  {
    id: "category",
    header: "Categoria de Serviço",
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
        {brl(row.grossRevenue)}
      </span>
    ),
  },
  {
    id: "partsCost",
    header: "Peças",
    className: "hidden md:table-cell",
    align: "right",
    cell: (row) => (
      <span className="text-label-sm text-error font-mono">
        -{brl(row.partsCost)}
      </span>
    ),
  },
  {
    id: "laborCost",
    header: "M. de Obra",
    className: "hidden lg:table-cell",
    align: "right",
    cell: (row) => (
      <span className="text-label-sm text-error font-mono">
        -{brl(row.laborCost)}
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
        {brl(row.netProfit)}
      </span>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] tracking-wider uppercase ${statusClass[row.status]}`}
      >
        {statusLabel[row.status]}
      </span>
    ),
  },
];

export default function FinanceReportsPage() {
  const totalRevenue =
    mockMonthlyCashFlow[mockMonthlyCashFlow.length - 1]?.receitas ?? 0;
  const totalExpenses =
    mockMonthlyCashFlow[mockMonthlyCashFlow.length - 1]?.despesas ?? 0;
  const totalProfit =
    mockMonthlyCashFlow[mockMonthlyCashFlow.length - 1]?.lucro ?? 0;

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
          <h1 className="text-headline-lg text-on-surface font-bold">
            Relatório de Lucratividade
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            Outubro 2023
          </p>
        </div>
        <button className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2 rounded-md border px-4 py-2 font-mono transition-colors">
          <Download className="size-4" />
          Exportar PDF
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {mockReportKpis.map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
              {kpi.label}
            </p>
            <p className="text-headline-sm text-secondary mt-2 font-mono font-bold">
              {kpi.value}
            </p>
            {kpi.hint && (
              <p className="text-label-sm text-status-completed mt-1 font-mono">
                {kpi.hint}
              </p>
            )}
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
          <div className="p-4">
            <MonthlyLineChart data={mockMonthlyCashFlow} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
            Custos Fixos vs Variáveis
          </h2>
          <CostDonutChart data={mockCostBreakdown} />
          <div className="border-outline-variant mt-4 space-y-2 border-t pt-4">
            <div className="text-body-sm text-on-surface-variant flex justify-between">
              <span>Total custos</span>
              <span className="text-error font-mono font-bold">
                -{brl(mockCostBreakdown.reduce((s, d) => s + d.value, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Resumo mensal comparativo */}
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
                {brl(value)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabela de detalhamento */}
      <Card>
        <div className="border-outline-variant border-b p-4">
          <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
            Detalhamento por Categoria
          </h2>
          <p className="text-label-sm text-on-surface-variant font-mono">
            Lucratividade por tipo de serviço — Outubro 2023
          </p>
        </div>
        <DataTable
          columns={columns}
          data={mockServiceDetails}
          getRowId={(row) => row.id}
          emptyMessage="Nenhum dado disponível."
        />
      </Card>
    </div>
  );
}
