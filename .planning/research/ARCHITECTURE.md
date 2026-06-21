# Architecture Research

**Domain:** Next.js 16 App Router + Drizzle ORM DB Integration (AutoShop Manager)
**Researched:** 2026-06-20
**Confidence:** HIGH — based on direct codebase inspection, not speculation

---

## Current State Assessment

The DB integration is **further along than a typical "wiring" milestone**. Direct codebase inspection reveals:

- `src/_db/index.ts` — db client exists, uses `drizzle-orm/node-postgres` + `pg.Pool`
- `src/_db/schema/` — full schema exists (auth, vehicles, service-orders, appointments, services, transactions, purchase-orders)
- `src/_db/migrations/` — 3 migration files generated and ready
- `src/_lib/auth.ts` — Better Auth already wired to Drizzle via `drizzleAdapter(db, { provider: "pg", schema: {...} })`
- `src/_data-access/*.ts` — ALL modules already import from `@/_db` and write real Drizzle queries
- `src/_actions/*.ts` — ALL server actions already write directly to DB via `db.insert/update/delete`
- `src/_helpers/mock-data.ts` — exists but is **not imported by any page or data-access file**; only referenced in `status-chart.tsx` (one component using mock chart data)

**The architecture is complete. The remaining work is:**

1. Running migrations against a real database
2. Seeding initial data so the UI renders non-empty states
3. One remaining mock reference: `status-chart.tsx` chart demo data

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (Client)                            │
│  ┌──────────────────────────┐  ┌────────────────────────────┐  │
│  │  Server Components        │  │  Client Components          │  │
│  │  (page.tsx, layout.tsx)  │  │  (*-client.tsx, drawers)   │  │
│  │  — direct data-access fn │  │  — call server actions      │  │
│  │  — no useState/useEffect │  │    via next-safe-action     │  │
│  └──────────┬───────────────┘  └───────────┬────────────────┘  │
└─────────────┼─────────────────────────────┼────────────────────┘
              │ await (RSC)                  │ POST (RPC)
              ▼                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Server Edge                         │
│  ┌────────────────────────┐  ┌────────────────────────────────┐ │
│  │  src/_data-access/     │  │  src/_actions/                 │ │
│  │  "server-only" module  │  │  "use server" + authActionClient│ │
│  │  — read queries only   │  │  — Zod validation              │ │
│  │  — typed return shapes │  │  — write queries + revalidate  │ │
│  └──────────┬─────────────┘  └──────────────┬─────────────────┘ │
│             │                               │                   │
│  ┌──────────▼───────────────────────────────▼─────────────────┐ │
│  │                    src/_db/index.ts                         │ │
│  │   drizzle(pool, { schema })  ← singleton via globalThis    │ │
│  └──────────────────────────────┬──────────────────────────────┘ │
└─────────────────────────────────┼──────────────────────────────┘
                                  │ TCP (pg wire protocol)
                                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL 17                               │
│   Tables: user, session, account, verification,                 │
│           vehicles, service_orders, service_order_items,        │
│           services (parts), appointments,                       │
│           transactions, purchase_orders, purchase_order_items  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Responsibilities

| Component                         | Responsibility                                                          | File Pattern                     |
| --------------------------------- | ----------------------------------------------------------------------- | -------------------------------- |
| Server Component (`page.tsx`)     | Fetch data at request time, compose layout, pass props to Client        | `app/(dashboard)/*/page.tsx`     |
| Client Component (`*-client.tsx`) | UI interactivity, form state, action dispatch                           | `app/(dashboard)/*/*-client.tsx` |
| Data Access (`_data-access/`)     | Read-only DB queries, typed return shapes, `"server-only"` guard        | `_data-access/*.ts`              |
| Server Actions (`_actions/`)      | Mutations via `authActionClient`, Zod validation, `revalidatePath`      | `_actions/*.ts`                  |
| DB Client (`_db/index.ts`)        | Single `drizzle(pool)` instance via `globalThis` singleton pattern      | `_db/index.ts`                   |
| Auth (`_lib/auth.ts`)             | Better Auth config with `drizzleAdapter` pointing to same `db` instance | `_lib/auth.ts`                   |

