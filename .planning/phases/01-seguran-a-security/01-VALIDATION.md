---
phase: 1
slug: seguran-a-security
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Test infrastructure seeded from 01-RESEARCH.md "Validation Architecture". The Per-Task Verification Map is completed by the planner.

---

## Test Infrastructure

| Property               | Value                                                                                 |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Framework**          | Vitest (per RESEARCH.md — confirm version in package.json; Wave 0 installs if absent) |
| **Config file**        | `vitest.config.ts` (Wave 0 creates if missing)                                        |
| **Quick run command**  | `npx vitest run`                                                                      |
| **Full suite command** | `npx vitest run && npx tsc --noEmit && npm run lint`                                  |
| **Estimated runtime**  | ~30 seconds                                                                           |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run`
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit && npm run lint`
- **Before `/gsd-verify-work`:** Full suite must be green + `npm run build` succeeds
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> Filled by gsd-planner. One row per task, mapping to SEC-01…06 and threat refs.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior            | Test Type | Automated Command | File Exists | Status     |
| ------- | ---- | ---- | ----------- | ---------- | -------------------------- | --------- | ----------------- | ----------- | ---------- |
| TBD     | 01   | 0    | SEC-xx      | T-1-xx     | {expected secure behavior} | unit      | `npx vitest run`  | ❌ W0       | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

- [ ] Vitest installed + `vitest.config.ts` (if not already present)
- [ ] Test stubs for SEC-01 (password policy Zod), SEC-03 (proxy route gating), SEC-05 (rate-limit keying)
- [ ] Shared fixtures for mocking `NextRequest` / headers

_Planner refines this list against the final task breakdown._

---

## Manual-Only Verifications

| Behavior                              | Requirement | Why Manual                                | Test Instructions                                                                                                  |
| ------------------------------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Security headers present on responses | SEC-04      | Requires running server / curl inspection | `curl -I` against dev server; assert HSTS, X-Frame-Options=DENY, nosniff, Referrer-Policy, CSP-Report-Only present |
| No secret in client bundle            | SEC-06      | Requires production build inspection      | `npm run build` then grep `.next` output for secret values (per RESEARCH recipe)                                   |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
