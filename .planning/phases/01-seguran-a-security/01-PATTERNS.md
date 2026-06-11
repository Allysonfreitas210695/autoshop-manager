# Phase 1: Segurança (Security) - Pattern Map

**Mapped:** 2026-06-11
**Files analyzed:** 9 (3 new, 6 modified/audited)
**Analogs found:** 8 / 9 (1 greenfield config, no analog needed)

> **Stack note (AGENTS.md):** "This is NOT the Next.js you know" — Next.js 16.2.6. `middleware.ts` is renamed `proxy.ts` (already migrated). Read `node_modules/next/dist/docs/` before writing Next.js code. `NextRequest.ip` is removed → read `x-forwarded-for`. This phase is HARDENING existing code: no new deps, no re-architecture. Every primitive already exists in-repo.

---

## File Classification

| New/Modified File                                           | New?           | Role                  | Data Flow                     | Closest Analog                                     | Match Quality              |
| ----------------------------------------------------------- | -------------- | --------------------- | ----------------------------- | -------------------------------------------------- | -------------------------- |
| `next.config.ts`                                            | modify (empty) | config                | request-response (headers)    | — (greenfield; RESEARCH Pattern 1 is the template) | none                       |
| `src/proxy.ts`                                              | modify         | middleware/route-gate | request-response              | self (edit two arrays)                             | exact (in-place)           |
| `src/_lib/rate-limit.ts`                                    | **new**        | utility (lib helper)  | request-response (abuse gate) | `src/_lib/safe-action.ts`, `src/_lib/auth.ts`      | role-match (lib singleton) |
| `src/app/api/auth/[...all]/route.ts`                        | modify         | route handler         | request-response              | self (wrap existing handler)                       | exact (in-place)           |
| `src/_schemas/auth.ts`                                      | modify         | schema (Zod)          | transform/validation          | self (existing schemas)                            | exact (in-place)           |
| `src/_lib/auth.ts`                                          | modify         | config (Better Auth)  | request-response              | self (`emailAndPassword` block)                    | exact (in-place)           |
| `src/_actions/{appointments,customers,inventory,orders}.ts` | audit only     | server actions        | CRUD                          | self (no edits expected — audit passes)            | exact                      |
| `src/app/api/csp-report/route.ts` (optional)                | **new**        | route handler         | event-driven (report sink)    | `src/app/api/auth/[...all]/route.ts`               | role-match                 |
| Test files (Wave 0)                                         | **new**        | test                  | unit                          | — (no existing tests; vitest config below)         | none                       |

---

## Pattern Assignments

### `next.config.ts` (config, request-response) — SEC-04 / D-01, D-02

**Analog:** None in-repo (file is a 7-line empty stub). Use RESEARCH.md Pattern 1 verbatim as the template — it is verified against `node_modules/next/dist/docs/.../headers.md` + `.../content-security-policy.md`.

**Current state** (`next.config.ts` lines 1-7) — what gets replaced:

```ts
import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  /* config options here */
};
export default nextConfig;
```

**Pattern to apply:** Add an `async headers()` returning ONE rule for `source: "/(.*)"` carrying the five baseline headers + `Content-Security-Policy-Report-Only`. Full template is in RESEARCH.md Pattern 1 (lines 173-226). Key points:

