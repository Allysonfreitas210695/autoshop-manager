---
phase: 01-seguran-a-security
verified: 2026-06-12T20:22:00-03:00
status: human_needed
score: 19/19 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Confirm proxy route gating is active at runtime (not just in build artifacts)"
    expected: "Logged-out browser visit to /orders redirects to /login; logged-out visit to /forgot-password renders the page; logged-in visit to /login redirects to /"
    why_human: "The middleware-manifest.json shows an empty runtime registry in the .next/server build. The proxy matcher IS compiled into the client middleware manifest and the server chunks contain the proxy logic, but a live runtime smoke test is needed to rule out any Next.js 16 proxy-wiring edge case."
  - test: "Confirm rate limiting fires against the live Upstash Redis backend"
    expected: "More than 5 POST requests to /api/auth/sign-in/email within one minute from the same IP return HTTP 429 with the PT-BR generic message"
    why_human: "Unit tests mock @upstash/ratelimit. No integration test was run against the real Upstash sliding-window backend. The UPSTASH env vars are populated in .env, but actual rate-limit enforcement requires live network calls that cannot be verified by grep."
  - test: "Confirm security headers are present on live HTTP responses"
    expected: "curl -I against a running dev or preview server shows Strict-Transport-Security, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy: strict-origin-when-cross-origin, Permissions-Policy, Content-Security-Policy-Report-Only — and NO Content-Security-Policy header"
    why_human: "next.config.ts headers() was verified by unit test and code inspection, but the actual HTTP response headers require a running server to confirm Next.js applies them."
---

# Phase 01: Security Verification Report

**Phase Goal:** The operator's app is verifiably secure — authentication, server-side input validation, route access control, transport/header protections, and abuse resistance are all enforced, with no secrets reaching the client.
**Verified:** 2026-06-12T20:22:00-03:00
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                                  | Status   | Evidence                                                                                                                                                                                                                                  |
| --- | ---------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | A register/reset password shorter than 8 chars is rejected server-side                                                 | VERIFIED | `passwordSchema` in `src/_schemas/auth.ts` line 8: `.min(8, ...)`. Test passes: `passwordSchema.safeParse("abc12").success === false`                                                                                                     |
| 2   | A register/reset password lacking a letter OR a number is rejected                                                     | VERIFIED | `src/_schemas/auth.ts` lines 9-10: `.regex(/[A-Za-z]/)` + `.regex(/[0-9]/)`. Both `registerSchema` and `resetPasswordSchema` use `password: passwordSchema`. Tests green.                                                                 |
| 3   | Login password keeps min(8) only and does not leak complexity policy                                                   | VERIFIED | `loginSchema.password` is `z.string().min(8, ...)` with no regex (line 14). Test: `loginSchema.safeParse({email, password:"abcdefgh"}).success === true`                                                                                  |
| 4   | Better Auth server floor (minPasswordLength) matches the Zod floor (8)                                                 | VERIFIED | `src/_lib/auth.ts` line 19: `minPasswordLength: 8` inside `emailAndPassword` config block                                                                                                                                                 |
| 5   | The reset-password link is never written to logs in production                                                         | VERIFIED | `src/_lib/auth.ts` lines 23-25: `if (process.env.NODE_ENV !== "production") { console.log(...) }`                                                                                                                                         |
| 6   | An unauthenticated request to a dashboard route is redirected to /login with a redirect param                          | VERIFIED | `src/proxy.ts` line 44-47: redirect to `/login` with `searchParams.set("redirect", pathname)`. Proxy test passes. Client middleware manifest confirms matcher compiled.                                                                   |
| 7   | An authenticated request to an auth route is redirected to /                                                           | VERIFIED | `src/proxy.ts` line 50-52. `authRoutes` includes `/login`, `/register`, `/forgot-password`, `/reset-password`. Tests pass.                                                                                                                |
| 8   | An unauthenticated request to /track/[id] is allowed through                                                           | VERIFIED | `ALWAYS_PUBLIC_PREFIXES` contains `"/track"` (line 17 of `src/proxy.ts`). `isStaticAsset` short-circuits before auth check. Test passes.                                                                                                  |
| 9   | An unauthenticated request to /forgot-password and /reset-password is allowed through                                  | VERIFIED | Both routes in `authRoutes` array; the `!hasSession && !isAuthRoute` branch does not fire. Tests pass.                                                                                                                                    |
| 10  | getSessionCookie remains a presence-only optimistic check (not the authz boundary)                                     | VERIFIED | `src/proxy.ts` line 41: `const hasSession = Boolean(getSessionCookie(request))` — no verification, presence-only. Real authz in `authActionClient` via `auth.api.getSession`.                                                             |
| 11  | Every response carries HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy | VERIFIED | `next.config.ts` lines 33-51: all five headers present in `headers()` for `source: "/(.*)"`. Unit test asserts each key/value.                                                                                                            |
| 12  | Responses carry Content-Security-Policy-Report-Only (NOT an enforcing CSP)                                             | VERIFIED | `next.config.ts` line 49: key is `Content-Security-Policy-Report-Only`. Test asserts presence of report-only + absence of `Content-Security-Policy`.                                                                                      |
| 13  | The CSP allows 'unsafe-eval' in development only                                                                       | VERIFIED | `next.config.ts` line 10: `${isDev ? " 'unsafe-eval'" : ""}` — gated on `process.env.NODE_ENV === "development"`.                                                                                                                         |
| 14  | A /api/csp-report endpoint accepts report POSTs without erroring                                                       | VERIFIED | `src/app/api/csp-report/route.ts`: exports async `POST`, wraps `req.json()` in try/catch, returns `new Response(null, { status: 204 })`.                                                                                                  |
| 15  | Login auth requests are limited to 5/min per client IP                                                                 | VERIFIED | `src/_lib/rate-limit.ts` line 44: `loginLimiter = slidingLimiter(5, "1 m", "rl:login")`. `limiterFor("/api/auth/sign-in/email")` returns `loginLimiter`. POST handler wires it. Tests pass.                                               |
| 16  | Forgot + reset-password auth requests are limited to 3/hour per client IP                                              | VERIFIED | `passwordRecoveryLimiter = slidingLimiter(3, "1 h", "rl:pwrecovery")`. `limiterFor` matches `/request-password-reset`, `/forget-password`, `/reset-password`. Tests pass.                                                                 |
| 17  | Register auth requests are limited to 5/hour per client IP                                                             | VERIFIED | `registerLimiter = slidingLimiter(5, "1 h", "rl:register")`. `limiterFor("/api/auth/sign-up/email")` returns `registerLimiter`. Tests pass.                                                                                               |
| 18  | Every exported server action in src/\_actions/\* uses authActionClient and declares .schema()                          | VERIFIED | Source-level audit test reads all 4 action files (9 exports total). All pass. `grep` confirms: appointments (1), customers (2), inventory (3), orders (3) — all reference `authActionClient` and `.schema(`.                              |
| 19  | No server-only secret string appears in the client bundle                                                              | VERIFIED | `node scripts/check-secret-boundary.mjs` exits 0. Bundle check: `BETTER_AUTH_SECRET`, `DATABASE_URL`, `UPSTASH_REDIS_REST_TOKEN` values not present in `.next/static`. Source check: no `"use client"` module references a server secret. |

