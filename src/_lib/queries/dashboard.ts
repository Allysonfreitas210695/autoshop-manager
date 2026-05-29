import { count, eq, sql } from "drizzle-orm";

import { db } from "@/_db";
import { appointments, serviceOrders, serviceOrderStatus } from "@/_db/schema";

export type DashboardMetrics = {
  openOrders: number;
  readyVehicles: number;
  todayAppointments: number;
};

export type StatusDistribution = {
  status: (typeof serviceOrderStatus.enumValues)[number];
  count: number;
};

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const [openResult] = await db
    .select({ count: count() })
    .from(serviceOrders)
    .where(
      sql`${serviceOrders.status} in ('pending', 'in_progress', 'delayed')`,
    );

  const [readyResult] = await db
    .select({ count: count() })
    .from(serviceOrders)
    .where(eq(serviceOrders.status, "completed"));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [aptResult] = await db
    .select({ count: count() })
    .from(appointments)
    .where(
      sql`${appointments.scheduledAt} >= ${today} and ${appointments.scheduledAt} < ${tomorrow}`,
    );

  return {
    openOrders: openResult?.count ?? 0,
    readyVehicles: readyResult?.count ?? 0,
    todayAppointments: aptResult?.count ?? 0,
  };
}

export async function getStatusDistribution(): Promise<StatusDistribution[]> {
  const rows = await db
    .select({
      status: serviceOrders.status,
      count: count(),
    })
    .from(serviceOrders)
    .groupBy(serviceOrders.status);

  return rows.map((r) => ({ status: r.status, count: r.count }));
}
