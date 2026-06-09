import { desc, sql } from "drizzle-orm";

import { db } from "@/_db";
import { transactions } from "@/_db/schema";

const COST_COLORS: Record<string, string> = {
  Serviço: "#adc6ff",
  Peças: "#ffb690",
  "Mão de Obra": "#a78bfa",
  Fornecedor: "#f472b6",
  "Despesa Fixa": "#94a3b8",
  Imposto: "#475569",
  Outros: "#64748b",
};

export type Transaction = {
  id: string;
  date: Date;
  description: string;
  category: string;
  type: "income" | "expense";
  amount: number;
  status: "paid" | "pending" | "overdue";
  serviceOrderId: string | null;
};

export type FinanceMetrics = {
  receivable: number;
  monthlyRevenue: number;
  pendingExpenses: number;
  monthlyProfit: number;
};

export async function listTransactions(limit = 50): Promise<Transaction[]> {
  const rows = await db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date))
    .limit(limit);

  return rows.map((r) => ({
    id: r.id,
    date: r.date,
    description: r.description,
    category: r.category,
    type: r.type,
    amount: Number(r.amount),
    status: r.status,
    serviceOrderId: r.serviceOrderId,
  }));
}

export type WeeklyCashFlow = {
  week: string;
  receitas: number;
  despesas: number;
};
export type MonthlyCashFlow = {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
};
export type CostBreakdownEntry = { name: string; value: number; fill: string };

export async function getFinanceMetrics(): Promise<FinanceMetrics> {
  const [metrics] = await db
    .select({
      monthlyRevenue: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
      receivable: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'pending' then ${transactions.amount}::numeric else 0 end), 0)`,
      pendingExpenses: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' and ${transactions.status} != 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
      totalExpenses: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
    })
    .from(transactions);

  const monthlyRevenue = Number(metrics?.monthlyRevenue ?? 0);
  const totalExpenses = Number(metrics?.totalExpenses ?? 0);

  return {
    receivable: Number(metrics?.receivable ?? 0),
    monthlyRevenue,
    pendingExpenses: Number(metrics?.pendingExpenses ?? 0),
    monthlyProfit: monthlyRevenue - totalExpenses,
  };
}

export async function getWeeklyCashFlow(): Promise<WeeklyCashFlow[]> {
  const rows = await db
    .select({
      weekNum: sql<number>`extract(week from ${transactions.date})`,
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.date} >= current_date - interval '28 days' and ${transactions.status} = 'paid'`,
    )
    .groupBy(sql`extract(week from ${transactions.date})`, transactions.type)
    .orderBy(sql`extract(week from ${transactions.date})`);

  const map = new Map<number, { receitas: number; despesas: number }>();
  for (const r of rows) {
    const w = Number(r.weekNum);
    if (!map.has(w)) map.set(w, { receitas: 0, despesas: 0 });
    const e = map.get(w)!;
    if (r.type === "income") e.receitas = Number(r.total);
    else e.despesas = Number(r.total);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, d], i) => ({ week: `Sem ${i + 1}`, ...d }));
}

export async function getMonthlyCashFlow(
  months = 6,
): Promise<MonthlyCashFlow[]> {
  const MONTH_ABBR = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  const rows = await db
    .select({
      yr: sql<number>`extract(year from ${transactions.date})`,
      mo: sql<number>`extract(month from ${transactions.date})`,
      type: transactions.type,
      total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.date} >= date_trunc('month', current_date) - interval '${sql.raw(String(months - 1))} months' and ${transactions.status} = 'paid'`,
    )
    .groupBy(
      sql`extract(year from ${transactions.date})`,
      sql`extract(month from ${transactions.date})`,
      transactions.type,
    )
    .orderBy(
      sql`extract(year from ${transactions.date})`,
      sql`extract(month from ${transactions.date})`,
    );

  const map = new Map<
    string,
    { receitas: number; despesas: number; label: string }
  >();
  for (const r of rows) {
    const key = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
    if (!map.has(key))
      map.set(key, {
        receitas: 0,
        despesas: 0,
        label: MONTH_ABBR[Number(r.mo) - 1],
      });
    const e = map.get(key)!;
    if (r.type === "income") e.receitas = Number(r.total);
    else e.despesas = Number(r.total);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, d]) => ({
      month: d.label,
      receitas: d.receitas,
      despesas: d.despesas,
      lucro: d.receitas - d.despesas,
    }));
}

export async function getCostBreakdown(): Promise<CostBreakdownEntry[]> {
  const rows = await db
    .select({
      category: transactions.category,
      total: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.type} = 'expense' and ${transactions.status} = 'paid'`,
    )
    .groupBy(transactions.category)
    .orderBy(sql`sum(${transactions.amount}::numeric) desc`);

  return rows.map((r) => ({
    name: r.category,
    value: Number(r.total),
    fill: COST_COLORS[r.category] ?? "#64748b",
  }));
}
