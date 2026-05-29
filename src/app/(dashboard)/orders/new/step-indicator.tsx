"use client";

import { Check } from "lucide-react";

type Step = {
  number: number;
  label: string;
};

const STEPS: Step[] = [
  { number: 1, label: "Cliente & Veículo" },
  { number: 2, label: "Checklist" },
  { number: 3, label: "Diagnóstico" },
  { number: 4, label: "Peças & Serviços" },
  { number: 5, label: "Assinatura" },
];

type StepIndicatorProps = {
  currentStep: number;
};

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <div key={step.number} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`text-label-sm flex size-8 items-center justify-center rounded-full border-2 font-mono font-bold transition-colors ${
                    isDone
                      ? "border-secondary bg-secondary text-surface"
                      : isActive
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-outline-variant bg-surface-container text-on-surface-variant"
                  }`}
                >
                  {isDone ? (
                    <Check className="size-4" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={`hidden text-center font-mono text-[10px] tracking-wider uppercase sm:block ${
                    isActive ? "text-secondary" : "text-on-surface-variant/60"
                  }`}
                >
                  {step.label}
                </span>
              </div>

              {index < STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px flex-1 transition-colors ${
                    step.number < currentStep
                      ? "bg-secondary"
                      : "bg-outline-variant"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-surface-container mt-4 h-1 w-full overflow-hidden rounded-full">
        <div
          className="bg-secondary h-full rounded-full transition-all duration-500"
          style={{
            width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
          }}
        />
      </div>
      <p className="text-on-surface-variant/60 mt-1 text-right font-mono text-[10px]">
        Preenchimento:{" "}
        {Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100)}%
      </p>
    </div>
  );
}
