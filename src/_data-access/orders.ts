import "server-only";

import { and, count, desc, eq } from "drizzle-orm";

import { db } from "@/_db";
import {
  serviceOrderItems,
  serviceOrders,
  serviceOrderStatus,
  user,
  vehicles,
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

export type ListOrdersResult = {
  rows: OrderRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function listOrders(
  status?: (typeof serviceOrderStatus.enumValues)[number],
  page = 1,
  pageSize = 20,
): Promise<ListOrdersResult> {
  const customerAlias = user;
  const where = status ? eq(serviceOrders.status, status) : undefined;

  const [{ total }] = await db
    .select({ total: count() })
    .from(serviceOrders)
    .where(where);

  const offset = (page - 1) * pageSize;

  const rawRows = await db
    .select({
      id: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      status: serviceOrders.status,
      totalAmount: serviceOrders.totalAmount,
      updatedAt: serviceOrders.updatedAt,
      plate: vehicles.plate,
      make: vehicles.make,
      model: vehicles.model,
      customerName: customerAlias.name,
      mechanicId: serviceOrders.mechanicId,
    })
    .from(serviceOrders)
    .leftJoin(vehicles, eq(serviceOrders.vehicleId, vehicles.id))
    .leftJoin(customerAlias, eq(serviceOrders.customerId, customerAlias.id))
    .where(where)
    .orderBy(desc(serviceOrders.openedAt))
    .limit(pageSize)
    .offset(offset);

  // Fetch mechanic names for rows that have a mechanicId
  const mechanicIds = [
    ...new Set(rawRows.map((r) => r.mechanicId).filter(Boolean) as string[]),
  ];
  let mechanicMap: Record<string, string> = {};
  if (mechanicIds.length > 0) {
    const { inArray } = await import("drizzle-orm");
    const mechanics = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(inArray(user.id, mechanicIds));
    mechanicMap = Object.fromEntries(mechanics.map((m) => [m.id, m.name]));
  }

  const rows: OrderRow[] = rawRows.map((r) => ({
    id: r.id,
    orderNumber: r.orderNumber,
    plate: r.plate ?? "—",
    customer: r.customerName ?? null,
    vehicle: r.make && r.model ? `${r.make} ${r.model}` : "—",
    mechanic: r.mechanicId ? (mechanicMap[r.mechanicId] ?? null) : null,
    status: r.status,
    totalAmount: r.totalAmount,
    updatedAt: r.updatedAt,
  }));

  return {
    rows,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
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
  const result = await listOrders(undefined, 1, 10);
  return result.rows;
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
