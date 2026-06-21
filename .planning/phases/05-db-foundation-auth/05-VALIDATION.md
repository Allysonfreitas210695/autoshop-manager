---
phase: 05
slug: db-foundation-auth
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-21
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property               | Value                                |
| ---------------------- | ------------------------------------ |
| **Framework**          | vitest (already in project)          |
| **Config file**        | vitest.config.ts                     |
| **Quick run command**  | `npm run typecheck`                  |
| **Full suite command** | `npm run build && npm run typecheck` |
| **Estimated runtime**  | ~15 seconds                          |

---

## Sampling Rate

- **After every task commit:** Run `npm run typecheck`
- **After every plan wave:** Run `npm run build && npm run typecheck`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID  | Plan | Wave | Requirement | Threat Ref | Secure Behavior                               | Test Type | Automated Command                    | File Exists | Status     |
| -------- | ---- | ---- | ----------- | ---------- | --------------------------------------------- | --------- | ------------------------------------ | ----------- | ---------- |
| 05-01-01 | 01   | 1    | FOUND-01    | —          | pool max:3 prevents connection exhaustion     | manual    | `npm run typecheck`                  | ✅          | ⬜ pending |
| 05-01-02 | 01   | 1    | FOUND-02    | —          | migration 0003 applies confirmed enum         | manual    | `npm run db:migrate`                 | ✅          | ⬜ pending |
| 05-01-03 | 01   | 1    | FOUND-03    | —          | seed runs idempotently twice without FK error | manual    | `npm run db:seed && npm run db:seed` | ✅          | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No new test framework installation needed.

---

## Manual-Only Verifications

| Behavior                                                | Requirement | Why Manual                    | Test Instructions                                                                                                                             |
| ------------------------------------------------------- | ----------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Login/logout session persists across page navigations   | FOUND-02    | Requires browser + live DB    | 1. Run `npm run dev`; 2. Login with seeded credentials; 3. Navigate between pages; 4. Verify session persists; 5. Logout and confirm redirect |
| pg.Pool exhaustion safe under Vercel Lambda             | FOUND-01    | Requires Vercel deployment    | Deploy to preview, check Vercel logs for connection errors under concurrent requests                                                          |
| Migration runs against production DB with all 12 tables | FOUND-01    | Requires production DB access | Run `npm run db:migrate` against prod and verify 12 tables via `psql` or Supabase dashboard                                                   |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
