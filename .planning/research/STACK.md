# Technology Stack

**Project:** Precision Auto — v1.1 DB Integration
**Researched:** 2026-06-20
**Confidence:** HIGH (all claims based on existing code, not training assumptions)

---

## Current State Assessment

The DB integration layer is **further along than the milestone name implies**. Based on direct code inspection:

| Component                       | Status                                                                                     |
| ------------------------------- | ------------------------------------------------------------------------------------------ |
| `drizzle-orm` + `pg`            | Already installed (`^0.45.2`, `^8.21.0`)                                                   |
| `drizzle-kit`                   | Already installed (`^0.31.10`), config in `drizzle.config.ts`                              |
| `drizzle.config.ts`             | Configured, dialect `postgresql`, migrations in `src/_db/migrations/`                      |
| `src/_db/index.ts`              | Done — `drizzle(pool, { schema })` with singleton `Pool` pattern                           |
| `src/_db/schema/*`              | Complete — all 7 modules have Drizzle tables + relations                                   |
| Migrations                      | 3 migration files exist in `src/_db/migrations/`                                           |
| Better Auth ↔ Drizzle           | Done — `drizzleAdapter(db, { provider: "pg", schema: {...} })` wired in `src/_lib/auth.ts` |
| `src/_data-access/customers.ts` | Real Drizzle queries (not mock)                                                            |
| `src/_data-access/orders.ts`    | Real Drizzle queries (not mock)                                                            |
| `src/_data-access/dashboard.ts` | Real Drizzle queries (not mock)                                                            |
| `scripts/seed.ts`               | Exists                                                                                     |

**The stack is COMPLETE. No new packages needed.**

---

## Recommended Stack

### No New Dependencies Required

All required packages are already in `package.json`. The v1.1 work is **wiring and migration**, not installation.

### Core Data Layer (already installed)

| Technology    | Version    | Purpose                             | Status                     |
| ------------- | ---------- | ----------------------------------- | -------------------------- |
| `drizzle-orm` | `^0.45.2`  | ORM + query builder                 | Installed, schema complete |
| `drizzle-kit` | `^0.31.10` | Migrations CLI                      | Installed, config complete |
| `pg`          | `^8.21.0`  | PostgreSQL driver                   | Installed                  |
| `@types/pg`   | `^8.20.0`  | TypeScript types                    | Installed                  |
| `better-auth` | `^1.6.11`  | Auth with Drizzle adapter           | Wired to Drizzle already   |
| `dotenv`      | `^17.4.2`  | Load `DATABASE_URL` for drizzle-kit | Installed                  |

### Connection Pattern (already implemented in `src/_db/index.ts`)

```typescript
// Singleton Pool — correct for Next.js + serverless
const pool =
  globalForDb.pool ?? new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });
```

This is the correct pattern for Vercel (serverless). Do NOT switch to `neon/serverless` or `@vercel/postgres` — the current `pg` + `Pool` approach works on Vercel with a standard PostgreSQL provider (e.g., Supabase, Neon, Railway).

### Better Auth ↔ Drizzle (already implemented in `src/_lib/auth.ts`)

```typescript
database: drizzleAdapter(db, {
  provider: "pg",
  schema: { user, session, account, verification },
});
```

Better Auth reads/writes `user`, `session`, `account`, `verification` tables directly via Drizzle. **No changes needed.**

---

## Schema Overview (complete, no additions needed for v1.1)

