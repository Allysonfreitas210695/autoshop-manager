"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { createOrderAction } from "@/_actions/orders";
import { createServiceOrderSchema } from "@/_schemas/service-order";

type OrderFormValues = z.input<typeof createServiceOrderSchema>;

export function useNewOrderForm(onClose: () => void) {
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

  const { execute, status: actionStatus } = useAction(createOrderAction, {
    onSuccess: ({ data }) => {
      toast.success(`O.S. #${data?.orderNumber} criada com sucesso.`);
      reset();
      setOpen(false);
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar O.S.");
    },
  });

  function onSubmit(data: OrderFormValues) {
    const totalAmount = Number(data.totalAmount ?? 0);
    const items =
      totalAmount > 0
        ? [
            {
              description: data.description || "Serviço",
              itemType: "labor" as const,
              quantity: 1,
              unitPrice: totalAmount,
            },
          ]
        : [];

    execute({
      plate: data.plate,
      customerName: data.customerName,
      vehicleMake: data.vehicleMake,
      vehicleModel: data.vehicleModel,
      description: data.description,
      status: data.status,
      priority: "normal",
      dueAt: data.dueAt ? new Date(data.dueAt).toISOString() : undefined,
      items,
    });
  }

  function handleCancel() {
    reset();
    setOpen(false);
  }

  return {
    open,
    setOpen,
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting: isSubmitting || actionStatus === "executing",
    onSubmit,
    handleCancel,
  };
}
