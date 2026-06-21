"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/_db";
import { feedbacks, serviceOrders } from "@/_db/schema";
import { actionClient, ActionError } from "@/_lib/safe-action";
import { createFeedbackSchema } from "@/_schemas/feedbacks";

export const submitFeedbackAction = actionClient
  .schema(createFeedbackSchema)
  .action(async ({ parsedInput: { orderId, score, comment } }) => {
    const [order] = await db
      .select()
      .from(serviceOrders)
      .where(eq(serviceOrders.id, orderId));

    if (!order) {
      throw new ActionError("Ordem de serviço não encontrada.");
    }

    if (order.status !== "completed") {
      throw new ActionError("A ordem de serviço ainda não foi concluída.");
    }

    if (!order.customerId) {
      throw new ActionError(
        "Esta ordem de serviço não possui um cliente associado.",
      );
    }

    const [existingFeedback] = await db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.orderId, orderId));

    if (existingFeedback) {
      throw new ActionError(
        "Uma avaliação já foi enviada para esta ordem de serviço.",
      );
    }

    await db.insert(feedbacks).values({
      orderId,
      customerId: order.customerId,
      score,
      comment,
    });

    revalidatePath("/analytics");
    revalidatePath(`/orders/${orderId}`);

    return { success: true };
  });
