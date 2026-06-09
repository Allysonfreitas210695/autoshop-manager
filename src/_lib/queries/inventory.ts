import { asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/_db";
import { purchaseOrderItems, purchaseOrders, services } from "@/_db/schema";

export type Part = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  createdAt: Date;
  updatedAt: Date;
};

export type PurchaseOrderRow = {
  id: string;
  supplier: string;
  status: "draft" | "sent" | "received" | "cancelled";
  totalAmount: number;
  expectedDelivery: Date | null;
  itemCount: number;
  createdAt: Date;
};

export type InventoryMetrics = {
  totalItems: number;
  lowStockCount: number;
  criticalCount: number;
  totalValue: number;
};

export async function listParts(category?: string): Promise<Part[]> {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.type, "part"))
    .orderBy(asc(services.name));

  const parts = rows.map(partFromRow);
  if (!category || category === "Todos") return parts;
  return parts.filter((p) => p.category === category);
}

export async function getLowStockParts(): Promise<Part[]> {
  const rows = await db
    .select()
    .from(services)
    .where(
      sql`${services.type} = 'part' and ${services.stockQuantity} <= ${services.minStock}`,
    )
    .orderBy(asc(services.stockQuantity));

  return rows.map(partFromRow);
}

export async function getInventoryMetrics(): Promise<InventoryMetrics> {
  const rows = await db
    .select()
    .from(services)
    .where(eq(services.type, "part"));

  const parts = rows.map(partFromRow);
  return {
    totalItems: parts.length,
    lowStockCount: parts.filter((p) => p.stock <= p.minStock).length,
    criticalCount: parts.filter((p) => p.stock < p.minStock).length,
    totalValue: parts.reduce((s, p) => s + p.stock * p.unitPrice, 0),
  };
}

export async function searchParts(query: string): Promise<Part[]> {
  const lq = `%${query.toLowerCase()}%`;
  const rows = await db
    .select()
    .from(services)
    .where(
      sql`${services.type} = 'part' and (lower(${services.name}) like ${lq} or lower(${services.sku}) like ${lq})`,
    )
    .limit(15);
  return rows.map(partFromRow);
}

export async function listPurchaseOrders(): Promise<PurchaseOrderRow[]> {
  const rows = await db
    .select({
      id: purchaseOrders.id,
      supplier: purchaseOrders.supplier,
      status: purchaseOrders.status,
      totalAmount: purchaseOrders.totalAmount,
      expectedDelivery: purchaseOrders.expectedDelivery,
      createdAt: purchaseOrders.createdAt,
      itemCount: sql<number>`count(${purchaseOrderItems.id})`,
    })
    .from(purchaseOrders)
    .leftJoin(
      purchaseOrderItems,
      eq(purchaseOrderItems.purchaseOrderId, purchaseOrders.id),
    )
    .groupBy(purchaseOrders.id)
    .orderBy(desc(purchaseOrders.createdAt));

  return rows.map((r) => ({
    ...r,
    totalAmount: Number(r.totalAmount),
    itemCount: Number(r.itemCount),
  }));
}

function partFromRow(row: typeof services.$inferSelect): Part {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    sku: row.sku,
    category: "Peças",
    stock: row.stockQuantity,
    minStock: row.minStock,
    unitPrice: Number(row.price),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
