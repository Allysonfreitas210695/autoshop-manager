"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/_components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/_components/ui/card";
import { Label } from "@/_components/ui/label";
import { PasswordInput } from "@/_components/ui/password-input";
import { useResetPasswordForm } from "@/_hooks/use-reset-password-form";

export function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    errors,
    pending,
    done,
    token,
    onSubmit,
    goToLogin,
  } = useResetPasswordForm();

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <span className="bg-secondary/10 flex size-14 items-center justify-center rounded-full">
            <CheckCircle2 className="text-secondary size-7" />
          </span>
          <div>
            <p className="text-body-lg text-on-surface font-medium">
              Senha redefinida
            </p>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Sua senha foi atualizada com sucesso.
            </p>
          </div>
          <Button onClick={goToLogin} className="mt-2">
            Ir para o login
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!token) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-body-sm text-on-surface-variant">
            Link inválido ou expirado.{" "}
            <Link
              href="/forgot-password"
              className="text-secondary hover:underline"
            >
              Solicitar novo link
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-headline-md">Redefinir senha</CardTitle>
        <CardDescription>
          Escolha uma nova senha para sua conta.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-label-md font-mono">
              Nova senha
            </Label>
            <PasswordInput id="password" {...register("password")} />
            {errors.password ? (
              <p className="text-label-sm text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="confirmPassword"
              className="text-label-md font-mono"
            >
              Confirmar nova senha
            </Label>
            <PasswordInput
              id="confirmPassword"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword ? (
              <p className="text-label-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Salvando..." : "Redefinir senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
