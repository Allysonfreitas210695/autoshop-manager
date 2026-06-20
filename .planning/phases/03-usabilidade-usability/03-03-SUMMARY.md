---
plan: 03-03
status: complete
---

## O que foi feito

- Refatorou `use-new-part-form.ts` para chamar `createPartAction` via `useAction` (removendo `console.log`/`setTimeout` mock)
- Criou `src/app/(dashboard)/inventory/_components/UpdateStockDialog.tsx` — dialog de edição de estoque inline via `updateStockAction`
- Integrou `UpdateStockDialog` em `inventory-client.tsx` como ação por linha
- Botões de submit desabilitam enquanto `status === 'executing'`
- Campos inválidos mostram erros inline

## Verificação

- `npx tsc --noEmit` — zero erros
- Commitado em `fc214eb` (Jun 14 2026)
