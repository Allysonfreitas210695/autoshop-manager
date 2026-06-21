"use client";

import { Plus } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { Controller } from "react-hook-form";
import { toast } from "sonner";

import { searchPartsAction } from "@/_actions/inventory";
import { addOrderItemAction } from "@/_actions/orders";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/_components/ui/sheet";
import type { Part } from "@/_data-access/inventory";
import { useAddOrderItemForm } from "@/_hooks/useAddOrderItemForm";
import type { AddOrderItemInput } from "@/_schemas/service-order";

type Props = {
  orderId: string;
  orderStatus: string;
};

export function AddOrderItemModal({ orderId, orderStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [parts, setParts] = useState<Part[]>([]);

  const { execute: fetchParts } = useAction(searchPartsAction, {
    onSuccess: ({ data }) => setParts(data?.parts ?? []),
  });

  function handleOpenChange(newOpen: boolean) {
    setOpen(newOpen);
    if (newOpen && parts.length === 0) {
      fetchParts({ query: "" });
    }
  }

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useAddOrderItemForm(orderId);

  const { execute, status } = useAction(addOrderItemAction, {
    onSuccess: () => {
      toast.success("Item adicionado com sucesso.");
      setOpen(false);
      reset({
        orderId,
        itemType: "part",
        quantity: 1,
        unitPrice: 0,
      });
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao adicionar item.");
    },
  });

  const itemType = watch("itemType");

  function onSubmit(data: AddOrderItemInput) {
    execute(data);
  }

  // Se a O.S. já está concluída ou cancelada, não permite adicionar itens
  if (orderStatus === "completed" || orderStatus === "delayed") {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button variant="outline" className="mt-2 w-full gap-2 border-dashed">
            <Plus className="size-4" />
            Adicionar Peça ou Serviço
          </Button>
        }
      />
      <SheetContent className="sm:max-w-[425px]">
        <SheetHeader>
          <SheetTitle>Novo Item no Orçamento</SheetTitle>
          <SheetDescription>
            Insira uma peça do estoque ou serviço para esta O.S.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-label-sm text-on-surface-variant font-mono">
              Tipo de Item
            </label>
            <Controller
              control={control}
              name="itemType"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    if (!val) return;
                    field.onChange(val);
                    setValue("description", "");
                    setValue("serviceId", undefined);
                    setValue("unitPrice", 0);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="part">Peça (Estoque)</SelectItem>
                    <SelectItem value="labor">Mão de Obra / Serviço</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {itemType === "part" ? (
            <div className="space-y-2">
              <label className="text-label-sm text-on-surface-variant font-mono">
                Peça do Estoque
              </label>
              <Controller
                control={control}
                name="serviceId"
                render={({ field }) => (
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(val) => {
                      field.onChange(val);
                      const part = parts.find((p) => p.id === val);
                      if (part) {
                        setValue("description", part.name);
                        setValue("unitPrice", Number(part.unitPrice));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a peça..." />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.stock} un)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceId && (
                <p className="text-error text-xs">{errors.serviceId.message}</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-label-sm text-on-surface-variant font-mono">
                Descrição do Serviço
              </label>
              <Input
                {...register("description")}
                placeholder="Ex: Troca de óleo"
              />
              {errors.description && (
                <p className="text-error text-xs">
                  {errors.description.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-label-sm text-on-surface-variant font-mono">
                Quantidade
              </label>
              <Input type="number" step="0.01" {...register("quantity")} />
              {errors.quantity && (
                <p className="text-error text-xs">{errors.quantity.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-label-sm text-on-surface-variant font-mono">
                Preço Unitário (R$)
              </label>
              <Input type="number" step="0.01" {...register("unitPrice")} />
              {errors.unitPrice && (
                <p className="text-error text-xs">{errors.unitPrice.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={status === "executing"}>
              {status === "executing" ? "Adicionando..." : "Adicionar Item"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
