"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { requestPasswordReset } from "@/_lib/auth-client";
import {
  type ForgotPasswordInput,
  forgotPasswordSchema,
} from "@/_schemas/auth";

export function useForgotPasswordForm() {
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

  return { register, handleSubmit, errors, pending, sent, onSubmit };
}
