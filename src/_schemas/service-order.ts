import { z } from "zod";

export const serviceOrderStatusValues = [
  "pending",
  "in_progress",
  "completed",
  "delayed",
] as const;

export type OrderStatus = (typeof serviceOrderStatusValues)[number];

export const createServiceOrderSchema = z.object({
  plate: z
    .string()
    .min(6, "Placa inválida.")
    .max(8)
    .transform((value) => value.toUpperCase().trim()),
  customerName: z.string().min(2, "Informe o cliente."),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().min(2, "Informe o veículo."),
  description: z.string().min(3, "Descreva o serviço.").max(2000),
  status: z.enum(serviceOrderStatusValues).default("pending"),
  totalAmount: z.coerce.number().min(0).default(0),
  dueAt: z.string().optional(),
});

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;

export const addOrderItemSchema = z.object({
  orderId: z.uuid(),
  itemType: z.enum(["part", "labor"]),
  serviceId: z.uuid().optional(),
  description: z.string().min(2, "A descrição é obrigatória"),
  quantity: z.coerce.number().min(1, "Quantidade deve ser maior que zero"),
  unitPrice: z.coerce.number().min(0),
});

export type AddOrderItemInput = z.infer<typeof addOrderItemSchema>;
