"use client";

import { Plus } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { CurrencyInput } from "@/_components/ui/currency-input";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { PlateInput } from "@/_components/ui/plate-input";
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
import { useNewOrderForm } from "@/_hooks/use-new-order-form";
import { serviceOrderStatusValues } from "@/_schemas/service-order";

const STATUS_LABELS: Record<(typeof serviceOrderStatusValues)[number], string> =
  {
    pending: "Pendente",
    in_progress: "Em Progresso",
    completed: "Concluído",
    delayed: "Atrasado",
  };

export function NewOrderDrawer() {
  const {
    open,
    setOpen,
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting,
    onSubmit,
    handleCancel,
  } = useNewOrderForm(() => {});

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
          className="flex flex-1 flex-col gap-5 overflow-y-auto px-4 py-4"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label
                htmlFor="plate"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                PLACA *
              </Label>
              <Controller
                control={control}
                name="plate"
                render={({ field }) => (
                  <PlateInput
                    id="plate"
                    aria-invalid={!!errors.plate}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              {errors.plate && (
                <p className="text-label-sm text-error font-mono">
                  {errors.plate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="vehicleMake"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                MARCA
              </Label>
              <Input
                id="vehicleMake"
                placeholder="Ex: Toyota"
                {...register("vehicleMake")}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="vehicleModel"
                className="text-label-sm text-on-surface-variant font-mono"
              >
                MODELO *
              </Label>
              <Input
                id="vehicleModel"
                placeholder="Ex: Corolla 2022"
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
                    items={STATUS_LABELS}
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
              <Controller
                control={control}
                name="totalAmount"
                render={({ field }) => (
                  <CurrencyInput
                    id="totalAmount"
                    value={field.value as number | undefined}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
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
            onClick={handleCancel}
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
