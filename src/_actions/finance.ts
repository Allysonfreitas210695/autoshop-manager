"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { transactions } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(["paid", "pending", "overdue"]),
});

export const createTransactionAction = authActionClient
  .schema(transactionSchema)
  .action(async ({ parsedInput }) => {
    const [row] = await db
      .insert(transactions)
      .values({
        type: parsedInput.type,
        amount: String(parsedInput.amount),
        date: new Date(parsedInput.date),
        description: parsedInput.description,
        category: parsedInput.category,
        status: parsedInput.status,
      })
      .returning({ id: transactions.id });

    revalidatePath("/finance");
    revalidatePath("/analytics");
    return row;
  });

export const updateTransactionAction = authActionClient
  .schema(transactionSchema.extend({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    const [row] = await db
      .update(transactions)
      .set({
        type: parsedInput.type,
        amount: String(parsedInput.amount),
        date: new Date(parsedInput.date),
        description: parsedInput.description,
        category: parsedInput.category,
        status: parsedInput.status,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, parsedInput.id))
      .returning({ id: transactions.id });

    revalidatePath("/finance");
    revalidatePath("/analytics");
    return row;
  });

export const deleteTransactionAction = authActionClient
  .schema(z.object({ id: z.string().uuid() }))
  .action(async ({ parsedInput }) => {
    await db.delete(transactions).where(eq(transactions.id, parsedInput.id));

    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