**Score:** 19/19 truths verified

### Required Artifacts

| Artifact                             | Expected                                                                | Status   | Details                                                                                                                     |
| ------------------------------------ | ----------------------------------------------------------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- |
| `src/_schemas/auth.ts`               | Shared passwordSchema (min 8, letter+number) reused by register + reset | VERIFIED | Exports `passwordSchema`, `registerSchema`, `resetPasswordSchema` all wired correctly. `loginSchema` intentionally simpler. |
| `src/_schemas/auth.test.ts`          | Unit tests asserting password policy accept/reject cases                | VERIFIED | 7 tests, all passing. Covers 6 required behaviors.                                                                          |
| `src/_lib/auth.ts`                   | minPasswordLength: 8 + prod-guarded reset-link logging                  | VERIFIED | Line 19: `minPasswordLength: 8`. Lines 23-25: NODE_ENV guard.                                                               |
| `src/proxy.ts`                       | Route gating with corrected authRoutes + public prefixes                | VERIFIED | `authRoutes` includes `/forgot-password` + `/reset-password`. `ALWAYS_PUBLIC_PREFIXES` includes `/track`.                   |
| `src/proxy.test.ts`                  | Unit tests for redirect logic                                           | VERIFIED | 6 tests, all passing. Covers all required redirect/pass-through cases.                                                      |
| `next.config.ts`                     | headers() returning baseline security headers + CSP report-only         | VERIFIED | 6-header rule for `/(.*)`; CSP is report-only; `unsafe-eval` dev-only.                                                      |
| `src/security/headers.test.ts`       | Unit test invoking nextConfig.headers()                                 | VERIFIED | 2 tests, all passing. Asserts all header keys/values and absence of enforcing CSP.                                          |
| `src/app/api/csp-report/route.ts`    | CSP report sink (POST → 204)                                            | VERIFIED | Exports `POST`, tolerant of invalid body, returns 204.                                                                      |
| `src/_lib/rate-limit.ts`             | Upstash sliding-window limiter singletons + IP helper + path selector   | VERIFIED | Exports `loginLimiter`, `passwordRecoveryLimiter`, `registerLimiter`, `clientIp`, `limiterFor`. Env-guarded.                |
| `src/_lib/rate-limit.test.ts`        | Unit tests with mocked @upstash/ratelimit                               | VERIFIED | 6 tests, all passing. clientIp, limiterFor, success/fail result shapes covered.                                             |
| `src/app/api/auth/[...all]/route.ts` | POST wrapped with rate-limit gate before Better Auth handler            | VERIFIED | Lines 12-26: derives pathname, calls `limiterFor`, calls `limiter.limit(clientIp(req))`, returns 429 generic or delegates.  |
| `src/_actions/_audit.test.ts`        | Static coverage assertion for authActionClient + .schema                | VERIFIED | 5 tests, all passing. Reads source files, asserts per-export compliance, pins count at 9.                                   |
| `scripts/check-secret-boundary.mjs`  | Secret-boundary guard script                                            | VERIFIED | Runs and exits 0. Checks source "use client" + bundle value grep. Negative test confirmed in SUMMARY-05.                    |

