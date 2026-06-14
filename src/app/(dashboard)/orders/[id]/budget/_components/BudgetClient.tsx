"use client";

import { CheckCircle } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { approveOrderItemAction } from "@/_actions/orders";

export function ApproveItemButton({
  itemId,
  orderId,
  approved,
}: {
  itemId: string;
  orderId: string;
  approved: boolean;
}) {
  const { execute, status } = useAction(approveOrderItemAction, {
    onSuccess: () =>
      toast.success(approved ? "Item reprovado." : "Item aprovado."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao atualizar item."),
  });

  return (
    <button
      disabled={status === "executing"}
      onClick={() => execute({ itemId, orderId, approved: !approved })}
      aria-label={approved ? "Reprovar item" : "Aprovar item"}
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors disabled:opacity-50 ${
        approved
          ? "border-status-completed bg-status-completed/10 hover:border-error hover:bg-error/10"
          : "border-outline-variant bg-surface-container hover:border-status-completed"
      }`}
    >
      {approved && <CheckCircle className="text-status-completed size-3.5" />}
    </button>
  );
}

export function ConfirmApprovalButton({
  orderId,
  itemIds,
}: {
  orderId: string;
  itemIds: string[];
}) {
  const { execute, status } = useAction(approveOrderItemAction, {
    onSuccess: () => toast.success("Orçamento aprovado."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao confirmar aprovação."),
  });

  return (
    <button
      disabled={status === "executing" || itemIds.length === 0}
      onClick={() =>
        itemIds.forEach((itemId) =>
          execute({ itemId, orderId, approved: true }),
        )
      }
      className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 w-full rounded-md px-4 py-2.5 font-mono font-bold transition-colors disabled:opacity-50"
    >
      {status === "executing" ? "Confirmando..." : "Confirmar Aprovação"}
    </button>
  );
}
