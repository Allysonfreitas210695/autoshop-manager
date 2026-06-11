# Phase 1: Segurança (Security) - Research

**Researched:** 2026-06-11
**Domain:** Web app hardening — auth, route gating, security headers/CSP, rate limiting, server-side validation, secret hygiene (Next.js 16 + Better Auth + Upstash)
**Confidence:** HIGH (all framework APIs verified against the locally-installed `node_modules/next/dist/docs/` and installed type/impl files; Better Auth + Upstash APIs verified against official docs)

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01 (SEC-04 headers):** Apply strict baseline headers immediately in `next.config.ts` via `headers()`: `Strict-Transport-Security` (HSTS, long max-age + includeSubDomains), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera/mic/geolocation by default).
- **D-02 (SEC-04 CSP):** Ship CSP in **report-only mode first** (`Content-Security-Policy-Report-Only`) to avoid breaking Next.js 16 / React Compiler inline scripts/styles. Tighten toward enforced nonce-based CSP in a later pass. **Do NOT enforce a blocking CSP in this phase.**
- **D-03 (SEC-03 routes):** Fix `proxy.ts`: add `/forgot-password` + `/reset-password` to auth routes (reachable logged-out; redirect to `/` when authenticated); add `/track` (public, `/track/[id]`) to always-public prefixes.
- **D-04 (SEC-03 model):** Authenticated-vs-unauthenticated gating ONLY. Role-based gating (admin/customer) is **deferred** — do not implement.
- **D-05 (SEC-03 boundary):** `proxy.ts`'s `getSessionCookie` is an **optimistic** cookie-presence check (redirect UX only). Real authorization stays server-side (`authActionClient` validates session). Do not rely on the proxy alone for security.
- **D-06 (SEC-05 lib):** Use **Upstash** (`@upstash/ratelimit` + `@upstash/redis`, already installed). No new rate-limit library.
- **D-07 (SEC-05 thresholds):** Login 5/min per IP (ideally IP+email); forgot+reset 3/hour per IP; register 5/hour per IP. On exceed: HTTP **429** + **generic** message (no user-enumeration). Exact numbers within these ranges = Claude's discretion.
- **D-08 (SEC-01 password):** Min length 8, requiring ≥1 letter and ≥1 number, validated by Zod on **both** client and server (extend `src/_schemas/auth.ts`). Applies to register + reset-password. Also set Better Auth `emailAndPassword.minPasswordLength` consistently.
- **D-09 (SEC-02 audit):** Audit all server actions in `src/_actions/` to confirm every exported action uses `authActionClient` + `.schema(zod)`. Verify each action individually, not just file-level imports.
- **D-10 (SEC-06 secrets):** Audit that server-only secrets (`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, Upstash tokens, DB URL) never reach the client bundle — only `NEXT_PUBLIC_*` may be client-exposed.

### Claude's Discretion

- Exact rate-limit numbers within the agreed ranges (D-07).
- Specific CSP report-only directive list and the `report-uri`/`report-to` endpoint.
- Exact `Permissions-Policy` allowlist beyond deny-by-default.
- Whether to add a lightweight session-validity helper for server components.

### Deferred Ideas (OUT OF SCOPE)

- Role-based authorization (admin vs customer) — `role` field + `/api/setup-admin` exist but admin areas undefined.
- Enforced nonce-based CSP — tighten from report-only later.
- **Reset-password email provider** — ⚠️ FLAGGED: `src/_lib/auth.ts` currently `console.log`s the reset link (real gap). Wiring Resend/Nodemailer MAY fold into this phase if planner judges it small; otherwise track as follow-up.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                            | Research Support                                                                                                                                                        |
| ------ | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-01 | Auth hardened (secure sessions, secure/HttpOnly cookies, password policy)              | Better Auth sets HttpOnly+Secure cookies by default; `minPasswordLength` config + Zod letter/number rule (no native custom validator hook exists). See Password Policy. |
| SEC-02 | All `src/_actions/` enforce server-side Zod                                            | Audited: all 8 actions across 4 files use `authActionClient.schema(...)`. Checklist below.                                                                              |
| SEC-03 | Route access control in `proxy.ts`                                                     | Verified `proxy.ts` convention + `getSessionCookie` is presence-only. Exact array edits below.                                                                          |
| SEC-04 | Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy) | `next.config.ts` `headers()` async fn — verified against local Next.js 16 docs. CSP report-only directive set below.                                                    |
| SEC-05 | Auth endpoints rate-limited                                                            | Two verified integration points: Better Auth native `rateLimit` (Redis via secondary-storage) OR `@upstash/ratelimit` wrapper. Per-IP keying via `x-forwarded-for`.     |
| SEC-06 | No secrets leak; env boundary verified                                                 | Grep audit done: secrets only in server modules; only `NEXT_PUBLIC_APP_URL` is client-facing. Verification recipe below.                                                |

</phase_requirements>

## Summary

This is a **hardening phase over already-shipped code**, not a greenfield build. Every primitive needed already exists in the repo: Better Auth (`src/_lib/auth.ts`), the `authActionClient` next-safe-action wrapper (`src/_lib/safe-action.ts`), the `proxy.ts` route gate, Zod schemas (`src/_schemas/auth.ts`), and the Upstash packages (installed, unused). The work is configuration + small, surgical edits + an audit — **no new dependencies, no re-architecture**.

The single most important Next.js-16-specific landmine is the `middleware.ts` → `proxy.ts` rename (already done in this repo) and the fact that **`proxy.ts` must not be the security boundary** — Next.js's own docs explicitly say proxy "should not be used as a full session management or authorization solution." Combined with the verified fact that Better Auth's `getSessionCookie` is **presence-only** (it parses the cookie string and returns it without validating signature or expiry), the plan must keep authorization defense-in-depth on the server (`authActionClient` already does this). The second landmine is CSP: React Compiler + Next.js 16 inject inline runtime; an enforcing CSP without nonces breaks the app, which is exactly why D-02 mandates **report-only first**.

For rate limiting there are **two legitimate, verified integration points** and the planner must pick one explicitly: (A) Better Auth's **native `rateLimit`** option backed by `secondary-storage` (requires wiring a `secondaryStorage` Redis adapter), which automatically covers `/api/auth/*` paths including `/sign-in/email`, `/forgot-password`, `/reset-password`, `/sign-up/email`; or (B) wrapping the auth route handler / auth server actions with `@upstash/ratelimit` directly (matches D-06's "use Upstash" intent most literally and gives per-path threshold control with the exact D-07 numbers). **Recommendation: Option B** for explicit per-endpoint control and the most direct reading of D-06, with per-IP keying via the `x-forwarded-for` header (Vercel sets this server-side and strips spoofed values).

**Primary recommendation:** Static baseline headers + CSP report-only in `next.config.ts` (`headers()`); fix the two `proxy.ts` arrays; wrap the four auth endpoints with `@upstash/ratelimit` sliding-window keyed by `x-forwarded-for` returning generic 429; add a shared `passwordSchema` (min 8, `[A-Za-z]` + `[0-9]`) used by register + reset on client AND re-validated server-side, with `emailAndPassword.minPasswordLength: 8` set to match; confirm the SEC-02 audit (already passing) and run the secret-boundary grep.

## Architectural Responsibility Map

| Capability                                               | Primary Tier                                               | Secondary Tier                     | Rationale                                                                              |
| -------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------- | -------------------------------------------------------------------------------------- |
| Baseline security headers (HSTS, X-Frame, etc.) (SEC-04) | Frontend Server (`next.config.ts` `headers()`)             | CDN/Vercel edge                    | Static response headers belong in config, applied to all routes at the edge.           |
| CSP report-only (SEC-04)                                 | Frontend Server (`next.config.ts` `headers()`)             | —                                  | Static directive list; report-only needs no nonce so no per-request proxy work.        |
| Optimistic redirect gating (SEC-03)                      | Frontend Server (`proxy.ts`)                               | —                                  | UX-only redirect; **not** an authz boundary.                                           |
| Real authorization (SEC-03/SEC-01)                       | API/Server Action (`authActionClient`) + Server Components | —                                  | Session validated server-side via `auth.api.getSession`. The actual security boundary. |
| Rate limiting (SEC-05)                                   | API/Backend (auth route handler / auth actions)            | Database/Storage (Upstash Redis)   | Abuse control must run server-side before auth logic; state lives in Redis.            |
| Password policy (SEC-01)                                 | API/Backend (Zod re-validate + Better Auth config)         | Browser/Client (Zod mirror for UX) | Server is authoritative; client mirror is feedback only.                               |
| Server-action input validation (SEC-02)                  | API/Server Action (`authActionClient.schema`)              | —                                  | next-safe-action parses input server-side before the handler runs.                     |
| Secret hygiene (SEC-06)                                  | Frontend Server build boundary                             | —                                  | `NEXT_PUBLIC_` prefix is the only client-exposed env surface in Next.js.               |

## Standard Stack

### Core (all already installed — no new deps)

| Library              | Version (verified)                                            | Purpose                                                        | Why Standard                  |
| -------------------- | ------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| `next`               | **16.2.6** (`node -p "require('next/package.json').version"`) | Headers config, `proxy.ts`, route handlers                     | Project framework (locked).   |
| `better-auth`        | **1.6.11** (`node_modules/better-auth/package.json`)          | Sessions, cookies, password length, optional native rate limit | Project auth (locked).        |
| `@upstash/ratelimit` | **v2.0.8** (`node_modules/@upstash/ratelimit/package.json`)   | Sliding-window per-IP rate limit                               | Chosen by user (D-06).        |
| `@upstash/redis`     | **1.38.0** (`node_modules/@upstash/redis/package.json`)       | Redis backend for ratelimit (`Redis.fromEnv()`)                | Pairs with ratelimit.         |
| `next-safe-action`   | **8.5.3** (`node_modules/next-safe-action/package.json`)      | `authActionClient` — auth + Zod on every action                | Established pattern (locked). |
| `zod`                | **4.4.3** (`node -p`)                                         | Password policy + all action input schemas                     | Project validation (locked).  |
| `react`              | **19.2.4**                                                    | (React Compiler context for CSP)                               | —                             |

### Supporting

| Library                                    | Purpose                                                                      | When to Use                                                    |
| ------------------------------------------ | ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `better-auth/cookies` (`getSessionCookie`) | Presence-only cookie check in `proxy.ts`                                     | Already imported in `proxy.ts`. Keep as-is per D-05.           |
| `next/headers` (`headers()`)               | Read `x-forwarded-for` in server actions; read session in `authActionClient` | If rate-limiting server actions rather than the route handler. |

### Alternatives Considered

| Instead of                              | Could Use                                                       | Tradeoff                                                                                                                                                                                                                                                                                       |
| --------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@upstash/ratelimit` wrapper (Option B) | Better Auth native `rateLimit` + `secondary-storage` (Option A) | Native auto-covers all `/api/auth/*` paths and returns 429 + `X-Retry-After`, but requires wiring a `secondaryStorage` Redis adapter into `auth.ts` and gives less direct control over D-07's exact per-endpoint numbers/messages. D-06 says "use Upstash" — Option B is the most literal fit. |
| Static CSP in `next.config.ts`          | Nonce-based CSP in `proxy.ts`                                   | Nonce CSP forces **dynamic rendering on every page** (kills static optimization/PPR) — explicitly deferred by D-02. Report-only static CSP is correct for this phase.                                                                                                                          |

**Installation:** None — every package is already in `package.json`/`node_modules`. (Upstash env vars `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` must exist for `Redis.fromEnv()`; confirm they are set in Vercel.)

## Package Legitimacy Audit

> No new packages are installed in this phase. All four security-relevant packages are pre-existing, locked project dependencies verified present in `node_modules` with matching versions. slopcheck not run because no install occurs.

| Package              | Registry | Status                                      | Source Repo                           | Disposition                     |
| -------------------- | -------- | ------------------------------------------- | ------------------------------------- | ------------------------------- |
| `@upstash/ratelimit` | npm      | Installed v2.0.8 (verified in node_modules) | github.com/upstash/ratelimit-js       | Approved (pre-existing, locked) |
| `@upstash/redis`     | npm      | Installed 1.38.0 (verified)                 | github.com/upstash/upstash-redis      | Approved (pre-existing, locked) |
| `better-auth`        | npm      | Installed 1.6.11 (verified)                 | github.com/better-auth/better-auth    | Approved (pre-existing, locked) |
| `next-safe-action`   | npm      | Installed 8.5.3 (verified)                  | github.com/TheEdoRan/next-safe-action | Approved (pre-existing, locked) |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
                          Incoming request (Vercel edge)
                                     │
                                     ▼
              ┌──────────────────────────────────────────────┐
              │ next.config.ts headers()  →  SEC-04           │
              │  applies HSTS / X-Frame-Options /             │
              │  X-Content-Type-Options / Referrer-Policy /   │
              │  Permissions-Policy / CSP-Report-Only         │
              │  to ALL responses (source: '/(.*)')           │
              └──────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌────────────────────────────────────────────────────────┐
        │ src/proxy.ts  (matcher excludes api,_next,static)        │
        │  getSessionCookie() = PRESENCE-ONLY (optimistic)  →SEC-03│
        │  ┌─ static/public prefix? ──► NextResponse.next()        │
        │  ├─ auth route + has cookie ──► redirect /               │
        │  ├─ non-auth + no cookie ──► redirect /login?redirect=…  │
        │  └─ else ──► next()                                       │
        └────────────────────────────────────────────────────────┘
                 │                                  │
   page/route render                    /api/auth/[...all] (route handler)
                 │                                  │
                 ▼                                  ▼
   ┌──────────────────────────┐   ┌────────────────────────────────────┐
   │ Server Action (use server│   │ RATE LIMIT GATE (SEC-05)            │
   │  authActionClient        │   │  @upstash/ratelimit slidingWindow   │
   │  → auth.api.getSession    │   │  key = x-forwarded-for (per IP)    │
   │    (REAL authz boundary)  │   │  exceed ──► 429 generic message    │
   │  → .schema(zod) parse     │   │  ok ──► Better Auth handler         │
   │    (SEC-02 server valid.) │   │           (password policy SEC-01)  │
   └──────────────────────────┘   └────────────────┬───────────────────┘
                 │                                  ▼
                 ▼                         ┌──────────────────┐
        Drizzle / DB write                │ Upstash Redis    │
                                          │ (rate-limit state)│
                                          └──────────────────┘

   Secrets (BETTER_AUTH_SECRET, GOOGLE_CLIENT_SECRET, UPSTASH_*, DATABASE_URL)
   live ONLY in server modules (auth.ts, _db/index.ts) — never NEXT_PUBLIC_ (SEC-06)
```

### Pattern 1: Static security headers in `next.config.ts` (SEC-04 / D-01, D-02)

**What:** Async `headers()` returning one rule for `source: '/(.*)'` carrying all baseline headers + `Content-Security-Policy-Report-Only`.
**When to use:** Always for static, app-wide response headers (verified correct in local Next.js 16 docs `…/05-config/01-next-config-js/headers.md`).
**Example:**

```ts
// Source: node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md
//         + …/02-guides/content-security-policy.md ("Without Nonces" section)
// next.config.ts
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Report-only CSP: permissive enough to NOT break React Compiler / Next 16 inline runtime.
// 'unsafe-inline' + 'unsafe-eval'(dev) are intentional in report-only — we are COLLECTING
// violations, not enforcing. Tighten to nonce-based later (deferred per D-02).
const cspReportOnly = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
  report-uri /api/csp-report;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          { key: "Content-Security-Policy-Report-Only", value: cspReportOnly },
        ],
      },
    ];
  },
};

export default nextConfig;
```

> `report-uri` is deprecated-but-universally-supported; `Reporting-Endpoints` + `report-to` is the modern form. For report-only collection in this phase either works. The `/api/csp-report` endpoint is a tiny route handler that logs the JSON body (Claude's discretion per D-02).

### Pattern 2: `proxy.ts` route-array fix (SEC-03 / D-03, D-05)

**What:** Add the two recovery routes to `authRoutes` and `/track` to public prefixes. Keep `getSessionCookie` (presence-only) — it is correct for redirect UX.
**Example:**

```ts
// src/proxy.ts — minimal diff
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

const ALWAYS_PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/setup-admin",
  "/_next",
  "/track", // ◄ public O.S. tracking /track/[id] (QR code) — D-03
  "/terms",
  "/privacy",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest",
];
```

> Verified: `getSessionCookie` (`node_modules/better-auth/dist/cookies/index.mjs:169`) only parses the cookie header and returns the token string if present — **no signature/expiry validation**. This is presence-only by design (D-05). The matcher already excludes `api|_next|static|favicon|icon|sw.js|manifest.webmanifest`.

### Pattern 3: Upstash per-IP rate limit on the auth handler (SEC-05 / D-06, D-07)

**What:** Wrap `/api/auth/[...all]` POSTs (and/or specific auth actions) with `@upstash/ratelimit` sliding-window keyed by client IP; return generic 429 on exceed.
**Example:**

```ts
// Source: github.com/upstash/ratelimit-js (canonical v2 pattern)
// src/_lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + _TOKEN

export const loginLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // D-07: 5/min
  prefix: "rl:login",
});
export const passwordRecoveryLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 h"), // D-07: forgot+reset 3/hour
  prefix: "rl:pwrecovery",
});
export const registerLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 h"), // D-07: register 5/hour
  prefix: "rl:register",
});
```

```ts
// src/app/api/auth/[...all]/route.ts — wrap the existing handler
import { toNextJsHandler } from "better-auth/next-js";
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/_lib/auth";
import {
  loginLimiter,
  passwordRecoveryLimiter,
  registerLimiter,
} from "@/_lib/rate-limit";

const handlers = toNextJsHandler(auth);

function clientIp(req: NextRequest): string {
  // Vercel sets x-forwarded-for server-side and strips spoofed values.
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || "127.0.0.1";
}

function limiterFor(pathname: string) {
  if (pathname.includes("/sign-in")) return loginLimiter;
  if (pathname.includes("/sign-up")) return registerLimiter;
  if (
    pathname.includes("/forget-password") ||
    pathname.includes("/reset-password")
  )
    return passwordRecoveryLimiter;
  return null;
}

export async function POST(req: NextRequest) {
  const limiter = limiterFor(new URL(req.url).pathname);
  if (limiter) {
    const { success } = await limiter.limit(clientIp(req));
    if (!success) {
      // Generic message — no user enumeration (D-07).
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }
  }
  return handlers.POST(req);
}

export const { GET } = handlers;
```

> ⚠️ **Verify the exact Better Auth path segments** before locking the `limiterFor` matcher. Better Auth's email/password endpoints are `/sign-in/email`, `/sign-up/email`, `/forget-password` (note Better Auth historically spells it "forget"), and `/reset-password`. Confirm against the running `/api/auth/*` paths (the project's client calls `requestPasswordReset`/`resetPassword`). `[ASSUMED]` path spellings — see Assumptions Log A2.

### Pattern 4: Shared password policy (SEC-01 / D-08)

**What:** One `passwordSchema` (min 8, ≥1 letter, ≥1 number) reused by `registerSchema` + `resetPasswordSchema`; mirror on server by re-parsing; set `emailAndPassword.minPasswordLength: 8`.
**Example:**

```ts
// src/_schemas/auth.ts — add and reuse
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.");
// then: password: passwordSchema  in registerSchema AND resetPasswordSchema
// loginSchema keeps min(8) only (do not leak policy on login).
```

```ts
// src/_lib/auth.ts — keep server min length consistent
emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,          // matches Zod
  sendResetPassword: async ({ url }) => { /* ⚠️ still console.log — see Deferred */ },
},
```

> **Verified limitation:** Better Auth `emailAndPassword` exposes `minPasswordLength` / `maxPasswordLength` but **no `password.validate` custom-rule hook** (the `password` object only takes `hash`/`verify`). Therefore the letter+number rule MUST be enforced in Zod at the action/form boundary on BOTH client and server — there is no native server-side complexity validator. `[CITED: better-auth.com/docs/authentication/email-password]`

### Anti-Patterns to Avoid

- **Treating `proxy.ts` as the authz boundary** — Next 16 docs: proxy "should not be used as a full session management or authorization solution." `getSessionCookie` does NOT validate the session.
- **Enforcing a blocking CSP this phase** — breaks React Compiler/Next 16 inline runtime; D-02 says report-only.
- **Nonce-based CSP now** — forces dynamic rendering on every page; deferred (D-02).
- **Client-only password validation** — must re-validate server-side (D-08); never trust the browser.
- **Revealing whether an email exists** on rate-limit/auth failure — generic 429 only (D-07).
- **Reading IP from a user-controllable header** other than Vercel's `x-forwarded-for` — would allow limit bypass via spoofing.

## Don't Hand-Roll

| Problem                      | Don't Build                       | Use Instead                         | Why                                                                                     |
| ---------------------------- | --------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------- |
| Distributed rate limiting    | Custom in-memory counter          | `@upstash/ratelimit` sliding window | In-memory breaks across Vercel's serverless/Fluid instances; Upstash is shared, atomic. |
| Session/cookie security      | Custom JWT/cookie code            | Better Auth defaults                | Better Auth sets HttpOnly + Secure + SameSite cookies automatically.                    |
| Per-action auth + validation | Manual session checks per action  | `authActionClient.schema(z)`        | Already centralized in `safe-action.ts`; consistent + auditable.                        |
| Security header plumbing     | Setting headers per-route in code | `next.config.ts` `headers()`        | One config block covers all routes at the edge.                                         |
| Client IP extraction         | Parsing many proxy headers        | Vercel `x-forwarded-for` first hop  | Vercel strips spoofed XFF server-side; other headers are unreliable.                    |

**Key insight:** Every capability this phase needs is already provided by an installed library. The risk is _misconfiguration_ (wrong CSP, wrong rate-limit key, proxy treated as authz), not missing functionality.

## Runtime State Inventory

> Hardening/refactor phase — included for completeness.

| Category            | Items Found                                                                                                                                                                                                                      | Action Required                                                        |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Stored data         | None — no string-rename of stored keys/IDs in this phase. (Verified: phase only edits config/validation/route arrays.)                                                                                                           | None                                                                   |
| Live service config | **Upstash Redis** will newly hold rate-limit counters under prefixes `rl:login` / `rl:pwrecovery` / `rl:register`. Requires `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` env vars set in Vercel.                        | Verify env vars exist in Vercel before deploy.                         |
| OS-registered state | None — verified, no OS-level registrations involved.                                                                                                                                                                             | None                                                                   |
| Secrets/env vars    | Existing server-only: `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `DATABASE_URL` (verified only in `auth.ts` + `_db/index.ts`). **New requirement:** Upstash REST URL+token must be present (server-only, NOT `NEXT_PUBLIC_`). | Confirm Upstash vars set; ensure they are NOT prefixed `NEXT_PUBLIC_`. |
| Build artifacts     | None — config/source edits only; no compiled artifacts carry stale state.                                                                                                                                                        | None                                                                   |

