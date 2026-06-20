# Pitfalls Research

**Domain:** Adding Drizzle ORM live data to existing Next.js 16 AutoShop app (mock → real DB migration)
**Researched:** 2026-06-20
**Confidence:** HIGH (codebase-specific analysis + known ecosystem issues)

---

## Critical Pitfalls

### Pitfall 1: `node-postgres` Pool on Vercel Serverless Exhausts Connections

**What goes wrong:**
`src/_db/index.ts` creates a `new Pool()` with default pool size (10 connections). Each Vercel serverless invocation is a cold process — the `globalThis` trick that prevents pool re-creation in dev does NOT work in production because Vercel does not guarantee process reuse. Under any load, concurrent invocations create new pools, exhausting PostgreSQL `max_connections` (typically 100 on hobby Neon/Supabase tiers). Symptoms: `remaining connection slots are reserved`, timeouts, 500s.

**Why it happens:**
The `globalForDb.pool` pattern is correct for Next.js dev server (single long-lived Node process) but Vercel Functions are isolated per-request in production. The pool accumulates idle connections that are never released.

**How to avoid:**
Switch from `drizzle/node-postgres` + `pg.Pool` to `drizzle/neon-serverless` (if using Neon) or `drizzle/postgres-js` with `postgres` driver configured with `max: 1` for serverless. Alternatively use a connection pooler like PgBouncer or Neon's built-in HTTP driver which is connection-less. The correct pattern for Vercel + Neon is `neon()` HTTP adapter — zero persistent connections.

```ts
// Correct for Vercel + Neon
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
export const db = drizzle(neon(process.env.DATABASE_URL!), { schema });
```

**Warning signs:**

- Works fine locally, fails under load on Vercel
- `FATAL: remaining connection slots are reserved for non-replication superuser connections`
- Dashboard loads slow after deploying even with few users

**Phase to address:**
DB-01 (first task before any other DB module) — change the driver before wiring any data access.

---

### Pitfall 2: Better Auth `additionalFields` Schema Mismatch Breaks Auth Silently

**What goes wrong:**
`auth.ts` declares `role`, `phone` as `additionalFields`. Better Auth's Drizzle adapter infers the user table from the schema passed to `drizzleAdapter()`. If the Drizzle `user` table schema (`src/_db/schema/auth.ts`) and Better Auth's `additionalFields` config diverge — e.g., `role` is a `pgEnum` in Drizzle but Better Auth treats it as `text` — auth operations (sign-in, session fetch) can fail silently or return `undefined` for those fields. The `cpf` and `address` fields exist in the Drizzle schema but are NOT declared in `additionalFields`, meaning Better Auth will not include them in the inferred type or session — queries that join `user.cpf` will work at the DB layer but the session object won't carry them.

**Why it happens:**
Better Auth and Drizzle maintain two separate type systems. Developers assume "I have the field in Drizzle schema → it works everywhere." Better Auth only exposes fields it explicitly knows about.

**How to avoid:**
Ensure every extra column used in the app (cpf, address, phone) is declared in `additionalFields` in `auth.ts`. The `role` field uses `pgEnum` in Drizzle — make sure the `type: "string"` in `additionalFields` aligns (Better Auth maps enums as strings, this is fine, but verify the default value matches the enum default). Run `npx better-auth generate` after any schema change to validate the adapter sees the correct shape.

**Warning signs:**

- `session.user.cpf` is `undefined` at runtime despite existing in the DB row
- `getSession()` returns user without role field
- TypeScript `auth.$Infer.Session` doesn't include the expected fields

**Phase to address:**
DB-01 — validate Better Auth ↔ Drizzle adapter schema parity before any other module.

---

### Pitfall 3: `numeric` Columns Return Strings — Mock Data Used Numbers

**What goes wrong:**
`totalAmount`, `unitPrice`, `amount` are defined as `numeric(12,2)` in Postgres. Drizzle returns these as `string` (JavaScript has no decimal type). Mock data used `total: number`. Components that received `total: number` from mock now receive `totalAmount: string` from Drizzle. `formatCurrency(row.totalAmount)` may silently pass a string to a function expecting number, producing `"R$ NaN"` or incorrect output.

Specific locations at risk:

- `OrderRow.totalAmount: string` — already typed correctly in `_data-access/orders.ts`
- `finance.ts` correctly calls `Number(r.amount)` — safe
- Any component that spread mock order objects directly needs audit
- `customers.ts` `totalSpent: sql<number>` is cast at query level — safe

**Why it happens:**
PostgreSQL `numeric` → Drizzle → JS is always `string`. Mock data used plain number literals. When switching from mock to live, component props or formatter calls pass a string where a number was expected. TypeScript often doesn't catch this because the mock type and Drizzle type were defined separately, and the component accepted the mock type.

