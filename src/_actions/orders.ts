"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { serviceOrderItems, serviceOrders } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

export const createOrderAction = authActionClient
  .schema(
    z.object({
      vehicleId: z.uuid(),
      customerId: z.string().optional(),
      mechanicId: z.string().optional(),
      clientReport: z.string().optional(),
      diagnosis: z.string().optional(),
      serviceType: z.string().optional(),
      priority: z.string().default("normal"),
      dueAt: z.string().datetime().optional(),
      items: z
        .array(
          z.object({
            description: z.string(),
            itemType: z.enum(["part", "labor"]),
            quantity: z.number().int().min(1),
            unitPrice: z.number().min(0),
            serviceId: z.uuid().optional(),
          }),
        )
        .default([]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const totalAmount = parsedInput.items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0,
    );

    const [order] = await db
      .insert(serviceOrders)
      .values({
        vehicleId: parsedInput.vehicleId,
        customerId: parsedInput.customerId ?? null,
        mechanicId: parsedInput.mechanicId ?? null,
        clientReport: parsedInput.clientReport ?? null,
        diagnosis: parsedInput.diagnosis ?? null,
        serviceType: parsedInput.serviceType ?? null,
        priority: parsedInput.priority,
        dueAt: parsedInput.dueAt ? new Date(parsedInput.dueAt) : null,
        totalAmount: String(totalAmount),
      })
      .returning({
        id: serviceOrders.id,
        orderNumber: serviceOrders.orderNumber,
      });

    if (parsedInput.items.length > 0) {
      await db.insert(serviceOrderItems).values(
        parsedInput.items.map((i) => ({
          serviceOrderId: order.id,
          description: i.description,
          itemType: i.itemType,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          serviceId: i.serviceId ?? null,
          approved: false,
        })),
      );
    }

    revalidatePath("/orders");
    return { id: order.id, orderNumber: order.orderNumber };
  });

export const updateOrderStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: z.enum(["pending", "in_progress", "completed", "delayed"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(serviceOrders)
      .set({
        status: parsedInput.status,
        closedAt: parsedInput.status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(serviceOrders.id, parsedInput.id));

    revalidatePath("/orders");
    revalidatePath(`/orders/${parsedInput.id}`);
  });

export const approveOrderItemAction = authActionClient
  .schema(
    z.object({
      itemId: z.uuid(),
      approved: z.boolean(),
      orderId: z.uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(serviceOrderItems)
      .set({ approved: parsedInput.approved })
      .where(eq(serviceOrderItems.id, parsedInput.itemId));

    revalidatePath(`/orders/${parsedInput.orderId}/budget`);
  });