## Common Pitfalls

### Pitfall 1: CSP report-only that still breaks dev (or "works in dev, breaks in prod")

**What goes wrong:** Forgetting `'unsafe-eval'` in development (React Compiler uses `eval` for enhanced debug stacks) OR copying a strict nonce CSP example into report-only.
**Why:** Next 16 docs: "In development, `'unsafe-eval'` is required because React uses `eval`… not required for production."
**How to avoid:** Gate `'unsafe-eval'` on `process.env.NODE_ENV === "development"` (shown in Pattern 1). Report-only NEVER blocks, so even a violation just logs — but keep the directive list permissive (`'unsafe-inline'` allowed) so the report noise is meaningful, not a wall of framework violations.
**Warning signs:** Console floods with CSP violation reports for Next.js's own inline scripts/styles.

### Pitfall 2: IP detection returns empty / same value for everyone on Vercel

**What goes wrong:** Using a removed `request.ip`, or `x-forwarded-for` is empty so every request keys to `"127.0.0.1"` and shares one bucket.
**Why:** `NextRequest.ip` was removed; Vercel overwrites `x-forwarded-for` server-side (and only forwards a trusted first hop). Behind a non-Vercel proxy XFF may differ.
**How to avoid:** Take the **first** comma-segment of `x-forwarded-for`; fall back to a constant only as last resort. On Vercel this is the real client IP and is spoof-resistant. Optionally combine IP+email for login (D-07 "ideally") to avoid one NAT'd IP locking out many users — but do not include email in the _response_ (enumeration risk).
**Warning signs:** Rate limit trips for unrelated users, or never trips under load test.

