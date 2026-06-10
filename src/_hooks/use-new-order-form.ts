"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

  async function onSubmit(data: OrderFormValues) {
    await new Promise((r) => setTimeout(r, 600));
    toast.success(`O.S. criada — Placa ${data.plate}`);
    reset();
    setOpen(false);
    onClose();
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
    isSubmitting,
    onSubmit,
    handleCancel,
  };
}
