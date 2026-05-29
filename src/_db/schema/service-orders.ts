import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import { services } from "./services";
import { vehicles } from "./vehicles";

export const serviceOrderStatus = pgEnum("service_order_status", [
  "pending",
  "in_progress",
  "completed",
  "delayed",
]);

export const serviceItemType = pgEnum("service_item_type", ["part", "labor"]);

export const serviceOrders = pgTable("service_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: serial("order_number").notNull(),
  vehicleId: uuid("vehicle_id")
    .notNull()
    .references(() => vehicles.id, { onDelete: "restrict" }),
  customerId: text("customer_id").references(() => user.id, {
    onDelete: "set null",
  }),
  mechanicId: text("mechanic_id").references(() => user.id, {
    onDelete: "set null",
  }),
  status: serviceOrderStatus("status").default("pending").notNull(),
  clientReport: text("client_report"),
  diagnosis: text("diagnosis"),
  description: text("description"),
  serviceType: text("service_type"),
  priority: text("priority").default("normal").notNull(),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  openedAt: timestamp("opened_at")
    .$defaultFn(() => new Date())
    .notNull(),
  dueAt: timestamp("due_at"),
  closedAt: timestamp("closed_at"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const serviceOrderItems = pgTable("service_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  serviceOrderId: uuid("service_order_id")
    .notNull()
    .references(() => serviceOrders.id, { onDelete: "cascade" }),
  serviceId: uuid("service_id").references(() => services.id, {
    onDelete: "set null",
  }),
  description: text("description").notNull(),
  itemType: serviceItemType("item_type").default("part").notNull(),
  quantity: integer("quantity").default(1).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 })
    .default("0")
    .notNull(),
  approved: boolean("approved").default(true).notNull(),
});

export const serviceOrdersRelations = relations(
  serviceOrders,
  ({ one, many }) => ({
    vehicle: one(vehicles, {
      fields: [serviceOrders.vehicleId],
      references: [vehicles.id],
    }),
    customer: one(user, {
      fields: [serviceOrders.customerId],
      references: [user.id],
    }),
    mechanic: one(user, {
      fields: [serviceOrders.mechanicId],
      references: [user.id],
    }),
    items: many(serviceOrderItems),
  }),
);

export const serviceOrderItemsRelations = relations(
  serviceOrderItems,
  ({ one }) => ({
    serviceOrder: one(serviceOrders, {
      fields: [serviceOrderItems.serviceOrderId],
      references: [serviceOrders.id],
    }),
    service: one(services, {
      fields: [serviceOrderItems.serviceId],
      references: [services.id],
    }),
  }),
);
