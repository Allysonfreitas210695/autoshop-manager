"use client";

import { AlertTriangle, Plus, Search, Trash2, Wrench } from "lucide-react";

import { Button } from "@/_components/ui/button";
import { CurrencyInput } from "@/_components/ui/currency-input";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import type { Part } from "@/_data-access/inventory";
import { formatCurrency } from "@/_helpers/format";
import { useStep3Form } from "@/_hooks/use-step-3-form";
import type { Step3Values } from "@/_schemas/order-wizard";

type Step3Props = {
  defaultValues: Partial<Step3Values>;
  parts: Part[];
  onNext: (data: Step3Values) => void;
};

export function Step03Parts({ defaultValues, parts, onNext }: Step3Props) {
  const {
    register,
    handleSubmit,
    partFields,
    appendPart,
    removePart,
    updatePart,
    laborFields,
    appendLabor,
    removeLabor,
    partsValues,
    laborValues,
    partsQuery,
    setPartsQuery,
    showLaborForm,
    setShowLaborForm,
    laborDescription,
    setLaborDescription,
    laborPrice,
    setLaborPrice,
    filteredParts,
  } = useStep3Form({ defaultValues, parts, onNext });

  const subtotalParts = partsValues.reduce(
    (sum, p) => sum + p.quantity * p.unitPrice,
    0,
  );
  const subtotalLabor = laborValues.reduce((sum, l) => sum + l.price, 0);
  const total = subtotalParts + subtotalLabor;

  function addPart(part: Part) {
    const existingIndex = partFields.findIndex((f) => f.id === part.id);
    if (existingIndex >= 0) {
      const current = partsValues[existingIndex];
      if (current) {
        updatePart(existingIndex, {
          ...current,
          quantity: current.quantity + 1,
        });
      }
    } else {
      appendPart({
        id: part.id,
        name: part.name,
        category: part.category,
        quantity: 1,
        unitPrice: part.unitPrice,
      });
    }
    setPartsQuery("");
  }

  function addLabor() {
    if (!laborDescription || !laborPrice || laborPrice <= 0) return;
    appendLabor({ description: laborDescription, price: laborPrice });
    setLaborDescription("");
    setLaborPrice(0);
    setShowLaborForm(false);
  }

  const lowStockParts = parts.filter((p) => p.stock <= p.minStock);

  return (
    <form id="wizard-step-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Alerta de estoque baixo */}
      {lowStockParts.length > 0 && (
        <div className="border-tertiary/30 bg-tertiary/5 flex items-start gap-3 rounded-md border px-4 py-3">
          <AlertTriangle className="text-tertiary mt-0.5 size-4 shrink-0" />
          <div>
            <p className="text-label-sm text-tertiary font-mono font-bold">
              BAIXO ESTOQUE: {lowStockParts.length}{" "}
              {lowStockParts.length === 1 ? "item" : "itens"}
            </p>
            <p className="text-body-sm text-on-surface-variant">
              {lowStockParts.map((p) => p.name).join(", ")}
            </p>
          </div>
        </div>
      )}

      {/* Busca de peças */}
      <div className="space-y-1.5">
        <Label className="text-label-sm text-on-surface-variant font-mono">
          BUSCAR PEÇA NO ESTOQUE
        </Label>
        <div className="relative">
          <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={partsQuery}
            onChange={(e) => setPartsQuery(e.target.value)}
            placeholder="Nome, SKU ou categoria..."
            className="border-outline-variant bg-surface-container text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full rounded-md border py-2 pr-4 pl-9 focus:ring-1 focus:outline-none"
          />
        </div>

        {filteredParts.length > 0 && (
          <div className="border-outline-variant bg-surface-container rounded-md border shadow-lg">
            {filteredParts.map((part) => {
              const isLow = part.stock <= part.minStock;
              return (
                <button
                  key={part.id}
                  type="button"
                  onClick={() => addPart(part)}
                  className="hover:bg-surface-container-highest flex w-full items-start justify-between gap-3 px-4 py-3 text-left transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-body-md text-on-surface truncate font-medium">
                      {part.name}
                    </p>
                    <p className="text-label-sm text-on-surface-variant font-mono">
                      {part.sku ?? "—"} · {part.category}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-label-md text-on-surface font-mono font-bold">
                      {formatCurrency(part.unitPrice)}
                    </p>
                    <p
                      className={`font-mono text-[10px] ${isLow ? "text-tertiary" : "text-on-surface-variant/60"}`}
                    >
                      {isLow ? "⚠ " : ""}
                      {part.stock} un.
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabela de itens adicionados */}
      {partFields.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
            Peças Adicionadas ({partFields.length})
          </h3>
          <div className="border-outline-variant overflow-hidden rounded-md border">
            <table className="w-full">
              <thead className="bg-surface-container">
                <tr>
                  <th className="text-on-surface-variant/60 px-3 py-2 text-left font-mono text-[10px] tracking-wider uppercase">
                    Peça
                  </th>
                  <th className="text-on-surface-variant/60 px-3 py-2 text-center font-mono text-[10px] tracking-wider uppercase">
                    Qtd
                  </th>
                  <th className="text-on-surface-variant/60 px-3 py-2 text-right font-mono text-[10px] tracking-wider uppercase">
                    Subtotal
                  </th>
                  <th className="w-10 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-outline-variant divide-y">
                {partFields.map((field, index) => {
                  const partValue = partsValues[index];
                  const qty = partValue?.quantity ?? 1;
                  return (
                    <tr key={field.id} className="bg-surface-container/50">
                      <td className="px-3 py-2">
                        <p className="text-body-sm text-on-surface font-medium">
                          {field.name}
                        </p>
                        <p className="text-on-surface-variant font-mono text-[10px]">
                          {field.category}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          className="border-outline-variant bg-surface text-label-sm text-on-surface focus:ring-secondary w-16 rounded border px-2 py-1 text-center font-mono focus:ring-1 focus:outline-none"
                          {...register(`parts.${index}.quantity`, {
                            valueAsNumber: true,
                          })}
                        />
                      </td>
                      <td className="text-label-sm text-on-surface px-3 py-2 text-right font-mono font-bold">
                        {formatCurrency(qty * field.unitPrice)}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          onClick={() => removePart(index)}
                          className="text-on-surface-variant/40 hover:text-error"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mão de obra */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
            Mão de Obra
          </h3>
          {!showLaborForm && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowLaborForm(true)}
              className="text-label-sm text-secondary h-7 gap-1.5 font-mono"
            >
              <Wrench className="size-3.5" />
              <Plus className="size-3" />
              Adicionar
            </Button>
          )}
        </div>

        {showLaborForm && (
          <div className="border-secondary/30 bg-secondary/5 rounded-md border p-3">
            <div className="space-y-2">
              <Input
                placeholder="Descrição do serviço..."
                value={laborDescription}
                onChange={(e) => setLaborDescription(e.target.value)}
              />
              <div className="flex gap-2">
                <CurrencyInput
                  value={laborPrice}
                  onValueChange={setLaborPrice}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={addLabor}
                  className="h-9 shrink-0"
                >
                  <Plus className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowLaborForm(false)}
                  className="text-on-surface-variant h-9 shrink-0"
                >
                  ✕
                </Button>
              </div>
            </div>
          </div>
        )}

        {laborFields.map((field, index) => (
          <div
            key={field.id}
            className="border-outline-variant bg-surface-container/50 flex items-center justify-between rounded-md border px-3 py-2"
          >
            <p className="text-body-sm text-on-surface">{field.description}</p>
            <div className="flex items-center gap-3">
              <span className="text-label-sm text-on-surface font-mono font-bold">
                {formatCurrency(field.price)}
              </span>
              <button
                type="button"
                onClick={() => removeLabor(index)}
                className="text-on-surface-variant/40 hover:text-error"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {laborFields.length === 0 && !showLaborForm && (
          <p className="text-body-sm text-on-surface-variant/60 py-2 text-center">
            Nenhum serviço de mão de obra adicionado.
          </p>
        )}
      </div>

      {/* Resumo */}
      <div className="border-outline-variant bg-surface-container space-y-2 rounded-md border p-4">
        <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
          Resumo do Pedido
        </h3>
        <div className="text-body-sm text-on-surface-variant flex justify-between">
          <span>Subtotal peças</span>
          <span className="font-mono">{formatCurrency(subtotalParts)}</span>
        </div>
        <div className="text-body-sm text-on-surface-variant flex justify-between">
          <span>Mão de obra</span>
          <span className="font-mono">{formatCurrency(subtotalLabor)}</span>
        </div>
        <div className="border-outline-variant text-body-md text-on-surface flex justify-between border-t pt-2 font-bold">
          <span>Total Estimado</span>
          <span className="text-secondary font-mono">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      <button type="submit" className="sr-only" aria-hidden="true" />
    </form>
  );
}
