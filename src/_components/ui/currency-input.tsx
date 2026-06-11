"use client";

import { NumericFormat, type NumericFormatProps } from "react-number-format";

import { cn } from "@/_lib/utils";

type CurrencyInputProps = Omit<
  NumericFormatProps,
  "value" | "onValueChange" | "customInput"
> & {
  value?: number | null;
  onValueChange?: (value: number) => void;
};

/**
 * Input de moeda padrão do projeto: sempre formata como R$ 0,00 (pt-BR).
 * Devolve o valor numérico via onValueChange, pronto para react-hook-form.
 */
export function CurrencyInput({
  value,
  onValueChange,
  className,
  ...props
}: CurrencyInputProps) {
  return (
    <NumericFormat
      value={value ?? ""}
      thousandSeparator="."
      decimalSeparator=","
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      prefix="R$ "
      placeholder="R$ 0,00"
      inputMode="decimal"
      onValueChange={(values) => onValueChange?.(values.floatValue ?? 0)}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}
