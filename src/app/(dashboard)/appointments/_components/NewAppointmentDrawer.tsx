"use client";

import { CalendarDays, Clock, User } from "lucide-react";
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
import type {
  CustomerOption,
  MechanicOption,
} from "@/_data-access/appointments";
import { useAppointmentForm } from "@/_hooks/use-appointment-form";

type Props = {
  open: boolean;
  onClose: () => void;
  mechanics: MechanicOption[];
  customers: CustomerOption[];
};

export function NewAppointmentDrawer({
  open,
  onClose,
  mechanics,
  customers,
}: Props) {
  const {
    control,
    register,
    handleSubmit,
    errors,
    status,
    result,
    selectedCustomer,
    onSubmit,
  } = useAppointmentForm({ customers, mechanics, onClose });

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
            <CalendarDays className="text-secondary size-5" />
            Novo Agendamento
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Preencha os dados para agendar o serviço
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-1 py-5">
          {/* Cliente */}
          <section className="space-y-3">
            <h3 className="text-label-sm text-on-surface-variant/60 flex items-center gap-2 font-mono tracking-wider uppercase">
              <User className="size-3.5" /> Cliente &amp; Veículo
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="customerId">Cliente</Label>
                <Controller
                  name="customerId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="customerId"
                      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                          {c.phone ? ` — ${c.phone}` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.customerId && (
                  <p className="text-label-xs text-error">
                    {errors.customerId.message}
                  </p>
                )}
                {customers.length === 0 && (
                  <p className="text-label-xs text-on-surface-variant">
                    Nenhum cliente cadastrado ainda.
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleId">Veículo</Label>
                <Controller
                  name="vehicleId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="vehicleId"
                      disabled={!selectedCustomer}
                      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none disabled:opacity-50"
                    >
                      <option value="">
                        {selectedCustomer
                          ? "Selecione..."
                          : "Selecione o cliente primeiro"}
                      </option>
                      {selectedCustomer?.vehicles.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.label} · {v.plate}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>
          </section>

          {/* Serviço */}
          <section className="space-y-3">
            <h3 className="text-label-sm text-on-surface-variant/60 flex items-center gap-2 font-mono tracking-wider uppercase">
              <Clock className="size-3.5" /> Agendamento
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="mechanicId">Mecânico Responsável</Label>
                <Controller
                  name="mechanicId"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="mechanicId"
                      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {mechanics.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="date">Data</Label>
                  <Input id="date" type="date" {...register("date")} />
                  {errors.date && (
                    <p className="text-label-xs text-error">
                      {errors.date.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="time">Hora</Label>
                  <Input id="time" type="time" {...register("time")} />
                  {errors.time && (
                    <p className="text-label-xs text-error">
                      {errors.time.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Tipo de serviço, informações adicionais..."
                  {...register("notes")}
                  className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full resize-none rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
            </div>
          </section>

          {result.serverError && (
            <p className="text-label-sm text-error">
              Erro ao criar agendamento. Tente novamente.
            </p>
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
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={status === "executing"}
          >
            {status === "executing" ? "Salvando..." : "Confirmar Agendamento"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
