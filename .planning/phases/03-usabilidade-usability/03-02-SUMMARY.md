---
plan: 03-02
status: complete
---

## O que foi feito

- Criou `src/app/(dashboard)/customers/_components/NewCustomerDrawer.tsx` — drawer de criação de cliente com `useAction(createCustomerAction)`, validação inline (react-hook-form) e toast de sucesso
- Corrigiu `customers-client.tsx`: substituiu navegação errada para `/orders/new` por estado `drawerOpen` que abre o `NewCustomerDrawer`
- Após sucesso o drawer fecha e a lista `/customers` é revalidada via `revalidatePath`

## Verificação

- `npx tsc --noEmit` — zero erros
- Commitado em `e0e1d22` + `f958864` (Jun 14 2026)
