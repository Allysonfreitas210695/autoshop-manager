# Project Research Summary

**Project:** Precision Auto — v1.1 DB Integration
**Domain:** AutoShop Management SaaS (Next.js 16 App Router + Drizzle ORM + PostgreSQL)
**Researched:** 2026-06-20
**Confidence:** HIGH

## Executive Summary

This is not a typical "wiring" milestone. Direct codebase inspection reveals that DB integration is substantially complete: all data-access functions and server actions already import from `@/_db`, write real Drizzle queries, and are wired into pages. The mock-data file is not imported by any app page. The v1.1 milestone is an **audit, gap-fix, and verify** milestone — not a from-scratch wiring exercise. The stack is frozen (no new packages), the schema is complete (12 tables with relations and 3 migration files), and Better Auth is already wired to Drizzle via `drizzleAdapter`.

Four concrete schema/behavioral gaps must be closed before the app is reliable on a real DB: (1) closing a service order does not auto-insert a `transactions` row, which means Finance and Analytics pages will show zeroes forever; (2) the `appointments` table is missing `serviceType` and `duration` columns that the form collects; (3) the `purchase_orders` status enum is missing the `confirmed` value that exists in the mock; (4) `analytics.ts` returns sentinel value `-1` for NPS and returnRate, and the UI must guard against displaying `-1%`.

The critical deployment risk is `pg.Pool` connection exhaustion on Vercel serverless. The current singleton pool pattern works in local dev but silently fails under concurrent load in production because Vercel does not reuse Node processes across Lambda invocations. This must be addressed in the foundation phase before any other module is deployed. Switching to Neon's HTTP driver (`drizzle-orm/neon-http`) eliminates the risk entirely and is a one-file change.

## Key Findings

### Recommended Stack

No new packages are needed. The data layer (`drizzle-orm ^0.45.2`, `drizzle-kit ^0.31.10`, `pg ^8.21.0`, `better-auth ^1.6.11`) is fully installed and configured. The only recommended stack change is swapping the PostgreSQL driver from `pg.Pool` (node-postgres) to the Neon HTTP driver to eliminate serverless connection exhaustion — a one-file change in `src/_db/index.ts`.

**Core technologies:**

- `drizzle-orm` + `drizzle-kit`: ORM + migrations — already installed, schema complete, 3 migrations ready
- `pg` / `neon-serverless`: PostgreSQL driver — swap to `neon-http` before Vercel deploy
- `better-auth` + `drizzleAdapter`: Auth wired to same `db` instance — complete, no changes needed
- `next-safe-action` + `authActionClient`: Mutation auth enforcement — all actions already use it

### Expected Features

**Must have (table stakes for real-DB launch):**

- Empty states on every list screen (Orders, Customers, Inventory, Appointments, Finance) without crashing
- O.S. close → auto-insert `transactions` row (Finance/Analytics show zeroes without this)
- `OrderDetailPanel` calls real `getOrderDetailAction` (not mock `getMockOrderById`)
- Appointment schema fix: add `serviceType` + `duration` migration OR remove fields from form
- Purchase order `confirmed` status: add to DB enum OR remove from status flow
- Analytics `-1` sentinel values display as "N/D" not "-1%"
- Dashboard `revenueToday` removed or computed from real transactions (not in `getDashboardMetrics`)
- Customer detail `nextServices` section stubbed/removed (no DB source)

**Should have (behavioral upgrades):**

- Stock auto-decrement when O.S. closes (requires transaction wrapping parts consumption)
- Server-side order search by plate/customer name
- Per-status order counts on tab headers
- Email uniqueness guard in `createCustomerAction` before customer → user table insert

**Defer (v2+):**

- Real-time order status updates (WebSocket/SSE)
- Customer ratings / NPS collection
- Finance transaction manual entry UI
- Multi-shop support

### Architecture Approach

The architecture follows a strict read/write separation: Server Components call `_data-access/` functions directly (no API routes, no client fetches); Client Components call `_actions/` via `useAction` (next-safe-action), which are protected by `authActionClient` middleware that validates the Better Auth session on every call. This pattern is already fully implemented across all 7 modules. The remaining work is behavioral gaps and data correctness, not structural changes.

**Major components:**

