import "server-only";

import { count, desc, sql } from "drizzle-orm";

import { db } from "@/_db";
import { serviceOrders, transactions, user } from "@/_db/schema";

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

export type MonthlyRevenue = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
};

export type MechanicPerformance = {
  name: string;
  orders: number;
  revenue: number;
  completionRate: number;
};

export type ServiceCategory = {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
};

export type AnalyticsKpis = {
  totalRevenue12m: number;
  totalOrders12m: number;
  avgTicket: number | null;
  netMargin: number | null;
  nps: number | null;
  returnRate: number | null;
  activeCustomers: number;
  newCustomers: number;
};

export async function getMonthlyRevenue(
  months = 12,
): Promise<MonthlyRevenue[]> {
  const txRows = await db
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

  const orderRows = await db
    .select({
      yr: sql<number>`extract(year from ${serviceOrders.openedAt})`,
      mo: sql<number>`extract(month from ${serviceOrders.openedAt})`,
      cnt: count(),
    })
    .from(serviceOrders)
    .where(
      sql`${serviceOrders.openedAt} >= date_trunc('month', current_date) - interval '${sql.raw(String(months - 1))} months'`,
    )
    .groupBy(
      sql`extract(year from ${serviceOrders.openedAt})`,
      sql`extract(month from ${serviceOrders.openedAt})`,
    );

  const map = new Map<
    string,
    { revenue: number; expenses: number; label: string }
  >();
  for (const r of txRows) {
    const key = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
    if (!map.has(key))
      map.set(key, {
        revenue: 0,
        expenses: 0,
        label: MONTH_ABBR[Number(r.mo) - 1],
      });
    const e = map.get(key)!;
    if (r.type === "income") e.revenue = Number(r.total);
    else e.expenses = Number(r.total);
  }

  const orderMap = new Map<string, number>();
  for (const r of orderRows) {
    const key = `${r.yr}-${String(r.mo).padStart(2, "0")}`;
    orderMap.set(key, Number(r.cnt));
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, d]) => ({
      month: d.label,
      revenue: d.revenue,
      expenses: d.expenses,
      profit: d.revenue - d.expenses,
      orders: orderMap.get(key) ?? 0,
    }));
}

export async function getMechanicPerformance(): Promise<MechanicPerformance[]> {
  const rows = await db
    .select({
      mechanicId: serviceOrders.mechanicId,
      mechanicName: user.name,
      orders: count(),
      totalAmount: sql<number>`coalesce(sum(${serviceOrders.totalAmount}::numeric), 0)`,
      completed: sql<number>`count(case when ${serviceOrders.status} = 'completed' then 1 end)`,
    })
    .from(serviceOrders)
    .leftJoin(user, sql`${user.id} = ${serviceOrders.mechanicId}`)
    .groupBy(serviceOrders.mechanicId, user.name)
    .orderBy(desc(sql`sum(${serviceOrders.totalAmount}::numeric)`))
    .limit(5);

  return rows.map((r) => {
    const orders = Number(r.orders);
    const completed = Number(r.completed);
    return {
      name: r.mechanicName ?? "Sem mecânico",
      orders,
      revenue: Number(r.totalAmount),
      completionRate: orders > 0 ? Math.round((completed / orders) * 100) : 0,
    };
  });
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const rows = await db
    .select({
      serviceType: serviceOrders.serviceType,
      orders: count(),
      totalAmount: sql<number>`coalesce(sum(${serviceOrders.totalAmount}::numeric), 0)`,
    })
    .from(serviceOrders)
    .groupBy(serviceOrders.serviceType)
    .orderBy(desc(sql`sum(${serviceOrders.totalAmount}::numeric)`));

  const grandTotal = rows.reduce((s, r) => s + Number(r.totalAmount), 0);

  return rows
    .filter((r) => r.serviceType)
    .map((r) => ({
      category: r.serviceType ?? "Outros",
      orders: Number(r.orders),
      revenue: Number(r.totalAmount),
      percentage:
        grandTotal > 0
          ? Math.round((Number(r.totalAmount) / grandTotal) * 100)
          : 0,
    }));
}

export async function getAnalyticsKpis(): Promise<AnalyticsKpis> {
  const [txMetrics] = await db
    .select({
      revenue: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
      expenses: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
    })
    .from(transactions)
    .where(sql`${transactions.date} >= current_date - interval '12 months'`);

  const [orderMetrics] = await db
    .select({
      total: count(),
      customers: sql<number>`count(distinct ${serviceOrders.customerId})`,
    })
    .from(serviceOrders)
    .where(
      sql`${serviceOrders.openedAt} >= current_date - interval '12 months'`,
    );

  // Clientes criados nos últimos 12 meses (query real)
  const [newCustomersResult] = await db
    .select({ cnt: count() })
    .from(user)
    .where(sql`${user.createdAt} >= current_date - interval '12 months'`);

  // Taxa de Retorno: % de clientes com mais de 1 O.S. nos últimos 12 meses
  const returnRateQuery = await db.execute(sql`
    WITH customer_orders AS (
      SELECT customer_id, count(id) as ord_count
      FROM service_orders
      WHERE opened_at >= current_date - interval '12 months' AND customer_id IS NOT NULL
      GROUP BY customer_id
    )
    SELECT 
      count(*) as total_customers,
      count(case when ord_count > 1 then 1 end) as returning_customers
    FROM customer_orders
  `);

  const returnStats = returnRateQuery.rows[0] as
    | { total_customers: string; returning_customers: string }
    | undefined;
  const returningCount = Number(returnStats?.returning_customers ?? 0);
  const totalReturningBase = Number(returnStats?.total_customers ?? 0);
  const returnRate =
    totalReturningBase > 0
      ? Math.round((returningCount / totalReturningBase) * 100)
      : null;

  // NPS: (Promotores - Detratores) / Total de respostas
  const npsQuery = await db.execute(sql`
    SELECT 
      count(*) as total_feedbacks,
      count(case when score >= 9 then 1 end) as promoters,
      count(case when score <= 6 then 1 end) as detractors
    FROM feedbacks
    WHERE created_at >= current_date - interval '12 months'
  `);

  const npsStats = npsQuery.rows[0] as
    | { total_feedbacks: string; promoters: string; detractors: string }
    | undefined;
  const totalFb = Number(npsStats?.total_feedbacks ?? 0);
  const promoters = Number(npsStats?.promoters ?? 0);
  const detractors = Number(npsStats?.detractors ?? 0);
  const nps =
    totalFb > 0 ? Math.round(((promoters - detractors) / totalFb) * 100) : null;

  const revenue = Number(txMetrics?.revenue ?? 0);
  const expenses = Number(txMetrics?.expenses ?? 0);
  const totalOrders = Number(orderMetrics?.total ?? 0);
  const activeCustomers = Number(orderMetrics?.customers ?? 0);
  const newCustomers = Number(newCustomersResult?.cnt ?? 0);

  return {
    totalRevenue12m: revenue,
    totalOrders12m: totalOrders,
    avgTicket: totalOrders > 0 ? revenue / totalOrders : null,
    netMargin:
      revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : null,
    nps,
    returnRate,
    activeCustomers,
    newCustomers,
  };
}
