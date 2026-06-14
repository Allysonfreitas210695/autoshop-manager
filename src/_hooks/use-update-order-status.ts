"use client";

import { useOptimisticAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateOrderStatusAction } from "@/_actions/orders";
import type { OrderRow } from "@/_data-access/orders";

type Status = OrderRow["status"];

export function useUpdateOrderStatus(orderId: string, initialStatus: Status) {
  const { execute, optimisticState } = useOptimisticAction(
    updateOrderStatusAction,
    {
      currentState: { status: initialStatus },
      updateFn: (_state, input) => ({ status: input.status }),
      onSuccess: () => toast.success("Status atualizado."),
      onError: ({ error }) =>
        toast.error(error.serverError ?? "Erro ao atualizar status."),
    },
  );

  return { execute, optimisticStatus: optimisticState.status };
}
