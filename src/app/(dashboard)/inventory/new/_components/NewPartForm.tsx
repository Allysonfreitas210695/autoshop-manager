"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { inventoryCategories } from "@/_lib/mock-data";

const newPartSchema = z.object({
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

type NewPartValues = z.infer<typeof newPartSchema>;

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const categoryOptions = inventoryCategories.filter((c) => c !== "Todos");

export function NewPartForm() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<NewPartValues>({
    resolver: zodResolver(newPartSchema),
    defaultValues: { stock: 0, minStock: 5, unitPrice: 0 },
  });

  const stockValue = useWatch({ control, name: "stock" }) ?? 0;
  const unitPriceValue = useWatch({ control, name: "unitPrice" }) ?? 0;
  const nameValue = useWatch({ control, name: "name" }) ?? "";
  const categoryValue = useWatch({ control, name: "category" });

  const totalValue = (Number(stockValue) || 0) * (Number(unitPriceValue) || 0);

  const onSubmit = useCallback(
    (data: NewPartValues) => {
      console.log("Nova peça:", data);
      setSubmitted(true);
      setTimeout(() => router.push("/inventory"), 1500);
    },
    [router],
  );

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <span className="bg-secondary/10 text-secondary flex size-16 items-center justify-center rounded-2xl">
          <Package className="size-8" />
        </span>
        <h2 className="text-headline-sm text-on-surface font-bold">
          Peça cadastrada!
        </h2>
        <p className="text-label-md text-on-surface-variant font-mono">
          Redirecionando para o estoque...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href="/inventory"
        className="text-label-sm text-on-surface-variant hover:text-on-surface inline-flex items-center gap-1.5 font-mono transition-colors"
      >
        <ArrowLeft className="size-4" />
        Voltar para Estoque
      </Link>

      <div>
        <h1 className="text-headline-md text-on-surface sm:text-headline-lg font-bold">
          Cadastrar Nova Peça
        </h1>
        <p className="text-label-md text-on-surface-variant mt-1 font-mono">
          Preencha os dados para adicionar ao inventário
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="border-outline-variant bg-surface-container rounded-lg border p-4 sm:p-5">
              <h2 className="text-label-lg text-on-surface mb-4 font-mono tracking-wider uppercase">
                Identificação
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Nome da Peça *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="Ex: Filtro de Óleo Bosch"
                  />
                  {errors.name && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    SKU / Código *
                  </label>
                  <Input
                    {...register("sku")}
                    placeholder="Ex: FO-1234"
                    className="font-mono"
                  />
                  {errors.sku && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.sku.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Categoria *
                  </label>
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <select
                        {...field}
                        className="border-outline-variant bg-surface text-label-sm text-on-surface focus:ring-secondary h-9 w-full rounded-md border px-3 font-mono focus:ring-2 focus:outline-none"
                      >
                        <option value="">Selecione...</option>
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.category && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Fornecedor
                  </label>
                  <Input
                    {...register("supplier")}
                    placeholder="Ex: Bosch Brasil"
                  />
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Localização (Prateleira)
                  </label>
                  <Input
                    {...register("location")}
                    placeholder="Ex: A1-P01"
                    className="font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="border-outline-variant bg-surface-container rounded-lg border p-4 sm:p-5">
              <h2 className="text-label-lg text-on-surface mb-4 font-mono tracking-wider uppercase">
                Estoque e Preço
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Qtd. Inicial *
                  </label>
                  <Input
                    type="number"
                    min={0}
                    inputMode="numeric"
                    {...register("stock", { valueAsNumber: true })}
                    className="font-mono"
                  />
                  {errors.stock && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.stock.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Est. Mínimo *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    {...register("minStock", { valueAsNumber: true })}
                    className="font-mono"
                  />
                  {errors.minStock && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.minStock.message}
                    </p>
                  )}
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="text-label-sm text-on-surface-variant mb-1.5 block font-mono">
                    Preço Unitário (R$) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0.01}
                    inputMode="decimal"
                    {...register("unitPrice", { valueAsNumber: true })}
                    className="font-mono"
                    placeholder="0,00"
                  />
                  {errors.unitPrice && (
                    <p className="text-error mt-1 font-mono text-[11px]">
                      {errors.unitPrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="border-outline-variant bg-surface-container rounded-lg border p-4 lg:hidden">
              <h2 className="text-label-lg text-on-surface mb-3 font-mono tracking-wider uppercase">
                Resumo
              </h2>
              <div className="flex items-center gap-3">
                <div className="bg-secondary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                  <Package className="text-secondary size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm text-on-surface truncate font-medium">
                    {nameValue || "Nome da peça"}
                  </p>
                  <p className="text-on-surface-variant font-mono text-[11px]">
                    {categoryValue ?? "—"}
                  </p>
                </div>
              </div>
              <div className="border-outline-variant mt-3 space-y-2 border-t pt-3">
                <div className="text-label-sm flex justify-between font-mono">
                  <span className="text-on-surface-variant">Qtd. inicial</span>
                  <span className="text-on-surface">
                    {Number(stockValue) || 0} un
                  </span>
                </div>
                <div className="text-label-sm flex justify-between font-mono">
                  <span className="text-on-surface-variant">
                    Preço unitário
                  </span>
                  <span className="text-on-surface">
                    {brl(Number(unitPriceValue) || 0)}
                  </span>
                </div>
                <div className="border-outline-variant text-label-md flex justify-between border-t pt-2 font-mono font-bold">
                  <span className="text-on-surface-variant">
                    Valor em estoque
                  </span>
                  <span className="text-secondary">{brl(totalValue)}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:hidden">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Salvando..." : "Cadastrar Peça"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-on-surface-variant w-full"
                onClick={() => router.push("/inventory")}
              >
                Cancelar
              </Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-4 space-y-4">
              <div className="border-outline-variant bg-surface-container rounded-lg border p-5">
                <h2 className="text-label-lg text-on-surface mb-4 font-mono tracking-wider uppercase">
                  Resumo
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-secondary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
                      <Package className="text-secondary size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-body-sm text-on-surface truncate font-medium">
                        {nameValue || "Nome da peça"}
                      </p>
                      <p className="text-on-surface-variant font-mono text-[11px]">
                        {categoryValue ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="border-outline-variant space-y-2 border-t pt-3">
                    <div className="text-label-sm flex justify-between font-mono">
                      <span className="text-on-surface-variant">
                        Qtd. inicial
                      </span>
                      <span className="text-on-surface">
                        {Number(stockValue) || 0} un
                      </span>
                    </div>
                    <div className="text-label-sm flex justify-between font-mono">
                      <span className="text-on-surface-variant">
                        Preço unitário
                      </span>
                      <span className="text-on-surface">
                        {brl(Number(unitPriceValue) || 0)}
                      </span>
                    </div>
                    <div className="border-outline-variant text-label-md flex justify-between border-t pt-2 font-mono font-bold">
                      <span className="text-on-surface-variant">
                        Valor em estoque
                      </span>
                      <span className="text-secondary">{brl(totalValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {isSubmitting ? "Salvando..." : "Cadastrar Peça"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-on-surface-variant w-full"
                  onClick={() => router.push("/inventory")}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
