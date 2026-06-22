---
phase: 10
slug: finance-analytics
status: draft
nyquist_compliant: false
nyquist_justification: "Esta fase usa npx tsc --noEmit como verificação automatizada primária em todas as tasks — intencionalmente sem arquivos vitest. Stubs Wave 0 (finance-actions.test.ts, analytics-kpis.test.ts) não foram criados porque a cobertura de comportamento é garantida por: (1) TypeScript strict nos contratos de tipo, (2) grep assertions nos critérios done de cada task, (3) FIN-03 verificado via inspeção de código (ausência de N+1 confirmada em analytics.ts). Ausência de test files é intencional nesta fase — não um gap."
wave_0_complete: false
wave_0_note: "Wave 0 não aplicável — fase não usa vitest. Ver nyquist_justification."
created: 2026-06-22
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                     |
| ---------------------- | --------------------------------------------------------- |
| **Framework**          | TypeScript compiler (tsc --noEmit)                        |
| **Config file**        | tsconfig.json                                             |
| **Quick run command**  | `npx tsc --noEmit 2>&1 \| grep -E "error TS" \| head -20` |
| **Full suite command** | `npx tsc --noEmit && npm run build`                       |
| **Estimated runtime**  | ~10 seconds (tsc), ~30 seconds (build)                    |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit`
- **After every plan wave:** Run `npx tsc --noEmit && npm run build`
- **Before `/gsd-verify-work`:** Full build must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement    | Threat Ref | Secure Behavior                                 | Test Type  | Automated Command                                                               | File Exists | Status     |
| -------- | ---- | ---- | -------------- | ---------- | ----------------------------------------------- | ---------- | ------------------------------------------------------------------------------- | ----------- | ---------- |
| 10-01-01 | 01   | 1    | FIN-01         | —          | N/A                                             | tsc        | `npx tsc --noEmit 2>&1 \| grep finance`                                         | ✅ tsc      | ⬜ pending |
| 10-01-02 | 01   | 1    | FIN-02, FIN-03 | —          | null guard prevents sentinel values; N+1 absent | tsc + grep | `npx tsc --noEmit && grep -n "for\|map\|forEach" src/_data-access/analytics.ts` | ✅ tsc      | ⬜ pending |
| 10-01-03 | 01   | 1    | FIN-04         | —          | N/A                                             | tsc + grep | `npx tsc --noEmit 2>&1 \| grep analytics`                                       | ✅ tsc      | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

> Not applicable. This phase uses TypeScript compiler checks as automated verification.
> Existing infrastructure (tsc strict mode) covers all phase type contracts.
> FIN-03 (N+1 audit) is verified via grep inspection per task done criteria.

---

## Manual-Only Verifications

| Behavior                        | Requirement | Why Manual                       | Test Instructions                                                                                                               |
| ------------------------------- | ----------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard carrega sem N+1 loops | FIN-03      | Requer inspeção de DB query logs | grep -n "for\|forEach\|\.map" src/\_data-access/analytics.ts — confirmar que nenhuma ocorrência tem db.select/db.query aninhado |
| "R$ NaN" não aparece na UI      | FIN-04      | Requer render visual             | Abrir `/finance` e `/analytics` e inspecionar todos os valores monetários                                                       |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify (tsc --noEmit)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [ ] `nyquist_compliant: true` — pendente até execução confirmar tsc limpo
- [x] nyquist_compliant: false com justificativa explícita documentada acima

**Approval:** pending
