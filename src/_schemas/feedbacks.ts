import { z } from "zod";

export const createFeedbackSchema = z.object({
  orderId: z.uuid(),
  score: z.number().int().min(0).max(10),
  comment: z.string().max(1000).optional(),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