---

## Architectural Patterns

### Pattern 1: Server Component → Data Access (Read Path)

**What:** `page.tsx` calls data-access functions directly with `await`. No API routes. Data flows as plain typed objects into JSX props.

**When to use:** All read operations for initial page render.

**Trade-offs:** Zero round-trips, full type safety, no serialization boundary issues. Cannot be called from Client Components.

**Current implementation (already in place):**

```typescript
// src/app/(dashboard)/page.tsx
export default async function DashboardPage() {
  const [metrics, ordersResult, statusDist, upcomingRaw] = await Promise.all([
    getDashboardMetrics(),
    listOrders(undefined, 1, 10),
    getStatusDistribution(),
    getUpcomingDeliveries(4),
  ]);
  // Pass to JSX directly — no useState, no fetch
}
```

### Pattern 2: Client Component → Server Action (Write Path)

**What:** Client components use `next-safe-action`'s `useAction` hook. Actions are authenticated via `authActionClient` middleware that validates the Better Auth session on every call.

**When to use:** All mutations (create, update, delete) and any client-initiated data fetch.

**Trade-offs:** Auth enforcement is automatic. `revalidatePath` triggers RSC re-render after mutation.

**Current implementation (already in place):**

```typescript
// src/_actions/orders.ts
export const createOrderAction = authActionClient
  .schema(z.object({ ... }))
  .action(async ({ parsedInput, ctx }) => {
    // ctx.user is the authenticated user (from Better Auth session)
    const [order] = await db.insert(serviceOrders).values({ ... }).returning();
    revalidatePath("/orders");
    return { id: order.id };
  });
```

### Pattern 3: DB Singleton via `globalThis`

**What:** Pool is attached to `globalThis` in development to survive HMR reloads. In production (Vercel), each serverless invocation gets a fresh module — the `globalThis` guard is a no-op.

**When to use:** Already applied. Do not change.

**Trade-offs:** Prevents "too many connections" during local dev. On Vercel's serverless, each function invocation is isolated — `pg.Pool` with a small `max` is the correct approach (not a single connection).

**Current implementation:**

```typescript
// src/_db/index.ts — already correct
const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;
export const db = drizzle(pool, { schema });
```

**Vercel constraint:** Each serverless function starts its own pool. With default `pg.Pool` settings (`max: 10`), heavy concurrent traffic can exhaust Postgres connections. Mitigation: set `max: 3` in the Pool constructor, or switch to `@neondatabase/serverless` if using Neon (HTTP-based, no persistent connections needed).

### Pattern 4: Better Auth ↔ Drizzle Adapter

**What:** Better Auth is wired to the same `db` instance via `drizzleAdapter`. It reads/writes to the `user`, `session`, `account`, `verification` tables directly through Drizzle — no separate auth DB. App queries (orders, vehicles) JOIN to `user` by `user.id`.

**Current implementation (already in place):**

```typescript
// src/_lib/auth.ts
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user, session, account, verification },
  }),
  // ...
});
```

**Key implication:** `createCustomerAction` inserts into `user` with `role: "customer"`. This is intentional — customers are users without login credentials. The `user.id` is then used as FK in `vehicles.ownerId`, `serviceOrders.customerId`. No separate `customers` table exists or is needed.

---

## Data Flow

### Read Path (Server Component)

```
Browser request → Next.js RSC render
  → page.tsx calls data-access fn (e.g., listOrders())
  → _data-access/orders.ts executes Drizzle query
  → db (Pool) sends SQL to Postgres
  → typed rows returned → mapped to typed shapes
  → passed as props to JSX → streamed HTML to browser
```

### Write Path (Client Action)

```
User submits form in Client Component
  → useAction(someAction).execute(payload)
  → POST to /api/action/[action-name] (internal Next.js route)
  → authActionClient middleware: auth.api.getSession(headers)
  → if !session → throws ActionError("Não autenticado")
  → parsedInput validated by Zod schema
  → action handler: db.insert/update/delete
  → revalidatePath("/route") → Next.js invalidates RSC cache
  → Client receives { data } or { serverError }
  → toast.success/error shown via Sonner
  → page RSC re-renders with fresh DB data
```

