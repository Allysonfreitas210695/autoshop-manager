"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";

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
import { useRegisterForm } from "@/_hooks/use-register-form";

export function RegisterForm() {
  const {
    register,
    handleSubmit,
    errors,
    pending,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    onSubmit,
  } = useRegisterForm();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-headline-md">Criar conta</CardTitle>
        <CardDescription>Cadastre-se para gerenciar a oficina.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GoogleButton redirectTo="/" />
        <div className="flex items-center gap-3">
          <span className="bg-outline-variant h-px flex-1" />
          <span className="text-label-sm text-on-surface-variant/60 font-mono">
            OU
          </span>
          <span className="bg-outline-variant h-px flex-1" />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-label-md font-mono">
              Nome
            </Label>
            <Input id="name" {...register("name")} />
            {errors.name ? (
              <p className="text-label-sm text-destructive">
                {errors.name.message}
              </p>
            ) : null}
          </div>
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
            <Label htmlFor="password" className="text-label-md font-mono">
              Senha
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
              Confirmar senha
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
            {pending ? "Criando..." : "Criar conta"}
          </Button>
        </form>
        <p className="text-body-md text-on-surface-variant text-center">
          Já tem conta?{" "}
          <Link href="/login" className="text-secondary hover:underline">
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
