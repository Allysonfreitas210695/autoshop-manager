"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createTransactionAction,
  deleteTransactionAction,
  updateTransactionAction,
} from "@/_actions/finance";

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  status: z.enum(["paid", "pending", "overdue"]),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

type Params = {
  onClose: () => void;
  mode?: "create" | "edit";
  transactionId?: string;
  initialValues?: Partial<TransactionFormData>;
};

export function useTransactionForm({
  onClose,
  mode = "create",
  transactionId,
  initialValues,
}: Params) {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(transactionSchema) as any,
    defaultValues: initialValues ?? {
      type: "income",
      amount: 0,
      date: "",
      description: "",
      category: "",
      status: "paid",
    },
  });

  const {
    execute: executeCreate,
    status: createStatus,
    result: createResult,
  } = useAction(createTransactionAction, {
    onSuccess: () => {
      toast.success("Transação criada com sucesso.");
      reset();
      router.refresh();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar transação.");
    },
  });

  const {
    execute: executeUpdate,
    status: updateStatus,
    result: updateResult,
  } = useAction(updateTransactionAction, {
    onSuccess: () => {
      toast.success("Transação atualizada.");
      router.refresh();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar transação.");
    },
  });

  const {
    execute: executeDelete,
    status: deleteStatus,
    result: deleteResult,
  } = useAction(deleteTransactionAction, {
    onSuccess: () => {
      toast.success("Transação excluída.");
      router.refresh();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao excluir transação.");
    },
  });

  const status =
    mode === "edit"
      ? deleteStatus === "executing"
        ? deleteStatus
        : updateStatus
      : createStatus;

  const result = mode === "edit" ? updateResult : createResult;

  function onSubmit(data: TransactionFormData) {
    if (mode === "edit") {
      executeUpdate({ id: transactionId!, ...data });
    } else {
      executeCreate(data);
    }
  }

  function handleDelete() {
    executeDelete({ id: transactionId! });
  }

  const isExecuting =
    createStatus === "executing" ||
    updateStatus === "executing" ||
    deleteStatus === "executing";

  return {
    control,
    register,
    handleSubmit: handleSubmit(onSubmit),
    handleDelete,
    errors,
    status,
    result,
    isExecuting,
    deleteResult,
  };
}
