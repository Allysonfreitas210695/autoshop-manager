---
phase: 01-seguran-a-security
plan: 04
status: complete
completed_at: "2026-06-12"
requirements: [SEC-05]
files_modified:
  - src/_lib/rate-limit.ts
  - src/_lib/rate-limit.test.ts
  - src/app/api/auth/[...all]/route.ts
---

# 01-04 Summary — Auth rate limiting (Upstash)

## Outcome

The four high-value auth endpoints are now rate-limited per client IP with a
generic HTTP 429 on exceed (SEC-05 / D-06 / D-07). Single integration point
(Upstash wrapper); Better Auth native `rateLimit` left disabled (Pitfall 4).

## What was built

- **`src/_lib/rate-limit.ts`** — env-guarded `Redis.fromEnv()` singleton plus
  three sliding-window limiters: `loginLimiter` (5/1m, `rl:login`),
  `passwordRecoveryLimiter` (3/1h, `rl:pwrecovery`), `registerLimiter`
  (5/1h, `rl:register`). Exports `clientIp(req)` (x-forwarded-for first hop,
  fallback `127.0.0.1`) and `limiterFor(pathname)`. When Upstash env vars are
  absent the limiters resolve to `null` and the gate is skipped — app still boots.
- **`src/_lib/rate-limit.test.ts`** — 6 unit tests (mocked `@upstash/redis` +
  `@upstash/ratelimit`): `clientIp` parsing/fallback, `limiterFor` selection
  across all verified segments + null paths, and `{ success }` result shape.
- **`src/app/api/auth/[...all]/route.ts`** — `POST` wrapped: derives pathname,
  selects limiter, calls `limiter.limit(clientIp(req))`, returns generic PT-BR
  429 on `success === false`, else delegates to `handlers.POST`. `GET` unchanged.

## Verified Better Auth 1.6.11 segments (Task 1 / A2)

Inspected `node_modules/better-auth/dist/api/routes/*.mjs`:

- sign-in: `/api/auth/sign-in/email`
- sign-up: `/api/auth/sign-up/email`
- recovery: `/api/auth/request-password-reset` (client `requestPasswordReset`);
  `/api/auth/forget-password` matched defensively as legacy alias
- reset: `/api/auth/reset-password`

Confirmed spelling is `request-password-reset` (NOT `forgot-password`) — the
matcher uses `endsWith` on these confirmed strings so it fires reliably.

## Verification

- `npx vitest run src/_lib/rate-limit.test.ts` — 6 passed
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors, 0 warnings
- `.env` populated with real `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`

## Follow-ups

- Set `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` in Vercel (A3) before
  deploy — without them, limiting is silently skipped in production.
- Manual SEC-05 check post-deploy: >5/min sign-in, >3/h recovery, >5/h register
  from one IP should return the generic 429.