### Key Link Verification

| From                                                      | To                                    | Via                                  | Status   | Details                                                                        |
| --------------------------------------------------------- | ------------------------------------- | ------------------------------------ | -------- | ------------------------------------------------------------------------------ | ------------- | --------------------------------------------------- |
| `src/_schemas/auth.ts` registerSchema/resetPasswordSchema | passwordSchema                        | `password: passwordSchema`           | VERIFIED | Lines 21 and 35 in auth.ts                                                     |
| `src/_lib/auth.ts` emailAndPassword                       | minPasswordLength: 8                  | Better Auth config                   | VERIFIED | Line 19                                                                        |
| `src/proxy.ts` authRoutes                                 | /forgot-password and /reset-password  | authRoutes array                     | VERIFIED | Lines 7-8                                                                      |
| `src/proxy.ts` ALWAYS_PUBLIC_PREFIXES                     | /track                                | public prefix membership             | VERIFIED | Line 17                                                                        |
| `next.config.ts` headers()                                | source: /(.\*) header rule            | async headers() return array         | VERIFIED | Line 29-55; Content-Security-Policy-Report-Only present                        |
| `next.config.ts` CSP report-uri                           | /api/csp-report                       | report-uri directive                 | VERIFIED | Line 20: `"report-uri /api/csp-report"`                                        |
| `src/app/api/auth/[...all]/route.ts` POST                 | src/\_lib/rate-limit.ts limiters      | limiterFor(pathname).limit(clientIp) | VERIFIED | Lines 13-18; `.limit(` present at line 16; 429 returned on `success === false` |
| `src/_actions/_audit.test.ts`                             | src/\_actions/\*.ts exports           | import + shape assertion             | VERIFIED | All 9 exports across 4 files confirmed                                         |
| `scripts/check-secret-boundary.mjs`                       | .next/static + src use client modules | build-output + source grep           | VERIFIED | Script exits 0; bundle clean                                                   |
| `src/proxy.ts` proxy() export + config matcher            | Next.js proxy runtime                 | named proxy export + config.matcher  | VERIFIED | Client middleware manifest confirms matcher compiled: `/((?!api                | \_next/static | ...).\*)`; server chunk contains proxy route logic. |

### Data-Flow Trace (Level 4)

Not applicable to this phase. All artifacts are security controls (validators, middleware, config, route handlers, guard scripts) — none render dynamic user-visible data.

### Behavioral Spot-Checks

| Behavior                               | Command                                  | Result                                           | Status |
| -------------------------------------- | ---------------------------------------- | ------------------------------------------------ | ------ |
| All 26 security tests pass             | `npx vitest run --reporter=verbose`      | 26 passed, 0 failed, 5 files                     | PASS   |
| Secret boundary guard exits clean      | `node scripts/check-secret-boundary.mjs` | Exit 0, bundle clean, no "use client" violations | PASS   |
| passwordSchema rejects weak passwords  | vitest (individual)                      | 4 passwordSchema tests pass                      | PASS   |
| Proxy route gating covers 6 cases      | vitest (individual)                      | 6 proxy tests pass                               | PASS   |
| Rate-limit selector maps correct paths | vitest (individual)                      | 6 rate-limit tests pass                          | PASS   |
| SEC-02 audit covers all 9 actions      | vitest (individual)                      | 5 audit tests pass                               | PASS   |
| Security headers test                  | vitest (individual)                      | 2 headers tests pass                             | PASS   |

### Probe Execution

No probes declared in PLAN frontmatter. `scripts/check-secret-boundary.mjs` serves as the functional equivalent for SEC-06 and was run directly (see Behavioral Spot-Checks above).

### Requirements Coverage

