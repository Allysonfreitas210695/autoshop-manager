# Phase 5: DB Foundation & Auth - Research

**Researched:** 2026-06-21
**Domain:** PostgreSQL / Drizzle ORM / Better Auth / Neon serverless
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Configure `pg.Pool` with `max: 3` fixed in code (not via env var).
- **D-02:** Add `idleTimeoutMillis: 30000` and `connectionTimeoutMillis: 2000` to pool to prevent stuck connections on Vercel Lambda.
- **D-03:** Keep the existing global singleton pattern in `src/_db/index.ts` (`globalForDb`).
- **D-04:** Generate migration `0003` in Phase 5 to add `'confirmed'` to enum `purchase_order_status`. Execute `ALTER TYPE ... ADD VALUE 'confirmed'` before Phases 6-10 reach the database.
- **D-05:** Update `src/_db/schema/purchase-orders.ts` to include `'confirmed'` in `pgEnum` before generating the migration.
- **D-06:** No other schema gaps identified — the 3 existing migrations cover the rest.
- **D-07:** `scripts/seed.ts` must be idempotent: wipe all tables in correct FK-reverse order and re-insert data.
- **D-08:** Users must be created via Better Auth API (`auth.api.signUpEmail`) to ensure correct password hash — no direct Drizzle insert.
- **D-09:** Cover all 12 relationships: user, session, account, verification, vehicles, services, serviceOrders, serviceOrderItems, transactions, appointments, purchaseOrders, purchaseOrderItems.

### Claude's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

- Driver swap to `@neondatabase/serverless` — deferred to a future milestone.
- Server-side pagination for large lists — deferred to a future milestone.
- Email provider integration for password reset — out of scope for Phase 5.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                     | Research Support                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FOUND-01 | Operator can run migrations and have production DB with updated schema          | Migration gap analysis: need to generate 0003 for `purchase_order_status` enum; drizzle-kit migrate runs against Neon URL in .env                       |
| FOUND-02 | System authenticates users against Drizzle DB (login, session, logout verified) | Better Auth drizzleAdapter already configured; pool changes are transparent; session persists via nextCookies() plugin                                  |
| FOUND-03 | Developer can populate DB with representative seed data via seed script         | Seed already covers 11/12 tables; `verification` table not in wipe function — gap identified; D-08 pattern (`auth.api.signUpEmail`) already implemented |

</phase_requirements>

---

## Summary

Phase 5 is primarily an **audit-and-gap-fix phase**, not a from-scratch implementation. The database infrastructure (Drizzle, Better Auth, pg.Pool singleton, seed script) is already present and mostly correct. Three targeted changes are required:

