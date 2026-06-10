"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { requestPasswordReset } from "@/_lib/auth-client";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/_schemas/auth";

export function ForgotPasswordForm() {
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setPending(true);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    await requestPasswordReset(
      { email: values.email, redirectTo: `${appUrl}/reset-password` },
      {
        onSuccess: () => setSent(true),
        onError: ({ error }: { error: { message: string } }) => {
          toast.error(error.message);
        },
      },
    );
    setPending(false);
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="bg-secondary/10 flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="text-secondary size-7" />
          </span>
          <div>
            <p className="text-body-lg text-on-surface font-medium">
              E-mail enviado
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Verifique sua caixa de entrada e siga o link para redefinir a
              senha.
            </p>
          </div>
          <Link
            href="/login"
            className="text-secondary text-label-sm hover:underline"
          >
            Voltar ao login
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-headline-md">Esqueci a senha</CardTitle>
        <CardDescription>
          Informe seu e-mail e enviaremos um link para redefinir a senha.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-label-md font-mono">
              E-mail
            </Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email ? (
              <p className="text-label-sm text-destructive">
                {errors.email.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link de redefinição"}
          </Button>
        </form>
        <p className="text-body-md text-on-surface-variant text-center">
          Lembrou a senha?{" "}
          <Link href="/login" className="text-secondary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
