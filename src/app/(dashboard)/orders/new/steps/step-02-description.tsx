"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Brush,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Label } from "@/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import {
  priorityValues,
  serviceTypeValues,
  step2Schema,
  type Step2Values,
} from "@/_schemas/order-wizard";

type Step2Props = {
  defaultValues: Partial<Step2Values>;
  onNext: (data: Step2Values) => void;
};

const SERVICE_TYPES: {
  value: (typeof serviceTypeValues)[number];
  label: string;
  icon: React.ReactNode;
  description: string;
}[] = [
  {
    value: "preventiva",
    label: "Preventiva",
    icon: <RotateCcw className="size-5" />,
    description: "Revisão e manutenção programada",
  },
  {
    value: "corretiva",
    label: "Corretiva",
    icon: <Wrench className="size-5" />,
    description: "Reparo de falha ou defeito",
  },
  {
    value: "garantia",
    label: "Garantia",
    icon: <ShieldCheck className="size-5" />,
    description: "Atendimento em garantia",
  },
  {
    value: "estetica",
    label: "Estética",
    icon: <Brush className="size-5" />,
    description: "Polimento, higienização etc.",
  },
];

const PRIORITY_LABELS: Record<
  (typeof priorityValues)[number],
  { label: string; color: string }
> = {
  normal: { label: "Normal", color: "text-on-surface-variant" },
  alta: { label: "Alta", color: "text-tertiary" },
  urgente: { label: "Urgente", color: "text-error" },
};

export function Step02Description({ defaultValues, onNext }: Step2Props) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      customerReport: "",
      initialDiagnosis: "",
      priority: "normal",
      ...defaultValues,
    },
  });

  return (
    <form
      id="wizard-step-form"
      onSubmit={handleSubmit(onNext)}
      className="space-y-6"
    >
      {/* Relato do Cliente */}
      <div className="space-y-1.5">
        <Label
          htmlFor="customerReport"
          className="text-label-sm text-on-surface-variant font-mono"
        >
          RELATO DO CLIENTE *
        </Label>
        <textarea
          id="customerReport"
          rows={3}
          placeholder="O que o cliente descreveu sobre o problema..."
          aria-invalid={!!errors.customerReport}
          className="border-outline-variant bg-surface-container text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary aria-invalid:border-error w-full resize-none rounded-md border px-3 py-2 focus:ring-1 focus:outline-none"
          {...register("customerReport")}
        />
        {errors.customerReport && (
          <p className="text-label-sm text-error font-mono">
            {errors.customerReport.message}
          </p>
        )}
      </div>

      {/* Diagnóstico Inicial */}
      <div className="space-y-1.5">
        <Label
          htmlFor="initialDiagnosis"
          className="text-label-sm text-on-surface-variant font-mono"
        >
          DIAGNÓSTICO INICIAL
          <span className="text-on-surface-variant/40 ml-2">
            (Codes OBD-II, observações técnicas)
          </span>
        </Label>
        <textarea
          id="initialDiagnosis"
          rows={3}
          placeholder="Ex: P0301 — Falha de ignição cilindro 1. Verificar velas e bobina..."
          className="border-outline-variant bg-surface-container text-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full resize-none rounded-md border px-3 py-2 font-mono focus:ring-1 focus:outline-none"
          {...register("initialDiagnosis")}
        />
      </div>

      {/* Tipo de Serviço */}
      <div className="space-y-2">
        <Label className="text-label-sm text-on-surface-variant font-mono">
          TIPO DE SERVIÇO *
        </Label>
        <Controller
          name="serviceType"
          control={control}
          render={({ field }) => (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {SERVICE_TYPES.map((type) => {
                const isSelected = field.value === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => field.onChange(type.value)}
                    className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
                      isSelected
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-outline-variant bg-surface-container text-on-surface-variant hover:border-secondary/40 hover:text-on-surface"
                    }`}
                  >
                    {type.icon}
                    <span className="text-label-sm font-mono font-bold">
                      {type.label}
                    </span>
                    <span className="text-[10px] leading-tight opacity-70">
                      {type.description}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        />
        {errors.serviceType && (
          <p className="text-label-sm text-error font-mono">
            {errors.serviceType.message}
          </p>
        )}
      </div>

      {/* Prioridade */}
      <div className="space-y-1.5">
        <Label
          htmlFor="priority"
          className="text-label-sm text-on-surface-variant font-mono"
        >
          PRIORIDADE
        </Label>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value ?? "normal"}
              onValueChange={field.onChange}
            >
              <SelectTrigger id="priority" aria-label="Prioridade da ordem">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityValues.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className={PRIORITY_LABELS[p].color}>
                      {p === "urgente" && (
                        <AlertTriangle className="mr-1.5 inline size-3.5" />
                      )}
                      {PRIORITY_LABELS[p].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <button type="submit" className="sr-only" aria-hidden="true" />
    </form>
  );
}
