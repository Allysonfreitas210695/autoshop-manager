---
plan: 03-04
status: complete
---

## O que foi feito

- Criou `src/_hooks/use-update-order-status.ts` com `useOptimisticAction` para mudança de status da O.S. com atualização imediata do chip
- Integrou o hook em `OrdersClient.tsx` — chip de status atualiza optimisticamente e confirma com toast
- Criou `BudgetClient.tsx` com botões de aprovação/reprovação de item wired a `approveOrderItemAction`
- Refatorou `budget/page.tsx` para Server Component que delega interatividade ao `BudgetClient`
- Total aprovado recalcula após aprovação via revalidação da rota

## Verificação

- `npx tsc --noEmit` — zero erros
- Commitado em `0a26f81` (Jun 14 2026)
