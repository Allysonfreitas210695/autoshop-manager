"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signIn } from "@/_lib/auth-client";
import { type LoginInput, loginSchema } from "@/_schemas/auth";

export function useLoginForm() {
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

  return {
    register,
    handleSubmit,
    errors,
    pending,
    showPassword,
    setShowPassword,
    redirectTo,
    onSubmit,
  };
}
