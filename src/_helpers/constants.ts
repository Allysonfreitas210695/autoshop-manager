export const inventoryCategories = [
  "Todos",
  "Filtros",
  "Freios",
  "Motor",
  "Suspensão",
  "Ignição",
  "Lubrificantes",
  "Elétrica",
] as const;

export type InventoryCategory = (typeof inventoryCategories)[number];
