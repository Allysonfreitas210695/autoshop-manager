"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createVehicleAction } from "@/_actions/customers";

export const newVehicleSchema = z.object({
  plate: z.string().min(7, "Placa inválida."),
  make: z.string().min(1, "Marca é obrigatória."),
  model: z.string().min(1, "Modelo é obrigatório."),
  year: z.number().int().min(1900).max(2100).optional(),
  color: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
});

export type NewVehicleValues = z.infer<typeof newVehicleSchema>;

type Params = {
  customerId: string;
  onSuccess: () => void;
};

export function useNewVehicleForm({ customerId, onSuccess }: Params) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<NewVehicleValues>({
    resolver: zodResolver(newVehicleSchema),
    defaultValues: { plate: "", make: "", model: "", color: "" },
  });

  const { execute, status } = useAction(createVehicleAction, {
    onSuccess: () => {
      toast.success("Veículo cadastrado com sucesso.");
      reset();
      onSuccess();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao cadastrar veículo.");
    },
  });

  const onSubmit = useCallback(
    (data: NewVehicleValues) => {
      execute({
        ownerId: customerId,
        plate: data.plate,
        make: data.make,
        model: data.model,
        year: data.year,
        color: data.color || undefined,
        mileage: data.mileage,
      });
    },
    [execute, customerId],
  );

  return { register, handleSubmit, control, errors, status, onSubmit };
}
