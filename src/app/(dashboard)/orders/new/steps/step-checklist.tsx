"use client";

import { AlertTriangle, CheckCircle2, XOctagon } from "lucide-react";
import { useState } from "react";

import { Label } from "@/_components/ui/label";
import {
  type ChecklistItem,
  type ChecklistItemState,
  type StepChecklistValues,
} from "@/_schemas/order-wizard";

const DEFAULT_ITEMS: ChecklistItem[] = [
  { id: "lataria", label: "Lataria e pintura", state: "ok" },
  { id: "parabrisa", label: "Parabrisa e vidros", state: "ok" },
  { id: "farois", label: "Faróis e lanternas", state: "ok" },
  { id: "espelhos", label: "Espelhos retrovisores", state: "ok" },
  { id: "pneus", label: "Pneus e rodas", state: "ok" },
  { id: "freios", label: "Freios (visual)", state: "ok" },
  { id: "suspen", label: "Suspensão (visual)", state: "ok" },
  { id: "motor", label: "Compartimento do motor", state: "ok" },
  { id: "interior", label: "Interior e bancos", state: "ok" },
  { id: "painel", label: "Painel e instrumentos", state: "ok" },
  { id: "combustivel", label: "Nível de combustível", state: "ok" },
  { id: "estepe", label: "Estepe e macaco", state: "ok" },
];

const stateConfig: Record<
  ChecklistItemState,
  { label: string; icon: React.ReactNode; active: string; inactive: string }
> = {
  ok: {
    label: "OK",
    icon: <CheckCircle2 className="size-3.5" />,
    active:
      "bg-status-completed/20 text-status-completed border-status-completed/50",
    inactive:
      "border-outline-variant/30 text-on-surface-variant hover:border-status-completed/30",
  },
  atencao: {
    label: "Atenção",
    icon: <AlertTriangle className="size-3.5" />,
    active: "bg-tertiary/20 text-tertiary border-tertiary/50",
    inactive:
      "border-outline-variant/30 text-on-surface-variant hover:border-tertiary/30",
  },
  dano: {
    label: "Dano",
    icon: <XOctagon className="size-3.5" />,
    active: "bg-error/20 text-error border-error/50",
    inactive:
      "border-outline-variant/30 text-on-surface-variant hover:border-error/30",
  },
};

type Props = {
  defaultValues: Partial<StepChecklistValues>;
  onNext: (data: StepChecklistValues) => void;
};

export function StepChecklist({ defaultValues, onNext }: Props) {
  const [items, setItems] = useState<ChecklistItem[]>(
    defaultValues.items ?? DEFAULT_ITEMS,
  );
  const [generalNotes, setGeneralNotes] = useState(
    defaultValues.generalNotes ?? "",
  );

  function setItemState(id: string, state: ChecklistItemState) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, state } : item)),
    );
  }

  function setItemNotes(id: string, notes: string) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes } : item)),
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext({ items, generalNotes: generalNotes || undefined });
  }

  const damageCount = items.filter((i) => i.state === "dano").length;
  const attentionCount = items.filter((i) => i.state === "atencao").length;

  return (
    <form id="wizard-step-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-title-md text-on-surface font-semibold">
          Checklist de Entrada
        </h2>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Registre as condições do veículo no momento da entrada. Este checklist
          é compartilhado com o cliente.
        </p>
      </div>

      {(damageCount > 0 || attentionCount > 0) && (
        <div className="bg-tertiary/5 border-tertiary/20 flex flex-wrap gap-3 rounded-xl border px-4 py-3">
          {damageCount > 0 && (
            <span className="text-label-sm text-error flex items-center gap-1.5 font-mono">
              <XOctagon className="size-4" />
              {damageCount} {damageCount === 1 ? "dano" : "danos"} registrado
              {damageCount > 1 ? "s" : ""}
            </span>
          )}
          {attentionCount > 0 && (
            <span className="text-label-sm text-tertiary flex items-center gap-1.5 font-mono">
              <AlertTriangle className="size-4" />
              {attentionCount} item{attentionCount > 1 ? "ns" : ""} com atenção
            </span>
          )}
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-surface-container border-outline-variant/20 rounded-xl border p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-body-sm text-on-surface font-medium">
                {item.label}
              </span>
              <div className="flex gap-1.5">
                {(["ok", "atencao", "dano"] as ChecklistItemState[]).map(
                  (state) => {
                    const cfg = stateConfig[state];
                    const isActive = item.state === state;
                    return (
                      <button
                        key={state}
                        type="button"
                        onClick={() => setItemState(item.id, state)}
                        className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-[11px] font-bold tracking-wider uppercase transition-colors ${
                          isActive ? cfg.active : cfg.inactive
                        }`}
                      >
                        {cfg.icon}
                        <span className="hidden sm:inline">{cfg.label}</span>
                      </button>
                    );
                  },
                )}
              </div>
            </div>

            {item.state !== "ok" && (
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Observação (opcional)"
                  value={item.notes ?? ""}
                  onChange={(e) => setItemNotes(item.id, e.target.value)}
                  className="bg-surface border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary w-full rounded-lg border px-3 py-2 font-mono text-sm transition-colors outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label>Observações Gerais</Label>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          placeholder="Ex.: cheiro de gasolina, barulho ao ligar, etc."
          rows={3}
          className="bg-surface-container border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/40 focus:border-secondary w-full rounded-xl border px-4 py-3 text-sm transition-colors outline-none"
        />
      </div>
    </form>
  );
}
