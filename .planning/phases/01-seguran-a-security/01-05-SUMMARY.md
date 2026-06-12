---
phase: 01-seguran-a-security
plan: 05
status: complete
completed_at: "2026-06-12"
requirements: [SEC-02, SEC-06]
files_modified:
  - src/_actions/_audit.test.ts
  - scripts/check-secret-boundary.mjs
---

# 01-05 Summary — Audit guards (SEC-02 / SEC-06)

## Outcome

The two already-passing audits are now enforced as non-regressable guards rather
than one-time manual checks. SEC-02 (D-09): a static test fails if any current or
future `src/_actions/*` export skips the `authActionClient` + `.schema()` shape.
SEC-06 (D-10): a runnable script fails if a server secret crosses the client
boundary. No action files or secret modules were edited — both already pass.

## What was built

- **`src/_actions/_audit.test.ts`** — reads each of the four action sources
  (`appointments`, `customers`, `inventory`, `orders`) as text, splits into
  `export const NAME = ...` blocks, and asserts every block references
  `authActionClient` and `.schema(`. A per-export failure names the offending
  action. Also pins the known total at 9 actions so a silently-dropped guard is
  caught. 5 tests, all green.
- **`scripts/check-secret-boundary.mjs`** — Node ESM guard (no new deps):
  (1) fails if any `src/` module reading `BETTER_AUTH_SECRET` /
  `GOOGLE_CLIENT_SECRET` / `UPSTASH_` / `DATABASE_URL` declares `"use client"`;
  (2) flags non-`NEXT_PUBLIC_` secrets under `"use client"`; (3) greps
  `.next/static` for the actual secret **values** (parsed from `.env`) when the
  build output is present (skips gracefully pre-build). Exits 0 PASS on the
  current tree.

## Post-build verification + false-positive fix

Exercising the bundle check against a real `npm run build` revealed that grepping
the secret **name** is a false positive: Better Auth bundles a runtime
env-accessor object whose getters are keyed by name
(`Object.freeze({ get BETTER_AUTH_SECRET(){ return read("BETTER_AUTH_SECRET") } })`),
so `BETTER_AUTH_SECRET` always appears in client JS even though no value leaks.
Fixed the guard to grep the secret **values** (from `.env`, min length 8) instead
— the only signal that proves a real leak. Confirmed no actual value
(`BETTER_AUTH_SECRET`, `DATABASE_URL`, `UPSTASH_REDIS_REST_TOKEN`) is present in
`.next/static`. A negative test (injecting the real secret value into a bundle
file) makes the guard exit 1, and removing it restores exit 0.

## Verification

- `npx vitest run src/_actions/_audit.test.ts` — 5 passed
- `npm run build` — succeeds (new `/api/csp-report` route, proxy middleware,
  `/track/[id]`, recovery routes all present)
- `node scripts/check-secret-boundary.mjs` (post-build) — PASS (exit 0); bundle
  clean, checked BETTER_AUTH_SECRET, DATABASE_URL, UPSTASH_REDIS_REST_TOKEN
- Negative test: real secret value injected into `.next/static` → guard exits 1
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors
- Full suite: `npx vitest run` — 26 passed (5 files)

## Follow-ups

- **Wire into CI/pre-deploy**: run `npm run build && node
scripts/check-secret-boundary.mjs` as a CI step or `predeploy` hook so the
  value-grep leak check runs against every real build output.
