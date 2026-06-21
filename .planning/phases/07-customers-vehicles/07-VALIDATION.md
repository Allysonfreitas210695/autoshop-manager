---
phase: 7
slug: customers-vehicles
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-21
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value               |
| ---------------------- | ------------------- |
| **Framework**          | vitest              |
| **Config file**        | vitest.config.ts    |
| **Quick run command**  | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime**  | ~5 seconds          |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                                               | Test Type            | Automated Command   | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | ------------------------------------------------------------- | -------------------- | ------------------- | ----------- | ---------- |
| 07-01-01 | 01   | 1    | CLI-03      | —          | Email duplicado retorna erro friendly, não expõe exception PG | unit (source-assert) | `npm test -- --run` | ✅          | ⬜ pending |
| 07-01-02 | 01   | 1    | CLI-01      | —          | searchCustomers inclui ILIKE em CPF e placa                   | unit (source-assert) | `npm test -- --run` | ❌ W0       | ⬜ pending |
| 07-02-01 | 02   | 2    | CLI-02      | —          | updateVehicleAction e deleteVehicleAction existem             | unit (source-assert) | `npm test -- --run` | ❌ W0       | ⬜ pending |
| 07-02-02 | 02   | 2    | CLI-02      | —          | deleteVehicleAction bloqueia se veículo tem O.S.              | unit (source-assert) | `npm test -- --run` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `src/_actions/customers.test.ts` — stubs para CLI-01, CLI-02, CLI-03 (replicar padrão de `src/_actions/orders.test.ts`)

_Framework vitest já presente — sem instalação adicional._

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                        | Test Instructions                                                                                     |
| ----------------------------------------------- | ----------- | --------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Busca com debounce 300ms funciona na UI         | CLI-01      | Comportamento temporal/interativo | Acessar /customers, digitar no campo de busca, verificar que requests só disparam após pausa          |
| Edição inline de veículo salva corretamente     | CLI-02      | UI interaction flow               | Abrir detalhe de cliente, clicar em editar veículo, alterar campos, confirmar e verificar atualização |
| Erro de email duplicado é exibido no formulário | CLI-03      | UI toast / form feedback          | Tentar criar cliente com email já existente, verificar toast com mensagem correta                     |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
