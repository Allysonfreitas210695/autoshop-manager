"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Clock, User } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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
import { appointmentServiceTypes, mechanics } from "@/_lib/mock-data";

const schema = z.object({
  customer: z.string().min(2, "Informe o nome do cliente"),
  phone: z.string().min(8, "Informe o telefone"),
  vehicle: z.string().min(2, "Informe o veículo"),
  plate: z.string().min(6, "Informe a placa"),
  serviceType: z.string().min(1, "Selecione o tipo de serviço"),
  mechanic: z.string().min(1, "Selecione o mecânico"),
  date: z.string().min(1, "Informe a data"),
  time: z.string().min(1, "Informe o horário"),
  duration: z.string().min(1, "Informe a duração"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewAppointmentDrawer({ open, onClose }: Props) {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { duration: "60" },
  });

  function onSubmit() {
    reset();
    onClose();
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
                <Label htmlFor="customer">Nome do Cliente</Label>
                <Input
                  id="customer"
                  placeholder="Ex: Ricardo Almeida"
                  {...register("customer")}
                />
                {errors.customer && (
                  <p className="text-label-xs text-error">
                    {errors.customer.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-0000"
                  {...register("phone")}
                />
                {errors.phone && (
                  <p className="text-label-xs text-error">
                    {errors.phone.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle">Veículo</Label>
                  <Input
                    id="vehicle"
                    placeholder="Toyota Corolla 2020"
                    {...register("vehicle")}
                  />
                  {errors.vehicle && (
                    <p className="text-label-xs text-error">
                      {errors.vehicle.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="plate">Placa</Label>
                  <Input
                    id="plate"
                    placeholder="ABC-1234"
                    {...register("plate")}
                  />
                  {errors.plate && (
                    <p className="text-label-xs text-error">
                      {errors.plate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Serviço */}
          <section className="space-y-3">
            <h3 className="text-label-sm text-on-surface-variant/60 flex items-center gap-2 font-mono tracking-wider uppercase">
              <Clock className="size-3.5" /> Serviço &amp; Agendamento
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="serviceType">Tipo de Serviço</Label>
                <Controller
                  name="serviceType"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="serviceType"
                      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {appointmentServiceTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.serviceType && (
                  <p className="text-label-xs text-error">
                    {errors.serviceType.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mechanic">Mecânico Responsável</Label>
                <Controller
                  name="mechanic"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      id="mechanic"
                      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                    >
                      <option value="">Selecione...</option>
                      {mechanics.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.mechanic && (
                  <p className="text-label-xs text-error">
                    {errors.mechanic.message}
                  </p>
                )}
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
                <Label htmlFor="duration">Duração (minutos)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  step={15}
                  {...register("duration")}
                />
                {errors.duration && (
                  <p className="text-label-xs text-error">
                    {errors.duration.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="notes">Observações</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Informações adicionais sobre o serviço..."
                  {...register("notes")}
                  className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full resize-none rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                />
              </div>
            </div>
          </section>
        </form>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button onClick={handleSubmit(onSubmit)}>
            Confirmar Agendamento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
