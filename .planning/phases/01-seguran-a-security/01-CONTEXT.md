# Phase 1: Segurança (Security) - Context

**Gathered:** 2026-06-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the existing AutoShop Manager app verifiably secure without breaking current flows: harden authentication, enforce server-side validation on every server action, fix and lock down route access control, add transport/security headers, add abuse-resistance (rate limiting), and confirm no secrets reach the client.

This phase HARDENS existing code — it does not re-architect the app and does not introduce the Drizzle data layer beyond what already exists. Mock-data-first remains the rule for screens; security work touches auth, `proxy.ts`, server actions, and config.

Covers requirements SEC-01 … SEC-06.
</domain>

<decisions>
## Implementation Decisions

### Security headers / CSP (SEC-04)

- **D-01:** Apply strict baseline headers immediately in `next.config.ts` via the `headers()` config: `Strict-Transport-Security` (HSTS, long max-age + includeSubDomains), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/mic/geolocation by default).
- **D-02:** Ship CSP in **report-only mode first** (`Content-Security-Policy-Report-Only`) to avoid breaking Next.js 16 / React Compiler inline scripts/styles. Tighten toward an enforced nonce-based CSP in a later pass based on report findings. Do NOT enforce a blocking CSP in this phase.

### Route access control (SEC-03)

- **D-03:** Fix the `proxy.ts` routing bugs:
  - Add `/forgot-password` and `/reset-password` to the auth routes (reachable while logged out; redirect to `/` when already authenticated).
  - Add `/track` (public O.S. tracking, `/track/[id]`) to the always-public prefixes so unauthenticated users can reach it.
- **D-04:** Keep access modeling simple: **authenticated vs unauthenticated** gating only. Role-based gating (admin vs customer) is **deferred** to a future phase once admin-only areas are explicitly defined — even though the `role` field and `/api/setup-admin` exist.
- **D-05:** `proxy.ts`'s `getSessionCookie` is an **optimistic** cookie-presence check (acceptable for redirect UX). Real authorization stays defense-in-depth on the server: pages/actions validate the session server-side via Better Auth (`authActionClient` already enforces this for actions). Do not rely on the proxy alone for security decisions.

### Rate limiting (SEC-05)