### Auth Flow (Better Auth)

```
Login form → Better Auth handler (/api/auth/[...all])
  → drizzleAdapter queries user table (email lookup)
  → verifies password (stored in account.password, hashed)
  → creates session row in session table
  → sets httpOnly session cookie
  → subsequent requests: authActionClient reads cookie via headers()
  → auth.api.getSession() validates against session table
```

---

## Integration Points

### Files Modified vs New

| Status    | File                                         | Change                                             |
| --------- | -------------------------------------------- | -------------------------------------------------- |
| DONE      | `src/_db/index.ts`                           | DB client — complete                               |
| DONE      | `src/_lib/auth.ts`                           | Better Auth + drizzleAdapter — complete            |
| DONE      | `src/_actions/orders.ts`                     | Full CRUD — complete                               |
| DONE      | `src/_actions/customers.ts`                  | Create/update customer + vehicle — complete        |
| DONE      | `src/_actions/appointments.ts`               | Create + status update — complete                  |
| DONE      | `src/_actions/inventory.ts`                  | Parts + purchase orders — complete                 |
| DONE      | `src/_data-access/orders.ts`                 | listOrders, getOrderById — complete                |
| DONE      | `src/_data-access/customers.ts`              | listCustomers, getCustomerById — complete          |
| DONE      | `src/_data-access/dashboard.ts`              | Metrics, status dist, notifications — complete     |
| DONE      | `src/_data-access/finance.ts`                | Transactions, cash flow, metrics — complete        |
| DONE      | `src/_data-access/analytics.ts`              | KPIs, revenue, mechanic perf — complete            |
| DONE      | `src/_data-access/inventory.ts`              | Parts, low stock, purchase orders — complete       |
| DONE      | `src/_data-access/appointments.ts`           | listAppointments with joins — complete             |
| REMAINING | `src/_db/migrations/`                        | Need to run `drizzle-kit migrate` against real DB  |
| REMAINING | Seed script                                  | Need initial data so UI shows non-empty states     |
| REMAINING | `src/_components/dashboard/status-chart.tsx` | One mock import to remove                          |
| REMAINING | `src/_helpers/mock-data.ts`                  | Can be deleted after seed script covers its shapes |
| POSSIBLE  | `src/_db/index.ts` Pool config               | Add `max: 3` for Vercel serverless                 |

### N+1 Query Issues Found

The following data-access functions use sequential queries in loops instead of batched JOINs. These work but are inefficient at scale:

| File                        | Function                | Problem                                                              | Fix                                     |
| --------------------------- | ----------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `_data-access/dashboard.ts` | `getUpcomingDeliveries` | Loops `getOrderById` → separate vehicle + customer queries per order | Single JOIN query                       |
| `_data-access/dashboard.ts` | `getNotifications`      | Loop fetches vehicle per completed order                             | Collect IDs, single `WHERE id IN (...)` |
| `_data-access/orders.ts`    | `getOrderById`          | 4 separate selects for order, vehicle, customer, mechanic            | Single JOIN or `with` clause            |

These are pre-existing in the codebase. Flag for a follow-up optimization pass, but do not block DB wiring work on them.

---

## Connection Pooling for Vercel Serverless

**Confirmed configuration (current):**

```typescript
new Pool({ connectionString: process.env.DATABASE_URL });
// Default max: 10 connections per pool instance
```

**Risk:** Vercel can spawn many concurrent Lambda functions. With `max: 10` per function and bursts of 20+ concurrent requests, this exceeds typical Postgres `max_connections` (100 default on small instances).

**Recommended fix:**

```typescript
new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 3, // Conservative for serverless
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
});
```

**If using Neon (recommended for Vercel):** Replace `drizzle-orm/node-postgres` + `pg` with `@neondatabase/serverless` + `drizzle-orm/neon-http`. Neon's HTTP driver is stateless — no pooling needed, no connection exhaustion risk. This is a one-file change (`_db/index.ts`).

---

## Recommended Build Order for v1.1

