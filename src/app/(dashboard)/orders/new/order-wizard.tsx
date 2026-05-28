"use client";

import { ChevronLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/_components/ui/button";
import type {
  LaborItem,
  PartItem,
  Step1Values,
  Step2Values,
  Step3Values,
  Step4Values,
} from "@/_schemas/order-wizard";

import { StepIndicator } from "./step-indicator";
import { Step01Client } from "./steps/step-01-client";
import { Step02Description } from "./steps/step-02-description";
import { Step03Parts } from "./steps/step-03-parts";
import { Step04Signature } from "./steps/step-04-signature";

type WizardState = {
  step1: Partial<Step1Values>;
  step2: Partial<Step2Values>;
  step3: Partial<Step3Values>;
  step4: Partial<Step4Values>;
};

const INITIAL_STATE: WizardState = {
  step1: {},
  step2: {},
  step3: { parts: [], laborItems: [] },
  step4: {},
};

export function OrderWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardState>(INITIAL_STATE);

  function handleStep1Next(data: Step1Values) {
    setWizardData((prev) => ({ ...prev, step1: data }));
    setCurrentStep(2);
  }

  function handleStep2Next(data: Step2Values) {
    setWizardData((prev) => ({ ...prev, step2: data }));
    setCurrentStep(3);
  }

  function handleStep3Next(data: Step3Values) {
    setWizardData((prev) => ({ ...prev, step3: data }));
    setCurrentStep(4);
  }

  async function handleFinalSubmit(
    data: Step4Values,
    signatureDataUrl: string | null,
  ) {
    const finalData = { ...wizardData, step4: data, signatureDataUrl };
    // Simula envio
    await new Promise((r) => setTimeout(r, 800));
    console.log("Nova O.S. criada:", finalData);
    toast.success(
      `O.S. criada com sucesso — Placa ${wizardData.step1.plate ?? "N/A"}`,
    );
    router.push("/orders");
  }

  function goBack() {
    if (currentStep === 1) {
      router.push("/orders");
    } else {
      setCurrentStep((s) => s - 1);
    }
  }

  const step3Parts = (wizardData.step3.parts as PartItem[] | undefined) ?? [];
  const step3Labor =
    (wizardData.step3.laborItems as LaborItem[] | undefined) ?? [];
  const subtotalParts = step3Parts.reduce(
    (s, p) => s + p.quantity * p.unitPrice,
    0,
  );
  const subtotalLabor = step3Labor.reduce((s, l) => s + l.price, 0);
  const financialSummary = {
    subtotalParts,
    subtotalLabor,
    total: subtotalParts + subtotalLabor,
  };

  const isFinalStep = currentStep === 4;
  const contextBar = wizardData.step1.customerName
    ? `${wizardData.step1.customerName} · ${wizardData.step1.plate ?? "Sem placa"} · ${wizardData.step1.vehicleModel ?? ""}`
    : null;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Header */}
      <div className="border-outline-variant bg-surface border-b px-4 py-4 md:px-8">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="text-secondary size-5 shrink-0" />
              <h1 className="text-label-lg text-on-surface truncate font-mono tracking-wider uppercase">
                Nova Ordem de Serviço
              </h1>
            </div>
            <span className="border-tertiary/30 bg-tertiary/5 text-tertiary shrink-0 rounded-full border px-3 py-1 font-mono text-[10px] tracking-wider uppercase">
              Aguardando
            </span>
          </div>
          <StepIndicator currentStep={currentStep} />
        </div>
      </div>

      {/* Contexto da O.S. */}
      {contextBar && (
        <div className="border-outline-variant bg-surface-container/50 border-b px-4 py-2 md:px-8">
          <p className="text-label-sm text-on-surface-variant mx-auto max-w-3xl truncate font-mono">
            {contextBar}
          </p>
        </div>
      )}

      {/* Conteúdo do step */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-3xl">
          {currentStep === 1 && (
            <Step01Client
              defaultValues={wizardData.step1}
              onNext={handleStep1Next}
            />
          )}
          {currentStep === 2 && (
            <Step02Description
              defaultValues={wizardData.step2}
              onNext={handleStep2Next}
            />
          )}
          {currentStep === 3 && (
            <Step03Parts
              defaultValues={wizardData.step3}
              onNext={handleStep3Next}
            />
          )}
          {currentStep === 4 && (
            <Step04Signature
              defaultValues={wizardData.step4}
              summary={financialSummary}
              step1={wizardData.step1}
              step2={wizardData.step2}
              step3={wizardData.step3}
              onSubmit={handleFinalSubmit}
            />
          )}
        </div>
      </div>

      {/* Footer fixo */}
      <div className="border-outline-variant bg-surface sticky bottom-0 border-t px-4 py-4 md:px-8">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Button
            variant="ghost"
            onClick={goBack}
            className="text-on-surface-variant gap-2"
          >
            <ChevronLeft className="size-4" />
            {currentStep === 1 ? "Cancelar" : "Anterior"}
          </Button>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="text-label-sm text-on-surface-variant hidden font-mono sm:flex"
              onClick={() => toast.info("Rascunho salvo.")}
            >
              Salvar Rascunho
            </Button>

            <Button
              type="submit"
              form="wizard-step-form"
              className={
                isFinalStep
                  ? "bg-tertiary text-surface hover:bg-tertiary/90"
                  : ""
              }
            >
              {isFinalStep ? "Gerar O.S." : "Próximo Passo →"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
