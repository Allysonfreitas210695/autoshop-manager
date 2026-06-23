import { ArrowDownRight, ArrowUpRight } from "lucide-react";

import { type DataTableColumn } from "@/_components/ui/data-table";
import type { Transaction } from "@/_data-access/finance";
import { formatCurrency, formatDate } from "@/_helpers/format";

type TransactionStatus = Transaction["status"];

export const statusLabel: Record<TransactionStatus, string> = {
  paid: "Pago",
  pending: "Pendente",
  overdue: "Vencido",
};

export const statusClass: Record<TransactionStatus, string> = {
  paid: "bg-status-completed/15 text-status-completed",
  pending: "bg-tertiary/15 text-tertiary",
  overdue: "bg-error/15 text-error",
};

export const transactionColumns: DataTableColumn<Transaction>[] = [
  {
    id: "date",
    header: "Data",
    className: "hidden sm:table-cell",
    cell: (row) => (
      <span className="text-label-sm text-on-surface-variant font-mono">
        {formatDate(row.date)}
      </span>
    ),
  },
  {
    id: "description",
    header: "Descrição",
    cell: (row) => (
      <div>
        <p className="text-body-sm text-on-surface font-medium">
          {row.description}
        </p>
        <p className="text-label-sm text-on-surface-variant font-mono">
          {row.category}
        </p>
      </div>
    ),
  },
  {
    id: "type",
    header: "Tipo",
    className: "hidden md:table-cell",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        {row.type === "income" ? (
          <ArrowUpRight className="text-status-completed size-3.5" />
        ) : (
          <ArrowDownRight className="text-error size-3.5" />
        )}
        <span className="text-label-sm text-on-surface-variant font-mono">
          {row.type === "income" ? "Receita" : "Despesa"}
        </span>
      </div>
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => (
      <span
        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${statusClass[row.status]}`}
      >
        {statusLabel[row.status]}
      </span>
    ),
  },
  {
    id: "amount",
    header: "Valor",
    align: "right",
    cell: (row) => (
      <span
        className={`text-label-md font-mono font-bold ${row.type === "income" ? "text-status-completed" : "text-error"}`}
      >
        {row.type === "income" ? "+" : "-"}
        {formatCurrency(row.amount)}
      </span>
    ),
  },
];
