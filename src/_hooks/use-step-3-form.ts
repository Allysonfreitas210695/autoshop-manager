"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import type { Part } from "@/_data-access/inventory";
import { step3Schema, type Step3Values } from "@/_schemas/order-wizard";

type Params = {
  defaultValues: Partial<Step3Values>;
  parts: Part[];
  onNext: (data: Step3Values) => void;
};

export function useStep3Form({ defaultValues, parts, onNext }: Params) {
  const [partsQuery, setPartsQuery] = useState("");
  const [showLaborForm, setShowLaborForm] = useState(false);
  const [laborDescription, setLaborDescription] = useState("");
  const [laborPrice, setLaborPrice] = useState("");

  const { register, handleSubmit, control } = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: { parts: [], laborItems: [], ...defaultValues },
  });

  const {
    fields: partFields,
    append: appendPart,
    remove: removePart,
    update: updatePart,
  } = useFieldArray({ control, name: "parts" });

  const {
    fields: laborFields,
    append: appendLabor,
    remove: removeLabor,
  } = useFieldArray({ control, name: "laborItems" });

  const partsValues = useWatch({ control, name: "parts" }) ?? [];
  const laborValues = useWatch({ control, name: "laborItems" }) ?? [];

  const filteredParts =
    partsQuery.length >= 2
      ? parts.filter(
          (p) =>
            p.name.toLowerCase().includes(partsQuery.toLowerCase()) ||
            (p.sku ?? "").toLowerCase().includes(partsQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(partsQuery.toLowerCase()),
        )
      : [];

  return {
    register,
    handleSubmit: handleSubmit(onNext),
    control,
    partFields,
    appendPart,
    removePart,
    updatePart,
    laborFields,
    appendLabor,
    removeLabor,
    partsValues,
    laborValues,
    partsQuery,
    setPartsQuery,
    showLaborForm,
    setShowLaborForm,
    laborDescription,
    setLaborDescription,
    laborPrice,
    setLaborPrice,
    filteredParts,
  };
}
