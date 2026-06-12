---
phase: 2
slug: responsividade-responsiveness
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-12
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                                                                   |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Framework**          | TypeScript compiler + ESLint (no unit test framework in phase scope — CSS-only changes) |
| **Config file**        | `tsconfig.json` / `.eslintrc` (existing)                                                |
| **Quick run command**  | `npx tsc --noEmit && npm run lint`                                                      |
| **Full suite command** | `npx tsc --noEmit && npm run lint && npm run build`                                     |
| **Estimated runtime**  | ~30–60 seconds                                                                          |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit && npm run lint`
- **After every plan wave:** Run `npx tsc --noEmit && npm run lint && npm run build`
- **Before `/gsd-verify-work`:** Full suite must be green + manual breakpoint pass
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID          | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type     | Automated Command  | File Exists | Status     |
| ---------------- | ---- | ---- | ----------- | ---------- | --------------- | ------------- | ------------------ | ----------- | ---------- |
| sidebar-drawer   | 01   | 1    | RESP-01     | —          | N/A             | manual visual | —                  | N/A         | ⬜ pending |
| datatable-scroll | 01   | 1    | RESP-02     | —          | N/A             | manual visual | —                  | N/A         | ⬜ pending |
| layout-reflow    | 02   | 1    | RESP-03     | —          | N/A             | manual visual | —                  | N/A         | ⬜ pending |
| touch-targets    | 02   | 1    | RESP-04     | —          | N/A             | manual visual | —                  | N/A         | ⬜ pending |
| overflow-audit   | 02   | 2    | RESP-05     | —          | N/A             | manual visual | —                  | N/A         | ⬜ pending |
| gate-tsc         | all  | 2    | all         | —          | N/A             | automated     | `npx tsc --noEmit` | ✅          | ⬜ pending |
| gate-lint        | all  | 2    | all         | —          | N/A             | automated     | `npm run lint`     | ✅          | ⬜ pending |
| gate-build       | all  | 2    | all         | —          | N/A             | automated     | `npm run build`    | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

None — no new test files needed. All validation for this phase is manual visual + automated gate commands already available.

_Existing infrastructure covers all phase requirements._

---

## Manual-Only Verifications

| Behavior                                     | Requirement | Why Manual                    | Test Instructions                                                                  |
| -------------------------------------------- | ----------- | ----------------------------- | ---------------------------------------------------------------------------------- |
| Sidebar drawer opens/closes on mobile        | RESP-01     | CSS/interaction, no unit test | DevTools mobile (375px), click hamburger, verify drawer opens with correct width   |
| Drawer width = 85vw on 320–375px viewport    | RESP-01     | Visual only                   | DevTools inspect drawer element, verify `w-[85vw] max-w-xs` applied                |
| DataTable scrolls horizontally at 375px      | RESP-02     | Visual only                   | DevTools mobile, navigate to orders/customers/inventory, scroll table horizontally |
| Dashboard reflows to single column at 375px  | RESP-03     | Visual only                   | DevTools mobile, check metric cards stack vertically                               |
| Step indicator scrolls on wizard at 320px    | RESP-03     | Visual only                   | DevTools, open new order wizard, verify step indicator scrollable                  |
| Finance charts scroll at narrow viewports    | RESP-03     | Visual only                   | DevTools mobile, finance page, verify charts scroll or fit                         |
| Nav items ≥ 44px touch target                | RESP-04     | DevTools measure              | Inspect sidebar nav link height — must be ≥ 44px                                   |
| Icon buttons ≥ 44px touch target             | RESP-04     | DevTools measure              | Inspect icon-touch buttons — must be 44px (size-11)                                |
| No horizontal overflow on any route at 375px | RESP-05     | Visual breakpoint pass        | DevTools 375px, navigate all routes, check for horizontal scrollbar on `<body>`    |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or manual test instructions
- [ ] Sampling continuity: TypeScript + lint run after every wave
- [ ] Wave 0 covers all MISSING references (none needed)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
