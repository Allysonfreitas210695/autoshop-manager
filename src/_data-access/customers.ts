import "server-only";

import { count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/_db";
import { serviceOrders, user, vehicles } from "@/_db/schema";

export type CustomerRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  address: string | null;
  totalSpent: number;
  visits: number;
  lastVisit: Date | null;
  lastVehicle: string | null;
  lastPlate: string | null;
};

export type CustomerVehicle = {
  id: string;
  make: string;
  model: string;
  plate: string;
  year: number | null;
  mileage: number | null;
  color: string | null;
};

export type CustomerDetail = CustomerRow & {
  vehicles: CustomerVehicle[];
};

export type ListCustomersResult = {
  customers: CustomerRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export async function listCustomers(
  page = 1,
  pageSize = 20,
): Promise<ListCustomersResult> {
  const offset = (page - 1) * pageSize;

  const [{ total }] = await db
    .select({ total: count() })
    .from(user)
    .where(eq(user.role, "customer"));

  const rows = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      address: user.address,
      totalSpent: sql<number>`coalesce(sum(${serviceOrders.totalAmount}::numeric), 0)`,
      visits: count(serviceOrders.id),
      lastVisit: sql<Date | null>`max(${serviceOrders.openedAt})`,
    })
    .from(user)
    .leftJoin(serviceOrders, eq(serviceOrders.customerId, user.id))
    .where(eq(user.role, "customer"))
    .groupBy(user.id)
    .orderBy(user.name)
    .limit(pageSize)
    .offset(offset);

  if (rows.length === 0) {
    return {
      customers: [],
      total: Number(total),
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(Number(total) / pageSize)),
    };
  }

  const ownerIds = rows.map((r) => r.id);
  const allVehicles = await db
    .select({
      ownerId: vehicles.ownerId,
      make: vehicles.make,
      model: vehicles.model,
      plate: vehicles.plate,
      createdAt: vehicles.createdAt,
    })
    .from(vehicles)
    .where(inArray(vehicles.ownerId, ownerIds))
    .orderBy(desc(vehicles.createdAt));

  const vehicleByOwner = new Map<
    string,
    { make: string; model: string; plate: string }
  >();
  for (const v of allVehicles) {
    if (!v.ownerId) continue;
    if (!vehicleByOwner.has(v.ownerId)) {
      vehicleByOwner.set(v.ownerId, {
        make: v.make,
        model: v.model,
        plate: v.plate,
      });
    }
  }

  const customers: CustomerRow[] = rows.map((row) => {
    const lastVehicle = vehicleByOwner.get(row.id);
    return {
      ...row,
      totalSpent: Number(row.totalSpent),
      lastVehicle: lastVehicle
        ? `${lastVehicle.make} ${lastVehicle.model}`
        : null,
      lastPlate: lastVehicle?.plate ?? null,
    };
  });

  return {
    customers,
    total: Number(total),
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(Number(total) / pageSize)),
  };
}

export async function getCustomerById(
  id: string,
): Promise<CustomerDetail | null> {
  const [row] = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
      address: user.address,
      totalSpent: sql<number>`coalesce(sum(${serviceOrders.totalAmount}::numeric), 0)`,
      visits: count(serviceOrders.id),
      lastVisit: sql<Date | null>`max(${serviceOrders.openedAt})`,
    })
    .from(user)
    .leftJoin(serviceOrders, eq(serviceOrders.customerId, user.id))
    .where(eq(user.id, id))
    .groupBy(user.id)
    .limit(1);

  if (!row) return null;

  const customerVehicles = await db
    .select()
    .from(vehicles)
    .where(eq(vehicles.ownerId, id))
    .orderBy(desc(vehicles.createdAt));

  return {
    ...row,
    totalSpent: Number(row.totalSpent),
    lastVehicle: customerVehicles[0]
      ? `${customerVehicles[0].make} ${customerVehicles[0].model}`
      : null,
    lastPlate: customerVehicles[0]?.plate ?? null,
    vehicles: customerVehicles.map((v) => ({
      id: v.id,
      make: v.make,
      model: v.model,
      plate: v.plate,
      year: v.year,
      mileage: v.mileage,
      color: v.color,
    })),
  };
}

export async function searchCustomers(query: string) {
  const lq = `%${query.toLowerCase()}%`;
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
    })
    .from(user)
    .leftJoin(vehicles, eq(vehicles.ownerId, user.id))
    .where(
      sql`${user.role} = 'customer' and (lower(${user.name}) like ${lq} or lower(${user.email}) like ${lq} or lower(${user.cpf}) like ${lq} or lower(${vehicles.plate}) like ${lq})`,
    )
    .groupBy(user.id)
    .limit(10);
}
