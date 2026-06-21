import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/_db";
import {
  appointments,
  serviceOrders,
  serviceOrderStatus,
  services,
  vehicles,
} from "@/_db/schema";
import { user } from "@/_db/schema/auth";

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

export type Notification = {
  id: string;
  title: string;
  description: string;
  type: "critical_stock" | "completed_order";
  time: string;
};

export async function getNotifications(): Promise<Notification[]> {
  const notifications: Notification[] = [];

  // Peças com estoque crítico (stockQuantity < minStock e minStock > 0)
  const criticalParts = await db
    .select({
      id: services.id,
      name: services.name,
      stockQuantity: services.stockQuantity,
      minStock: services.minStock,
    })
    .from(services)
    .where(
      sql`${services.type} = 'part' and ${services.minStock} > 0 and ${services.stockQuantity} < ${services.minStock}`,
    )
    .limit(5);

  if (criticalParts.length > 0) {
    notifications.push({
      id: "stock-critical",
      title: "Estoque crítico",
      description: `${criticalParts.length} ${criticalParts.length === 1 ? "peça abaixo" : "peças abaixo"} do estoque mínimo`,
      type: "critical_stock",
      time: "Agora",
    });
  }

  // O.S. concluídas nas últimas 24h
  const yesterday = new Date();
  yesterday.setHours(yesterday.getHours() - 24);

  const recentCompleted = await db
    .select({
      id: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      updatedAt: serviceOrders.updatedAt,
      vehicleId: serviceOrders.vehicleId,
    })
    .from(serviceOrders)
    .where(
      sql`${serviceOrders.status} = 'completed' and ${serviceOrders.updatedAt} >= ${yesterday}`,
    )
    .orderBy(desc(serviceOrders.updatedAt))
    .limit(3);

  for (const order of recentCompleted) {
    const [vehicle] = order.vehicleId
      ? await db
          .select({
            plate: vehicles.plate,
            make: vehicles.make,
            model: vehicles.model,
          })
          .from(vehicles)
          .where(eq(vehicles.id, order.vehicleId))
          .limit(1)
      : [null];

    const diffMs = Date.now() - order.updatedAt.getTime();
    const diffH = Math.floor(diffMs / 3600000);
    const timeStr = diffH < 1 ? "Há pouco" : `${diffH}h atrás`;

    notifications.push({
      id: `completed-${order.id}`,
      title: `O.S. #${order.orderNumber} concluída`,
      description: vehicle
        ? `${vehicle.make} ${vehicle.model} · ${vehicle.plate}`
        : "Veículo não identificado",
      type: "completed_order",
      time: timeStr,
    });
  }

  return notifications;
}

export type UpcomingDelivery = {
  id: string;
  plate: string;
  customer: string | null;
  vehicle: string;
  dueAt: Date | null;
  status: (typeof serviceOrderStatus.enumValues)[number];
};

export async function getUpcomingDeliveries(
  limit = 4,
): Promise<UpcomingDelivery[]> {
  const rows = await db
    .select({
      id: serviceOrders.id,
      status: serviceOrders.status,
      dueAt: serviceOrders.dueAt,
      vehicleId: serviceOrders.vehicleId,
      customerId: serviceOrders.customerId,
    })
    .from(serviceOrders)
    .where(sql`${serviceOrders.status} != 'completed'`)
    .orderBy(serviceOrders.dueAt)
    .limit(limit);

  const results: UpcomingDelivery[] = [];
  for (const row of rows) {
    const [vehicle] = row.vehicleId
      ? await db
          .select({
            plate: vehicles.plate,
            make: vehicles.make,
            model: vehicles.model,
          })
          .from(vehicles)
          .where(eq(vehicles.id, row.vehicleId))
          .limit(1)
      : [null];

    const [customer] = row.customerId
      ? await db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, row.customerId))
          .limit(1)
      : [null];

    results.push({
      id: row.id,
      plate: vehicle?.plate ?? "—",
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "—",
      customer: customer?.name ?? null,
      dueAt: row.dueAt,
      status: row.status,
    });
  }

  return results;
}