| Table                  | File                        | Relations                                                                 |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------- |
| `user`                 | `schema/auth.ts`            | FK target for service_orders, vehicles, appointments                      |
| `session`              | `schema/auth.ts`            | Better Auth managed                                                       |
| `account`              | `schema/auth.ts`            | Better Auth managed                                                       |
| `verification`         | `schema/auth.ts`            | Better Auth managed                                                       |
| `vehicles`             | `schema/vehicles.ts`        | FK → user                                                                 |
| `service_orders`       | `schema/service-orders.ts`  | FK → vehicles, user (customer + mechanic); has many `service_order_items` |
| `service_order_items`  | `schema/service-orders.ts`  | FK → service_orders, services                                             |
| `services`             | `schema/services.ts`        | Inventory (parts + services catalog)                                      |
| `appointments`         | `schema/appointments.ts`    | FK → user, vehicles                                                       |
| `transactions`         | `schema/transactions.ts`    | FK → service_orders                                                       |
| `purchase_orders`      | `schema/purchase-orders.ts` | Has many `purchase_order_items`                                           |
| `purchase_order_items` | `schema/purchase-orders.ts` | FK → purchase_orders, services                                            |

---

## Migration Strategy

Three migrations already exist. The task for v1.1:

1. **Run `npm run db:migrate`** against production PostgreSQL — applies existing 3 migrations
2. **If schema changes needed** (discovered during wiring): `npm run db:generate` then `db:migrate`
3. **Seed with `npm run db:seed`** for development/staging

**Do NOT use `db:push`** — it bypasses migration history, unsafe for production.

---

## What Each Module Needs (Integration Work Only)

| Module            | Data Access                                    | Server Actions                 | Status                           |
| ----------------- | ---------------------------------------------- | ------------------------------ | -------------------------------- |
| Dashboard         | `src/_data-access/dashboard.ts`                | N/A (Server Component reads)   | Queries already real Drizzle     |
| Customers         | `src/_data-access/customers.ts`                | `src/_actions/customers.ts`    | Queries real; actions need audit |
| Orders            | `src/_data-access/orders.ts`                   | `src/_actions/orders.ts`       | Queries real; actions need audit |
| Inventory         | `src/_data-access/inventory.ts`                | `src/_actions/inventory.ts`    | Needs audit                      |
| Appointments      | `src/_data-access/appointments.ts` (if exists) | `src/_actions/appointments.ts` | Needs audit                      |
| Finance/Analytics | `src/_data-access/finance.ts`, `analytics.ts`  | N/A                            | Needs audit                      |

---

## Alternatives Considered

| Category           | Chosen                | Alternative                | Why Not                                                                                          |
| ------------------ | --------------------- | -------------------------- | ------------------------------------------------------------------------------------------------ |
| PostgreSQL driver  | `pg` (node-postgres)  | `@neondatabase/serverless` | Already installed and working; switching adds risk with no benefit unless using Neon's HTTP mode |
| ORM                | Drizzle               | Prisma                     | Already chosen; schema complete                                                                  |
| Auth-DB link       | `drizzleAdapter`      | Custom JWT store           | Already implemented correctly                                                                    |
| Migration approach | `drizzle-kit migrate` | `drizzle-kit push`         | Push bypasses migration history; unsafe for prod                                                 |

---

## Environment Variables Required

```bash
DATABASE_URL=          # PostgreSQL connection string (already set on Vercel)
BETTER_AUTH_URL=       # Already set on Vercel
BETTER_AUTH_SECRET=    # Already set on Vercel
GOOGLE_CLIENT_ID=      # Already set (optional social login)
GOOGLE_CLIENT_SECRET=  # Already set (optional social login)
```

For local dev, populate `.env` — `drizzle.config.ts` loads it via `dotenv`.

---

## What NOT to Add

- **No new ORM or DB library** — Drizzle is complete
- **No connection pooler middleware** (PgBouncer, etc.) — out of scope for v1.1
- **No caching layer** (Redis beyond existing Upstash rate-limit) — out of scope
- **No email provider** — `sendResetPassword` has a TODO comment; defer to v1.2
- **No file storage** (`signatureUrl` field exists but defer blob storage to later)

---

## Sources

- Direct code inspection: `src/_db/`, `src/_lib/auth.ts`, `src/_data-access/`, `package.json`, `drizzle.config.ts`
- All claims HIGH confidence — derived from existing codebase, not training data