1. **Pool hardening** — add `max: 3`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 2000` to the existing `new Pool({...})` in `src/_db/index.ts`.
2. **Migration 0003** — add `'confirmed'` value to the `purchase_order_status` enum in schema then run `drizzle-kit generate` + `drizzle-kit migrate`.
3. **Seed idempotency gap** — the `wipe()` function omits the `verification` table; it must be added to prevent FK violations on repeated runs.

**Critical discovery:** The project's `DATABASE_URL` already points to a **Neon connection pooler** (`ep-long-night-apor3afn-pooler.c-7.us-east-1.aws.neon.tech`). The serverless-safe concern is therefore managed at the Neon layer. The `pg.Pool` with `max: 3` decision (D-01) adds a client-side cap as a belt-and-suspenders guard, which is the right call. No driver swap is needed for Phase 5.

**Primary recommendation:** Apply the three targeted changes, generate+apply migration 0003, fix the `wipe()` gap, and run the seed against the real DB to validate all success criteria.

---

## Architectural Responsibility Map

| Capability                   | Primary Tier       | Secondary Tier        | Rationale                                                                             |
| ---------------------------- | ------------------ | --------------------- | ------------------------------------------------------------------------------------- |
| DB connection pooling        | API / Backend      | —                     | `pg.Pool` lives in `src/_db/index.ts`, consumed by server-side code only              |
| Schema migrations            | Database / Storage | —                     | drizzle-kit runs outside the app; affects DB state directly                           |
| Auth session persistence     | API / Backend      | Frontend Server (SSR) | Better Auth writes sessions to DB; `nextCookies()` plugin handles cookie/SSR boundary |
| Seed data population         | Database / Storage | API / Backend         | `scripts/seed.ts` is a CLI script; calls Better Auth API for user creation            |
| Enum value gap (`confirmed`) | Database / Storage | API / Backend         | Postgres ALTER TYPE affects DB; schema file change affects ORM types                  |

---

## Standard Stack

### Core (already installed — no new packages)

| Library       | Version (installed)      | Purpose                                | Source                   |
| ------------- | ------------------------ | -------------------------------------- | ------------------------ |
| `pg`          | 8.21.0 (latest: 8.22.0)  | PostgreSQL node driver, `pg.Pool`      | [VERIFIED: npm registry] |
| `drizzle-orm` | 0.45.2                   | ORM, schema definitions, query builder | [VERIFIED: npm registry] |
| `drizzle-kit` | 0.31.10                  | Migration generator and runner         | [VERIFIED: npm registry] |
| `better-auth` | 1.6.11 (latest: 1.6.20)  | Auth framework, `drizzleAdapter`       | [VERIFIED: npm registry] |
| `tsx`         | (devDep, latest: 4.22.4) | TypeScript execution for seed script   | [VERIFIED: npm registry] |
| `dotenv`      | installed                | Loads `.env` for drizzle.config.ts     | [VERIFIED: npm registry] |

**No new packages required for Phase 5.** All dependencies are already present.

### Alternatives Considered

| Instead of              | Could Use                  | Tradeoff                                                                                       |
| ----------------------- | -------------------------- | ---------------------------------------------------------------------------------------------- |
| `pg.Pool` with `max: 3` | `@neondatabase/serverless` | Neon serverless driver is more optimal for Lambda; locked as future requirement per CONTEXT.md |

---

## Package Legitimacy Audit

**No new packages to install in Phase 5.** All required packages are already declared in `package.json`.

_Slopcheck was unavailable at research time — not required since no new installs occur._

---

## Architecture Patterns

### System Architecture Diagram

```
scripts/seed.ts
  │
  ├─[auth.api.signUpEmail]──► Better Auth HTTP handler
  │                               │
  │                               ▼
  │                          pg.Pool (max:3, idleTimeout:30s)
  │                               │
  └─[db.insert / db.delete]──────►│
                                   ▼
                              Neon Pooler (c-7.us-east-1)
                                   │
                                   ▼
                              PostgreSQL DB
                               (12 tables)

Next.js App (runtime)
  │
  ├─[Server Action / Route Handler]
  │       │
  │       ▼
  │  globalForDb.pool (singleton, reused across hot reloads)
  │       │
  │       ▼
  │  pg.Pool ──► Neon Pooler ──► PostgreSQL
  │
  └─[Better Auth middleware / proxy.ts]
          │
          ▼
     drizzleAdapter(db) ──► pg.Pool ──► Neon Pooler
```

### Recommended Project Structure (no changes from existing)

```
src/_db/
├── index.ts           # Pool singleton — add max/idleTimeout/connectionTimeout
├── schema/
│   ├── index.ts       # Re-exports all schemas
│   ├── auth.ts        # user, session, account, verification
│   ├── purchase-orders.ts  # ADD 'confirmed' to purchaseOrderStatus enum
│   ├── service-orders.ts
│   ├── services.ts
│   ├── transactions.ts
│   ├── vehicles.ts
│   └── appointments.ts
└── migrations/
    ├── 0000_equal_doomsday.sql
    ├── 0001_phase16_additions.sql
    ├── 0002_flat_reavers.sql
    └── 0003_<auto-name>.sql   # NEW: ALTER TYPE purchase_order_status ADD VALUE 'confirmed'