**How to avoid:**
Audit every place `totalAmount`, `unitPrice`, `amount` is consumed in components. If the component prop type says `number`, either change the prop to `string` and convert in the component, or always call `Number()` in the data-access layer before returning. Prefer the `sql<number>` cast pattern already used in `customers.ts` for aggregates. For non-aggregate numeric columns, use a mapper function.

**Warning signs:**

- "R$ NaN" or "R$0" displayed where amounts should appear
- `typeof row.totalAmount === 'string'` in a path that calls `toFixed()`
- `tsc --noEmit` misses this when both sides typed as `any` or the mock type used `number | string`

**Phase to address:**
DB-02 (orders CRUD) and DB-06 (finance) — add a type audit step before each module ships.

---

### Pitfall 4: N+1 Queries in Dashboard and Notification Data Access

**What goes wrong:**
`getUpcomingDeliveries()` and `getNotifications()` in `dashboard.ts` use a `for` loop with individual `db.select().where(eq(vehicles.id, ...))` calls per order. Same pattern in `getOrderById()` which fires separate queries for vehicle, customer, mechanic, and items. On mock data this is invisible. With real data, a dashboard load with 4 upcoming deliveries + 3 recent completions triggers 14+ sequential DB round-trips. On Vercel (serverless, each query opens a connection), this causes slow dashboard renders and amplifies the connection exhaustion problem from Pitfall 1.

**Why it happens:**
The pattern was written for correctness while on mock data — it's trivially easy to write and passes TypeScript. The cost only appears under real latency.

**How to avoid:**
Replace per-loop queries with `inArray` batch fetches or proper `leftJoin` at the query level. For `getUpcomingDeliveries`, join vehicles and user in a single query. For `getNotifications`, collect all vehicleIds, batch-fetch. For `getOrderById`, use a single query with joins (already possible since relations are defined in schema).

**Warning signs:**

- Dashboard takes 2-4s to load
- Vercel function duration logs show 500ms+ per invocation
- Connection count spikes on every page load

**Phase to address:**
DB-06 (dashboard/analytics) and DB-02 (order detail) — fix joins before production load.

---

### Pitfall 5: `user` Table Shared Between Better Auth Internal Records and Customer Records

**What goes wrong:**
Customers are stored as rows in the `user` table with `role = 'customer'`. Better Auth also manages auth internal users in the same table. `createCustomerAction` manually inserts into `user` with a `crypto.randomUUID()` ID — these rows have no password entry in `account` table, no session, no auth context. If a customer later registers via email/password, Better Auth will try to create a new `user` row with the same email, hitting the `UNIQUE` constraint on `email` and throwing a DB error that surfaces as a generic auth failure.

**Why it happens:**
Using the auth user table as a CRM customer table is a common pattern that breaks the moment someone tries to register an account using the same email they were registered under as a "customer" record.

**How to avoid:**
Two mitigations: (a) check for email uniqueness in `createCustomerAction` before insert and return a user-facing error if the email exists, or (b) separate customer CRM records from auth users (bigger refactor, out of scope for this milestone). For v1.1, implement (a): query `db.select().from(user).where(eq(user.email, parsedInput.email)).limit(1)` before insert and surface a clear error.

**Warning signs:**

- `duplicate key value violates unique constraint "user_email_unique"` in Vercel logs
- Users report "can't create account" after being added as customer manually
- `createCustomerAction` throws in production with no UI error shown

**Phase to address:**
DB-03 (customers CRUD) — add email uniqueness guard before going live.

---

### Pitfall 6: Drizzle `$defaultFn` Does Not Execute on Server Action `update()` Calls

**What goes wrong:**
`updatedAt` columns use `.$defaultFn(() => new Date())`. `$defaultFn` only fires on INSERT. UPDATE queries must explicitly set `updatedAt: new Date()`. Several update actions already do this correctly (`updateOrderStatusAction` sets `updatedAt: new Date()`). But if any update action omits it (e.g., `approveOrderItemAction`, `updateCustomerAction`), the `updatedAt` column stays stale. This is invisible in mock data, and sorting/filtering by `updatedAt` in the UI will show stale timestamps.

**Why it happens:**
Developers assume `$defaultFn` = "auto-managed timestamp." In Drizzle, it's an insert-only default. Prisma's `@updatedAt` directive works on update; Drizzle does not have an equivalent.

**How to avoid:**
Add `updatedAt: new Date()` to every `.set({})` call in every update action. Add a code-review checklist item: "Does this UPDATE include `updatedAt: new Date()`?"