| Requirement | Source Plan   | Description                                                 | Status    | Evidence                                                                                                                                                |
| ----------- | ------------- | ----------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01      | 01-01-PLAN.md | Authentication hardened: password policy enforced           | SATISFIED | `passwordSchema` min 8 + letter + number in `src/_schemas/auth.ts`; `minPasswordLength: 8` in `src/_lib/auth.ts`; reset URL prod-guarded; 7 tests green |
| SEC-02      | 01-05-PLAN.md | All server actions enforce server-side Zod validation       | SATISFIED | `_audit.test.ts` confirms all 9 exports use `authActionClient.schema()`; static guard non-regressable; 5 tests green                                    |
| SEC-03      | 01-02-PLAN.md | Route access control in proxy.ts correct                    | SATISFIED | `authRoutes` includes recovery routes; `ALWAYS_PUBLIC_PREFIXES` includes `/track`; 6 tests green; client middleware manifest confirms matcher compiled  |
| SEC-04      | 01-03-PLAN.md | Security headers applied (CSP, HSTS, X-Frame-Options, etc.) | SATISFIED | All 5 baseline headers + CSP-Report-Only in `next.config.ts`; no enforcing CSP; `unsafe-eval` dev-only; 2 tests green                                   |
| SEC-05      | 01-04-PLAN.md | Auth endpoints rate-limited against brute force             | SATISFIED | Upstash sliding-window limiters for login (5/min), recovery (3/hr), register (5/hr); generic 429; x-forwarded-for IP; env-guarded; 6 tests green        |
| SEC-06      | 01-05-PLAN.md | No secrets leak into client bundles                         | SATISFIED | `scripts/check-secret-boundary.mjs` exits 0; bundle value-grep clean; no server-secret "use client" module found                                        |

All 6 requirements from Phase 1 are covered by the plans and satisfied by code evidence.

### Anti-Patterns Found

| File               | Line | Pattern                                                                    | Severity | Impact                                                                                                                                                                  |
| ------------------ | ---- | -------------------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/_lib/auth.ts` | 21   | `TODO: integrate email provider (Resend, Nodemailer, etc.) for production` | Info     | Intentional deferred follow-up documented in PLAN-01 deferred_followups and SUMMARY-01. Email provider wiring is explicitly out of scope for this phase. Not a blocker. |

No `TBD`, `FIXME`, or `XXX` markers found in any phase-modified file. The single `TODO` is a documented deferred item with a clear scope boundary.

### Human Verification Required

#### 1. Proxy Route Gating — Live Runtime Smoke Test

**Test:** Start the development server (`npm run dev`) and test in a browser or with curl: (a) visit `/orders` while logged out — expect redirect to `/login?redirect=%2Forders`; (b) visit `/forgot-password` while logged out — expect the page to render; (c) visit `/login` while logged in — expect redirect to `/`.

**Expected:** All three redirect/pass-through behaviors match the unit test assertions in `src/proxy.test.ts`.

**Why human:** The `.next/server/middleware-manifest.json` shows `"middleware": {}` (empty) in the last production build artifact. While the client middleware manifest confirms the matcher is compiled and the server chunk contains the proxy route logic (verified by grep), a live runtime test is the only definitive confirmation that Next.js 16 is executing the named `proxy` export at request time. The empty server-side manifest could be a stale build artifact or a Next.js 16 convention difference — it warrants human confirmation.

#### 2. Rate Limiting — Live Upstash Integration Test

**Test:** With `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` set, send more than 5 POST requests to `/api/auth/sign-in/email` within one minute from the same IP address.

**Expected:** The 6th request returns HTTP 429 with body `{"error": "Muitas tentativas. Tente novamente mais tarde."}`. The response contains no email address or user enumeration signal.

**Why human:** Unit tests mock `@upstash/ratelimit` entirely. No integration test was run against the live Upstash Redis backend. The env vars are set in `.env` and the code is correct, but real sliding-window enforcement requires a live network round-trip that cannot be verified statically.

#### 3. Security Headers — Live HTTP Response Verification

**Test:** Run `curl -sI http://localhost:3000/` (or against a preview deployment) and inspect the response headers.

**Expected:** Response headers include `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and `Content-Security-Policy-Report-Only` (with no `Content-Security-Policy` header present).

**Why human:** The `next.config.ts` `headers()` function was verified by unit test (2 tests passing), but Next.js processes headers at the server layer. A curl against a running server is the only way to confirm the HTTP response carries all headers end-to-end.

### Gaps Summary

No gaps. All 19 must-haves are verified by codebase evidence. The three items above require human confirmation of live runtime behavior — they are not code gaps, but integration/smoke tests that cannot be completed programmatically.

---

_Verified: 2026-06-12T20:22:00-03:00_
_Verifier: Claude (gsd-verifier)_
