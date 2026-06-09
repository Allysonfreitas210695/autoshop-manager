import { and, asc, desc, eq, gte, lte } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

import { db } from "@/_db";
import { appointments, user, vehicles } from "@/_db/schema";

export type AppointmentRow = {
  id: string;
  customer: string | null;
  phone: string | null;
  vehicle: string | null;
  plate: string | null;
  mechanic: string | null;
  scheduledAt: Date;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
};

export type MechanicOption = { id: string; name: string };

export type CustomerOption = {
  id: string;
  name: string;
  phone: string | null;
  vehicles: { id: string; label: string; plate: string }[];
};

export async function listAppointments(
  from?: Date,
  to?: Date,
): Promise<AppointmentRow[]> {
  const customer = alias(user, "customer");
  const mechanic = alias(user, "mechanic");

  const whereConditions = [];
  if (from) whereConditions.push(gte(appointments.scheduledAt, from));
  if (to) whereConditions.push(lte(appointments.scheduledAt, to));

  const rows = await db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      notes: appointments.notes,
      customerName: customer.name,
      customerPhone: customer.phone,
      mechanicName: mechanic.name,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,
      vehiclePlate: vehicles.plate,
    })
    .from(appointments)
    .leftJoin(customer, eq(customer.id, appointments.customerId))
    .leftJoin(mechanic, eq(mechanic.id, appointments.mechanicId))
    .leftJoin(vehicles, eq(vehicles.id, appointments.vehicleId))
    .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
    .orderBy(desc(appointments.scheduledAt));

  return rows.map((row) => ({
    id: row.id,
    customer: row.customerName,
    phone: row.customerPhone,
    vehicle:
      row.vehicleMake && row.vehicleModel
        ? `${row.vehicleMake} ${row.vehicleModel}`
        : null,
    plate: row.vehiclePlate,
    mechanic: row.mechanicName,
    scheduledAt: row.scheduledAt,
    status: row.status,
    notes: row.notes,
  }));
}

export async function listMechanics(): Promise<MechanicOption[]> {
  return db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, "mechanic"))
    .orderBy(user.name);
}

export async function listCustomerOptions(): Promise<CustomerOption[]> {
  const customers = await db
    .select({ id: user.id, name: user.name, phone: user.phone })
    .from(user)
    .where(eq(user.role, "customer"))
    .orderBy(user.name);

  const allVehicles = await db
    .select({
      id: vehicles.id,
      ownerId: vehicles.ownerId,
      make: vehicles.make,
      model: vehicles.model,
      plate: vehicles.plate,
    })
    .from(vehicles)
    .orderBy(asc(vehicles.make));

  const vehiclesByOwner = new Map<string, CustomerOption["vehicles"]>();
  for (const v of allVehicles) {
    if (!v.ownerId) continue;
    if (!vehiclesByOwner.has(v.ownerId)) vehiclesByOwner.set(v.ownerId, []);
    vehiclesByOwner.get(v.ownerId)!.push({
      id: v.id,
      label: `${v.make} ${v.model}`,
      plate: v.plate,
    });
  }

  return customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    vehicles: vehiclesByOwner.get(c.id) ?? [],
  }));
}
