"use client";

import { DollarSign } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import { useTransactionForm } from "@/_hooks/use-transaction-form";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewTransactionDrawer({ open, onClose }: Props) {
  const { control, register, handleSubmit, errors, result, isExecuting } =
    useTransactionForm({ onClose });

  return (
    <Sheet
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <SheetContent
        side="right"
        className="bg-surface w-full overflow-y-auto sm:max-w-lg"
      >
        <SheetHeader className="border-outline-variant/30 border-b pb-4">
          <SheetTitle className="text-on-surface flex items-center gap-2">
            <DollarSign className="text-secondary size-5" />
            Nova Transação
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Preencha os dados para registrar a transação
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="type"
                  className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
              )}
            />
            {errors.type && (
              <p className="text-label-xs text-error">{errors.type.message}</p>
            )}
          </div>

          {/* Valor */}
          <div className="space-y-1.5">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              aria-invalid={!!errors.amount}
              {...register("amount", { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-label-xs text-error">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              aria-invalid={!!errors.date}
              {...register("date")}
            />
            {errors.date && (
              <p className="text-label-xs text-error">{errors.date.message}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              type="text"
              placeholder="Ex: Pagamento serviço #123"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-label-xs text-error">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Categoria */}
          <div className="space-y-1.5">
            <Label htmlFor="category">Categoria</Label>
            <Input
              id="category"
              type="text"
              placeholder="Ex: Serviço, Peças, Despesa Fixa"
              aria-invalid={!!errors.category}
              {...register("category")}
            />
            {errors.category && (
              <p className="text-label-xs text-error">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="status"
                  className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                >
                  <option value="paid">Pago</option>
                  <option value="pending">Pendente</option>
                  <option value="overdue">Em atraso</option>
                </select>
              )}
            />
            {errors.status && (
              <p className="text-label-xs text-error">
                {errors.status.message}
              </p>
            )}
          </div>

          {result.serverError && (
            <p className="text-label-sm text-error">{result.serverError}</p>
          )}
        </form>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button onClick={handleSubmit} disabled={isExecuting}>
            {isExecuting ? "Salvando..." : "Criar Transação"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
