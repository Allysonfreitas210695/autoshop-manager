"use client";

import { Edit } from "lucide-react";
import { useState } from "react";

import { EditCustomerDrawer } from "../_components/EditCustomerDrawer";

type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  address: string | null;
};

export function CustomerActions({ customer }: { customer: Customer }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setEditOpen(true)}
        className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2 rounded-md border px-4 py-2 font-mono transition-colors"
      >
        <Edit className="size-4" />
        Editar Cadastro
      </button>
      <EditCustomerDrawer
        open={editOpen}
        onClose={() => setEditOpen(false)}
        customer={customer}
      />
    </>
  );
}
