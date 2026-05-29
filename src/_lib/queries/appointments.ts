import { desc, eq, gte, lte, sql } from "drizzle-orm";

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

export async function listAppointments(
  from?: Date,
  to?: Date,
): Promise<AppointmentRow[]> {
  const whereConditions = [];
  if (from) whereConditions.push(gte(appointments.scheduledAt, from));
  if (to) whereConditions.push(lte(appointments.scheduledAt, to));

  const rows = await db
    .select({
      id: appointments.id,
      scheduledAt: appointments.scheduledAt,
      status: appointments.status,
      notes: appointments.notes,
      customerId: appointments.customerId,
      vehicleId: appointments.vehicleId,
      mechanicId: appointments.mechanicId,
    })
    .from(appointments)
    .where(whereConditions.length > 0 ? sql`${whereConditions[0]}` : undefined)
    .orderBy(desc(appointments.scheduledAt));

  const result: AppointmentRow[] = [];

  for (const row of rows) {
    const [customer] = row.customerId
      ? await db
          .select({ name: user.name, phone: user.phone })
          .from(user)
          .where(eq(user.id, row.customerId))
          .limit(1)
      : [null];

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

    const [mechanic] = row.mechanicId
      ? await db
          .select({ name: user.name })
          .from(user)
          .where(eq(user.id, row.mechanicId))
          .limit(1)
      : [null];

    result.push({
      id: row.id,
      customer: customer?.name ?? null,
      phone: customer?.phone ?? null,
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model}` : null,
      plate: vehicle?.plate ?? null,
      mechanic: mechanic?.name ?? null,
      scheduledAt: row.scheduledAt,
      status: row.status,
      notes: row.notes,
    });
  }

  return result;
}

export async function listMechanics() {
  return db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, "mechanic"))
    .orderBy(user.name);
}
