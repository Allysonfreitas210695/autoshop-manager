"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { user, vehicles } from "@/_db/schema";
import { ActionError, authActionClient } from "@/_lib/safe-action";

function isUniqueConstraintError(e: unknown, constraintName: string): boolean {
  if (typeof e !== "object" || e === null) return false;
  const err = e as Record<string, unknown>;
  return (
    err["code"] === "23505" &&
    typeof err["constraint"] === "string" &&
    err["constraint"].includes(constraintName)
  );
}

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
    try {
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
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, "user_email_unique")) {
        throw new ActionError(
          "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.",
        );
      }
      throw e;
    }

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
    const owner = await db
      .select({ role: user.role })
      .from(user)
      .where(eq(user.id, parsedInput.ownerId))
      .limit(1);

    if (!owner[0] || owner[0].role !== "customer") {
      throw new ActionError("Cliente não encontrado.");
    }

    let vehicle: { id: string } | undefined;
    try {
      [vehicle] = await db
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
    } catch (e: unknown) {
      if (isUniqueConstraintError(e, "plate")) {
        throw new ActionError("Placa já cadastrada para outro veículo.");
      }
      throw e;
    }
    if (!vehicle) throw new ActionError("Falha ao cadastrar veículo.");

    revalidatePath("/customers");
    revalidatePath(`/customers/${parsedInput.ownerId}`);
    return { id: vehicle.id };
  });

export const updateCustomerAction = authActionClient
  .schema(
    z.object({
      id: z.string().min(1),
      name: z.string().min(2),
      email: z.string().email(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      address: z.string().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    try {
      const [updated] = await db
        .update(user)
        .set({
          name: parsedInput.name,
          email: parsedInput.email,
          phone: parsedInput.phone ?? null,
          cpf: parsedInput.cpf ?? null,
          address: parsedInput.address ?? null,
          updatedAt: new Date(),
        })
        .where(and(eq(user.id, parsedInput.id), eq(user.role, "customer")))
        .returning({ id: user.id });

      if (!updated) {
        throw new ActionError("Cliente não encontrado.");
      }
    } catch (e: unknown) {
      if (e instanceof ActionError) throw e;
      if (isUniqueConstraintError(e, "user_email_unique")) {
        throw new ActionError(
          "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.",
        );
      }
      throw e;
    }

    revalidatePath("/customers");
    revalidatePath(`/customers/${parsedInput.id}`);
    return { id: parsedInput.id };
  });
