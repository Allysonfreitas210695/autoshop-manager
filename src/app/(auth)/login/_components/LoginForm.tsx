"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { GoogleButton } from "@/_components/shared/google-button";
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
import { signIn } from "@/_lib/auth-client";
import { type LoginInput, loginSchema } from "@/_schemas/auth";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setPending(true);
    await signIn.email(
      { email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success("Bem-vindo de volta!");
          router.push(redirectTo);
          router.refresh();
        },
        onError: ({ error }) => {
          toast.error(error.message);
        },
      },
    );
    setPending(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-headline-md">Entrar</CardTitle>
        <CardDescription>Acesse o painel da oficina.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton redirectTo={redirectTo} />
        <div className="flex items-center gap-3">
          <span className="bg-outline-variant h-px flex-1" />
          <span className="text-label-sm text-on-surface-variant/60 font-mono">
            OU
          </span>
          <span className="bg-outline-variant h-px flex-1" />
        </div>
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
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-label-md font-mono">
                Senha
              </Label>
              <Link
                href="/forgot-password"
                className="text-label-sm text-secondary hover:underline"
              >
                Esqueci a senha
              </Link>
            </div>
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
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-body-md text-on-surface-variant text-center">
          Não tem conta?{" "}
          <Link href="/register" className="text-secondary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
