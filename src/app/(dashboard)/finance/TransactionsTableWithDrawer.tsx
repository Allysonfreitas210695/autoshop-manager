"use client";

import { useState } from "react";

import { DataTable, type DataTableColumn } from "@/_components/ui/data-table";
import type { Transaction } from "@/_data-access/finance";

import { EditTransactionDrawer } from "./EditTransactionDrawer";

type Props = {
  transactions: Transaction[];
  columns: DataTableColumn<Transaction>[];
};

export function TransactionsTableWithDrawer({ transactions, columns }: Props) {
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);

  return (
    <>
      <DataTable
        columns={columns}
        data={transactions}
        getRowId={(row) => row.id}
        emptyMessage="Nenhuma transação encontrada."
        onRowClick={(row) => setEditTarget(row)}
      />
      <EditTransactionDrawer
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        transaction={editTarget}
      />
    </>
  );
}
