import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/_lib/utils";

const statusChipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-label-sm font-bold uppercase tracking-wider text-white",
  {
    variants: {
      status: {
        pending: "bg-status-pending",
        in_progress: "bg-status-progress",
        completed: "bg-status-completed",
        delayed: "bg-status-delayed",
      },
    },
    defaultVariants: {
      status: "pending",
    },
  },
);

export const STATUS_LABELS: Record<
  NonNullable<VariantProps<typeof statusChipVariants>["status"]>,
  string
> = {
  pending: "Pendente",
  in_progress: "Em Progresso",
  completed: "Concluído",
  delayed: "Atrasado",
};

type StatusChipProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof statusChipVariants> & {
    label?: string;
  };

export function StatusChip({
  status,
  label,
  className,
  ...props
}: StatusChipProps) {
  return (
    <span className={cn(statusChipVariants({ status }), className)} {...props}>
      {label ?? STATUS_LABELS[status ?? "pending"]}
    </span>
  );
}
