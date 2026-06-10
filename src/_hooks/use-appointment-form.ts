"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";
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
    resolver: zodResolver(appointmentSchema),
    defaultValues: { customerId: "", vehicleId: "", mechanicId: "" },
  });

  const selectedCustomerId = useWatch({ control, name: "customerId" });
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const { execute, status, result } = useAction(createAppointmentAction, {
    onSuccess: () => {
      reset();
      onClose();
    },
  });

  function onSubmit(data: AppointmentFormData) {
    execute({
      customerId: data.customerId,
      vehicleId: data.vehicleId || undefined,
      mechanicId: data.mechanicId || undefined,
      scheduledAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
      notes: data.notes || undefined,
    });
  }

  return {
    control,
    register,
    handleSubmit,
    errors,
    status,
    result,
    selectedCustomer,
    onSubmit,
  };
}