1. `src/_db/index.ts` — singleton `drizzle(pool, { schema })` via `globalThis` guard; needs Pool config tightened (`max: 3`) or driver swap to Neon HTTP
2. `src/_data-access/*.ts` — read-only Drizzle queries, "server-only" guarded; N+1 patterns in `dashboard.ts` need refactoring before production load
3. `src/_actions/*.ts` — all mutations via `authActionClient` + Zod validation + `revalidatePath`; missing `updatedAt` in two update actions (`approveOrderItemAction`, `updateCustomerAction`)
4. `src/_db/schema/` — 12 tables fully defined with relations; appointments table missing 2 columns, purchase_orders enum missing one value
5. `src/_lib/auth.ts` — Better Auth with `drizzleAdapter`; customers stored as `user` rows with `role: 'customer'` — email conflict risk requires guard in `createCustomerAction`

### Critical Pitfalls

1. **`pg.Pool` connection exhaustion on Vercel serverless** — switch to `drizzle-orm/neon-http` in `src/_db/index.ts` before any Vercel deploy; default pool of 10 per Lambda invocation exhausts Postgres `max_connections` (~100) at ~10 concurrent users
2. **`numeric` columns return strings from Drizzle** — `totalAmount`, `unitPrice`, `amount` are `numeric(12,2)` → JS `string`; UI components expecting `number` will render "R$ NaN"; audit every component consuming these fields and wrap with `Number()` in data-access layer
3. **N+1 queries in dashboard** — `getUpcomingDeliveries` and `getNotifications` loop individual queries per order; dashboard will take 2-4s on first real data; replace with `inArray` batch or single JOIN query
4. **O.S. close missing transaction insert** — `updateOrderStatusAction` does not insert to `transactions` when status → `completed`; Finance and Analytics pages will show all-zero metrics forever without this link
5. **Email conflict in `user` table** — `createCustomerAction` inserts directly into the auth `user` table; if a customer email matches an existing auth account, a `UNIQUE` constraint error surfaces as a generic failure; add pre-insert email check
6. **`updatedAt` missing from update actions** — `approveOrderItemAction` and `updateCustomerAction` omit `updatedAt: new Date()` in `.set()`; Drizzle `$defaultFn` is insert-only; timestamps will be stale

## Implications for Roadmap

Based on dependency analysis and pitfall mapping, the recommended phase structure is:

### Phase 1: DB Foundation + Connection Safety (DB-01)

**Rationale:** Everything else depends on tables existing and a working DB connection that will not collapse under load. Better Auth must work before any authenticated route can be tested.
**Delivers:** Migrations applied to production DB, driver swapped to serverless-safe pattern, Better Auth session round-trip verified, first admin user registered
**Addresses:** Table stakes auth flow; empty-state smoke test on Dashboard
**Avoids:** Pitfall 1 (connection exhaustion), Pitfall 2 (Better Auth schema mismatch)
**Research flag:** Standard patterns — skip research-phase

### Phase 2: Orders + Transaction Auto-Create (DB-02)

**Rationale:** Orders are the most complex schema (vehicle FK, service_order_items, budget approval) and the critical link to Finance/Analytics. O.S. close → transaction insert must be implemented here, not deferred.
**Delivers:** Order CRUD end-to-end, `OrderDetailPanel` on real data, budget approval, print page, O.S. close → transaction auto-insert
**Addresses:** `OrderDetailPanel` real wiring, `numeric` string type audit, `updatedAt` fix in `approveOrderItemAction`, revalidatePath coverage
**Avoids:** Pitfall 3 (numeric strings), Pitfall 6 (missing updatedAt)
**Research flag:** Standard patterns — skip research-phase

### Phase 3: Customers CRUD (DB-03)

**Rationale:** Orders depend on customers for the wizard step-1 search. Must ship before Appointments and before Finance relies on customer-linked orders.
**Delivers:** Customer create/list/detail with real vehicle list and order history, email uniqueness guard
**Addresses:** Email conflict guard, `totalSpent: 0` / `lastVisit: null` graceful rendering, `nextServices` section removal, `updatedAt` fix in `updateCustomerAction`
**Avoids:** Pitfall 5 (email conflict), Pitfall 6 (missing updatedAt)
**Research flag:** Standard patterns — skip research-phase

### Phase 4: Inventory CRUD (DB-04)

**Rationale:** Independent of orders/customers flow; must be wired before stock auto-decrement can be added to O.S. close. Can be parallelized with DB-03.
**Delivers:** Parts list, low-stock alerts, purchase orders CRUD, purchase order `confirmed` enum fix
**Addresses:** Purchase order enum mismatch, category filter audit, zero-inventory empty states
**Avoids:** No new pitfalls; standard patterns apply
**Research flag:** Standard patterns — skip research-phase

