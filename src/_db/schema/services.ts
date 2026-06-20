import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const serviceType = pgEnum("service_type", ["service", "part"]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  type: serviceType("type").default("service").notNull(),
  sku: text("sku"),
  category: text("category"),
  supplier: text("supplier"),
  location: text("location"),
  price: numeric("price", { precision: 12, scale: 2 }).default("0").notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  createdAt: timestamp("created_at")
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => new Date())
    .notNull(),
});