Confirmed missing in this codebase:

- `approveOrderItemAction` — no `updatedAt` in `.set()`
- `updateCustomerAction` — no `updatedAt` in `.set()`

**Warning signs:**

- `updated_at` column frozen at creation time despite rows being modified
- Sorting by "last modified" shows wrong order in orders list

**Phase to address:**
DB-02 (orders), DB-03 (customers) — fix before each module ships.

---

## Technical Debt Patterns

| Shortcut                                                 | Immediate Benefit                    | Long-term Cost                                                                | When Acceptable                                           |
| -------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------- | --------------------------------------------------------- |
| `globalThis` pool trick for `pg.Pool`                    | Works in dev without changing driver | Silent connection exhaustion on Vercel production                             | Never for serverless deployment                           |
| `sql.raw(String(days))` in finance queries               | Avoids parameterization complexity   | SQL injection risk if `days` ever comes from user input                       | Only if value is always internal constant                 |
| Storing customers in `user` table                        | No extra table or join needed        | Auth email conflicts, no CRM fields without polluting auth schema             | Acceptable for v1.1 if email guard added                  |
| Per-row DB queries in loops (dashboard)                  | Simple to read and write             | N+1 queries, slow renders, connection exhaustion                              | Only in mock data prototype phase, never in production    |
| `approved: true` hardcoded on `serviceOrderItems` insert | Simpler create flow                  | Items auto-approved; budget approval flow has no effect on new order creation | Acceptable if budget page re-approves items post-creation |

---

## Integration Gotchas

| Integration                         | Common Mistake                                                   | Correct Approach                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Better Auth Drizzle adapter         | Pass entire `schema` glob import to adapter                      | Pass only the 4 required tables: `{ user, session, account, verification }` — already correct in `auth.ts`   |
| Better Auth `additionalFields`      | Declare fields only in Drizzle schema, not in `additionalFields` | Every non-standard user field must be in both places                                                         |
| Drizzle + Vercel                    | Use `pg.Pool` (long-lived connections)                           | Use `neon-http` or `postgres-js` with `max: 1` for stateless serverless                                      |
| `revalidatePath` in server actions  | Revalidate only the list page, not the detail page               | Both `/orders` and `/orders/[id]` need revalidation after status change — partially done, verify all actions |
| Drizzle migrations on Vercel deploy | Run `db:migrate` manually                                        | Add `db:migrate` to Vercel build command or use a migration script in CI — not wired yet                     |

---

## Performance Traps

| Trap                                                                         | Symptoms                                    | Prevention                                                                                                                                      | When It Breaks                                |
| ---------------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `pg.Pool` on serverless                                                      | Connection limit errors on moderate traffic | Switch to serverless-compatible driver                                                                                                          | ~5-10 concurrent users on hobby Postgres tier |
| N+1 in `getUpcomingDeliveries` loop                                          | Dashboard slow on any real data             | Replace loop queries with batch `inArray` or join                                                                                               | From first production use                     |
| `listCustomers` aggregation without index on `customer_id` FK                | Customer list slow as orders grow           | Ensure FK columns are indexed (Drizzle FK adds index only if explicitly declared with `.references()` — does add index on PG, verify migration) | ~1000+ service orders                         |
| `getFinanceMetrics` full table scan with no date index                       | Finance page slow as transactions grow      | Add index on `transactions.date`                                                                                                                | ~10k+ transaction rows                        |
| `listOrders` fetching mechanic names in a separate batch query per page load | Double query on every order list render     | Join `user` twice (aliased) in a single query                                                                                                   | Any number of concurrent users                |

---

## Security Mistakes

| Mistake                                                  | Risk                                                     | Prevention                                                               |
| -------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------ |
| `sql.raw(String(days))` in `getFinanceMetrics`           | SQL injection if `days` param ever exposed to user input | Validate `days` is always a hardcoded constant; add lint rule or comment |
| Customer insert without email uniqueness check           | Auth system broken, user data silently overwritten       | Query before insert in `createCustomerAction`                            |
| `DATABASE_URL` with full superuser credentials           | Full DB access if env var leaks                          | Use a least-privilege DB role for the app; superuser only for migrations |
| `revalidatePath("/orders")` without auth check in action | N/A here (authActionClient enforces auth)                | Already correct — `authActionClient` on all mutating actions             |

---

## UX Pitfalls

