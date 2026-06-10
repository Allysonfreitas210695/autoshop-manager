"use client";

import type { ErrorContext } from "@better-fetch/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetPassword } from "@/_lib/auth-client";
import { type ResetPasswordInput, resetPasswordSchema } from "@/_schemas/auth";

export function useResetPasswordForm() {
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

  return {
    register,
    handleSubmit,
    errors,
    pending,
    done,
    token,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    onSubmit,
    goToLogin: () => router.push("/login"),
  };
}
