---
phase: 8
slug: inventory
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-21
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                   |
| ---------------------- | ----------------------- |
| **Framework**          | vitest                  |
| **Config file**        | `vitest.config.ts`      |
| **Quick run command**  | `npm run test -- --run` |
| **Full suite command** | `npm run test -- --run` |
| **Estimated runtime**  | ~15 seconds             |

---

## Sampling Rate

- **After every task commit:** Run `npm run test -- --run`
- **After every plan wave:** Run `npm run test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                  | Test Type | Automated Command                         | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | -------------------------------- | --------- | ----------------------------------------- | ----------- | ---------- |
| 08-01-01 | 01   | 0    | INV-03      | —          | N/A                              | smoke     | `curl -s http://localhost:3000/inventory` | ✅          | ⬜ pending |
| 08-01-02 | 01   | 1    | INV-03      | —          | serviceId forwarded to action    | unit      | `npm run test -- --run`                   | ✅          | ⬜ pending |
| 08-01-03 | 01   | 1    | INV-03      | —          | decrement atomic in transaction  | unit      | `npm run test -- --run`                   | ✅          | ⬜ pending |
| 08-01-04 | 01   | 2    | INV-03      | —          | stock restore on delete          | unit      | `npm run test -- --run`                   | ✅          | ⬜ pending |
| 08-01-05 | 01   | 2    | INV-01      | —          | revalidatePath covers /inventory | manual    | verify page refreshes after order         | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] Smoke-test `/inventory` page against live DB — confirm parts load and low-stock alerts appear before any code changes

_Existing vitest infrastructure covers all phase requirements._

---

## Manual-Only Verifications

| Behavior                                        | Requirement | Why Manual                             | Test Instructions                                                     |
| ----------------------------------------------- | ----------- | -------------------------------------- | --------------------------------------------------------------------- |
| Stock decrements after O.S. creation            | INV-03      | Requires full wizard flow with live DB | Create O.S. with a part, check `stockQuantity` in DB before and after |
| Stock restores after O.S. deletion              | INV-03      | Requires live DB delete flow           | Delete an O.S. with parts, verify `stockQuantity` restored            |
| Low-stock alert appears for item below minStock | INV-01      | Requires seed data in live DB          | Visit `/inventory/alerts`, confirm at least one item listed           |
| Purchase order created with "confirmed" status  | INV-02      | UI flow with real enum                 | Create P.O. in UI, set status to confirmed, verify no DB error        |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
