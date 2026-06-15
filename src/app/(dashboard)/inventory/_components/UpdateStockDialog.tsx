"use client";

import { Pencil } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { updateStockAction } from "@/_actions/inventory";
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

type Props = {
  partId: string;
  partName: string;
  currentStock: number;
  open: boolean;
  onClose: () => void;
};

export function UpdateStockDialog({
  partId,
  partName,
  currentStock,
  open,
  onClose,
}: Props) {
  const [qty, setQty] = useState(currentStock);

  const { execute, status } = useAction(updateStockAction, {
    onSuccess: () => {
      toast.success("Estoque atualizado.");
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar estoque.");
    },
  });

  function handleSave() {
    const safe = Math.max(0, Number(qty) || 0);
    execute({ id: partId, stockQuantity: safe });
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
        className="bg-surface w-full overflow-y-auto sm:max-w-sm"
      >
        <SheetHeader className="border-outline-variant/30 border-b pb-4">
          <SheetTitle className="text-on-surface flex items-center gap-2">
            <Pencil className="text-secondary size-4" />
            Editar Estoque
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm font-mono">
            {partName}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 py-5">
          <div className="space-y-1.5">
            <Label htmlFor="qty" className="text-on-surface-variant font-mono">
              Nova quantidade
            </Label>
            <Input
              id="qty"
              type="number"
              min={0}
              inputMode="numeric"
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="font-mono"
            />
          </div>
        </div>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose
            render={
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            }
          />
          <Button onClick={handleSave} disabled={status === "executing"}>
            {status === "executing" ? "Salvando..." : "Salvar"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
