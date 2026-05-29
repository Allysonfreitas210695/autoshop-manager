"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { appointments } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

export const createAppointmentAction = authActionClient
  .schema(
    z.object({
      customerId: z.string().optional(),
      vehicleId: z.string().uuid().optional(),
      mechanicId: z.string().optional(),
      scheduledAt: z.string().datetime(),
      notes: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const [apt] = await db
      .insert(appointments)
      .values({
        customerId: parsedInput.customerId ?? null,
        vehicleId: parsedInput.vehicleId ?? null,
        mechanicId: parsedInput.mechanicId ?? null,
        scheduledAt: new Date(parsedInput.scheduledAt),
        notes: parsedInput.notes ?? null,
      })
      .returning({ id: appointments.id });

    revalidatePath("/appointments");
    return { id: apt.id };
  });
