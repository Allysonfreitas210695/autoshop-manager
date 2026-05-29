"use client";

import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import type { CustomerRow } from "@/_lib/queries/customers";

type Props = {
  customer: CustomerRow | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CustomerDetailPanel({ customer, open, onOpenChange }: Props) {
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {customer ? (
          <>
            <SheetHeader className="border-outline-variant bg-surface-container border-b px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="bg-secondary/15 text-display-sm text-secondary flex size-12 shrink-0 items-center justify-center rounded-full font-mono font-bold">
                  {customer.name[0]}
                </div>
                <div>
                  <SheetTitle className="text-body-lg text-on-surface font-semibold">
                    {customer.name}
                  </SheetTitle>
                  <SheetDescription className="text-label-sm text-on-surface-variant font-mono">
                    {customer.cpf ?? "CPF não informado"}
                  </SheetDescription>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {customer.phone && (
                  <p className="text-label-sm text-on-surface-variant font-mono">
                    📞 {customer.phone}
                  </p>
                )}
                <p className="text-label-sm text-on-surface-variant font-mono">
                  ✉ {customer.email}
                </p>
                {customer.address && (
                  <p className="text-label-sm text-on-surface-variant font-mono">
                    📍 {customer.address}
                  </p>
                )}
              </div>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto">
              {/* KPI cards */}
              <div className="border-outline-variant grid grid-cols-2 gap-3 border-b p-4">
                <div className="border-outline-variant bg-surface-container rounded-md border p-3 text-center">
                  <p className="text-headline-sm text-secondary font-mono font-bold break-all">
                    {brl(customer.totalSpent)}
                  </p>
                  <p className="text-on-surface-variant font-mono text-[10px] tracking-wider uppercase">
                    Total Gasto
                  </p>
                </div>
                <div className="border-outline-variant bg-surface-container rounded-md border p-3 text-center">
                  <p className="text-headline-sm text-secondary font-mono font-bold">
                    {customer.visits}
                  </p>
                  <p className="text-on-surface-variant font-mono text-[10px] tracking-wider uppercase">
                    Visitas
                  </p>
                </div>
              </div>

              {/* Último veículo */}
              {customer.lastVehicle && (
                <div className="border-outline-variant border-b p-4">
                  <p className="text-on-surface-variant/60 mb-2 font-mono text-[10px] tracking-wider uppercase">
                    Último Veículo
                  </p>
                  <div className="border-outline-variant bg-surface-container flex items-center justify-between rounded-md border px-3 py-2">
                    <p className="text-body-sm text-on-surface font-medium">
                      {customer.lastVehicle}
                    </p>
                    <span className="text-label-md text-secondary font-mono font-bold">
                      {customer.lastPlate}
                    </span>
                  </div>
                </div>
              )}

              {/* Última visita */}
              {customer.lastVisit && (
                <div className="p-4">
                  <p className="text-on-surface-variant/60 mb-2 font-mono text-[10px] tracking-wider uppercase">
                    Última Visita
                  </p>
                  <p className="text-body-sm text-on-surface font-mono">
                    {new Date(customer.lastVisit).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-outline-variant border-t p-4">
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/customers/${customer.id}`)}
                  className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex-1 rounded-md border px-3 py-2 font-mono transition-colors"
                >
                  Ver Ficha Completa
                </button>
                <button
                  onClick={() =>
                    router.push(`/orders/new?customerId=${customer.id}`)
                  }
                  className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 flex-1 rounded-md px-3 py-2 font-mono font-bold transition-colors"
                >
                  Nova O.S.
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <SheetHeader className="sr-only">
              <SheetTitle>Detalhes do cliente</SheetTitle>
              <SheetDescription>
                Painel lateral com informações do cliente
              </SheetDescription>
            </SheetHeader>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
