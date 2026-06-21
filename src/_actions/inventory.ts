"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { purchaseOrderItems, purchaseOrders, services } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

const purchaseOrderStatusEnum = z.enum([
  "draft",
  "sent",
  "received",
  "cancelled",
  "confirmed",
]);

export const createPartAction = authActionClient
  .schema(
    z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      sku: z.string().optional(),
      category: z.string().optional(),
      supplier: z.string().optional(),
      location: z.string().optional(),
      price: z.number().min(0),
      stockQuantity: z.number().int().min(0).default(0),
      minStock: z.number().int().min(0).default(0),
    }),
  )
  .action(async ({ parsedInput }) => {
    const [part] = await db
      .insert(services)
      .values({
        name: parsedInput.name,
        description: parsedInput.description ?? null,
        sku: parsedInput.sku ?? null,
        category: parsedInput.category ?? null,
        supplier: parsedInput.supplier ?? null,
        location: parsedInput.location ?? null,
        type: "part",
        price: String(parsedInput.price),
        stockQuantity: parsedInput.stockQuantity,
        minStock: parsedInput.minStock,
      })
      .returning({ id: services.id });

    revalidatePath("/inventory");
    return { id: part.id };
  });

export const updateStockAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      stockQuantity: z.number().int().min(0),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(services)
      .set({ stockQuantity: parsedInput.stockQuantity, updatedAt: new Date() })
      .where(eq(services.id, parsedInput.id));

    revalidatePath("/inventory");
  });

export const createPurchaseOrderAction = authActionClient
  .schema(
    z.object({
      supplier: z.string().min(1),
      expectedDelivery: z.string().datetime().optional(),
      notes: z.string().optional(),
      items: z.array(
        z.object({
          description: z.string(),
          quantity: z.number().int().min(1),
          unitPrice: z.number().min(0),
          serviceId: z.uuid().optional(),
        }),
      ),
    }),
  )
  .action(async ({ parsedInput }) => {
    const totalAmount = parsedInput.items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0,
    );

    const [po] = await db
      .insert(purchaseOrders)
      .values({
        supplier: parsedInput.supplier,
        expectedDelivery: parsedInput.expectedDelivery
          ? new Date(parsedInput.expectedDelivery)
          : null,
        notes: parsedInput.notes ?? null,
        totalAmount: String(totalAmount),
      })
      .returning({ id: purchaseOrders.id });

    if (parsedInput.items.length > 0) {
      await db.insert(purchaseOrderItems).values(
        parsedInput.items.map((i) => ({
          purchaseOrderId: po.id,
          description: i.description,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          serviceId: i.serviceId ?? null,
        })),
      );
    }

    revalidatePath("/inventory/purchase-orders");
    return { id: po.id };
  });

export const getPurchaseOrderItemsAction = authActionClient
  .schema(z.object({ id: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const { getPurchaseOrderItems } = await import("@/_data-access/inventory");
    return { items: await getPurchaseOrderItems(parsedInput.id) };
  });

export const updatePurchaseOrderStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: purchaseOrderStatusEnum,
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(purchaseOrders)
      .set({ status: parsedInput.status, updatedAt: new Date() })
      .where(eq(purchaseOrders.id, parsedInput.id));

    revalidatePath("/inventory/purchase-orders");
  });
