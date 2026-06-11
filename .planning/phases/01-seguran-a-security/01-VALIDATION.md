---
phase: 1
slug: seguran-a-security
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-06-11
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Test infrastructure seeded from 01-RESEARCH.md "Validation Architecture". The Per-Task Verification Map is completed by the planner.

---

## Test Infrastructure

| Property               | Value                                                                                     |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **Framework**          | Vitest 4.1.7 (jsdom, globals: true, setup `./vitest.setup.ts`) — installed                |
| **Config file**        | `vitest.config.ts` (present — include `src/**/*.{test,spec}.{ts,tsx}`, alias `@`→`./src`) |
| **Quick run command**  | `npx vitest run` (or `npm run test:run`)                                                  |
| **Full suite command** | `npx vitest run && npx tsc --noEmit && npm run lint`                                      |
| **Estimated runtime**  | ~30 seconds                                                                               |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run` (relevant file)
- **After every plan wave:** Run `npx vitest run && npx tsc --noEmit && npm run lint`
- **Before `/gsd-verify-work`:** Full suite green + `npm run build` succeeds + `node scripts/check-secret-boundary.mjs` clean
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

> One row per task, mapping to SEC-01…06 and threat refs. All test files are NEW (Wave 0 stubs folded as the first task of each owning plan).

| Task ID | Plan | Wave | Requirement | Threat Ref      | Secure Behavior                                                                          | Test Type      | Automated Command                                                                                  | File Exists | Status     |
| ------- | ---- | ---- | ----------- | --------------- | ---------------------------------------------------------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- | ----------- | ---------- | --------------------------------- | ------ | ---------- |
| P01-T1  | 01   | 1    | SEC-01      | T-1-PW1         | passwordSchema rejects <8 / no-letter / no-number; accepts valid (RED stub)              | unit           | `npx vitest run src/_schemas/auth.test.ts`                                                         | ❌ new      | ⬜ pending |
| P01-T2  | 01   | 1    | SEC-01      | T-1-PW1/PW2     | register+reset reuse passwordSchema; login keeps min(8) only                             | unit           | `npx vitest run src/_schemas/auth.test.ts`                                                         | ❌ new      | ⬜ pending |
| P01-T3  | 01   | 1    | SEC-01      | T-1-PW3         | minPasswordLength:8 set; reset-link log guarded out of prod                              | grep+tsc       | `npx tsc --noEmit && grep -n "minPasswordLength: 8" src/_lib/auth.ts`                              | n/a         | ⬜ pending |
| P02-T1  | 02   | 1    | SEC-03      | T-1-RT1/RT2     | proxy redirects unauth→/login, auth+authroute→/, allows /track + recovery (RED stub)     | unit           | `npx vitest run src/proxy.test.ts`                                                                 | ❌ new      | ⬜ pending |
| P02-T2  | 02   | 1    | SEC-03      | T-1-RT2/RT3     | authRoutes += forgot/reset; public += /track; getSessionCookie unchanged                 | unit           | `npx vitest run src/proxy.test.ts`                                                                 | ❌ new      | ⬜ pending |
| P03-T1  | 03   | 1    | SEC-04      | T-1-HD1..HD4    | headers() returns HSTS/X-Frame/X-CTO/Referrer/Permissions/CSP-RO for /(.\*) (RED stub)   | unit           | `npx vitest run src/security/headers.test.ts`                                                      | ❌ new      | ⬜ pending |
| P03-T2  | 03   | 1    | SEC-04      | T-1-HD1..HD4    | baseline headers + report-only CSP applied; no enforcing CSP; dev unsafe-eval gated      | unit           | `npx vitest run src/security/headers.test.ts`                                                      | ❌ new      | ⬜ pending |
| P03-T3  | 03   | 1    | SEC-04      | T-1-HD5         | /api/csp-report POST returns 204, tolerant of empty body                                 | tsc+smoke      | `npx tsc --noEmit && test -f src/app/api/csp-report/route.ts`                                      | ❌ new      | ⬜ pending |
| P04-T1  | 04   | 1    | SEC-05      | T-1-RL5         | verified Better Auth /api/auth/\* segments recorded (forget vs forgot)                   | grep           | `grep -niE "forget                                                                                 | forgot      | sign-in    | sign-up" src/\_lib/rate-limit.ts` | ❌ new | ⬜ pending |
| P04-T2  | 04   | 1    | SEC-05      | T-1-RL1/RL2/RL4 | limiter singletons 5/1m,3/1h,5/1h; clientIp from x-forwarded-for; env-guarded (RED stub) | unit           | `npx vitest run src/_lib/rate-limit.test.ts`                                                       | ❌ new      | ⬜ pending |
| P04-T3  | 04   | 1    | SEC-05      | T-1-RL1/RL3/RL6 | auth POST wrapped → 429 generic on exceed; single integration point                      | unit+grep      | `npx vitest run src/_lib/rate-limit.test.ts && grep -n "429" "src/app/api/auth/[...all]/route.ts"` | ❌ new      | ⬜ pending |
| P05-T1  | 05   | 1    | SEC-02      | T-1-AU1         | every \_actions export uses authActionClient + .schema (static coverage)                 | unit           | `npx vitest run src/_actions/_audit.test.ts`                                                       | ❌ new      | ⬜ pending |
| P05-T2  | 05   | 1    | SEC-06      | T-1-AU2/AU3     | no secret in client bundle; secret modules not "use client"                              | smoke (script) | `node scripts/check-secret-boundary.mjs`                                                           | ❌ new      | ⬜ pending |

_Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky_

> Sampling continuity check: every plan's behavior-adding task has an `<automated>` verify; no 3 consecutive tasks lack automated verification. No watch-mode flags used (`vitest run`, not `vitest`).

---

## Wave 0 Requirements

- [x] Vitest installed + `vitest.config.ts` present (no install gap)
- [ ] `src/_schemas/auth.test.ts` (SEC-01 password policy) — created in Plan 01 T1 (RED first)
- [ ] `src/proxy.test.ts` (SEC-03 route gating, mocked NextRequest + getSessionCookie) — Plan 02 T1 (RED first)
- [ ] `src/security/headers.test.ts` (SEC-04 headers() assertion) — Plan 03 T1 (RED first)
- [ ] `src/_lib/rate-limit.test.ts` (SEC-05, mocked @upstash/ratelimit) — Plan 04 T2 (RED first)
- [ ] `src/_actions/_audit.test.ts` (SEC-02 coverage assertion) — Plan 05 T1
- [ ] `scripts/check-secret-boundary.mjs` (SEC-06 guard script) — Plan 05 T2
- Shared fixtures: each test mocks its own boundary (`better-auth/cookies`, `@upstash/ratelimit`, `@upstash/redis`) via `vi.mock` — no shared fixture file required.

---

## Manual-Only Verifications

| Behavior                              | Requirement | Why Manual                                | Test Instructions                                                                                                  |
| ------------------------------------- | ----------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Security headers present on responses | SEC-04      | Requires running server / curl inspection | `curl -I` against dev server; assert HSTS, X-Frame-Options=DENY, nosniff, Referrer-Policy, CSP-Report-Only present |
| No secret in client bundle            | SEC-06      | Requires production build inspection      | `npm run build` then `node scripts/check-secret-boundary.mjs` greps `.next/static` for secret names                |
| Rate-limit 429 on real auth endpoints | SEC-05      | Requires running server + Upstash creds   | Hammer the verified sign-in path >5/min from one IP → expect HTTP 429 generic; forgot/reset >3/h; register >5/h    |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (5 new test files + 1 guard script)
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
