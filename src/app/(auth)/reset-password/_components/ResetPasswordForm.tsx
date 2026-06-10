"use client";

import type { ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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
import { resetPassword } from "@/_lib/auth-client";
import { type ResetPasswordInput, resetPasswordSchema } from "@/_schemas/auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  async function onSubmit(values: ResetPasswordInput) {
    if (!token) {
      toast.error("Link inválido ou expirado. Solicite um novo.");
      return;
    }
    setPending(true);
    await resetPassword(
      { newPassword: values.password, token },
      {
        onSuccess: () => setDone(true),
        onError: ({ error }: ErrorContext) => {
          toast.error(error.message);
        },
      },
    );
    setPending(false);
  }

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
          <Button onClick={() => router.push("/login")} className="mt-2">
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
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                className="pr-9"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-on-surface-variant/60 hover:text-on-surface absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                className="pr-9"
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="text-on-surface-variant/60 hover:text-on-surface absolute top-1/2 right-2.5 -translate-y-1/2 transition-colors"
                aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
              >
                {showConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
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
