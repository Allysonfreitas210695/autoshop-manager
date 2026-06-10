"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { step2Schema, type Step2Values } from "@/_schemas/order-wizard";

type Params = {
  defaultValues: Partial<Step2Values>;
  onNext: (data: Step2Values) => void;
};

export function useStep2Form({ defaultValues, onNext }: Params) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      customerReport: "",
      initialDiagnosis: "",
      priority: "normal",
      ...defaultValues,
    },
  });

  return {
    register,
    handleSubmit: handleSubmit(onNext),
    control,
    errors,
  };
}
