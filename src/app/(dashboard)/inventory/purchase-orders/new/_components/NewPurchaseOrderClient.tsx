"use client";

import { ArrowLeft, Package, Plus, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";

import { createPurchaseOrderAction } from "@/_actions/inventory";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import type { Part } from "@/_data-access/inventory";

type OrderItem = {
  partId: string;
  name: string;
  sku: string | null;
  quantity: number;
  unitPrice: number;
};

const suppliers = [
  "AutoPeças Brasil Ltda",
  "Distribuidora FreiMax",
  "MotoForce Distribuidora",
  "Peças & Cia",
];

type Props = { parts: Part[] };

export function NewPurchaseOrderClient({ parts }: Props) {
  const [supplier, setSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [search, setSearch] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);

  const criticalParts = parts.filter((p) => p.stock < p.minStock).slice(0, 8);

  const { execute, status, result } = useAction(createPurchaseOrderAction, {
    onSuccess: ({ data }) => {
      setCreatedId(data?.id ?? "ok");
    },
  });

  const filteredParts =
    search.length > 1
      ? parts
          .filter(
            (p) =>
              p.name.toLowerCase().includes(search.toLowerCase()) ||
              (p.sku ?? "").toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 5)
      : [];

  function addItem(part: Part) {
    if (items.find((i) => i.partId === part.id)) return;
    const shortage = Math.max(part.minStock - part.stock + 5, 1);
    setItems((prev) => [
      ...prev,
      {
        partId: part.id,
        name: part.name,
        sku: part.sku,
        quantity: shortage,
        unitPrice: part.unitPrice,
      },
    ]);
    setSearch("");
  }

  function removeItem(partId: string) {
    setItems((prev) => prev.filter((i) => i.partId !== partId));
  }

  function updateQty(partId: string, qty: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.partId === partId ? { ...i, quantity: Math.max(1, qty) } : i,
      ),
    );
  }

  function submitOrder() {
    execute({
      supplier,
      expectedDelivery: deliveryDate
        ? new Date(`${deliveryDate}T00:00:00`).toISOString()
        : undefined,
      notes: notes || undefined,
      items: items.map((i) => ({
        description: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        serviceId: i.partId,
      })),
    });
  }

  const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  if (createdId) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="bg-status-completed/15 flex size-16 items-center justify-center rounded-2xl">
          <ShoppingCart className="text-status-completed size-8" />
        </div>
        <div>
          <h2 className="text-headline-sm text-on-surface font-bold">
            Ordem de Compra Criada
          </h2>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Pedido registrado para {supplier || "o fornecedor"}.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/inventory/purchase-orders">
            <Button variant="outline">Ver Todas as Ordens</Button>
          </Link>
          <Link href="/inventory/alerts">
            <Button>Voltar para Alertas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/inventory/purchase-orders">
          <button className="text-on-surface-variant hover:bg-surface-container rounded-lg p-2 transition-colors">
            <ArrowLeft className="size-5" />
          </button>
        </Link>
        <div>
          <h1 className="text-headline-md text-on-surface font-bold">
            Nova Ordem de Compra
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-0.5">
            Solicite reposição de peças ao fornecedor
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form */}
        <div className="space-y-6">
          {/* Supplier */}
          <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
            <h2 className="text-title-sm text-on-surface font-semibold">
              Fornecedor
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="supplier">Fornecedor</Label>
                <select
                  id="supplier"
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="bg-surface border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
                >
                  <option value="">Selecione...</option>
                  {suppliers.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="deliveryDate">Previsão de Entrega</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Observações</Label>
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Entrega prioritária, confirmar disponibilidade..."
                className="bg-surface border-outline-variant/50 text-body-sm text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full resize-none rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
              />
            </div>
          </div>

          {/* Items */}
          <div className="bg-surface-container border-outline-variant/30 space-y-4 rounded-2xl border p-5">
            <h2 className="text-title-sm text-on-surface font-semibold">
              Itens do Pedido
            </h2>

            {/* Search */}
            <div className="relative">
              <Input
                placeholder="Buscar peça por nome ou SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {filteredParts.length > 0 && (
                <div className="bg-surface border-outline-variant/40 absolute top-full right-0 left-0 z-10 mt-1 overflow-hidden rounded-xl border shadow-lg">
                  {filteredParts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="hover:bg-surface-container flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left transition-colors"
                    >
                      <div>
                        <p className="text-body-sm text-on-surface font-medium">
                          {p.name}
                        </p>
                        <p className="text-label-xs text-on-surface-variant font-mono">
                          {p.sku ?? "—"} · {p.category}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-label-sm text-on-surface font-mono">
                          {p.unitPrice.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </p>
                        <p
                          className={`text-label-xs font-mono ${p.stock < p.minStock ? "text-error" : "text-on-surface-variant"}`}
                        >
                          Estoque: {p.stock}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Critical parts quick-add */}
            {items.length === 0 && criticalParts.length > 0 && (
              <div className="space-y-2">
                <p className="text-label-sm text-on-surface-variant">
                  Itens críticos sugeridos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {criticalParts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => addItem(p)}
                      className="bg-error/10 border-error/20 text-error text-label-xs hover:bg-error/20 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 font-mono transition-colors"
                    >
                      <Plus className="size-3" />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Items table */}
            {items.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-outline-variant/30 border-b">
                      {[
                        "Peça",
                        "SKU",
                        "Qtd",
                        "Valor Unit.",
                        "Subtotal",
                        "",
                      ].map((h) => (
                        <th
                          key={h}
                          className="text-label-xs text-on-surface-variant/60 px-3 py-2 text-left font-mono tracking-wider uppercase"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr
                        key={item.partId}
                        className="border-outline-variant/20 border-b last:border-0"
                      >
                        <td className="px-3 py-2.5">
                          <p className="text-body-sm text-on-surface font-medium">
                            {item.name}
                          </p>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-label-xs text-on-surface-variant font-mono">
                            {item.sku ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQty(item.partId, Number(e.target.value))
                            }
                            className="w-16 text-center"
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-body-sm text-on-surface font-mono">
                            {item.unitPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-body-sm text-on-surface font-mono font-medium">
                            {(item.quantity * item.unitPrice).toLocaleString(
                              "pt-BR",
                              { style: "currency", currency: "BRL" },
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <button
                            onClick={() => removeItem(item.partId)}
                            className="text-error/60 hover:text-error hover:bg-error/10 rounded p-1 transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {items.length === 0 && search.length <= 1 && (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Package className="text-on-surface-variant/30 size-8" />
                <p className="text-body-sm text-on-surface-variant">
                  Nenhum item adicionado
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar summary */}
        <div className="space-y-4">
          <div className="bg-surface-container border-outline-variant/30 sticky top-4 space-y-4 rounded-2xl border p-5">
            <h2 className="text-title-sm text-on-surface font-semibold">
              Resumo do Pedido
            </h2>
            <div className="space-y-2">
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Itens</span>
                <span className="text-on-surface font-mono">
                  {items.length}
                </span>
              </div>
              <div className="text-body-sm flex justify-between">
                <span className="text-on-surface-variant">Unidades</span>
                <span className="text-on-surface font-mono">
                  {items.reduce((s, i) => s + i.quantity, 0)}
                </span>
              </div>
              <div className="border-outline-variant/30 flex justify-between border-t pt-2">
                <span className="text-title-sm text-on-surface font-semibold">
                  Total
                </span>
                <span className="text-title-sm text-on-surface font-mono font-bold">
                  {total.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
            </div>
            <Button
              className="w-full"
              disabled={
                items.length === 0 || !supplier || status === "executing"
              }
              onClick={submitOrder}
            >
              <ShoppingCart className="mr-2 size-4" />
              {status === "executing"
                ? "Enviando..."
                : "Enviar Ordem de Compra"}
            </Button>
            {result.serverError && (
              <p className="text-label-xs text-error text-center">
                Erro ao criar a ordem. Tente novamente.
              </p>
            )}
            {(!supplier || items.length === 0) && (
              <p className="text-label-xs text-on-surface-variant/60 text-center">
                {!supplier
                  ? "Selecione um fornecedor"
                  : "Adicione ao menos um item"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
