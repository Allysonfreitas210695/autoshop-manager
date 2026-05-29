"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { user, vehicles } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

export const createCustomerAction = authActionClient
  .schema(
    z.object({
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      address: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const id = crypto.randomUUID();
    await db.insert(user).values({
      id,
      name: parsedInput.name,
      email: parsedInput.email,
      emailVerified: false,
      role: "customer",
      phone: parsedInput.phone ?? null,
      cpf: parsedInput.cpf ?? null,
      address: parsedInput.address ?? null,
    });

    revalidatePath("/customers");
    return { id };
  });

export const createVehicleAction = authActionClient
  .schema(
    z.object({
      ownerId: z.string(),
      plate: z.string().min(7),
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.number().int().optional(),
      color: z.string().optional(),
      mileage: z.number().int().optional(),
      vin: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const [vehicle] = await db
      .insert(vehicles)
      .values({
        ownerId: parsedInput.ownerId,
        plate: parsedInput.plate.toUpperCase(),
        make: parsedInput.make,
        model: parsedInput.model,
        year: parsedInput.year ?? null,
        color: parsedInput.color ?? null,
        mileage: parsedInput.mileage ?? null,
        vin: parsedInput.vin ?? null,
      })
      .returning({ id: vehicles.id });

    revalidatePath("/customers");
    return { id: vehicle.id };
  });
