"use client";

import { ChevronDown, FileText, Plus, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Props = {
  onNewTransaction?: () => void;
};

export function FinanceActions({ onNewTransaction }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 flex items-center gap-1.5 rounded-md px-4 py-2 font-mono font-bold transition-colors"
      >
        Quick Actions
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="border-outline-variant bg-surface-container absolute right-0 z-20 mt-1 w-52 rounded-md border shadow-lg">
            <button
              onClick={() => {
                setOpen(false);
                onNewTransaction?.();
              }}
              className="text-body-sm text-on-surface hover:bg-surface-container-highest flex w-full items-center gap-2.5 rounded-t-md px-4 py-3 font-mono transition-colors"
            >
              <Plus className="text-secondary size-4 shrink-0" />
              Nova Transação
            </button>
            <Link
              href="/finance/reports"
              onClick={() => setOpen(false)}
              className="text-body-sm text-on-surface hover:bg-surface-container-highest flex items-center gap-2.5 px-4 py-3 font-mono transition-colors"
            >
              <FileText className="text-secondary size-4 shrink-0" />
              Ver Relatórios
            </Link>
            <Link
              href="/orders/new"
              onClick={() => setOpen(false)}
              className="text-body-sm text-on-surface hover:bg-surface-container-highest flex items-center gap-2.5 rounded-b-md px-4 py-3 font-mono transition-colors"
            >
              <PlusCircle className="text-secondary size-4 shrink-0" />
              Nova Ordem de Serviço
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
