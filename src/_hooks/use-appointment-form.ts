"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createAppointmentAction,
  updateAppointmentAction,
} from "@/_actions/appointments";
import type {
  AppointmentRow,
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
  mode?: "create" | "edit";
  initialValues?: Partial<AppointmentFormData>;
  appointmentId?: string;
  onUpdated?: (updated: AppointmentRow) => void;
};

export function useAppointmentForm({
  customers,
  onClose,
  mode = "create",
  initialValues,
  appointmentId,
  onUpdated,
}: Params) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(appointmentSchema) as any,
    defaultValues: initialValues ?? {
      customerId: "",
      vehicleId: "",
      mechanicId: "",
    },
  });

  const selectedCustomerId = useWatch({ control, name: "customerId" });
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const {
    execute: executeCreate,
    status: createStatus,
    result: createResult,
  } = useAction(createAppointmentAction, {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      reset();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar agendamento.");
    },
  });

  const {
    execute: executeUpdate,
    status: updateStatus,
    result: updateResult,
  } = useAction(updateAppointmentAction, {
    onSuccess: ({ data }) => {
      toast.success("Agendamento atualizado com sucesso.");
      if (data) {
        onUpdated?.({
          id: data.id,
          customerId: data.customerId ?? null,
          vehicleId: data.vehicleId ?? null,
          mechanicId: data.mechanicId ?? null,
          scheduledAt: new Date(data.scheduledAt),
          status: data.status ?? "scheduled",
          serviceType: data.serviceType ?? null,
          duration: data.duration ?? null,
          notes: data.notes ?? null,
          customer: null,
          phone: null,
          vehicle: null,
          plate: null,
          mechanic: null,
        });
      }
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar agendamento.");
    },
  });

  const status = mode === "edit" ? updateStatus : createStatus;
  const result = mode === "edit" ? updateResult : createResult;

  function onSubmit(data: AppointmentFormData) {
    const tzOffset = -new Date().getTimezoneOffset();
    const tzSign = tzOffset >= 0 ? "+" : "-";
    const tzPad = (n: number) =>
      String(Math.floor(Math.abs(n))).padStart(2, "0");
    const tz = `${tzSign}${tzPad(tzOffset / 60)}:${tzPad(tzOffset % 60)}`;

    const payload = {
      customerId: data.customerId,
      vehicleId: data.vehicleId?.trim() || undefined,
      mechanicId: data.mechanicId || undefined,
      scheduledAt: new Date(`${data.date}T${data.time}:00${tz}`).toISOString(),
      serviceType: data.serviceType || undefined,
      duration: data.duration || undefined,
      notes: data.notes || undefined,
    };

    if (mode === "edit" && appointmentId) {
      executeUpdate({ id: appointmentId, ...payload });
    } else {
      executeCreate(payload);
    }
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
