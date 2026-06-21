"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createAppointmentAction } from "@/_actions/appointments";
import type {
  CustomerOption,
  MechanicOption,
} from "@/_data-access/appointments";

export const appointmentSchema = z.object({
  customerId: z.string().min(1, "Selecione o cliente"),
  vehicleId: z.string().optional(),
  mechanicId: z.string().optional(),
  date: z.string().min(1, "Informe a data"),
  time: z.string().min(1, "Informe o horário"),
  serviceType: z.string().optional(),
  duration: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

type Params = {
  customers: CustomerOption[];
  mechanics: MechanicOption[];
  onClose: () => void;
};

export function useAppointmentForm({ customers, onClose }: Params) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: { customerId: "", vehicleId: "", mechanicId: "" },
  });

  const selectedCustomerId = useWatch({ control, name: "customerId" });
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const { execute, status, result } = useAction(createAppointmentAction, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      reset();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar agendamento.");
    },
  });

  function onSubmit(data: AppointmentFormData) {
    const vehicleId = data.vehicleId?.trim() || undefined;
    execute({
      customerId: data.customerId,
      vehicleId,
      mechanicId: data.mechanicId || undefined,
      scheduledAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
      serviceType: data.serviceType || undefined,
      duration: data.duration || undefined,
      notes: data.notes || undefined,
    });
  }

  return {
    control,
    register,
    handleSubmit: handleSubmit(onSubmit),
    errors,
    status,
    result,
    selectedCustomer,
    onSubmit,
  };
}