scripts/
└── seed.ts            # ADD verification to wipe(); already covers 11/12 tables
```

### Pattern 1: Pool Singleton with Serverless Limits

**What:** Global singleton pool with bounded connection count, idle timeout, and connection timeout.
**When to use:** Any Next.js app deployed to Vercel Lambda or similar short-lived runtimes.

```typescript
// Source: src/_db/index.ts (current + D-01/D-02/D-03 changes)
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
```

[ASSUMED] — training knowledge on Vercel Lambda connection behavior, confirmed by project's own CONTEXT.md decisions.

### Pattern 2: Postgres Enum Value Addition

**What:** Postgres does not support removing enum values, only adding. `drizzle-kit generate` detects the pgEnum change and emits `ALTER TYPE ... ADD VALUE`.
**When to use:** Any time a pgEnum gains a new value.

```sql
-- Source: [ASSUMED] — standard PostgreSQL DDL
-- drizzle-kit will generate this automatically after schema update:
ALTER TYPE "public"."purchase_order_status" ADD VALUE 'confirmed';
```

```typescript
// Source: src/_db/schema/purchase-orders.ts (D-05 change)
export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "draft",
  "sent",
  "received",
  "cancelled",
  "confirmed", // ADD THIS
]);
```

### Pattern 3: Idempotent Seed with Better Auth User Creation

**What:** Wipe all tables in FK-reverse order, then re-insert. Use `auth.api.signUpEmail` (not `db.insert`) for users to get correct password hashing.
**When to use:** Any seed script that must be re-runnable without duplicates.

```typescript
// Source: scripts/seed.ts (gap fix — add verification to wipe)
import { verification as verificationTable } from "@/_db/schema";

