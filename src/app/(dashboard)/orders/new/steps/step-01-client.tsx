"use client";

import { Search, UserPlus, X } from "lucide-react";

import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import type { CustomerRow } from "@/_data-access/customers";
import { useStep1Form } from "@/_hooks/use-step-1-form";
import type { Step1Values } from "@/_schemas/order-wizard";

type Step1Props = {
  defaultValues: Partial<Step1Values>;
  customers: CustomerRow[];
  onNext: (data: Step1Values) => void;
};

export function Step01Client({ defaultValues, customers, onNext }: Step1Props) {
  const {
    register,
    handleSubmit,
    errors,
    query,
    setQuery,
    selectedCustomer,
    filtered,
    selectCustomer,
    clearCustomer,
  } = useStep1Form({ defaultValues, customers, onNext });

  return (
    <form id="wizard-step-form" onSubmit={handleSubmit} className="space-y-6">
      {/* Busca de cliente */}
      <div className="space-y-1.5">
        <Label className="text-label-sm text-on-surface-variant font-mono">
          BUSCAR CLIENTE (CPF ou Nome)
        </Label>
        <div className="relative">
          <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (selectedCustomer) clearCustomer();
            }}
            placeholder="Digite o nome ou CPF..."
            className="border-outline-variant bg-surface-container text-body-md text-on-surface placeholder:text-on-surface-variant/40 focus:ring-secondary w-full rounded-md border py-2 pr-4 pl-9 focus:ring-1 focus:outline-none"
          />
          {selectedCustomer && (
            <button
              type="button"
              onClick={clearCustomer}
              className="text-on-surface-variant hover:text-on-surface absolute top-1/2 right-3 -translate-y-1/2"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Dropdown de resultados */}
        {!selectedCustomer && filtered.length > 0 && (
          <div className="border-outline-variant bg-surface-container rounded-md border shadow-lg">
            {filtered.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => selectCustomer(customer)}
                className="hover:bg-surface-container-highest flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
              >
                <div className="bg-secondary/10 text-label-md text-secondary flex size-9 items-center justify-center rounded-full font-mono font-bold">
                  {customer.name[0]}
                </div>
                <div>
                  <p className="text-body-md text-on-surface font-medium">
                    {customer.name}
                  </p>
                  <p className="text-label-sm text-on-surface-variant font-mono">
                    {customer.cpf ?? "CPF não cadastrado"}
                    {customer.lastPlate ? ` · ${customer.lastPlate}` : ""}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Nenhum cliente selecionado */}
        {!selectedCustomer && query.length === 0 && (
          <div className="border-outline-variant bg-surface-container/50 flex items-center justify-between rounded-md border border-dashed px-4 py-3">
            <p className="text-body-sm text-on-surface-variant">
              Nenhum cliente selecionado
            </p>
            <button
              type="button"
              className="text-label-sm text-secondary flex items-center gap-1.5 font-mono hover:underline"
            >
              <UserPlus className="size-4" />
              Novo Cadastro Rápido
            </button>
          </div>
        )}

        {selectedCustomer && (
          <div className="border-secondary/30 bg-secondary/5 flex items-center gap-3 rounded-md border px-4 py-3">
            <div className="bg-secondary/20 text-label-md text-secondary flex size-9 items-center justify-center rounded-full font-mono font-bold">
              {selectedCustomer.name[0]}
            </div>
            <div>
              <p className="text-body-md text-on-surface font-medium">
                {selectedCustomer.name}
              </p>
              <p className="text-label-sm text-on-surface-variant font-mono">
                {selectedCustomer.cpf ?? selectedCustomer.email}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Dados do veículo */}
      <div className="border-outline-variant bg-surface-container/50 space-y-4 rounded-md border p-4">
        <h3 className="text-label-sm text-on-surface-variant font-mono tracking-wider uppercase">
          Dados do Veículo
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="plate"
              className="text-label-sm text-on-surface-variant font-mono"
            >
              PLACA *
            </Label>
            <Input
              id="plate"
              placeholder="ABC-1234"
              aria-invalid={!!errors.plate}
              {...register("plate")}
            />
            {errors.plate && (
              <p className="text-label-sm text-error font-mono">
                {errors.plate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="mileage"
              className="text-label-sm text-on-surface-variant font-mono"
            >
              KM ATUAL *
            </Label>
            <Input
              id="mileage"
              type="number"
              min="0"
              placeholder="Ex: 45000"
              aria-invalid={!!errors.mileage}
              {...register("mileage")}
            />
            {errors.mileage && (
              <p className="text-label-sm text-error font-mono">
                {errors.mileage.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="vehicleModel"
            className="text-label-sm text-on-surface-variant font-mono"
          >
            MODELO / VERSÃO *
          </Label>
          <Input
            id="vehicleModel"
            placeholder="Ex: Toyota Corolla XEi 2022"
            aria-invalid={!!errors.vehicleModel}
            {...register("vehicleModel")}
          />
          {errors.vehicleModel && (
            <p className="text-label-sm text-error font-mono">
              {errors.vehicleModel.message}
            </p>
          )}
        </div>

        {/* Campo hidden para customerName e customerId */}
        <input type="hidden" {...register("customerName")} />
        <input type="hidden" {...register("customerId")} />
        {errors.customerName && (
          <p className="text-label-sm text-error font-mono">
            {errors.customerName.message}
          </p>
        )}
      </div>

      {/* Botão de submit oculto — acionado pelo footer do wizard */}
      <button type="submit" className="sr-only" aria-hidden="true" />
    </form>
  );
}
