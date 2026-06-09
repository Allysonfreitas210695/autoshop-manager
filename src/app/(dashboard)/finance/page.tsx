import {
  ArrowDownRight,
  ArrowUpRight,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import { Card } from "@/_components/ui/card";
import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import {
  getFinanceMetrics,
  getWeeklyCashFlow,
  listTransactions,
  type Transaction,
} from "@/_lib/queries/finance";

import { CashFlowBarChart } from "./finance-charts";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

type TransactionStatus = Transaction["status"];

const statusLabel: Record<TransactionStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencido",
};

const statusClass: Record<TransactionStatus, string> = {
  paid: "bg-status-completed/15 text-status-completed",
  pending: "bg-tertiary/15 text-tertiary",
  overdue: "bg-error/15 text-error",
};

const columns: DataTableColumn<Transaction>[] = [
  {
    id: "date",
    header: "Data",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {new Date(row.date).toLocaleDateString("pt-BR")}
      </span>
    ),
  },
  {
    id: "description",
    header: "Descrição",
    cell: (row) => (
      <div>
        <p className="text-body-sm text-on-surface font-medium">
          {row.description}
        </p>
        <p className="text-label-sm text-on-surface-variant font-mono">
          {row.category}
        </p>
      </div>
    ),
  },
  {
    id: "type",
    header: "Tipo",
    className: "hidden md:table-cell",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        {row.type === "income" ? (
          <ArrowUpRight className="text-status-completed size-3.5" />
        ) : (
          <ArrowDownRight className="text-error size-3.5" />
        )}
        <span className="text-label-sm text-on-surface-variant font-mono">
          {row.type === "income" ? "Receita" : "Despesa"}
        </span>
      </div>
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
  {
    id: "amount",
    header: "Valor",
    align: "right",
    cell: (row) => (
      <span
        className={`text-label-md font-mono font-bold ${row.type === "income" ? "text-status-completed" : "text-error"}`}
      >
        {row.type === "income" ? "+" : "-"}
        {brl(row.amount)}
      </span>
    ),
  },
];

export default async function FinancePage() {
  const [metrics, transactions, cashFlow] = await Promise.all([
    getFinanceMetrics(),
    listTransactions(50),
    getWeeklyCashFlow(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-lg text-on-surface font-bold">
            Financeiro
          </h1>
          <p className="text-label-md text-on-surface-variant mt-1 font-mono">
            Visão geral consolidada
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/finance/reports"
            className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest rounded-md border px-4 py-2 font-mono transition-colors"
          >
            Ver Relatórios
          </Link>
          <button className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 rounded-md px-4 py-2 font-mono font-bold transition-colors">
            Quick Actions
          </button>
        </div>
      </div>

      {/* Filtros de período */}
      <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {["Mensal", "Trimestral", "Anual"].map((p) => (
          <button
            key={p}
            className={`text-label-sm shrink-0 rounded-full border px-4 py-1.5 font-mono transition-colors ${
              p === "Mensal"
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
                Contas a Receber
              </p>
              <p className="text-headline-md text-status-completed mt-2 font-mono font-bold">
                {brl(metrics.receivable)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-1 font-mono">
                Pendente de recebimento
              </p>
            </div>
            <span className="bg-status-completed/10 flex size-10 items-center justify-center rounded-full">
              <ArrowUpRight className="text-status-completed size-5" />
            </span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
                Faturamento Total
              </p>
              <p className="text-headline-md text-secondary mt-2 font-mono font-bold">
                {brl(metrics.monthlyRevenue)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-1 font-mono">
                Receitas pagas
              </p>
            </div>
            <span className="bg-secondary/10 flex size-10 items-center justify-center rounded-full">
              <TrendingUp className="text-secondary size-5" />
            </span>
          </div>
        </Card>

        <Card className="p-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
                Despesas Pendentes
              </p>
              <p className="text-headline-md text-tertiary mt-2 font-mono font-bold">
                {brl(metrics.pendingExpenses)}
              </p>
              <p className="text-label-sm text-on-surface-variant mt-1 font-mono">
                A pagar
              </p>
            </div>
            <span className="bg-tertiary/10 flex size-10 items-center justify-center rounded-full">
              <Wallet className="text-tertiary size-5" />
            </span>
          </div>
        </Card>
      </div>

      {/* Gráfico + Resumo */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="border-outline-variant flex items-center justify-between border-b p-4">
            <div>
              <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
                Fluxo de Caixa
              </h2>
              <p className="text-label-sm text-on-surface-variant font-mono">
                Receitas vs Despesas por semana
              </p>
            </div>
            <div className="text-label-sm text-on-surface-variant flex items-center gap-4 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="bg-secondary size-2.5 rounded-full" />
                Receitas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="bg-tertiary size-2.5 rounded-full" />
                Despesas
              </span>
            </div>
          </div>
          <div className="p-4">
            <CashFlowBarChart data={cashFlow} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-label-lg text-on-surface mb-4 font-mono font-semibold tracking-wider uppercase">
            Resumo
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Receita Bruta",
                value: metrics.monthlyRevenue,
                color: "text-status-completed",
              },
              {
                label: "Despesas Totais",
                value: metrics.monthlyRevenue - metrics.monthlyProfit,
                color: "text-error",
              },
              {
                label: "Lucro Líquido",
                value: metrics.monthlyProfit,
                color: "text-secondary",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border-outline-variant flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
              >
                <span className="text-body-sm text-on-surface-variant">
                  {item.label}
                </span>
                <span
                  className={`text-label-md font-mono font-bold ${item.color}`}
                >
                  {brl(item.value)}
                </span>
              </div>
            ))}
            {metrics.monthlyRevenue > 0 && (
              <div className="bg-secondary/5 rounded-md px-3 py-2 text-center">
                <p className="text-label-sm text-on-surface-variant font-mono">
                  Margem Líquida
                </p>
                <p className="text-headline-sm text-secondary font-mono font-bold">
                  {(
                    (metrics.monthlyProfit / metrics.monthlyRevenue) *
                    100
                  ).toFixed(1)}
                  %
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tabela de transações */}
      <Card>
        <div className="border-outline-variant flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="text-secondary size-4" />
            <h2 className="text-label-lg text-on-surface font-mono font-semibold tracking-wider uppercase">
              Transações Recentes
            </h2>
          </div>
          <Link
            href="/finance/reports"
            className="text-label-sm text-secondary font-mono hover:underline"
          >
            Ver relatório
          </Link>
        </div>
        <DataTable
          columns={columns}
          data={transactions}
          getRowId={(row) => row.id}
          emptyMessage="Nenhuma transação encontrada."
        />
      </Card>
    </div>
  );
}
