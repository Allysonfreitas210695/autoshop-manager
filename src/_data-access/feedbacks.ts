import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/_db";
import { feedbacks, serviceOrders, vehicles } from "@/_db/schema";

export type OrderForFeedback = {
  id: string;
  orderNumber: number;
  status: string;
  vehicleMake: string | null;
  vehicleModel: string | null;
  plate: string | null;
};

export async function getOrderForFeedback(
  orderId: string,
): Promise<OrderForFeedback | null> {
  const [order] = await db
    .select({
      id: serviceOrders.id,
      orderNumber: serviceOrders.orderNumber,
      status: serviceOrders.status,
      vehicleMake: vehicles.make,
      vehicleModel: vehicles.model,
      plate: vehicles.plate,
    })
    .from(serviceOrders)
    .leftJoin(vehicles, eq(vehicles.id, serviceOrders.vehicleId))
    .where(eq(serviceOrders.id, orderId));

  return order ?? null;
}

export async function hasFeedback(orderId: string): Promise<boolean> {
  const [existingFeedback] = await db
    .select({ id: feedbacks.id })
    .from(feedbacks)
    .where(eq(feedbacks.orderId, orderId));

  return !!existingFeedback;
}
