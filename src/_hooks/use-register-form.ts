"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { signUp } from "@/_lib/auth-client";
import { type RegisterInput, registerSchema } from "@/_schemas/auth";

export function useRegisterForm() {
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

  return {
    register,
    handleSubmit,
    errors,
    pending,
    onSubmit,
  };
}
