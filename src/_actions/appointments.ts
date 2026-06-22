"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { appointments } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

export const createAppointmentAction = authActionClient
  .schema(
    z.object({
      customerId: z.string().optional(),
      vehicleId: z.uuid().optional(),
      mechanicId: z.string().optional(),
      scheduledAt: z.string().datetime(),
      serviceType: z.string().optional(),
      duration: z.number().int().min(1).optional(),
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
        serviceType: parsedInput.serviceType ?? null,
        duration: parsedInput.duration ?? null,
        notes: parsedInput.notes ?? null,
      })
      .returning({ id: appointments.id });

    revalidatePath("/appointments");
    return { id: apt.id };
  });

export const updateAppointmentAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      customerId: z.string().optional(),
      vehicleId: z.uuid().optional(),
      mechanicId: z.string().optional(),
      scheduledAt: z.string().datetime(),
      serviceType: z.string().optional(),
      duration: z.number().int().min(1).optional(),
      notes: z.string().optional(),
      status: z
        .enum(["scheduled", "confirmed", "completed", "cancelled"])
        .optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;
    await db
      .update(appointments)
      .set({
        ...rest,
        scheduledAt: new Date(rest.scheduledAt),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    revalidatePath("/appointments");
    return { id };
  });

export const updateAppointmentStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(appointments)
      .set({ status: parsedInput.status, updatedAt: new Date() })
      .where(eq(appointments.id, parsedInput.id));

    revalidatePath("/appointments");
    return { id: parsedInput.id, status: parsedInput.status };
  });