### Pitfall 3: Better Auth path spelling for password reset (`forget` vs `forgot`)

**What goes wrong:** The rate-limit path matcher targets `/forgot-password` but Better Auth's endpoint is `/forget-password`, so the limiter never fires.
**Why:** Better Auth's server endpoints differ from the app's page routes; the client wrapper exposes `requestPasswordReset`/`resetPassword`.
**How to avoid:** Inspect the actual Network calls under `/api/auth/*` (or Better Auth's route list) and match on the verified segment. See Assumptions Log A2. Page routes (`/forgot-password`) and API routes (`/api/auth/forget-password`) are different.
**Warning signs:** Forgot-password is hammerable with no 429.

### Pitfall 4: Double rate-limiting / conflicting backends

**What goes wrong:** Enabling Better Auth native `rateLimit` AND the Upstash wrapper at once → inconsistent limits, confusing 429s.
**Why:** Two independent limiters on the same endpoint.
**How to avoid:** Pick ONE integration point (recommend Option B / Upstash wrapper per D-06). If using native Better Auth `rateLimit`, do NOT also wrap the handler.
**Warning signs:** Two different retry-after values, or limits trip earlier than configured.

### Pitfall 5: Secret accidentally referenced from a `"use client"` module

**What goes wrong:** A non-`NEXT_PUBLIC_` env var read inside (or transitively imported by) a `"use client"` file → Next inlines `undefined` client-side AND signals a leak risk.
**Why:** Only `NEXT_PUBLIC_`-prefixed vars are exposed to the client bundle; others are `undefined` in client context.
**How to avoid:** Run the SEC-06 grep recipe below; keep secret-reading modules server-only (consider importing `server-only` — already a dependency — at the top of `auth.ts`/`_db/index.ts`).
**Warning signs:** A secret value appears in the built client JS, or a server secret reads `undefined` at runtime in a client component.

## Code Examples

### SEC-06 secret-boundary verification recipe (run + paste output into VALIDATION)

```bash
# 1. Every env reference and whether it is NEXT_PUBLIC_:
grep -rn "process.env" src/ | grep -v "NODE_ENV"
# 2. Secrets must appear ONLY in server modules (no "use client" at top):
for f in $(grep -rl "BETTER_AUTH_SECRET\|GOOGLE_CLIENT_SECRET\|UPSTASH_\|DATABASE_URL" src/); do
  echo "$f -> $(head -1 "$f")"
done   # NONE should start with "use client"
# 3. After build, confirm no secret string is in the client bundle:
npm run build && grep -rn "BETTER_AUTH_SECRET\|GOOGLE_CLIENT_SECRET" .next/static 2>/dev/null \
  && echo "LEAK!" || echo "clean"
```

> Current state (verified 2026-06-11): secrets appear only in `src/_lib/auth.ts` and `src/_db/index.ts` (both server modules, neither `"use client"`). Only `NEXT_PUBLIC_APP_URL` is client-facing. SEC-06 already passes; this phase just adds the Upstash env vars (keep them non-public) and documents the check.

## State of the Art

| Old Approach        | Current Approach                                     | When Changed                | Impact                                                           |
| ------------------- | ---------------------------------------------------- | --------------------------- | ---------------------------------------------------------------- |
| `middleware.ts`     | `proxy.ts` (root or `src/`)                          | Next.js 16                  | Already migrated in this repo; "functionality remains the same." |
| `NextRequest.ip`    | `request.headers.get("x-forwarded-for")` (first hop) | Removed in recent Next.js   | Must read IP from header, not `.ip`.                             |
| Enforced inline CSP | Nonce-based (dynamic) OR report-only first           | Next 13.4.20+ nonce support | This phase uses report-only; nonce deferred (D-02).              |

**Deprecated/outdated:**

- `middleware.ts` filename — renamed to `proxy.ts` (Next 16). Do not recreate `middleware.ts`.
- `request.ip` on `NextRequest` — gone; use headers.

## Assumptions Log

| #   | Claim                                                                                                                  | Section                 | Risk if Wrong                                                                                                                                                                                                |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A1  | `report-uri` (vs modern `Reporting-Endpoints`/`report-to`) is acceptable for report-only collection this phase.        | Pattern 1               | Low — both work; `report-uri` widely supported. CSP endpoint shape is Claude's discretion (D-02).                                                                                                            |
| A2  | Better Auth email/password server paths are `/sign-in/email`, `/sign-up/email`, `/forget-password`, `/reset-password`. | Pattern 3, Pitfall 3    | Medium — if spelling differs, the limiter silently never fires. **Planner must add a task to verify actual `/api/auth/*` paths** (inspect Network tab or Better Auth route list) before locking the matcher. |
| A3  | Upstash env vars `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are (or will be) set in Vercel.                   | Runtime State Inventory | High — `Redis.fromEnv()` throws at startup if absent. Confirm before deploy.                                                                                                                                 |
| A4  | Combining IP+email for login keying is optional ("ideally" in D-07); IP-only is the baseline.                          | Pattern 3, Pitfall 2    | Low — IP-only satisfies D-07's required behavior; IP+email is an enhancement.                                                                                                                                |

## Open Questions

1. **Rate-limit integration point: Option A (Better Auth native) vs Option B (Upstash wrapper)?**
   - Known: Both are verified and viable. Native auto-covers all auth paths + returns 429+`X-Retry-After`; Upstash wrapper gives exact per-endpoint D-07 control and is the literal reading of D-06.
   - Unclear: Whether the planner prefers the smallest config change (native, but needs `secondaryStorage` adapter) or explicit control (Upstash wrapper).
   - Recommendation: **Option B (Upstash wrapper)** — matches D-06 most directly and maps 1:1 to D-07 thresholds/messages. Pick ONE (Pitfall 4).
2. **Reset-password email provider (FLAGGED in CONTEXT Deferred).**
   - Known: `auth.ts` `console.log`s the reset link — a real secret-exposure gap.
   - Unclear: Whether to fold a provider (Resend/Nodemailer) into this phase.
   - Recommendation: Planner decides; if not folded in, track as explicit follow-up — do not silently ship the `console.log`.

## Environment Availability

| Dependency                             | Required By                | Available        | Version     | Fallback                                                                                   |
| -------------------------------------- | -------------------------- | ---------------- | ----------- | ------------------------------------------------------------------------------------------ |
| Node/Next toolchain                    | build/lint/typecheck gates | ✓                | next 16.2.6 | —                                                                                          |
| `@upstash/ratelimit`                   | SEC-05                     | ✓ (node_modules) | 2.0.8       | —                                                                                          |
| `@upstash/redis`                       | SEC-05                     | ✓ (node_modules) | 1.38.0      | —                                                                                          |
| Upstash Redis instance + REST env vars | SEC-05 runtime             | ✗ (unverified)   | —           | Local dev: Better Auth native in-memory rate limit, OR gate rate-limit behind env presence |
| `better-auth`                          | SEC-01/03/05               | ✓                | 1.6.11      | —                                                                                          |
| `vitest`                               | Validation                 | ✓                | 4.1.7       | —                                                                                          |

**Missing dependencies with no fallback:** None at code level.
**Missing dependencies with fallback:** Upstash **runtime** credentials — must be confirmed set in Vercel (A3). If absent locally, `Redis.fromEnv()` throws; recommend guarding the limiter so dev without Upstash still boots (e.g., skip rate-limit when env vars unset, or use a stub limiter).

## Validation Architecture

> `workflow.nyquist_validation` not set to false — included. Test framework: **Vitest 4.1.7** (jsdom, globals, setup `./vitest.setup.ts`, includes `src/**/*.{test,spec}.{ts,tsx}`).

### Test Framework

| Property           | Value                                                                    |
| ------------------ | ------------------------------------------------------------------------ |
| Framework          | Vitest 4.1.7 (`@vitejs/plugin-react`, jsdom)                             |
| Config file        | `vitest.config.ts`                                                       |
| Quick run command  | `npm run test:run` (`vitest run`)                                        |
| Full suite command | `npm run test:run && npm run typecheck && npm run lint && npm run build` |

### Phase Requirements → Test Map

| Req ID | Behavior                                                                                     | Test Type                                 | Automated Command                                                               | File Exists? |
| ------ | -------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------- | ------------ |
| SEC-01 | `passwordSchema` rejects <8 / no-letter / no-number; accepts valid                           | unit                                      | `vitest run src/_schemas/auth.test.ts`                                          | ❌ Wave 0    |
| SEC-02 | Every export in `_actions/*` is built from `authActionClient` + has `.schema`                | unit (static/import assertion)            | `vitest run src/_actions/_audit.test.ts`                                        | ❌ Wave 0    |
| SEC-03 | `proxy` redirects unauth→/login, auth+authroute→/, allows `/track` & recovery routes         | unit (mock `NextRequest`)                 | `vitest run src/proxy.test.ts`                                                  | ❌ Wave 0    |
| SEC-04 | `next.config` `headers()` returns HSTS/X-Frame/X-CTO/Referrer/Permissions/CSP-RO for `/(.*)` | unit                                      | `vitest run src/security/headers.test.ts` (or assert on `nextConfig.headers()`) | ❌ Wave 0    |
| SEC-05 | limiter returns `success:false` after threshold; handler returns 429 generic                 | unit (mock Upstash limiter) + manual curl | `vitest run src/_lib/rate-limit.test.ts`                                        | ❌ Wave 0    |
| SEC-06 | No secret in `.next/static`; secret modules are not `"use client"`                           | smoke (script)                            | grep recipe above (CI step)                                                     | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npm run test:run` (relevant file) — must be green.
- **Per wave merge:** `npm run test:run && npm run typecheck && npm run lint`.
- **Phase gate:** Full suite + `npm run build` green before `/gsd-verify-work`. (Build is a locked process gate — constraints.md.)

### Wave 0 Gaps

- [ ] `src/_schemas/auth.test.ts` — covers SEC-01 password policy
- [ ] `src/proxy.test.ts` — covers SEC-03 redirect logic (mock `NextRequest`)
- [ ] `src/_lib/rate-limit.test.ts` — covers SEC-05 (mock `@upstash/ratelimit`)
- [ ] `src/_actions/_audit.test.ts` — covers SEC-02 coverage assertion
- [ ] SEC-04 header assertion (small test invoking `nextConfig.headers()`)
- [ ] SEC-06 grep step wired as a CI/script check (no new test file needed)
- (Framework already installed — no install gap.)

## Security Domain

> `security_enforcement` not disabled — included. This entire phase IS the security domain.

### Applicable ASVS Categories

| ASVS Category                  | Applies           | Standard Control                                                                                                                          |
| ------------------------------ | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| V2 Authentication              | yes               | Better Auth (sessions, secure/HttpOnly cookies); password policy via Zod + `minPasswordLength`; rate limit on auth endpoints (SEC-01/05). |
| V3 Session Management          | yes               | Better Auth session cookies (HttpOnly+Secure+SameSite by default); `auth.api.getSession` is the server validation boundary (SEC-03).      |
| V4 Access Control              | yes (binary)      | `authActionClient` enforces authn per action; `proxy.ts` optimistic redirect. Role-based deferred (D-04).                                 |
| V5 Input Validation            | yes               | Zod on every server action (`.schema`) + password policy (SEC-02/01).                                                                     |
| V6 Cryptography                | no (use defaults) | Better Auth handles password hashing; do NOT hand-roll. No new crypto in this phase.                                                      |
| V12/V14 Config & HTTP Security | yes               | Security headers + CSP report-only (SEC-04); secret hygiene / env boundary (SEC-06).                                                      |

### Known Threat Patterns for Next.js 16 + Better Auth + Upstash

| Pattern                                        | STRIDE                      | Standard Mitigation                                                       |
| ---------------------------------------------- | --------------------------- | ------------------------------------------------------------------------- |
| Brute-force credential stuffing                | Spoofing / DoS              | Upstash sliding-window per IP, 429 generic (SEC-05).                      |
| Account enumeration via differential responses | Information Disclosure      | Generic error on auth failure + rate limit (D-07).                        |
| Clickjacking                                   | Tampering                   | `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'` (SEC-04).          |
| XSS                                            | Tampering                   | CSP (report-only now → nonce later); React auto-escaping (SEC-04).        |
| MITM / protocol downgrade                      | Tampering / Info Disclosure | HSTS `includeSubDomains; preload` (SEC-04).                               |
| MIME sniffing                                  | Tampering                   | `X-Content-Type-Options: nosniff` (SEC-04).                               |
| Authz bypass via optimistic proxy              | Elevation of Privilege      | Server-side session validation as real boundary (D-05); proxy is UX-only. |
| Secret exfiltration via client bundle          | Information Disclosure      | `NEXT_PUBLIC_` boundary + grep/build audit (SEC-06).                      |
| Unsigned-cookie trust                          | Spoofing                    | Never trust `getSessionCookie` presence for authz; validate server-side.  |

## Sources

### Primary (HIGH confidence)

- `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md` — proxy convention, "not an authz solution", matcher.
- `node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md` — report-only/static CSP, dev `'unsafe-eval'`, nonce→dynamic-rendering tradeoff.
- `node_modules/next/dist/docs/01-app/03-api-reference/05-config/01-next-config-js/headers.md` — `headers()` async config shape.
- `node_modules/next/dist/docs/01-app/02-guides/data-security.md` — DAL / server-only data boundary.
- `node_modules/better-auth/dist/cookies/index.{mjs,d.mts}` — verified `getSessionCookie` is presence-only.
- Installed `package.json` + `node_modules/*/package.json` — verified versions (next 16.2.6, better-auth 1.6.11, @upstash/ratelimit 2.0.8, @upstash/redis 1.38.0, next-safe-action 8.5.3, zod 4.4.3).
- Repo source: `src/proxy.ts`, `src/_lib/auth.ts`, `src/_lib/safe-action.ts`, `src/_schemas/auth.ts`, `src/_actions/*.ts`, `src/app/api/auth/[...all]/route.ts` — current state for the SEC-02 audit and edits.

### Secondary (MEDIUM-HIGH confidence)

- better-auth.com/docs/concepts/rate-limit — `rateLimit` option (window/max/storage/customRules), `secondary-storage`, default strict auth rules, 429 + `X-Retry-After`.
- better-auth.com/docs/authentication/email-password — `minPasswordLength`/`maxPasswordLength`; `password` object = hash/verify only (NO custom validator hook).
- github.com/upstash/ratelimit-js — canonical v2 `Redis.fromEnv()` + `Ratelimit.slidingWindow` + `.limit(id)` return shape.

### Tertiary (LOW confidence — flagged)

- WebSearch (vercel/next.js discussions, vercel.com/docs/headers) — `NextRequest.ip` removed; Vercel overwrites `x-forwarded-for` server-side (spoof-resistant). Cross-confirmed by multiple results; treat path-spelling for Better Auth (A2) as still needing in-repo verification.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all versions verified in node_modules; no new deps.
- Architecture / Next.js 16 APIs: HIGH — verified against locally-installed Next 16 docs (the authoritative source per AGENTS.md).
- Better Auth rate-limit + password API: MEDIUM-HIGH — official docs; native rate-limit path exists but Upstash chosen (D-06).
- Pitfalls (IP/path spelling): MEDIUM — A2 (Better Auth path spelling) and A3 (Upstash env) need in-repo/Vercel confirmation by the planner.

**Research date:** 2026-06-11
**Valid until:** 2026-07-11 (stable stack; re-verify if Next.js / Better Auth minor bumps before planning).
