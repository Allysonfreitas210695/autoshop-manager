---
phase: 6
slug: orders-transactions
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-21
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                      |
| ---------------------- | ------------------------------------------ |
| **Framework**          | vitest                                     |
| **Config file**        | vitest.config.ts (or package.json scripts) |
| **Quick run command**  | `npm run test -- --run`                    |
| **Full suite command** | `npm run test -- --run`                    |
| **Estimated runtime**  | ~10 seconds                                |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                           | Test Type   | Automated Command       | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | ----------------------------------------- | ----------- | ----------------------- | ----------- | ---------- |
| 06-01-01 | 01   | 1    | OS-01       | —          | Authenticated action only creates O.S.    | integration | `npm run test -- --run` | ❌ W0       | ⬜ pending |
| 06-01-02 | 01   | 1    | OS-01       | —          | O.S. persists after page refresh          | manual      | —                       | N/A         | ⬜ pending |
| 06-02-01 | 02   | 1    | OS-02       | —          | Status change revalidates paths           | integration | `npm run test -- --run` | ❌ W0       | ⬜ pending |
| 06-02-02 | 02   | 1    | OS-03       | —          | Closing O.S. inserts transaction row      | integration | `npm run test -- --run` | ❌ W0       | ⬜ pending |
| 06-03-01 | 03   | 2    | OS-03       | —          | approveOrderItem recalculates totalAmount | unit        | `npm run test -- --run` | ❌ W0       | ⬜ pending |
| 06-03-02 | 03   | 2    | OS-03       | —          | totalAmount = sum of approved items only  | unit        | `npm run test -- --run` | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] `src/_actions/__tests__/orders.test.ts` — stubs for OS-01, OS-02, OS-03
- [ ] Shared mock DB fixture if needed

_If none: "Existing infrastructure covers all phase requirements."_

---

## Manual-Only Verifications

| Behavior                                       | Requirement | Why Manual                    | Test Instructions                                   |
| ---------------------------------------------- | ----------- | ----------------------------- | --------------------------------------------------- |
| O.S. wizard persists after page refresh        | OS-01       | Requires real browser + DB    | Create O.S., refresh, confirm row exists in /orders |
| Finance page shows new transaction after close | OS-03       | Requires real DB + navigation | Close O.S., navigate to /finance, confirm row       |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
