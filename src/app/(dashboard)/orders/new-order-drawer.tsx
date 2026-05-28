"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
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
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/_components/ui/sheet";
import {
  createServiceOrderSchema,
  serviceOrderStatusValues,
} from "@/_schemas/service-order";

// Use input type (pre-transform) to align with zodResolver's resolver output
type OrderFormValues = z.input<typeof createServiceOrderSchema>;

const STATUS_LABELS: Record<(typeof serviceOrderStatusValues)[number], string> =
  {
    pending: "Pendente",
    in_progress: "Em Progresso",
    completed: "Concluído",
    delayed: "Atrasado",
  };

export function NewOrderDrawer() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(createServiceOrderSchema),
    defaultValues: { status: "pending", totalAmount: 0 },
  });

  async function onSubmit(data: OrderFormValues) {
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`O.S. criada — Placa ${data.plate}`);
    reset();
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button aria-label="Nova ordem de serviço" />}>
        <Plus className="mr-2 size-4" />
        Nova O.S.
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="border-outline-variant border-b pb-4">
          <SheetTitle className="text-label-lg text-on-surface font-mono tracking-wider uppercase">
            Nova Ordem de Serviço
          </SheetTitle>
          <SheetDescription className="text-body-sm text-on-surface-variant">
            Registre a entrada do veículo e descreva o serviço necessário.
          </SheetDescription>
        </SheetHeader>

        <form
          id="new-order-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 overflow-y-auto py-4"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="plate"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                PLACA *
              </Label>
              <Input
                id="plate"
                placeholder="ABC-1234"
                aria-invalid={!!errors.plate}
                {...register("plate")}
              />
              {errors.plate && (
                <p className="text-label-sm text-error font-mono">
                  {errors.plate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="vehicleModel"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                VEÍCULO *
              </Label>
              <Input
                id="vehicleModel"
                placeholder="Ex: Toyota Corolla 2022"
                aria-invalid={!!errors.vehicleModel}
                {...register("vehicleModel")}
              />
              {errors.vehicleModel && (
                <p className="text-label-sm text-error font-mono">
                  {errors.vehicleModel.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="customerName"
              className="text-label-sm text-on-surface-variant font-mono"
            >
              CLIENTE *
            </Label>
            <Input
              id="customerName"
              placeholder="Nome do cliente"
              aria-invalid={!!errors.customerName}
              {...register("customerName")}
            />
            {errors.customerName && (
              <p className="text-label-sm text-error font-mono">
                {errors.customerName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-label-sm text-on-surface-variant font-mono"
            >
              DESCRIÇÃO DO SERVIÇO *
            </Label>
            <textarea
              id="description"
              rows={4}
              placeholder="Descreva detalhadamente o problema e o serviço a realizar..."
              aria-invalid={!!errors.description}
              className="border-outline-variant bg-surface-container text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary aria-[invalid=true]:border-error w-full resize-none rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-label-sm text-error font-mono">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="status"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                STATUS INICIAL
              </Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value ?? "pending"}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="status" aria-label="Status da ordem">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOrderStatusValues.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="totalAmount"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                VALOR ESTIMADO (R$)
              </Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                {...register("totalAmount")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="dueAt"
              className="text-label-sm text-on-surface-variant font-mono"
            >
              PRAZO DE ENTREGA
            </Label>
            <Input id="dueAt" type="datetime-local" {...register("dueAt")} />
          </div>
        </form>

        <SheetFooter className="border-outline-variant border-t pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="text-on-surface-variant"
          >
            Cancelar
          </Button>
          <Button type="submit" form="new-order-form" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Criar O.S."}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