async function wipe() {
  await db.delete(transactions);
  await db.delete(serviceOrderItems);
  await db.delete(serviceOrders);
  await db.delete(appointments);
  await db.delete(purchaseOrderItems);
  await db.delete(purchaseOrders);
  await db.delete(vehicles);
  await db.delete(services);
  await db.delete(sessionTable);
  await db.delete(accountTable);
  await db.delete(verificationTable); // ADD THIS — was missing
  await db.delete(userTable);
}
```

Note: `auth.api.signUpEmail` may create entries in the `verification` table depending on Better Auth config. Wiping `verification` before `user` (which it references) avoids FK violations.

### Anti-Patterns to Avoid

- **Direct `db.insert` for users:** Bypasses Better Auth's bcrypt hashing — passwords stored as plaintext. Always use `auth.api.signUpEmail`.
- **`pg.Pool` without `max` in Lambda:** Default `max: 10` per cold start + concurrent invocations = connection exhaustion in Postgres (hard limit on Neon free tier).
- **`drizzle-kit push` in production:** Bypasses the migration journal. Always use `drizzle-kit generate` + `drizzle-kit migrate` for tracked migrations.
- **Dropping/recreating enum in migration:** Postgres does not support `ALTER TYPE ... DROP VALUE`. Only `ADD VALUE` is valid. Attempting to remove values requires table rewrites.

---

## Don't Hand-Roll

| Problem              | Don't Build                 | Use Instead                        | Why                                                                                           |
| -------------------- | --------------------------- | ---------------------------------- | --------------------------------------------------------------------------------------------- |
| Password hashing     | Custom bcrypt calls in seed | `auth.api.signUpEmail`             | Better Auth uses its own argon2/bcrypt config; direct insert creates un-authenticatable users |
| Migration generation | Hand-write ALTER statements | `drizzle-kit generate`             | Kit produces correct snapshot diffs; hand-written SQL can desync the journal                  |
| Session management   | Custom JWT/cookie logic     | Better Auth `nextCookies()` plugin | Already configured; handles SSR cookie edge cases                                             |
| Connection pooling   | Multiple Pool instances     | Existing `globalForDb` singleton   | Multiple pools under Vercel Lambda = connection exhaustion                                    |

---

## Runtime State Inventory

> Phase 5 modifies a live DB schema — runtime state audit required.

| Category            | Items Found                                                                                                                   | Action Required                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Stored data         | Production DB rows (if any exist) in `purchase_orders` with status not `'confirmed'` — unaffected by ADD VALUE (non-breaking) | None — `ALTER TYPE ADD VALUE` is additive only                      |
| Live service config | DATABASE_URL points to Neon pooler (`ep-long-night-apor3afn-pooler`); `.env` is local-only                                    | No change — same URL used for migration and seed                    |
| OS-registered state | None — no task scheduler or pm2 involvement                                                                                   | None                                                                |
| Secrets/env vars    | `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` required for seed and migration                                       | Confirm all set in `.env` before running `db:migrate` and `db:seed` |
| Build artifacts     | `src/_db/migrations/meta/` snapshots must stay in sync — drizzle-kit manages this automatically                               | None — do not manually edit snapshot files                          |

---

## Common Pitfalls

### Pitfall 1: `verification` table missing from wipe()

**What goes wrong:** Seed fails with FK violation on re-run because `verification` rows reference `user.id`. Since `user` is deleted but `verification` is not cleared first, the subsequent `signUpEmail` may or may not conflict, but leaving orphaned rows causes inconsistent data.
**Why it happens:** The table was added by Better Auth and not included in the original `wipe()` implementation.
**How to avoid:** Import `verification` from `@/_db/schema` and add `await db.delete(verificationTable)` before `await db.delete(userTable)` in the `wipe()` function.
**Warning signs:** `ForeignKeyConstraintViolation` or duplicate unique email errors on second seed run.

### Pitfall 2: drizzle-kit snapshot out of sync

**What goes wrong:** Running `drizzle-kit generate` produces a migration that tries to CREATE TYPE for an enum that already exists.
**Why it happens:** The `meta/` snapshot files in `.planning/phases/` are git-deleted (see git status). However the actual `src/_db/migrations/meta/` snapshots appear intact. If schema changes are made without generating, the snapshot diverges.
**How to avoid:** Always run `npm run db:generate` (drizzle-kit generate) after editing schema files, never hand-write migration SQL for schema objects that drizzle-kit tracks.
**Warning signs:** `ERROR: type "purchase_order_status" already exists` during migrate.

### Pitfall 3: Better Auth `signUpEmail` returns different shape across versions

**What goes wrong:** Seed assumes `res.user.id` exists on the response from `auth.api.signUpEmail`. If Better Auth API response shape changes, this silently returns `undefined` and all FK references break.
**Why it happens:** Better Auth is at 1.6.11 (installed) vs 1.6.20 (latest) — minor version drift.
**How to avoid:** The current seed already uses `res.user.id` correctly for v1.6.x. Do not upgrade better-auth mid-phase. After seed runs, verify mechanic/customer IDs are non-null UUIDs before inserting vehicles.
**Warning signs:** `null value in column "owner_id"` FK errors in vehicles insert.

### Pitfall 4: Neon pooler + `pg.Pool` double-pooling

**What goes wrong:** `pg.Pool` with high `max` + Neon's PgBouncer pooler can cause connection count issues or `prepared statement "..." already exists` errors (PgBouncer in transaction mode doesn't support session-level prepared statements).
**Why it happens:** Neon pooler uses PgBouncer in transaction mode by default; `pg` driver uses protocol-level prepared statements.
**How to avoid:** The `max: 3` cap (D-01) minimizes the surface. [ASSUMED] If prepared statement errors appear, add `?pgbouncer=true` to `DATABASE_URL` or disable prepared statements in drizzle config. This is a known pattern with Neon + PgBouncer.
**Warning signs:** `ERROR: prepared statement "drizzle_..." already exists`.

---

## Code Examples

### Pool hardening (complete replacement for `src/_db/index.ts`)

```typescript
// Source: decisions D-01, D-02, D-03 from CONTEXT.md
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
export type Database = typeof db;
```

### Schema update for `purchase-orders.ts` (D-05)

```typescript
// Add 'confirmed' as the 5th enum value — order matters for drizzle snapshot
export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "draft",
  "sent",
  "received",
  "cancelled",
  "confirmed",
]);
```

### Seed `wipe()` fix (D-07 + D-09)

```typescript
import {
  verification as verificationTable,
  // ... other imports
} from "@/_db/schema";

