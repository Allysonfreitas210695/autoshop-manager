"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import {
  serviceOrderItems,
  serviceOrders,
  services,
  transactions,
  vehicles,
} from "@/_db/schema";
import { ActionError, authActionClient } from "@/_lib/safe-action";

export const createOrderAction = authActionClient
  .schema(
    z.object({
      plate: z.string().min(6).max(8),
      customerName: z.string().min(2),
      vehicleMake: z.string().optional(),
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
        make: parsedInput.vehicleMake?.trim() || "Não informado",
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
      await db.transaction(async (tx) => {
        await tx.insert(serviceOrderItems).values(
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

        // Decrement stock for part items that reference a service/part record
        const partItems = parsedInput.items.filter(
          (i) => i.itemType === "part" && i.serviceId,
        );
        for (const item of partItems) {
          await tx
            .update(services)
            .set({
              stockQuantity: sql`greatest(0, ${services.stockQuantity} - ${item.quantity})`,
              updatedAt: new Date(),
            })
            .where(eq(services.id, item.serviceId!));
        }
      });
    }

    revalidatePath("/orders");
    revalidatePath("/inventory");
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
    await db.transaction(async (tx) => {
      // Restore stock for part items linked to a service record
      const items = await tx
        .select()
        .from(serviceOrderItems)
        .where(eq(serviceOrderItems.serviceOrderId, parsedInput.id));

      const partItems = items.filter(
        (i) => i.itemType === "part" && i.serviceId,
      );
      for (const item of partItems) {
        await tx
          .update(services)
          .set({
            stockQuantity: sql`${services.stockQuantity} + ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(services.id, item.serviceId!));
      }

      await tx
        .delete(serviceOrderItems)
        .where(eq(serviceOrderItems.serviceOrderId, parsedInput.id));
      await tx
        .delete(serviceOrders)
        .where(eq(serviceOrders.id, parsedInput.id));
    });

    revalidatePath("/orders");
    revalidatePath("/inventory");
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

    const items = await db
      .select()
      .from(serviceOrderItems)
      .where(
        and(
          eq(serviceOrderItems.serviceOrderId, parsedInput.orderId),
          eq(serviceOrderItems.approved, true),
        ),
      );

    const newTotal = items.reduce(
      (s, i) => s + i.quantity * Number(i.unitPrice),
      0,
    );

    await db
      .update(serviceOrders)
      .set({ totalAmount: String(newTotal), updatedAt: new Date() })
      .where(eq(serviceOrders.id, parsedInput.orderId));

    revalidatePath(`/orders/${parsedInput.orderId}/budget`);
    revalidatePath(`/orders/${parsedInput.orderId}`);
  });

export const addOrderItemAction = authActionClient
  .schema(
    z.object({
      orderId: z.uuid(),
      itemType: z.enum(["part", "labor"]),
      serviceId: z.uuid().optional(),
      description: z.string().min(2, "A descrição é obrigatória"),
      quantity: z.coerce.number().min(1),
      unitPrice: z.coerce.number().min(0),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select({
          id: serviceOrders.id,
          status: serviceOrders.status,
          totalAmount: serviceOrders.totalAmount,
        })
        .from(serviceOrders)
        .where(eq(serviceOrders.id, parsedInput.orderId));

      if (!order) throw new ActionError("O.S. não encontrada.");

      // Check stock if part
      if (parsedInput.itemType === "part" && parsedInput.serviceId) {
        const [part] = await tx
          .select({ stock: services.stockQuantity })
          .from(services)
          .where(eq(services.id, parsedInput.serviceId));

        if (!part) throw new ActionError("Peça não encontrada.");
        if (part.stock < parsedInput.quantity) {
          throw new ActionError(
            "Estoque insuficiente para a quantidade solicitada.",
          );
        }

        // If order is in_progress, deduct stock immediately
        if (order.status === "in_progress") {
          await tx
            .update(services)
            .set({
              stockQuantity: sql`${services.stockQuantity} - ${parsedInput.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(services.id, parsedInput.serviceId));
        }
      }

      await tx.insert(serviceOrderItems).values({
        serviceOrderId: parsedInput.orderId,
        itemType: parsedInput.itemType,
        serviceId: parsedInput.serviceId,
        description: parsedInput.description,
        quantity: parsedInput.quantity,
        unitPrice: String(parsedInput.unitPrice),
        approved: false, // Default to false so client can approve in budget
      });

      // We do NOT update order.totalAmount here. It's updated when the item is approved.
      // Wait, getOrderById handles total calculation, actually no, the order has a totalAmount field.
      // The totalAmount is updated when items are approved. Let's just re-calculate it based on approved items?
      // For now, leave it alone since it's not approved yet.
    });

    revalidatePath(`/orders/${parsedInput.orderId}`);
    revalidatePath(`/orders/${parsedInput.orderId}/budget`);
    revalidatePath("/inventory");
  });
