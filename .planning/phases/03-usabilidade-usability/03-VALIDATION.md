---
phase: 3
slug: usabilidade-usability
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-13
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                              |
| ---------------------- | ---------------------------------- |
| **Framework**          | Vitest + @testing-library/react    |
| **Config file**        | `vite.config.ts`                   |
| **Quick run command**  | `npx tsc --noEmit && npm run lint` |
| **Full suite command** | `npx vitest run`                   |
| **Estimated runtime**  | ~30 seconds                        |

---

## Sampling Rate

- **After every task commit:** `npx tsc --noEmit && npm run lint`
- **After every wave:** `npx vitest run`
- **Phase gate:** Full suite green + manual render check of all touched routes

---

## Phase Requirements → Test Map

| Req ID  | Behavior Under Test                                   | Test Type | Notes                                                         |
| ------- | ----------------------------------------------------- | --------- | ------------------------------------------------------------- |
| USAB-01 | `loading.tsx` files exist in dashboard route segments | smoke     | `tsc --noEmit` verifies types; manual render check            |
| USAB-02 | `error.tsx` uses `unstable_retry` prop (not `reset`)  | unit      | TypeScript compilation catches wrong prop name                |
| USAB-03 | Form `errors` rendered when validation fails          | unit      | Test `useNewPartForm` with invalid data → errors populated    |
| USAB-04 | `DataTable` renders `emptyMessage` when `data=[]`     | unit      | Verify `emptyMessage` prop shown on empty array               |
| USAB-05 | `execute()` called on submit (not setTimeout)         | unit      | Spy on action mock; assert `execute` called with correct args |
| USAB-06 | Optimistic state updates before server responds       | unit      | Mock server delay; check state updates immediately            |

---

## Wave 0 Gaps (tests to add before/during execution)

- [ ] Unit test for `use-new-order-form.ts` after fix — covers USAB-05
- [ ] Unit test for `use-new-part-form.ts` after fix — covers USAB-03/05
- [ ] Unit test for `order-wizard.tsx` final submit — covers USAB-05
- [ ] Verify `src/_actions/_audit.test.ts` still passes after `createOrderAction` schema change
- [ ] Unit test: `NewCustomerDrawer` submits with `createCustomerAction` — covers USAB-05

---

## Manual Verification Checklist (Phase Gate)

- [ ] Criar O.S. via wizard → lista /orders atualiza sem reload manual
- [ ] Criar O.S. via drawer rápido → lista /orders atualiza
- [ ] Cadastrar cliente → lista /clientes atualiza
- [ ] Cadastrar peça → lista /inventory atualiza
- [ ] Mudar status da O.S. → status atualiza com toast de confirmação
- [ ] Aprovar item de orçamento → total aprovado atualiza
- [ ] Tela /orders em carregamento → skeleton visível
- [ ] Lista vazia → empty state visível (não tela em branco)
- [ ] Erro de formulário → mensagem inline visível abaixo do campo
