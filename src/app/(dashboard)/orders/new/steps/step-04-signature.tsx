"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";

import { Button } from "@/_components/ui/button";
import type {
  LaborItem,
  PartItem,
  Step1Values,
  Step2Values,
  Step3Values,
  Step4Values,
} from "@/_schemas/order-wizard";
import { step4Schema } from "@/_schemas/order-wizard";

type FinancialSummary = {
  subtotalParts: number;
  subtotalLabor: number;
  total: number;
};

type Step4Props = {
  defaultValues: Partial<Step4Values>;
  summary: FinancialSummary;
  step1: Partial<Step1Values>;
  step2: Partial<Step2Values>;
  step3: Partial<Step3Values>;
  onSubmit: (data: Step4Values, signatureDataUrl: string | null) => void;
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  garantia: "Garantia",
  estetica: "Estética",
};

const PRIORITY_LABELS: Record<string, string> = {
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
};

function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function Step04Signature({
  defaultValues,
  summary,
  step1,
  step2,
  step3,
  onSubmit,
}: Step4Props) {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      hasSignature: false,
      ...defaultValues,
    },
  });

  const clearSignature = useCallback(() => {
    sigCanvasRef.current?.clear();
    setValue("hasSignature", false);
  }, [setValue]);

  const handleFormSubmit = useCallback(
    (data: Step4Values) => {
      const signatureDataUrl = sigCanvasRef.current?.isEmpty()
        ? null
        : (sigCanvasRef.current?.toDataURL("image/png") ?? null);
      onSubmit(data, signatureDataUrl);
    },
    [onSubmit],
  );

  const parts: PartItem[] = (step3.parts as PartItem[] | undefined) ?? [];
  const laborItems: LaborItem[] =
    (step3.laborItems as LaborItem[] | undefined) ?? [];

  return (
    // eslint-disable-next-line react-hooks/refs
    <form
      id="wizard-step-form"
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      {/* Resumo da O.S. */}
      <div className="border-outline-variant bg-surface-container/50 space-y-3 rounded-md border p-4">
        <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
          Resumo da Ordem de Serviço
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Cliente
            </p>
            <p className="text-body-md text-on-surface font-medium">
              {step1.customerName ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Veículo / Placa
            </p>
            <p className="text-body-md text-on-surface">
              {step1.vehicleModel ?? "—"}{" "}
              <span className="text-secondary font-mono">
                · {step1.plate ?? "—"}
              </span>
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Tipo de Serviço
            </p>
            <p className="text-body-md text-on-surface">
              {step2.serviceType ? SERVICE_TYPE_LABELS[step2.serviceType] : "—"}
            </p>
          </div>
          <div>
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Prioridade
            </p>
            <p className="text-body-md text-on-surface">
              {step2.priority ? PRIORITY_LABELS[step2.priority] : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo financeiro */}
      <div className="border-outline-variant bg-surface-container space-y-2 rounded-md border p-4">
        <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
          Resumo Financeiro
        </h3>

        {parts.length > 0 && (
          <>
            <p className="text-on-surface-variant/60 font-mono text-[10px] tracking-wider uppercase">
              Peças
            </p>
            {parts.map((p, i) => (
              <div
                key={i}
                className="text-body-sm text-on-surface-variant flex justify-between"
              >
                <span>
                  {p.name} × {p.quantity}
                </span>
                <span className="font-mono">
                  {brl(p.quantity * p.unitPrice)}
                </span>
              </div>
            ))}
          </>
        )}

        {laborItems.length > 0 && (
          <>
            <p className="text-on-surface-variant/60 mt-2 font-mono text-[10px] tracking-wider uppercase">
              Mão de Obra
            </p>
            {laborItems.map((l, i) => (
              <div
                key={i}
                className="text-body-sm text-on-surface-variant flex justify-between"
              >
                <span>{l.description}</span>
                <span className="font-mono">{brl(l.price)}</span>
              </div>
            ))}
          </>
        )}

        <div className="border-outline-variant flex justify-between border-t pt-2">
          <span className="text-body-sm text-on-surface-variant">
            Subtotal Peças
          </span>
          <span className="text-label-sm text-on-surface font-mono">
            {brl(summary.subtotalParts)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-body-sm text-on-surface-variant">
            Mão de Obra
          </span>
          <span className="text-label-sm text-on-surface font-mono">
            {brl(summary.subtotalLabor)}
          </span>
        </div>
        <div className="border-outline-variant text-body-md text-on-surface flex justify-between border-t pt-2 font-bold">
          <span>Total</span>
          <span className="text-tertiary font-mono">{brl(summary.total)}</span>
        </div>
      </div>

      {/* Canvas de assinatura */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-label-sm text-on-surface-variant font-mono">
            ASSINATURA DIGITAL DO CLIENTE
          </span>
          <Button
            type="button"
            variant="ghost"
            onClick={clearSignature}
            className="text-label-sm text-on-surface-variant h-7 font-mono"
          >
            Limpar
          </Button>
        </div>
        <div className="border-outline-variant overflow-hidden rounded-md border bg-white">
          <SignatureCanvas
            ref={sigCanvasRef}
            canvasProps={{
              className: "w-full",
              style: { height: 140, display: "block" },
            }}
            onEnd={() => setValue("hasSignature", true)}
          />
        </div>
        <p className="text-on-surface-variant/60 font-mono text-[10px]">
          Assine na área acima usando o mouse ou toque na tela.
        </p>
      </div>

      {/* Termos */}
      <Controller
        name="agreedToTerms"
        control={control}
        render={({ field }) => (
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={field.value === true}
              onChange={(e) =>
                field.onChange(e.target.checked ? (true as const) : undefined)
              }
              className="accent-secondary mt-0.5 size-4"
            />
            <span className="text-body-sm text-on-surface-variant">
              Declaro que estou ciente dos serviços descritos e autorizo a
              execução conforme o orçamento apresentado. Os dados informados são
              verdadeiros.
            </span>
          </label>
        )}
      />
      {errors.agreedToTerms && (
        <p className="text-label-sm text-error font-mono">
          {errors.agreedToTerms.message}
        </p>
      )}

      <button type="submit" className="sr-only" aria-hidden="true" />
    </form>
  );
}
