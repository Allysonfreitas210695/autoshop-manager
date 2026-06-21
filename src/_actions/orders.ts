"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import {
  serviceOrderItems,
  serviceOrders,
  transactions,
  vehicles,
} from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

export const createOrderAction = authActionClient
  .schema(
    z.object({
      plate: z.string().min(6).max(8),
      customerName: z.string().min(2),
      vehicleModel: z.string().min(2),
      mileage: z.coerce.number().min(0).optional(),
      customerId: z.string().optional(),
      mechanicId: z.string().optional(),
      description: z.string().optional(),
      clientReport: z.string().optional(),
      diagnosis: z.string().optional(),
      serviceType: z.string().optional(),
      priority: z.string().default("normal"),
      status: z
        .enum(["pending", "in_progress", "completed", "delayed"])
        .optional(),
      dueAt: z.string().datetime().optional(),
      checklist: z.string().optional(),
      signatureUrl: z.string().optional(),
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
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        plate: parsedInput.plate.toUpperCase(),
        make: "Não informado",
        model: parsedInput.vehicleModel,
        mileage: parsedInput.mileage ?? null,
      })
      .onConflictDoUpdate({
        target: vehicles.plate,
        set: {
          model: parsedInput.vehicleModel,
          mileage: parsedInput.mileage ?? null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: vehicles.id });

    const totalAmount = parsedInput.items.reduce(
      (s, i) => s + i.quantity * i.unitPrice,
      0,
    );

    const [order] = await db
      .insert(serviceOrders)
      .values({
        vehicleId: vehicle.id,
        customerId: parsedInput.customerId ?? null,
        mechanicId: parsedInput.mechanicId ?? null,
        description: parsedInput.description ?? null,
        clientReport: parsedInput.clientReport ?? null,
        diagnosis: parsedInput.diagnosis ?? null,
        serviceType: parsedInput.serviceType ?? null,
        priority: parsedInput.priority,
        status: parsedInput.status ?? "pending",
        dueAt: parsedInput.dueAt ? new Date(parsedInput.dueAt) : null,
        checklist: parsedInput.checklist ?? null,
        signatureUrl: parsedInput.signatureUrl ?? null,
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
          approved: true,
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
    const [order] = await db
      .update(serviceOrders)
      .set({
        status: parsedInput.status,
        closedAt: parsedInput.status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(serviceOrders.id, parsedInput.id))
      .returning({
        id: serviceOrders.id,
        orderNumber: serviceOrders.orderNumber,
        totalAmount: serviceOrders.totalAmount,
      });

    if (parsedInput.status === "completed") {
      await db.insert(transactions).values({
        date: new Date(),
        description: `O.S. #${order.orderNumber}`,
        category: "Serviço",
        type: "income",
        amount: order.totalAmount,
        status: "paid",
        serviceOrderId: order.id,
      });
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${parsedInput.id}`);
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });

export const deleteOrderAction = authActionClient
  .schema(z.object({ id: z.uuid() }))
  .action(async ({ parsedInput }) => {
    await db
      .delete(serviceOrderItems)
      .where(eq(serviceOrderItems.serviceOrderId, parsedInput.id));
    await db.delete(serviceOrders).where(eq(serviceOrders.id, parsedInput.id));
    revalidatePath("/orders");
  });

export const getOrderDetailAction = authActionClient
  .schema(z.object({ id: z.uuid() }))
  .action(async ({ parsedInput }) => {
    const { getOrderById } = await import("@/_data-access/orders");
    return getOrderById(parsedInput.id);
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
