"use client";

import * as React from "react";

import { Input } from "@/_components/ui/input";
import { formatPlate } from "@/_helpers/format";

type PlateInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
> & {
  value?: string;
  onChange?: (value: string) => void;
};

/**
 * Input de placa que aplica a máscara brasileira enquanto o usuário digita.
 * Devolve sempre a placa já formatada (ABC-1234 ou ABC1D23) via onChange.
 */
export function PlateInput({
  value,
  onChange,
  className,
  ...props
}: PlateInputProps) {
  return (
    <Input
      type="text"
      inputMode="text"
      autoCapitalize="characters"
      maxLength={8}
      placeholder="ABC-1234"
      value={value ?? ""}
      onChange={(e) => onChange?.(formatPlate(e.target.value))}
      className={className}
      {...props}
    />
  );
}
