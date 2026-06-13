---
phase: 03-usabilidade-usability
plan: "01"
subsystem: orders
tags: [server-action, wizard, useAction, vehicle-inline, next-safe-action]
dependency_graph:
  requires: []
  provides: [createOrderAction-wired, order-wizard-real-submit]
  affects:
    [src/_actions/orders.ts, src/app/(dashboard)/orders/new/order-wizard.tsx]
tech_stack:
  added: []
  patterns:
    [useAction-hook, inline-vehicle-insert, next-safe-action-onSuccess-onError]
key_files:
  created: []
  modified:
    - src/_actions/orders.ts
    - src/app/(dashboard)/orders/new/order-wizard.tsx
decisions:
  - "vehicle criado inline em createOrderAction com make: 'Não informado' (NOT NULL no schema, sem ownerId nullable)"
  - "priority sem .default() no schema Zod — valor vem preenchido do wizard (step2.priority ?? 'normal')"
  - "_data e _signatureDataUrl mantidos como parâmetros prefixados com _ em handleFinalSubmit (assinatura exigida pelo tipo de onSubmit)"
metrics:
  duration: "~8 min"
  completed: "2026-06-13"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 03 Plan 01: Wire createOrderAction + Order Wizard Summary

**One-liner:** Substituiu stub setTimeout/console.log do wizard por chamada real a createOrderAction via useAction, com schema reescrito para plate/customerName/vehicleModel e insert de vehicle inline antes da serviceOrder.

## Tasks Completed

| Task | Name                                              | Commit  | Files                                           |
| ---- | ------------------------------------------------- | ------- | ----------------------------------------------- |
| 1    | Reescrever schema e action de createOrderAction   | edca387 | src/\_actions/orders.ts                         |
| 2    | Wire order-wizard handleFinalSubmit via useAction | decbaf0 | src/app/(dashboard)/orders/new/order-wizard.tsx |

## What Was Built

### Task 1 — createOrderAction schema + vehicle inline

- Campo `vehicleId: z.uuid()` removido; substituído por `plate`, `customerName`, `vehicleModel` (strings validadas)
- `vehicles` adicionado ao import do schema Drizzle
- Insert de `vehicle` criado inline ANTES do insert de `serviceOrders`: `plate.toUpperCase()`, `make: "Não informado"`, `model: vehicleModel`
- `vehicleId: vehicle.id` (ID retornado) usado no insert de serviceOrders
- `priority: z.string()` sem `.default()` — valor vem do wizard; campo `items` mantém `.default([])`
- `revalidatePath("/orders")` e retorno `{ id, orderNumber }` mantidos

### Task 2 — order-wizard wired via useAction

- Imports adicionados: `useAction` de `next-safe-action/hooks`, `createOrderAction` de `@/_actions/orders`
- `useAction(createOrderAction, { onSuccess, onError })` declarado no componente
- `onSuccess`: `toast.success("O.S. #${orderNumber} criada com sucesso.")` + `router.push("/orders")`
- `onError`: `toast.error(error.serverError ?? "Erro ao criar O.S.")`
- `handleFinalSubmit`: stub `setTimeout`/`console.log` removido; mapeia `step3.parts` → items `"part"`, `step3.laborItems` → items `"labor"`, chama `execute({...})`
- Botão "Gerar O.S.": `disabled={isFinalStep && status === "executing"}`, label condicional `"Gerando O.S...."` durante execução

## Deviations from Plan

### Auto-fixed Issues

Nenhum desvio — plano executado exatamente como escrito.

## Verification

- `npx tsc --noEmit`: zero erros
- `npm run lint`: zero erros (2 warnings esperados para `_data`/`_signatureDataUrl` — parâmetros prefixados com `_` por convenção)
- Critérios de aceitação Task 1: `grep -q "insert(vehicles)"` e `grep -q "vehicleModel"` e `! grep -q "vehicleId: z.uuid()"` — OK
- Critérios de aceitação Task 2: `grep -q "useAction(createOrderAction"` e `! grep -q "setTimeout"` — OK

## Known Stubs

Nenhum. A wiring é completa — `handleFinalSubmit` chama `execute()` real. O DB (Drizzle) está configurado; a persistência depende das variáveis de ambiente de produção (Vercel), fora do escopo desta fase.

## Threat Flags

Nenhum novo surface introduzido além do já existente `createOrderAction` (server action autenticada via `authActionClient`).

## Self-Check: PASSED

- [x] `src/_actions/orders.ts` modificado e commitado (edca387)
- [x] `src/app/(dashboard)/orders/new/order-wizard.tsx` modificado e commitado (decbaf0)
- [x] `npx tsc --noEmit` zero erros
- [x] `! grep -q "vehicleId: z.uuid()" src/_actions/orders.ts` — true
- [x] `grep -q "insert(vehicles)" src/_actions/orders.ts` — true
- [x] `grep -q "useAction(createOrderAction" src/app/(dashboard)/orders/new/order-wizard.tsx` — true
- [x] `! grep -q "setTimeout" src/app/(dashboard)/orders/new/order-wizard.tsx` — true