Based on dependency analysis — each step unblocks the next:

| Step | Task                                                                             | Why This Order                                                  |
| ---- | -------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| 1    | Run `drizzle-kit migrate` against real DATABASE_URL                              | Everything else depends on tables existing                      |
| 2    | Verify Better Auth tables created (`user`, `session`, `account`, `verification`) | Auth must work before any authenticated route                   |
| 3    | Register first admin user via `/register`                                        | Needed to test all auth-gated actions                           |
| 4    | Smoke-test Dashboard page                                                        | Queries real DB, shows empty states — confirms connection works |
| 5    | Smoke-test Orders: create via wizard, list, update status, view budget           | Core flow, most complex schema (vehicle FK, items)              |
| 6    | Smoke-test Customers: create, view detail, customer's orders                     | Depends on users + vehicles                                     |
| 7    | Smoke-test Inventory: add part, update stock, create purchase order              | Independent of orders/customers                                 |
| 8    | Smoke-test Appointments: create, status update, calendar view                    | Depends on customers + vehicles + mechanics                     |
| 9    | Smoke-test Finance: transactions list, metrics, cash flow                        | Depends on service_orders table having data                     |
| 10   | Smoke-test Analytics: KPIs, monthly revenue, mechanic perf                       | Depends on transactions + orders having data                    |
| 11   | Write seed script (`scripts/seed.ts`)                                            | Creates realistic test data for all modules                     |
| 12   | Fix `status-chart.tsx` mock import                                               | Polish: replace static demo data with real status distribution  |
| 13   | Pool config: add `max: 3` or switch to Neon HTTP driver                          | Pre-Vercel-deploy hardening                                     |
| 14   | Delete `src/_helpers/mock-data.ts`                                               | Cleanup after seed covers all shapes                            |

---

## Anti-Patterns

### Anti-Pattern 1: Direct DB in Client Components

**What people do:** Import `db` in a `"use client"` file.

**Why it's wrong:** Impossible — `"server-only"` guard on `_db/index.ts` will throw at build time. But also: would expose credentials in the client bundle.

**Do this instead:** Use server actions (`authActionClient`) for all client-initiated DB access.

### Anti-Pattern 2: Bypassing `authActionClient` for Protected Mutations

**What people do:** Write mutations in a bare `"use server"` function without `authActionClient`.

**Why it's wrong:** No session check — any unauthenticated request can mutate data.

**Do this instead:** All mutation actions must use `authActionClient`. The middleware reads `auth.api.getSession(headers)` and throws `ActionError("Não autenticado")` if no valid session exists.

### Anti-Pattern 3: Calling `revalidatePath` in Data Access Functions

**What people do:** Put `revalidatePath` in `_data-access/` read functions.

**Why it's wrong:** `_data-access/` is read-only by convention. `revalidatePath` belongs only in `_actions/` after writes.

**Do this instead:** `revalidatePath` only in `_actions/*.ts`, after `db.insert/update/delete` completes.

### Anti-Pattern 4: Multiple `db` Instances

**What people do:** Instantiate `drizzle(new Pool(...))` in multiple files.

**Why it's wrong:** Each `new Pool()` opens its own connection pool. Under Vercel serverless this multiplies connection exhaustion risk. In dev, HMR creates unbounded instances.

**Do this instead:** Always import `db` from `@/_db` — one canonical export, singleton via `globalThis`.

---

## Sources

- Direct inspection of `src/_db/`, `src/_data-access/`, `src/_actions/`, `src/_lib/auth.ts` — HIGH confidence
- Drizzle ORM `drizzle-orm/node-postgres` + `pg.Pool` behavior for serverless — confirmed from package.json (`pg ^8.21.0`, `drizzle-orm ^0.45.2`)
- Better Auth `drizzleAdapter` usage — confirmed in `src/_lib/auth.ts` (better-auth ^1.6.11)
- Vercel serverless connection pool constraints — MEDIUM confidence (well-known pattern, not verified against Vercel current docs)

---

_Architecture research for: AutoShop Manager v1.1 DB Integration_
_Researched: 2026-06-20_
