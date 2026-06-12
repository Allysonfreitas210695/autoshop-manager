---
phase: 01-seguran-a-security
plan: 02
status: complete
completed_at: "2026-06-12"
requirements: [SEC-03]
files_modified:
  - src/proxy.ts
  - src/proxy.test.ts
---

# 01-02 Summary — Proxy route gating (SEC-03 / D-03)

## Outcome

Recovery routes (`/forgot-password`, `/reset-password`) are now treated as auth
routes — reachable while logged out, redirecting to `/` when already
authenticated — and the public QR tracking route `/track/[id]` is whitelisted as
an always-public prefix. The `getSessionCookie` presence-only optimistic check is
unchanged: the proxy remains UX-only and is NOT the authorization boundary (D-05).

## What was built

- **`src/proxy.ts`** — `authRoutes` extended to
  `["/login", "/register", "/forgot-password", "/reset-password"]`;
  `ALWAYS_PUBLIC_PREFIXES` gains `"/track"`. `getSessionCookie`, `matcher`, and
  static-asset handling untouched. No role-based gating (D-04 deferred).
- **`src/proxy.test.ts`** — 6 unit tests mocking `better-auth/cookies`: unauth
  dashboard → /login (with `redirect` param), authed /login → /, authed
  /forgot-password → /, unauth /forgot-password + /reset-password + /track/[id]
  pass through.

## Verification

- `npx vitest run src/proxy.test.ts` — 6 passed
- `npx tsc --noEmit` — 0 errors
- `npm run lint` — 0 errors

## Notes

- Per D-05, the proxy stays optimistic UX-only; the real authz boundary is
  server-side (`auth.api.getSession` / `authActionClient`), verified in Plan 05.
