"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { CustomerRow } from "@/_data-access/customers";
import { formatPlate } from "@/_helpers/format";
import { step1Schema, type Step1Values } from "@/_schemas/order-wizard";

type Params = {
  defaultValues: Partial<Step1Values>;
  customers: CustomerRow[];
  onNext: (data: Step1Values) => void;
};

export function useStep1Form({ defaultValues, customers, onNext }: Params) {
  const [query, setQuery] = useState(defaultValues.customerQuery ?? "");
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      customerName: "",
      plate: "",
      mileage: 0,
      vehicleModel: "",
      ...defaultValues,
    },
  });

  const filtered =
    query.length >= 2
      ? customers.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            (c.cpf ?? "").includes(query),
        )
      : [];

  function selectCustomer(customer: CustomerRow) {
    setSelectedCustomer(customer);
    setQuery(customer.name);
    setValue("customerId", customer.id);
    setValue("customerName", customer.name);
    setValue("plate", formatPlate(customer.lastPlate ?? ""));
    setValue("vehicleModel", customer.lastVehicle ?? "");
  }

  function clearCustomer() {
    setSelectedCustomer(null);
    setQuery("");
    setValue("customerId", undefined);
    setValue("customerName", "");
    setValue("plate", "");
    setValue("vehicleModel", "");
  }

  return {
    register,
    control,
    handleSubmit: handleSubmit(onNext),
    errors,
    query,
    setQuery,
    selectedCustomer,
    filtered,
    selectCustomer,
    clearCustomer,
  };
}
