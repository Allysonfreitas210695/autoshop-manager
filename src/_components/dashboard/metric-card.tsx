"use client";

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { useEffect } from "react";

import { Card } from "@/_components/ui/card";
import { cn } from "@/_lib/utils";

type MetricCardProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  hint?: string;
  hintTone?: "positive" | "neutral";
  format?: "number" | "currency";
  accent?: "secondary" | "completed" | "tertiary";
};

const accentClass = {
  secondary: "bg-secondary/10 text-secondary",
  completed: "bg-status-completed/10 text-status-completed",
  tertiary: "bg-tertiary/10 text-tertiary",
} as const;

export function MetricCard({
  label,
  value,
  icon: Icon,
  hint,
  hintTone = "neutral",
  format = "number",
  accent = "secondary",
}: MetricCardProps) {
  const count = useMotionValue(0);
  const display = useTransform(count, (latest) => {
    const rounded = Math.round(latest);
    if (format === "currency") {
      return rounded.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    }
    return rounded.toLocaleString("pt-BR");
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 1, ease: "easeOut" });
    return () => controls.stop();
  }, [count, value]);

  return (
    <Card className="hover:border-secondary flex flex-col justify-between gap-4 p-4 transition-colors">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            accentClass[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
        {hint ? (
          <span
            className={cn(
              "text-label-sm font-mono",
              hintTone === "positive"
                ? "text-status-completed"
                : "text-on-surface-variant",
            )}
          >
            {hint}
          </span>
        ) : null}
      </div>
      <div>
        <p className="text-label-md text-on-surface-variant font-mono">
          {label}
        </p>
        <motion.p className="text-headline-md text-on-surface font-bold">
          {display}
        </motion.p>
      </div>
    </Card>
  );
}
