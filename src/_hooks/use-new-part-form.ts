"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createPartAction } from "@/_actions/inventory";
import { inventoryCategories } from "@/_helpers/mock-data";

export const newPartSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter ao menos 2 caracteres." }),
  sku: z.string().min(1, { message: "SKU obrigatório." }),
  category: z.enum(
    inventoryCategories.filter((c) => c !== "Todos") as [string, ...string[]],
    { error: "Selecione uma categoria." },
  ),
  supplier: z.string().optional(),
  location: z.string().optional(),
  stock: z.number({ error: "Informe a quantidade inicial." }).min(0),
  minStock: z.number({ error: "Informe o estoque mínimo." }).min(1),
  unitPrice: z.number({ error: "Informe o preço unitário." }).min(0.01),
});

export type NewPartValues = z.infer<typeof newPartSchema>;

export const categoryOptions = inventoryCategories.filter((c) => c !== "Todos");

export function useNewPartForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<NewPartValues>({
    resolver: zodResolver(newPartSchema),
    defaultValues: { stock: 0, minStock: 5, unitPrice: 0 },
  });

  const stockValue = useWatch({ control, name: "stock" }) ?? 0;
  const unitPriceValue = useWatch({ control, name: "unitPrice" }) ?? 0;
  const nameValue = useWatch({ control, name: "name" }) ?? "";
  const categoryValue = useWatch({ control, name: "category" });

  const totalValue = (Number(stockValue) || 0) * (Number(unitPriceValue) || 0);

  const { execute, status } = useAction(createPartAction, {
    onSuccess: () => {
      toast.success("Peça cadastrada com sucesso.");
      router.push("/inventory");
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao cadastrar peça.");
    },
  });

  const onSubmit = useCallback(
    (data: NewPartValues) => {
      execute({
        name: data.name,
        sku: data.sku,
        price: data.unitPrice,
        stockQuantity: data.stock,
        minStock: data.minStock,
      });
    },
    [execute],
  );

  return {
    register,
    handleSubmit,
    control,
    errors,
    status,
    stockValue,
    unitPriceValue,
    nameValue,
    categoryValue,
    totalValue,
    onSubmit,
    goToInventory: () => router.push("/inventory"),
  };
}
