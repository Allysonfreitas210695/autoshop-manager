"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FormEvent, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import type SignatureCanvas from "react-signature-canvas";

import { step4Schema, type Step4Values } from "@/_schemas/order-wizard";

type Params = {
  defaultValues: Partial<Step4Values>;
  onSubmit: (data: Step4Values, signatureDataUrl: string | null) => void;
};

export function useStep4Form({ defaultValues, onSubmit }: Params) {
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<Step4Values>({
    resolver: zodResolver(step4Schema),
    defaultValues: { hasSignature: false, ...defaultValues },
  });

  const clearSignature = useCallback(() => {
    sigCanvasRef.current?.clear();
    setValue("hasSignature", false);
  }, [setValue]);

  const handleFormSubmit = useCallback(
    (data: Step4Values) => {
      const signatureDataUrl = sigCanvasRef.current?.isEmpty()
        ? null
        : (sigCanvasRef.current?.toDataURL("image/png") ?? null);
      onSubmit(data, signatureDataUrl);
    },
    [onSubmit],
  );

  const onFormSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      handleSubmit(handleFormSubmit)(e);
    },
    [handleSubmit, handleFormSubmit],
  );

  const onSignatureEnd = useCallback(() => {
    setValue("hasSignature", true);
  }, [setValue]);

  return {
    sigCanvasRef,
    control,
    errors,
    clearSignature,
    onFormSubmit,
    onSignatureEnd,
  };
}
