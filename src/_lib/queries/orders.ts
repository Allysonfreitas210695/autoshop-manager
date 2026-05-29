import { and, desc, eq } from "drizzle-orm";

import { db } from "@/_db";
import {
  serviceOrderItems,
  serviceOrders,
  serviceOrderStatus,
} from "@/_db/schema";

export type OrderRow = {
  id: string;
  orderNumber: number;
  plate: string;
  customer: string | null;
  vehicle: string;
  mechanic: string | null;
  status: (typeof serviceOrderStatus.enumValues)[number];
  totalAmount: string;
  updatedAt: Date;
};

export type OrderDetail = {
  id: string;
  orderNumber: number;
  plate: string;
  vehicleYear: number | null;
  vehicleColor: string | null;
  vehicle: string;
  mileage: number | null;
  customer: string | null;
  customerCpf: string | null;
  customerPhone: string | null;
  mechanic: string | null;
  status: (typeof serviceOrderStatus.enumValues)[number];
  clientReport: string | null;
  diagnosis: string | null;
  description: string | null;
  serviceType: string | null;
  priority: string;
  totalAmount: string;
  openedAt: Date;
  dueAt: Date | null;
  closedAt: Date | null;
  items: {
    id: string;
    description: string;
    itemType: "part" | "labor";
    quantity: number;
    unitPrice: string;
    approved: boolean;
  }[];
};

export async function listOrders(
  status?: (typeof serviceOrderStatus.enumValues)[number],
): Promise<OrderRow[]> {
  const rows = await db
    .select({
      id: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      status: serviceOrders.status,
      totalAmount: serviceOrders.totalAmount,
      updatedAt: serviceOrders.updatedAt,
      vehicleId: serviceOrders.vehicleId,
      customerId: serviceOrders.customerId,
      mechanicId: serviceOrders.mechanicId,
    })
    .from(serviceOrders)
    .where(status ? eq(serviceOrders.status, status) : undefined)
    .orderBy(desc(serviceOrders.openedAt));

  // Fetch related data separately to avoid complex joins
  const { user, vehicles } = await import("@/_db/schema");

  const results: OrderRow[] = [];
  for (const row of rows) {
    const [vehicle] = row.vehicleId
      ? await db
          .select({
            make: vehicles.make,
            model: vehicles.model,
            plate: vehicles.plate,
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

    const [mechanic] = row.mechanicId
      ? await db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, row.mechanicId))
          .limit(1)
      : [null];

    results.push({
      id: row.id,
      orderNumber: row.orderNumber,
      plate: vehicle?.plate ?? "—",
      customer: customer?.name ?? null,
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "—",
      mechanic: mechanic?.name ?? null,
      status: row.status,
      totalAmount: row.totalAmount,
      updatedAt: row.updatedAt,
    });
  }

  return results;
}

export async function getOrderById(id: string): Promise<OrderDetail | null> {
  const [order] = await db
    .select()
    .from(serviceOrders)
    .where(eq(serviceOrders.id, id))
    .limit(1);

  if (!order) return null;

  const { user, vehicles } = await import("@/_db/schema");

  const [vehicle] = order.vehicleId
    ? await db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, order.vehicleId))
        .limit(1)
    : [null];

  const [customer] = order.customerId
    ? await db
        .select({ name: user.name, cpf: user.cpf, phone: user.phone })
        .from(user)
        .where(eq(user.id, order.customerId))
        .limit(1)
    : [null];

  const [mechanic] = order.mechanicId
    ? await db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, order.mechanicId))
        .limit(1)
    : [null];

  const items = await db
    .select()
    .from(serviceOrderItems)
    .where(eq(serviceOrderItems.serviceOrderId, id));

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    plate: vehicle?.plate ?? "—",
    vehicleYear: vehicle?.year ?? null,
    vehicleColor: vehicle?.color ?? null,
    vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : "—",
    mileage: vehicle?.mileage ?? null,
    customer: customer?.name ?? null,
    customerCpf: customer?.cpf ?? null,
    customerPhone: customer?.phone ?? null,
    mechanic: mechanic?.name ?? null,
    status: order.status,
    clientReport: order.clientReport,
    diagnosis: order.diagnosis,
    description: order.description,
    serviceType: order.serviceType,
    priority: order.priority,
    totalAmount: order.totalAmount,
    openedAt: order.openedAt,
    dueAt: order.dueAt,
    closedAt: order.closedAt,
    items: items.map((i) => ({
      id: i.id,
      description: i.description,
      itemType: i.itemType,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      approved: i.approved,
    })),
  };
}

export async function getDashboardOrders(): Promise<OrderRow[]> {
  return listOrders();
}

export async function getOrdersByCustomer(customerId: string) {
  return db
    .select({
      id: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      status: serviceOrders.status,
      totalAmount: serviceOrders.totalAmount,
      openedAt: serviceOrders.openedAt,
      description: serviceOrders.description,
    })
    .from(serviceOrders)
    .where(and(eq(serviceOrders.customerId, customerId)))
    .orderBy(desc(serviceOrders.openedAt));
}