async function wipe() {
  // Reverse FK order:
  await db.delete(transactions);
  await db.delete(serviceOrderItems);
  await db.delete(serviceOrders);
  await db.delete(appointments);
  await db.delete(purchaseOrderItems);
  await db.delete(purchaseOrders);
  await db.delete(vehicles);
  await db.delete(services);
  await db.delete(sessionTable);
  await db.delete(accountTable);
  await db.delete(verificationTable); // ADDED
  await db.delete(userTable);
}
```

---

## State of the Art

| Old Approach                                | Current Approach                                                  | When Changed        | Impact                                |
| ------------------------------------------- | ----------------------------------------------------------------- | ------------------- | ------------------------------------- |
| `new Pool({connectionString})` only         | `Pool` with `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` | Phase 5 (D-01/D-02) | Prevents Lambda connection exhaustion |
| `purchase_order_status` without `confirmed` | Add `confirmed` via ALTER TYPE in migration 0003                  | Phase 5 (D-04/D-05) | Enables INV-02 in Phase 8             |
| `wipe()` without `verification` table       | `wipe()` with all 12 tables in FK-safe order                      | Phase 5 (D-07/D-09) | Seed is truly idempotent              |

---

## Assumptions Log

| #   | Claim                                                                                 | Section                          | Risk if Wrong                                                                          |
| --- | ------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------- |
| A1  | Vercel Lambda connection exhaustion risk with `max > 3`; `max: 3` is safe upper bound | Common Pitfalls / Pool Hardening | Low — Neon pooler mitigates; worst case is slower queries under burst load             |
| A2  | Neon PgBouncer in transaction mode may cause prepared statement conflicts             | Pitfall 4                        | Low — `max: 3` reduces frequency; fix is well-documented (`?pgbouncer=true`)           |
| A3  | `auth.api.signUpEmail` response shape `res.user.id` is stable in better-auth 1.6.x    | Code Examples / Pitfall 3        | Medium — minor version drift (1.6.11 installed vs 1.6.20 latest); test before assuming |

---

## Open Questions

1. **Is the production DB empty or does it have existing data?**
   - What we know: .env points to a live Neon DB; migrations may or may not have been applied.
   - What's unclear: Whether `drizzle-kit migrate` will be a fresh apply or incremental.
   - Recommendation: Run `drizzle-kit migrate` — it checks the journal and is safe either way. If migration 0002 was already applied, it skips it.

2. **Should `verification` wipe be wrapped in a try/catch?**
   - What we know: Better Auth may or may not write to `verification` depending on `emailVerified` flow.
   - What's unclear: Whether `verification` table has rows on a fresh DB.
   - Recommendation: No try/catch needed — `db.delete(verificationTable)` is safe on empty tables (deletes 0 rows, no error).

---

## Environment Availability

| Dependency           | Required By                          | Available                   | Version                     | Fallback                             |
| -------------------- | ------------------------------------ | --------------------------- | --------------------------- | ------------------------------------ |
| `node` / `tsx`       | `npm run db:seed`                    | ✓                           | tsx 4.22.4                  | —                                    |
| `drizzle-kit`        | `npm run db:migrate` / `db:generate` | ✓                           | 0.31.10                     | —                                    |
| `DATABASE_URL`       | migrations, seed                     | ✓                           | Neon pooler URL set in .env | —                                    |
| `BETTER_AUTH_SECRET` | seed (`auth.api.signUpEmail`)        | ✓ (set in .env)             | —                           | —                                    |
| `BETTER_AUTH_URL`    | Better Auth API calls in seed        | ✓ (`http://localhost:3000`) | —                           | Set to localhost for local seed runs |

**Missing dependencies with no fallback:** None.

**Note:** `BETTER_AUTH_URL=http://localhost:3000` is fine for local seed execution. For CI/CD seed runs, this must be updated to match the environment.

---

## Validation Architecture

### Test Framework

| Property           | Value                       |
| ------------------ | --------------------------- |
| Framework          | Vitest 4.x                  |
| Config file        | `vitest.config.ts` (exists) |
| Quick run command  | `npm run test:run`          |
| Full suite command | `npm run test:run`          |

### Phase Requirements → Test Map