### Phase 5: Appointments (DB-05)

**Rationale:** Depends on customers (FK) and mechanics (user.id FK). Schema gaps (missing `serviceType`, `duration`) must be resolved via migration or form simplification before wiring.
**Delivers:** Calendar on real data, create appointment, status update, mechanic assignment by UUID
**Addresses:** Appointments schema migration (add `serviceType` + `duration` OR remove from form), `scheduled` → "Agendado" status label mapping, empty calendar rendering
**Avoids:** Schema mismatch breaking form submission
**Research flag:** Skip research-phase; decide migration vs form-simplification at planning time

### Phase 6: Finance + Analytics (DB-06)

**Rationale:** Entirely dependent on Phase 2 (Orders) populating `transactions` via O.S. close auto-insert. Without that link, Finance shows zeroes and Analytics shows `-1` sentinels. N+1 dashboard queries fixed here.
**Delivers:** Finance metrics from real transactions, recharts empty-data guards, Analytics KPI sentinel display ("N/D"), mechanic performance from real orders, N+1 dashboard query refactor
**Addresses:** Analytics `-1` → "N/D" display, `revenueToday` fix/removal, recharts crash on `[]`, `getUpcomingDeliveries` N+1 refactor, `status-chart.tsx` mock import removal
**Avoids:** Pitfall 4 (N+1 queries crashing dashboard under load)
**Research flag:** Recharts empty-data patterns are well-documented; skip research-phase

### Phase Ordering Rationale

- DB-01 before everything: tables must exist and auth must work before any authenticated action can be tested
- DB-02 carries the O.S. → transaction link which unlocks DB-06; implement early even though DB-03 (customers) is also a dependency of the order wizard — a test customer can be created manually during DB-02 smoke testing
- DB-04 (Inventory) is independent and can be parallelized with DB-03 if capacity allows
- DB-05 (Appointments) blocked only on DB-01 + DB-03; can start after those complete
- DB-06 (Finance/Analytics) must come last — data quality depends entirely on O.S. close → transaction insert from DB-02

### Research Flags

Phases needing deeper research during planning:

- **None identified** — all patterns are well-established and codebase-specific gaps are fully documented in PITFALLS.md and FEATURES.md

Phases with standard patterns (skip research-phase):

- **All 6 phases** — the codebase is the source of truth; research files are derived from direct inspection, not external docs

## Confidence Assessment

| Area         | Confidence                                 | Notes                                                                                                 |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Stack        | HIGH                                       | All claims from direct `package.json` and `src/_db/` inspection                                       |
| Features     | HIGH                                       | All gaps identified from direct schema + mock-data diff analysis                                      |
| Architecture | HIGH                                       | Component boundaries confirmed by reading all `_data-access/` and `_actions/` files                   |
| Pitfalls     | HIGH (codebase) / MEDIUM (Vercel behavior) | Vercel serverless pool exhaustion is well-known pattern but not load-tested against this specific app |

**Overall confidence:** HIGH

### Gaps to Address

- **DB provider not confirmed:** Driver swap recommendation (Neon HTTP) assumes Neon. If using Supabase or Railway, use `postgres-js` with `max: 1` instead. Confirm provider at DB-01 planning.
- **Seed script completeness unverified:** `scripts/seed.ts` exists; review during DB-01 to confirm coverage of all 12 tables with realistic relational data
- **`revalidatePath` edge cases:** All confirmed routes covered but edge cases unverified (e.g., budget approval revalidating both `/orders` and `/orders/[id]/budget`); audit during each module phase

## Sources

### Primary (HIGH confidence)

- Direct codebase inspection: `src/_db/`, `src/_data-access/*.ts`, `src/_actions/*.ts`, `src/_lib/auth.ts`, `src/_db/schema/`, `src/_helpers/mock-data.ts`, `package.json`, `drizzle.config.ts`

### Secondary (MEDIUM confidence)

- Drizzle ORM docs on `$defaultFn` behavior (insert-only): https://orm.drizzle.team/docs/column-types/pg#default-value
- Better Auth Drizzle adapter `additionalFields`: https://www.better-auth.com/docs/concepts/database#additional-fields
- Vercel serverless PostgreSQL connection patterns: https://vercel.com/docs/storage/vercel-postgres/sdk
- Neon + Drizzle serverless driver: https://neon.tech/docs/serverless/serverless-driver

---

_Research completed: 2026-06-20_
_Ready for roadmap: yes_
