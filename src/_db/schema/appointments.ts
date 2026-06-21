import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { vehicles } from "./vehicles";

export const appointmentStatus = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "completed",
  "cancelled",
]);

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: text("customer_id").references(() => user.id, {
    onDelete: "set null",
  }),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id, {
    onDelete: "set null",
  }),
  mechanicId: text("mechanic_id").references(() => user.id, {
    onDelete: "set null",
  }),
  scheduledAt: timestamp("scheduled_at").notNull(),
  status: appointmentStatus("status").default("scheduled").notNull(),
  serviceType: text("service_type"),
  duration: integer("duration"), // em minutos
  notes: text("notes"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
