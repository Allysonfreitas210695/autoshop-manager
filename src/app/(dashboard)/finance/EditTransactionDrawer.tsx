"use client";

import { Pencil, Trash2 } from "lucide-react";
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
import type { Transaction } from "@/_data-access/finance";
import { useTransactionForm } from "@/_hooks/use-transaction-form";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};

export function EditTransactionDrawer({ open, onClose, transaction }: Props) {
  const {
    control,
    register,
    handleSubmit,
    handleDelete,
    errors,
    result,
    isExecuting,
  } = useTransactionForm({
    onClose,
    mode: "edit",
    transactionId: transaction?.id,
    initialValues: transaction
      ? {
          type: transaction.type,
          amount: transaction.amount,
          date:
            transaction.date instanceof Date
              ? transaction.date.toISOString().slice(0, 10)
              : String(transaction.date),
          description: transaction.description,
          category: transaction.category,
          status: transaction.status,
        }
      : undefined,
  });

  if (!transaction) return null;

  function onDeleteClick() {
    if (
      window.confirm("Excluir esta transação? Esta ação não pode ser desfeita.")
    ) {
      handleDelete();
    }
  }

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
            <Pencil className="text-secondary size-5" />
            Editar Transação
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Atualize os dados da transação
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-4 py-5">
          {/* Tipo */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-type">Tipo</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="edit-type"
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
            <Label htmlFor="edit-amount">Valor (R$)</Label>
            <Input
              id="edit-amount"
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
            <Label htmlFor="edit-date">Data</Label>
            <Input
              id="edit-date"
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
            <Label htmlFor="edit-description">Descrição</Label>
            <Input
              id="edit-description"
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
            <Label htmlFor="edit-category">Categoria</Label>
            <Input
              id="edit-category"
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
            <Label htmlFor="edit-status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  id="edit-status"
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
          <Button
            variant="outline"
            className="text-error border-error/30 hover:bg-error/10 mr-auto"
            onClick={onDeleteClick}
            disabled={isExecuting}
          >
            <Trash2 className="size-4" />
            Excluir
          </Button>
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button onClick={handleSubmit} disabled={isExecuting}>
            {isExecuting ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
