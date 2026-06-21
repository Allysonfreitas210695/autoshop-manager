"use client";

import { Car } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { PlateInput } from "@/_components/ui/plate-input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import { useNewVehicleForm } from "@/_hooks/use-new-vehicle-form";

type Props = {
  open: boolean;
  onClose: () => void;
  customerId: string;
};

export function NewVehicleDrawer({ open, onClose, customerId }: Props) {
  const { register, handleSubmit, control, errors, status, onSubmit } =
    useNewVehicleForm({ customerId, onSuccess: onClose });

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
            <Car className="text-secondary size-5" />
            Novo Veículo
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Vincule um veículo a este cliente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-4 py-5">
          <div className="space-y-1.5">
            <Label
              htmlFor="plate"
              className="text-on-surface-variant font-mono"
            >
              Placa *
            </Label>
            <Controller
              name="plate"
              control={control}
              render={({ field }) => (
                <PlateInput
                  id="plate"
                  value={field.value}
                  onChange={field.onChange}
                  aria-invalid={!!errors.plate}
                />
              )}
            />
            {errors.plate && (
              <p className="text-label-xs text-error">{errors.plate.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="make"
                className="text-on-surface-variant font-mono"
              >
                Marca *
              </Label>
              <Input
                id="make"
                placeholder="Toyota"
                aria-invalid={!!errors.make}
                {...register("make")}
              />
              {errors.make && (
                <p className="text-label-xs text-error">
                  {errors.make.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="model"
                className="text-on-surface-variant font-mono"
              >
                Modelo *
              </Label>
              <Input
                id="model"
                placeholder="Corolla"
                aria-invalid={!!errors.model}
                {...register("model")}
              />
              {errors.model && (
                <p className="text-label-xs text-error">
                  {errors.model.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="year"
                className="text-on-surface-variant font-mono"
              >
                Ano
              </Label>
              <Input
                id="year"
                type="number"
                placeholder="2020"
                {...register("year", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="color"
                className="text-on-surface-variant font-mono"
              >
                Cor
              </Label>
              <Input id="color" placeholder="Prata" {...register("color")} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="mileage"
              className="text-on-surface-variant font-mono"
            >
              KM Atual
            </Label>
            <Input
              id="mileage"
              type="number"
              placeholder="50000"
              {...register("mileage", { valueAsNumber: true })}
            />
          </div>
        </form>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={status === "executing"}
          >
            {status === "executing" ? "Salvando..." : "Cadastrar Veículo"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