| Pitfall                                                  | User Impact                                 | Better Approach                                                                                                         |
| -------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Empty states show instantly during DB fetch              | Page flashes empty before data arrives      | Server Components with `loading.tsx` or Suspense boundaries already in place — verify they're wired for DB-backed pages |
| `totalAmount` returning `"0"` string from fresh DB       | Order list shows R$0.00 for all new orders  | Always `Number()` numeric columns before returning from data-access layer                                               |
| `orderNumber` from `serial` starts at 1                  | Looks like an empty system to first users   | Expected — serial auto-increments; no action needed unless sequential gap is a concern                                  |
| Order detail page crashes if `vehicleId` not found in DB | 500 instead of graceful "vehicle not found" | `getOrderById` already guards with optional chaining — verify no `!` non-null assertions in consumers                   |

---

## "Looks Done But Isn't" Checklist

- [ ] **DB migrations applied to production:** `db:migrate` must run against the real DB before any code that queries it. Not wired to Vercel build yet — verify.
- [ ] **Better Auth schema generated:** `npx better-auth generate` or verify adapter schema matches Drizzle tables — session fields, `role` enum cast.
- [ ] **Connection driver swapped:** `pg.Pool` + `node-postgres` works locally but fails silently on Vercel under load — swap before first deploy.
- [ ] **`updatedAt` in all UPDATE actions:** `approveOrderItemAction` and `updateCustomerAction` are missing it — check all update paths.
- [ ] **`revalidatePath` coverage complete:** After budget approval, order status change, and customer update — verify all affected routes are revalidated.
- [ ] **Numeric → number conversion:** Every `numeric` column surfaced to UI must be wrapped with `Number()` or typed as `string` with formatter that handles strings.
- [ ] **Email uniqueness guard in `createCustomerAction`:** No guard exists — add before DB-03 ships.
- [ ] **`proxy.ts` reads session from DB-backed auth:** `getSession()` calls `auth.api.getSession()` which hits the DB. If DB is unavailable, every route returns 401. Add error handling.

---

## Recovery Strategies

| Pitfall                               | Recovery Cost | Recovery Steps                                                                 |
| ------------------------------------- | ------------- | ------------------------------------------------------------------------------ |
| Connection exhaustion in production   | MEDIUM        | Switch driver to `neon-http`, redeploy, restart DB pooler                      |
| Better Auth schema mismatch on deploy | HIGH          | Run `npx better-auth generate`, diff schema, apply missing migration, redeploy |
| `totalAmount` shown as NaN in UI      | LOW           | Add `Number()` wrapper in data-access, `revalidatePath` clears cache           |
| N+1 query slowness                    | MEDIUM        | Refactor to joins, measure with Vercel function logs                           |
| Email conflict in `user` table        | LOW           | Add uniqueness check in action, return user-facing error                       |
| Migrations not applied to production  | HIGH          | `npx drizzle-kit migrate` against production `DATABASE_URL`, then redeploy     |

---

## Pitfall-to-Phase Mapping

| Pitfall                                    | Prevention Phase                  | Verification                                                                            |
| ------------------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------- |
| `pg.Pool` serverless connection exhaustion | DB-01 (foundation)                | Deploy a single DB-backed route to Vercel, load test with 10 concurrent requests        |
| Better Auth schema mismatch                | DB-01 (foundation)                | `getSession()` returns `session.user.role`, `session.user.phone` without undefined      |
| Numeric columns returned as strings        | DB-02 (orders) and all subsequent | `npx tsc --noEmit` with strict prop types; manually verify R$ amounts in UI             |
| N+1 queries in dashboard                   | DB-06 (dashboard/analytics)       | Vercel function duration < 500ms for dashboard route                                    |
| Shared user table email conflicts          | DB-03 (customers)                 | Attempt to create customer with existing auth email — expect user-facing error, not 500 |
| Missing `updatedAt` on updates             | DB-02 (orders), DB-03 (customers) | Query `updated_at` directly after update, verify timestamp changed                      |
| Migrations not wired to deploy             | DB-01 (foundation)                | Document and execute `db:migrate` step in deployment runbook                            |

---

## Sources

- Codebase inspection: `src/_db/index.ts`, `src/_lib/auth.ts`, `src/_db/schema/`, `src/_data-access/`, `src/_actions/`
- Drizzle ORM docs on `$defaultFn` behavior (insert-only): https://orm.drizzle.team/docs/column-types/pg#default-value
- Better Auth Drizzle adapter docs on `additionalFields`: https://www.better-auth.com/docs/concepts/database#additional-fields
- Vercel serverless PostgreSQL connection patterns: https://vercel.com/docs/storage/vercel-postgres/sdk#connecting-to-the-database
- Known Neon + Drizzle serverless pattern: https://neon.tech/docs/serverless/serverless-driver

---

_Pitfalls research for: Drizzle ORM DB integration into Next.js 16 AutoShop (Precision Auto)_
_Researched: 2026-06-20_