- HSTS `max-age=63072000; includeSubDomains; preload`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- CSP is **report-only** (never blocking — D-02). Gate `'unsafe-eval'` on `process.env.NODE_ENV === "development"` (React Compiler uses `eval` in dev — Pitfall 1).
- Keep `import type { NextConfig } from "next";` and `export default nextConfig;` (already present — preserve the file's import/export shape).

---

### `src/proxy.ts` (middleware/route-gate, request-response) — SEC-03 / D-03, D-04, D-05

**Analog:** self — surgical edit of two existing arrays. Do NOT rewrite the file.

**Current imports + gate logic** (`src/proxy.ts` lines 1-2, 28-49) — already correct, preserve:

```ts
import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";
// ...
const hasSession = Boolean(getSessionCookie(request)); // line 35 — PRESENCE-ONLY (D-05), keep as-is
const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
```

**Edit 1 — `authRoutes`** (line 4) add the two recovery routes:

```ts
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
```

**Edit 2 — `ALWAYS_PUBLIC_PREFIXES`** (lines 9-18) add `/track` (public QR O.S. tracking `/track/[id]`):

```ts
const ALWAYS_PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/setup-admin",
  "/_next",
  "/track", // ◄ ADD — public O.S. tracking /track/[id] (D-03)
  "/terms",
  "/privacy",
  "/sitemap.xml",
  "/robots.txt",
  "/manifest",
];
```

**Do NOT change:**

- `getSessionCookie` (line 35) — optimistic by design (D-05). It is NOT the authz boundary.
- The `matcher` (lines 51-55) — already excludes `api|_next/static|_next/image|favicon.ico|icon.png|sw.js|manifest.webmanifest`.
- No role-based gating (D-04 deferred).

---

### `src/_lib/rate-limit.ts` (utility / lib singleton, request-response) — SEC-05 / D-06, D-07 — **NEW FILE**

**Analog:** `src/_lib/safe-action.ts` and `src/_lib/auth.ts` — both are the `src/_lib/` "module-level singleton config" pattern: import deps, construct/export a configured client object at module scope.

**Import + module-singleton pattern** (mirror from `src/_lib/auth.ts` lines 1-8 / `src/_lib/safe-action.ts` lines 1-11):

```ts
// src/_lib/auth.ts shape — exported configured singleton at module scope:
import { betterAuth } from "better-auth";
import { db } from "@/_db";
export const auth = betterAuth({
  /* config */
});
```

Apply the same shape: import `{ Ratelimit }` from `@upstash/ratelimit` and `{ Redis }` from `@upstash/redis`, build `const redis = Redis.fromEnv();`, export named limiter singletons (`loginLimiter`, `passwordRecoveryLimiter`, `registerLimiter`). Full template in RESEARCH.md Pattern 3 (lines 266-287). Thresholds (D-07): login `slidingWindow(5,"1 m")`, recovery `slidingWindow(3,"1 h")`, register `slidingWindow(5,"1 h")`.

**Path-alias convention:** use `@/...` imports (verified in every `src/_lib/*` and `src/_actions/*` file; `@` → `./src` per `tsconfig` + `vitest.config.ts` alias).

**Env guard (RESEARCH A3 / Environment Availability):** `Redis.fromEnv()` throws if `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` are unset. Guard so dev without Upstash still boots (skip limiting or stub when env vars absent). Keep these vars server-only (NOT `NEXT_PUBLIC_` — D-10).

---

### `src/app/api/auth/[...all]/route.ts` (route handler, request-response) — SEC-05 / D-06, D-07

**Analog:** self — wrap the existing handler. Current file is 5 lines:

```ts
import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/_lib/auth";
export const { GET, POST } = toNextJsHandler(auth);
```

**Pattern to apply:** Keep `GET` from the generated handler. Replace the bare `POST` export with a wrapper that (1) extracts client IP from `x-forwarded-for` first hop (NOT `request.ip` — removed), (2) selects the limiter by pathname, (3) returns generic **429** (`{ error: "Muitas tentativas. Tente novamente mais tarde." }`) on exceed — no user enumeration (D-07), else delegates to `handlers.POST(req)`. Full template in RESEARCH.md Pattern 3 (lines 290-334).

**⚠️ Verification task (RESEARCH A2 / Pitfall 3):** Before locking the `limiterFor` matcher, confirm the ACTUAL Better Auth server path segments under `/api/auth/*`. Better Auth historically spells it `/forget-password` (not `/forgot-password`); endpoints are likely `/sign-in/email`, `/sign-up/email`, `/forget-password`, `/reset-password`. The app's client wrapper (`src/_lib/auth-client.ts`) calls `requestPasswordReset`/`resetPassword` — page routes (`/forgot-password`) differ from API paths. If the matcher targets the wrong spelling, the limiter silently never fires.

---

### `src/_schemas/auth.ts` (schema/Zod, transform) — SEC-01 / D-08

**Analog:** self — the file already defines `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema` with the established Zod shape.

**Current Zod conventions to mirror** (`src/_schemas/auth.ts` lines 1-37):

```ts
import { z } from "zod";
// PT-BR error messages, z.email(), .min(8, "...") for password,
// .refine(...path:["confirmPassword"]) for confirm-match,
// and z.infer<typeof X> type exports at the bottom.
export const registerSchema = z
  .object({
    /* ... */ password: z
      .string()
      .min(8, "A senha deve ter ao menos 8 caracteres.") /* ... */,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
  });
```

**Pattern to apply:** Add a shared `passwordSchema` and reuse it (RESEARCH.md Pattern 4 lines 346-352):

```ts
export const passwordSchema = z
  .string()
  .min(8, "A senha deve ter ao menos 8 caracteres.")
  .regex(/[A-Za-z]/, "A senha deve conter ao menos uma letra.")
  .regex(/[0-9]/, "A senha deve conter ao menos um número.");
```

Then replace `password: z.string().min(8, ...)` with `password: passwordSchema` in BOTH `registerSchema` (line 12) and `resetPasswordSchema` (line 26). **Leave `loginSchema` (line 5) as `min(8)` only** — do not leak the complexity policy on login. Keep PT-BR messages and the `z.infer` exports at the bottom.

**Project rule (CONTEXT / PROJECT.md):** no `.default()` in form schemas — use react-hook-form `defaultValues`. The new `passwordSchema` correctly has no `.default()`.

---

### `src/_lib/auth.ts` (config / Better Auth, request-response) — SEC-01 / D-08

**Analog:** self — edit the existing `emailAndPassword` block (lines 15-21).

**Current block:**

```ts
emailAndPassword: {
  enabled: true,
  sendResetPassword: async ({ url }) => {
    // TODO: integrate email provider (Resend, Nodemailer, etc.) for production
    console.log("[reset-password] link:", url);   // ⚠️ FLAGGED — see Deferred
  },
},
```

**Pattern to apply:** Add `minPasswordLength: 8` to keep the server floor consistent with Zod (D-08):

```ts
emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,   // ◄ ADD — matches passwordSchema
  sendResetPassword: async ({ url }) => { /* ... */ },
},
```

**Verified limitation (RESEARCH line 364):** Better Auth `emailAndPassword` has NO `password.validate` custom-rule hook (only `minPasswordLength`/`maxPasswordLength`). The letter+number rule MUST be enforced in Zod on BOTH client and server — there is no native server complexity validator.

**⚠️ FLAGGED (CONTEXT/RESEARCH Deferred):** `sendResetPassword` still `console.log`s the reset link — a real secret-exposure gap. Wiring Resend/Nodemailer MAY fold into this phase if the planner judges it small; otherwise track as an explicit follow-up. Do not silently ship the `console.log`.

---

### `src/_actions/{appointments,customers,inventory,orders}.ts` (server actions, CRUD) — SEC-02 / D-09 — AUDIT ONLY

**Analog:** self — these ARE the canonical pattern; the work is verification, not editing.

**Audit result (all 8 exported actions verified — PASSES):**

| File              | Exported action             | `authActionClient`? | `.schema(zod)`? |
| ----------------- | --------------------------- | :-----------------: | :-------------: |
| `orders.ts`       | `createOrderAction`         |          ✓          |        ✓        |
| `orders.ts`       | `updateOrderStatusAction`   |          ✓          |        ✓        |
| `orders.ts`       | `approveOrderItemAction`    |          ✓          |        ✓        |
| `appointments.ts` | `createAppointmentAction`   |          ✓          |        ✓        |
| `customers.ts`    | `createCustomerAction`      |          ✓          |        ✓        |
| `customers.ts`    | `createVehicleAction`       |          ✓          |        ✓        |
| `inventory.ts`    | `createPartAction`          |          ✓          |        ✓        |
| `inventory.ts`    | `updateStockAction`         |          ✓          |        ✓        |
| `inventory.ts`    | `createPurchaseOrderAction` |          ✓          |        ✓        |

(9 actions total; all built from `authActionClient.schema(...).action(...)`.) **No source edits expected** — SEC-02 is a coverage assertion. The planner should produce a static `_audit.test.ts` (below) that fails if any future export skips this shape.

**Canonical action shape** (`src/_actions/orders.ts` lines 1-11 — what every action MUST mirror):

```ts
"use server";
import { z } from "zod";
import { db } from "@/_db";
import { authActionClient } from "@/_lib/safe-action";

export const createOrderAction = authActionClient
  .schema(
    z.object({
      /* ... */
    }),
  )
  .action(async ({ parsedInput }) => {
    /* ... */ revalidatePath("/orders");
  });
```

---

### `src/app/api/csp-report/route.ts` (route handler, event-driven) — optional, SEC-04 / D-02

**Analog:** `src/app/api/auth/[...all]/route.ts` (route-handler shape — `export async function POST(req)` / named exports).

**Pattern:** Tiny POST handler that reads the JSON body and logs it (the `report-uri /api/csp-report` sink referenced in the CSP). Claude's discretion (D-02) — only needed if the `report-uri` directive points at an in-app endpoint. Return `new Response(null, { status: 204 })`.

---

## Shared Patterns

### `src/_lib/` singleton-config convention

**Source:** `src/_lib/auth.ts` (lines 1-8), `src/_lib/safe-action.ts` (lines 1-20), `src/_lib/session.ts`
**Apply to:** `src/_lib/rate-limit.ts` (new)
Each `_lib` module imports deps, constructs a configured client at module scope, and exports it as a named `const`. Use `@/...` path aliases. Keep secret-reading modules server-only (no `"use client"`).

```ts
import { betterAuth } from "better-auth";
import { db } from "@/_db";
export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET /* ... */,
});
```

### Server-side auth boundary (the REAL authz)

**Source:** `src/_lib/safe-action.ts` lines 22-37 (`authActionClient`); `src/_lib/session.ts` (`getSession`)
**Apply to:** all server actions; any new server-component session check
`authActionClient` calls `auth.api.getSession({ headers: await headers() })` and throws `ActionError("Não autenticado.")` if no session. This — NOT `proxy.ts` — is the security boundary (D-05). The optional "lightweight session-validity helper" (Claude's discretion) should reuse `getSession()` from `src/_lib/session.ts`.

```ts
const session = await auth.api.getSession({ headers: await headers() });
if (!session) throw new ActionError("Não autenticado.");
```

### Generic-error / no-enumeration convention

**Source:** `src/_lib/safe-action.ts` lines 11-20 (`handleServerError` → `DEFAULT_SERVER_ERROR_MESSAGE`)
**Apply to:** rate-limit 429 response, auth failures
Never reveal whether an email exists. Errors are PT-BR generic strings. Rate-limit exceed → `429` + `"Muitas tentativas. Tente novamente mais tarde."` (D-07).

### Zod schema convention

**Source:** `src/_schemas/auth.ts` (entire file)
**Apply to:** `passwordSchema` and any new schema
PT-BR messages, `z.email()`, `.refine(...path:[...])` for cross-field, `z.infer<typeof X>` type exports at file bottom, NO `.default()` in form schemas (use RHF `defaultValues`).

### Secret/env boundary (SEC-06 / D-10)

**Source:** verified — secrets only in `src/_lib/auth.ts` + `src/_db/index.ts` (both server modules, neither `"use client"`); only `NEXT_PUBLIC_APP_URL` is client-facing (`src/_lib/auth-client.ts`).
**Apply to:** new `src/_lib/rate-limit.ts` — Upstash tokens stay server-only (no `NEXT_PUBLIC_`). Consider importing `server-only` at the top of secret modules. Run the grep recipe (RESEARCH lines 440-450) and paste output into VALIDATION.

---

## Test Patterns (Wave 0 — all NEW, no existing tests)

**No test files exist yet** (`find src -name "*.test.ts"` → empty). There is no in-repo test analog; use the vitest config as the contract:

| Property     | Value                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Framework    | Vitest 4.1.7, jsdom, `globals: true` (no need to import `describe/it/expect`)                                     |
| Include glob | `src/**/*.{test,spec}.{ts,tsx}` (co-locate next to source)                                                        |
| Alias        | `@` → `./src` (matches app imports)                                                                               |
| Setup        | `./vitest.setup.ts` (jest-dom + RTL cleanup)                                                                      |
| Run          | `npm run test:run` (per task), full gate `npm run test:run && npm run typecheck && npm run lint && npm run build` |

**Wave 0 test files to create** (RESEARCH Validation):

- `src/_schemas/auth.test.ts` — `passwordSchema` rejects <8 / no-letter / no-number; accepts valid (SEC-01).
- `src/proxy.test.ts` — mock `NextRequest`; unauth→`/login`, auth+authroute→`/`, allows `/track` + recovery routes (SEC-03).
- `src/_lib/rate-limit.test.ts` — mock `@upstash/ratelimit`; `success:false` after threshold → 429 generic (SEC-05).
- `src/_actions/_audit.test.ts` — static/import assertion every `_actions/*` export is `authActionClient`+`.schema` (SEC-02).
- SEC-04 header assertion — small test invoking `nextConfig.headers()`.
- SEC-06 — grep recipe as a CI/script step (no test file).

---

## No Analog Found

| File                           | Role   | Data Flow        | Reason                                                     | Planner uses                                                                |
| ------------------------------ | ------ | ---------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| `next.config.ts` headers block | config | request-response | File is an empty stub; no prior `headers()` config in repo | RESEARCH.md Pattern 1 (lines 173-226) — verified against local Next 16 docs |
| Test files                     | test   | unit             | Zero existing tests in repo                                | vitest.config.ts contract above + RESEARCH Validation section               |

---

## Metadata

**Analog search scope:** `src/_lib/`, `src/_schemas/`, `src/_actions/`, `src/app/api/auth/`, `src/proxy.ts`, `next.config.ts`, vitest config.
**Files scanned (read in full):** `proxy.ts`, `_lib/auth.ts`, `_lib/safe-action.ts`, `_lib/auth-client.ts`, `_lib/session.ts`, `_schemas/auth.ts`, `next.config.ts`, all 4 `_actions/*.ts`, route handler, vitest config/setup.
**Key verifications:** SEC-02 audit PASSES (9/9 actions compliant); route handler is the 5-line bare `toNextJsHandler` (needs wrapping); no test files exist; secrets confined to `_lib/auth.ts` + `_db`.
**Pattern extraction date:** 2026-06-11

```

```