- **D-06:** Use **Upstash** (`@upstash/ratelimit` + `@upstash/redis`, already in deps) — confirmed by user ("upsplash"). No new rate-limit library.
- **D-07:** Default thresholds (Claude's discretion to fine-tune, these are the agreed starting point):
  - Login: 5 attempts / minute per IP (and ideally per IP+email pair).
  - Forgot-password + reset-password: 3 / hour per IP.
  - Register: 5 / hour per IP.
  - On limit exceeded: respond HTTP **429** with a **generic** message (no user-enumeration — never reveal whether an email exists).

### Password policy (SEC-01)

- **D-08:** Enforce **min length 8, requiring at least one letter and one number**, validated by Zod on **both** client and server (extend `src/_schemas/auth.ts`). Applies to register and reset-password flows. Also set Better Auth `emailAndPassword.minPasswordLength` consistently.

### Server-action validation (SEC-02)

- **D-09:** Audit all server actions in `src/_actions/` (`appointments.ts`, `customers.ts`, `inventory.ts`, `orders.ts`) to confirm every exported action uses `authActionClient` + `.schema(zod)` (the next-safe-action pattern in `src/_lib/safe-action.ts`). Current spot-check: all four files reference `authActionClient` and `orders.ts` validates with Zod — verify each individual action, not just file-level imports.

### Secret hygiene (SEC-06)

- **D-10:** Audit that server-only secrets (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, Upstash tokens, DB URL) never reach the client bundle — only `NEXT_PUBLIC_*` vars may be client-exposed. Verify env boundary; check no secret is imported into a `"use client"` module.

### Claude's Discretion

- Exact rate-limit numbers may be tuned within the agreed ranges (D-07).
- Specific CSP report-only directive list and the `report-uri`/`report-to` endpoint.
- Exact `Permissions-Policy` allowlist beyond the deny-by-default baseline.
- Whether to add a lightweight session-validity check helper for server components.
  </decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project-level locked decisions

- `.planning/PROJECT.md` — locked design system, TS rules, Base UI render-prop rule, mock-data-first.
- `.planning/intel/decisions.md` — full LOCKED decisions list (framework, file structure, auth = Better Auth).
- `.planning/intel/constraints.md` — tech stack + process gates (tsc/lint/build).
- `.planning/REQUIREMENTS.md` — SEC-01 … SEC-06 requirement text.

### Phase-relevant source files (read before modifying)

- `src/proxy.ts` — current route gating (auth routes, public prefixes, optimistic cookie check). Target of D-03/D-04/D-05.
- `src/_lib/auth.ts` — Better Auth config (emailAndPassword, Google social, `role` additional field, `nextCookies()`). Target of D-08.
- `src/_lib/auth-client.ts` — client auth wrapper.
- `src/_lib/safe-action.ts` — `authActionClient` (next-safe-action) used by all server actions. Central to D-09.
- `src/_actions/{appointments,customers,inventory,orders}.ts` — server actions to audit (D-09).
- `src/_schemas/auth.ts` — auth Zod schemas; extend for password policy (D-08).
- `next.config.ts` — currently empty; target for headers + CSP (D-01/D-02).
- `src/_db/schema/auth.ts` — user/session/account/verification schema (`role` field).

### Project instructions

- `./CLAUDE.md` / `./AGENTS.md` — "This is NOT the Next.js you know"; read `node_modules/next/dist/docs/` before writing Next.js code; `middleware.ts` is deprecated → `proxy.ts`.
  </canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `authActionClient` (`src/_lib/safe-action.ts`): next-safe-action client that enforces auth + Zod schema on server actions — reuse for any new action; the SEC-02 audit is about coverage, not building new infra.
- `@upstash/ratelimit` + `@upstash/redis`: already installed — rate-limit infra is ready to wire (SEC-05), no new dependency.
- Better Auth with Drizzle adapter + `nextCookies()`: session/cookie handling already in place; password policy is a config + schema tweak, not a rebuild.

### Established Patterns

- Server actions: `"use server"` + `authActionClient.schema(z.object({...})).action(...)` — the canonical validation pattern (see `orders.ts`).
- Zod schemas centralized in `src/_schemas/` (no `.default()` in form schemas — use react-hook-form `defaultValues`).
- `proxy.ts` replaces `middleware.ts` (Next.js 16 convention); route gating via `matcher` config + prefix checks.

### Integration Points

- `next.config.ts` `headers()` async function → security headers + CSP (greenfield, file is empty).
- `proxy.ts` `authRoutes` / `ALWAYS_PUBLIC_PREFIXES` arrays → the route-access fixes plug in here.
- Rate limiting wraps Better Auth handler (`/api/auth/[...all]`) and/or specific auth server actions — exact hook point is a planning decision.
  </code_context>

<specifics>
## Specific Ideas

- Public route that MUST stay reachable while logged out: `/track/[id]` (QR-code O.S. tracking).
- Auth recovery routes that MUST be reachable while logged out: `/forgot-password`, `/reset-password`.
- Generic error on rate-limit and on auth failures to prevent account enumeration.
- CSP report-only first — explicitly avoid breaking React Compiler / Next.js inline runtime.
  </specifics>

<deferred>
## Deferred Ideas

- **Role-based authorization (admin vs customer):** the `role` field and `/api/setup-admin` exist, but admin-only areas aren't defined yet. Defer route-level role gating to a dedicated follow-up once admin scope is specified (D-04).
- **Enforced nonce-based CSP:** tighten from report-only to blocking CSP in a later pass after collecting violation reports (D-02).
- **Reset-password email provider:** ⚠️ FLAGGED — `src/_lib/auth.ts` currently sends the reset link via `console.log` (TODO: integrate Resend/Nodemailer). Logging a sensitive reset link is a real security gap. Wiring a production email provider is an integration concern that likely warrants its own task/phase; called out here so it is not lost. If the planner judges it small, it MAY be folded into this phase — otherwise track it as a follow-up.

### Reviewed Todos (not folded)

None — no matching todos.
</deferred>

---

_Phase: 1-Segurança (Security)_
_Context gathered: 2026-06-11_
