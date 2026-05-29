import { desc, eq, sql } from "drizzle-orm";

import { db } from "@/_db";
import { transactions } from "@/_db/schema";

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
