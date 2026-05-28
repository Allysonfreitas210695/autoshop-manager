"use client";

import { useRouter } from "next/navigation";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import { StatusChip } from "@/_components/ui/status-chip";
import { type MockCustomerDetail } from "@/_lib/mock-data";

type CustomerDetailPanelProps = {
  customer: MockCustomerDetail | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CustomerDetailPanel({
  customer,
  open,
  onOpenChange,
}: CustomerDetailPanelProps) {
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
                    {customer.cpf}
                  </SheetDescription>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <p className="text-label-sm text-on-surface-variant font-mono">
                  📞 {customer.phone}
                </p>
                <p className="text-label-sm text-on-surface-variant font-mono">
                  ✉ {customer.email}
                </p>
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

              {/* Veículo principal */}
              <div className="border-outline-variant border-b p-4">
                <p className="text-on-surface-variant/60 mb-2 font-mono text-[10px] tracking-wider uppercase">
                  Veículo(s)
                </p>
                {customer.vehicles.map((v) => (
                  <div
                    key={v.id}
                    className="border-outline-variant bg-surface-container mb-2 flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div>
                      <p className="text-body-sm text-on-surface font-medium">
                        {v.model}
                      </p>
                      <p className="text-label-sm text-on-surface-variant font-mono">
                        {v.year} · {v.color}
                      </p>
                    </div>
                    <span className="text-label-md text-secondary font-mono font-bold">
                      {v.plate}
                    </span>
                  </div>
                ))}
              </div>

              {/* Histórico de manutenções */}
              <div className="p-4">
                <p className="text-on-surface-variant/60 mb-3 font-mono text-[10px] tracking-wider uppercase">
                  Histórico de Manutenções ({customer.orders.length})
                </p>
                <div className="space-y-2">
                  {customer.orders.slice(0, 4).map((order) => (
                    <div
                      key={order.id}
                      className="border-outline-variant bg-surface-container/50 rounded-md border p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-body-sm text-on-surface truncate font-medium">
                            {order.service}
                          </p>
                          <p className="text-label-sm text-on-surface-variant font-mono">
                            {new Date(order.date).toLocaleDateString("pt-BR")} ·{" "}
                            {order.vehicle}
                          </p>
                        </div>
                        <StatusChip status={order.status} />
                      </div>
                      <p className="text-label-sm text-on-surface mt-1 text-right font-mono font-bold">
                        {brl(order.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
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
