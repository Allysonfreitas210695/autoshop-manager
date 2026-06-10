"use client";

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
import { PasswordInput } from "@/_components/ui/password-input";
import { useRegisterForm } from "@/_hooks/use-register-form";

export function RegisterForm() {
  const { register, handleSubmit, errors, pending, onSubmit } =
    useRegisterForm();

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
              Confirmar senha
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
