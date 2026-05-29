import { relations } from "drizzle-orm";
import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { serviceOrders } from "./service-orders";

export const transactionType = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const transactionStatus = pgEnum("transaction_status", [
  "paid",
  "pending",
  "overdue",
]);

export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: transactionType("type").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  status: transactionStatus("status").default("pending").notNull(),
  serviceOrderId: uuid("service_order_id").references(() => serviceOrders.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  serviceOrder: one(serviceOrders, {
    fields: [transactions.serviceOrderId],
    references: [serviceOrders.id],
  }),
}));
