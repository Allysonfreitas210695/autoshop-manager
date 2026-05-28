import { Wallet } from "lucide-react";

export default function FinancePage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="bg-status-completed/10 text-status-completed flex size-16 items-center justify-center rounded-2xl">
        <Wallet className="size-8" />
      </span>
      <h1 className="text-headline-md text-on-surface font-bold">
        Gestão Financeira
      </h1>
      <p className="text-body-md text-on-surface-variant max-w-sm">
        Módulo financeiro em desenvolvimento. Em breve disponível.
      </p>
    </div>
  );
}
