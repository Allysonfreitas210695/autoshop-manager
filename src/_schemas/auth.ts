import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("E-mail inválido."),
  password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, "Informe seu nome."),
    email: z.email("E-mail inválido."),
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("E-mail inválido."),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "A senha deve ter ao menos 8 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
