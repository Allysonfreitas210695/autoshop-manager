"use client";

import { ArrowLeft, Package } from "lucide-react";
import Link from "next/link";
import { Controller } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { CurrencyInput } from "@/_components/ui/currency-input";
import { Input } from "@/_components/ui/input";
import { formatCurrency } from "@/_helpers/format";
import { categoryOptions, useNewPartForm } from "@/_hooks/use-new-part-form";

export function NewPartForm() {
  const {
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
    goToInventory,
  } = useNewPartForm();

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
                    aria-invalid={!!errors.name}
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
                    aria-invalid={!!errors.sku}
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
                    aria-invalid={!!errors.stock}
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
                    aria-invalid={!!errors.minStock}
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
                  <Controller
                    control={control}
                    name="unitPrice"
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        onValueChange={field.onChange}
                        onBlur={field.onBlur}
                        className="font-mono"
                      />
                    )}
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
                    {formatCurrency(Number(unitPriceValue) || 0)}
                  </span>
                </div>
                <div className="border-outline-variant text-label-md flex justify-between border-t pt-2 font-mono font-bold">
                  <span className="text-on-surface-variant">
                    Valor em estoque
                  </span>
                  <span className="text-secondary">
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 lg:hidden">
              <Button
                type="submit"
                disabled={status === "executing"}
                className="w-full"
              >
                {status === "executing" ? "Salvando..." : "Cadastrar Peça"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-on-surface-variant w-full"
                onClick={goToInventory}
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
                        {formatCurrency(Number(unitPriceValue) || 0)}
                      </span>
                    </div>
                    <div className="border-outline-variant text-label-md flex justify-between border-t pt-2 font-mono font-bold">
                      <span className="text-on-surface-variant">
                        Valor em estoque
                      </span>
                      <span className="text-secondary">
                        {formatCurrency(totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  disabled={status === "executing"}
                  className="w-full"
                >
                  {status === "executing" ? "Salvando..." : "Cadastrar Peça"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-on-surface-variant w-full"
                  onClick={goToInventory}
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
