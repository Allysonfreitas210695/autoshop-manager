"use client";

import { useState } from "react";

import { FinanceActions } from "./finance-actions";
import { NewTransactionDrawer } from "./NewTransactionDrawer";

export function FinanceActionsWithDrawer() {
  const [newDrawerOpen, setNewDrawerOpen] = useState(false);

  return (
    <>
      <FinanceActions onNewTransaction={() => setNewDrawerOpen(true)} />
      <NewTransactionDrawer
        open={newDrawerOpen}
        onClose={() => setNewDrawerOpen(false)}
      />
    </>
  );
}
