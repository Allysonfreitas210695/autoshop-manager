import { z } from "zod";

export const serviceTypeValues = [
  "preventiva",
  "corretiva",
  "garantia",
  "estetica",
] as const;

export const priorityValues = ["normal", "alta", "urgente"] as const;

export const step1Schema = z.object({
  customerQuery: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().min(2, "Informe o nome do cliente."),
  plate: z
    .string()
    .min(6, "Placa inválida.")
    .max(8)
    .transform((v) => v.toUpperCase().trim()),
  mileage: z.coerce.number().min(0, "KM inválido."),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().min(2, "Informe o modelo do veículo."),
});

export const step2Schema = z.object({
  customerReport: z.string().min(3, "Descreva o relato do cliente.").max(2000),
  initialDiagnosis: z.string().optional(),
  serviceType: z.enum(serviceTypeValues, {
    error: "Selecione o tipo de serviço.",
  }),
  priority: z.enum(priorityValues).default("normal"),
});

export const checklistItemStateValues = ["ok", "atencao", "dano"] as const;

const checklistItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  state: z.enum(checklistItemStateValues).default("ok"),
  notes: z.string().optional(),
});

export const stepChecklistSchema = z.object({
  items: z.array(checklistItemSchema),
  generalNotes: z.string().optional(),
});

export type ChecklistItemState = (typeof checklistItemStateValues)[number];
export type ChecklistItem = z.infer<typeof checklistItemSchema>;
export type StepChecklistValues = z.infer<typeof stepChecklistSchema>;

const partItemSchema = z.object({
  id: z.string(),
  serviceId: z.string().optional(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
});

const laborItemSchema = z.object({
  description: z.string().min(1),
  price: z.number().min(0),
});

export const step3Schema = z.object({
  parts: z.array(partItemSchema).default([]),
  laborItems: z.array(laborItemSchema).default([]),
});

export const step4Schema = z.object({
  hasSignature: z.boolean().default(false),
  agreedToTerms: z.literal(true, {
    error: "É necessário concordar com os termos.",
  }),
});

export type Step1Values = z.input<typeof step1Schema>;
export type Step2Values = z.input<typeof step2Schema>;
export type Step3Values = z.input<typeof step3Schema>;
export type Step4Values = z.input<typeof step4Schema>;

export type PartItem = z.infer<typeof partItemSchema>;
export type LaborItem = z.infer<typeof laborItemSchema>;

export type WizardData = {
  step1: Partial<Step1Values>;
  stepChecklist: Partial<StepChecklistValues>;
  step2: Partial<Step2Values>;
  step3: Partial<Step3Values>;
  step4: Partial<Step4Values>;
};
