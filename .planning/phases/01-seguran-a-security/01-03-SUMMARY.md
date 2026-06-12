---
phase: 01-seguran-a-security
plan: 03
status: complete
completed_at: "2026-06-12"
requirements: [SEC-04]
files_modified:
  - next.config.ts
  - src/security/headers.test.ts
  - src/app/api/csp-report/route.ts
---

# 01-03 Summary — Security headers + report-only CSP (SEC-04 / D-01 + D-02)

## Outcome

Every response now carries baseline security headers (HSTS, X-Frame-Options DENY,
X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy) plus a
`Content-Security-Policy-Report-Only` header — never an enforcing CSP this phase
(D-02). The report-only CSP gates `'unsafe-eval'` to development only so the
React Compiler dev runtime is not broken, and points `report-uri` at a new
in-app `/api/csp-report` sink.

## What was built

- **`next.config.ts`** — `async headers()` returns one `/(.*)` rule with:
  `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and the
  collapsed `Content-Security-Policy-Report-Only` directive string
  (`'unsafe-eval'` only under `NODE_ENV === "development"`; `report-uri
/api/csp-report`). No enforcing CSP emitted.
- **`src/security/headers.test.ts`** — 2 tests invoking `nextConfig.headers()`:
  baseline header key/values, and report-only presence + absence of enforcing
  `Content-Security-Policy` + `report-uri` wiring.
- **`src/app/api/csp-report/route.ts`** — async `POST` sink: tolerant JSON parse
  (no throw on empty/invalid body), logs only outside production, returns 204.

## Verification

- `npx vitest run src/security/headers.test.ts` — 2 passed
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors
- Manual (SEC-04): `curl -I` a running server to confirm all six headers ship.

## Follow-ups

- **Enforced nonce-based CSP** (D-02): currently report-only to collect
  violations without breaking the React Compiler inline runtime. Promoting to an
  enforcing nonce CSP is a deferred follow-up once reports are clean.