| Req ID   | Behavior                                         | Test Type    | Automated Command                                | File Exists?                    |
| -------- | ------------------------------------------------ | ------------ | ------------------------------------------------ | ------------------------------- |
| FOUND-01 | Migration runs without error; 12 tables exist    | manual/smoke | `npm run db:migrate` (observe output)            | ❌ Wave 0 — CLI validation only |
| FOUND-02 | Login with seeded admin user persists session    | manual       | Browser: login → navigate → session still active | ❌ Manual UAT                   |
| FOUND-03 | Seed runs without error; all 12 tables have rows | smoke        | `npm run db:seed` (observe exit 0)               | ❌ Wave 0 — CLI validation      |

> Phase 5 changes are infrastructure-level (pool config, migration DDL, seed script). Automated unit tests are not applicable for these changes — verification is via CLI commands and manual auth flow check.

### Sampling Rate

- **Per task commit:** `npm run typecheck` (catches schema type regressions)
- **Per wave merge:** `npm run test:run && npm run typecheck`
- **Phase gate:** All 4 success criteria met (migrate, login, seed, no connection exhaustion)

### Wave 0 Gaps

- [ ] No test file needed for pool config changes (runtime behavior, not unit-testable)
- [ ] No test file needed for migration DDL (drizzle-kit handles correctness)
- [ ] Consider adding `scripts/seed.ts` smoke test: run seed, query DB, assert row counts — optional enhancement, not required for Phase 5

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category         | Applies | Standard Control                                                                                   |
| --------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| V2 Authentication     | yes     | Better Auth `emailAndPassword` with `minPasswordLength: 8` — already configured                    |
| V3 Session Management | yes     | Better Auth `nextCookies()` plugin — handles secure cookie attributes                              |
| V4 Access Control     | no      | Phase 5 does not add new routes or endpoints                                                       |
| V5 Input Validation   | no      | Seed uses hardcoded data; no user input                                                            |
| V6 Cryptography       | yes     | Password hashing via `auth.api.signUpEmail` (Better Auth internal bcrypt/argon2) — never hand-roll |

### Known Threat Patterns for Phase 5

| Pattern                           | STRIDE                 | Standard Mitigation                                                                            |
| --------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------- |
| Connection string in logs         | Information Disclosure | `DATABASE_URL` must never be logged; pool errors should not expose credentials                 |
| Seed with weak default passwords  | Spoofing               | `senha123` is dev-only; document that seed MUST NOT run against production with real user data |
| SQL injection via drizzle-kit CLI | Tampering              | drizzle-kit reads from trusted local config only — no user input path                          |

---

## Project Constraints (from CLAUDE.md)

- **No `any`/`as unknown`** in new code. The `globalForDb` cast in `index.ts` is pre-existing and acceptable.
- **Server Components by default** — seed script and DB index are server-only (no client imports).
- **No `.default()` in form schemas** — not applicable to Phase 5.
- **Base UI `render` prop, never `asChild`** — not applicable to Phase 5.
- **Next.js 16 + Turbopack** — no routing changes in Phase 5.
- **Read `node_modules/next/dist/docs/` before writing Next.js code** — Phase 5 has no Next.js route changes.

---

## Sources

### Primary (HIGH confidence)

- Codebase: `src/_db/index.ts`, `src/_db/schema/`, `src/_db/migrations/`, `scripts/seed.ts`, `drizzle.config.ts`, `src/_lib/auth.ts` — direct file inspection
- `.env` — confirmed Neon pooler URL, confirmed `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET` present
- `.planning/phases/05-db-foundation-auth/05-CONTEXT.md` — locked decisions D-01 through D-09
- `npm view pg/drizzle-orm/better-auth/drizzle-kit/tsx version` — confirmed installed versions

### Secondary (MEDIUM confidence)

- `.planning/REQUIREMENTS.md` — FOUND-01, FOUND-02, FOUND-03 requirements text
- `.planning/STATE.md` — project decisions and deferred items

### Tertiary (LOW confidence — marked [ASSUMED])

- Neon PgBouncer transaction mode + prepared statement conflict pattern (A2)
- Vercel Lambda `max: 3` safety claim (A1)

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all packages inspected directly in package.json and npm registry
- Architecture: HIGH — all source files read; no speculative assumptions about file structure
- Pitfalls: MEDIUM — pool/PgBouncer pitfalls are [ASSUMED]; verification FK pitfall is HIGH (verified from code)

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (stable infrastructure — 30-day window)
