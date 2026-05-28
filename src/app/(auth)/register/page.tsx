"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { signUp } from "@/_lib/auth-client";
import { type RegisterInput, registerSchema } from "@/_schemas/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterInput) {
    setPending(true);
    await signUp.email(
      { name: values.name, email: values.email, password: values.password },
      {
        onSuccess: () => {
          toast.success("Conta criada!");
          router.push("/");
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
            <Input id="password" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-label-sm text-destructive">
                {errors.password.message}
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
