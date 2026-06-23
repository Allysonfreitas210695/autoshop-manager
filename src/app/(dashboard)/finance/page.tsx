import { formatCurrency } from "@/_helpers/format";
export const metadata = { title: "Financeiro — Precision Auto" };

import { ArrowUpRight, DollarSign, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

import { Card } from "@/_components/ui/card";
import {
  getFinanceMetrics,
  getWeeklyCashFlow,
  listTransactions,
} from "@/_data-access/finance";

import { CashFlowBarChart } from "./finance-charts";
import { FinanceActionsWithDrawer } from "./FinanceActionsWithDrawer";
import { transactionColumns } from "./transaction-columns";
import { TransactionsTableWithDrawer } from "./TransactionsTableWithDrawer";

type Period = "mensal" | "trimestral" | "anual";

function getPeriodDays(period: Period): number {
  if (period === "trimestral") return 90;
  if (period === "anual") return 365;
  return 30;
}

type Props = { searchParams: Promise<{ periodo?: string }> };

export default async function FinancePage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const activePeriod: Period =
    periodo === "trimestral" || periodo === "anual" ? periodo : "mensal";
  const days = getPeriodDays(activePeriod);

  const [metrics, transactions, cashFlow] = await Promise.all([
    getFinanceMetrics(days),
    listTransactions(50),
    getWeeklyCashFlow(),
  ]);

  const PERIODS: { key: Period; label: string }[] = [
    { key: "mensal", label: "Mensal" },
    { key: "trimestral", label: "Trimestral" },
    { key: "anual", label: "Anual" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-headline-md text-on-surface font-bold">
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
          <FinanceActionsWithDrawer />
        </div>
      </div>

      {/* Filtros de período */}
      <div className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {PERIODS.map(({ key, label }) => (
          <Link
            key={key}
            href={`/finance?periodo=${key}`}
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

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
                Contas a Receber
              </p>
              <p className="text-headline-md text-status-completed mt-2 font-mono font-bold">
                {formatCurrency(metrics.receivable)}
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
                {formatCurrency(metrics.monthlyRevenue)}
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
                {formatCurrency(metrics.pendingExpenses)}
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
          <div className="overflow-x-auto p-4">
            <div className="min-w-[300px]">
              <CashFlowBarChart data={cashFlow} />
            </div>
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
                  {formatCurrency(item.value)}
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
        <TransactionsTableWithDrawer
          transactions={transactions}
          columns={transactionColumns}
        />
      </Card>
    </div>
  );
}
