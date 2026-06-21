# Phase 5: DB Foundation & Auth - Pattern Map

**Mapped:** 2026-06-21
**Files analyzed:** 3 modified files + 1 generated file
**Analogs found:** 3 / 3 (generated migration has direct SQL analog)

---

## File Classification

| New/Modified File                    | Role      | Data Flow        | Closest Analog                             | Match Quality              |
| ------------------------------------ | --------- | ---------------- | ------------------------------------------ | -------------------------- |
| `src/_db/index.ts`                   | config    | request-response | `src/_db/index.ts` (current)               | self — surgical edit       |
| `src/_db/schema/purchase-orders.ts`  | model     | CRUD             | `src/_db/schema/auth.ts` (pgEnum pattern)  | role-match                 |
| `src/_db/migrations/0003_<name>.sql` | migration | batch            | `src/_db/migrations/0002_flat_reavers.sql` | exact (ALTER TYPE pattern) |
| `scripts/seed.ts`                    | utility   | batch            | `scripts/seed.ts` (current)                | self — surgical edit       |

---

## Pattern Assignments

### `src/_db/index.ts` (config, request-response)

**Change type:** Surgical edit — add 3 properties to the existing `new Pool({...})` call.

**Analog:** `src/_db/index.ts` (current file, lines 1–22)

**Current pool pattern** (lines 10–14):

```typescript
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });
```

**Target pool pattern** (D-01, D-02, D-03):

```typescript
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });
```

**Singleton guard pattern** (lines 16–18) — keep unchanged:

```typescript
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
```

**Export pattern** (lines 20–22) — keep unchanged:

```typescript
export const db = drizzle(pool, { schema });
export type Database = typeof db;
```

---

### `src/_db/schema/purchase-orders.ts` (model, CRUD)

**Change type:** Surgical edit — add `'confirmed'` as 5th value to the existing `pgEnum`.

**Analog:** `src/_db/schema/auth.ts` lines 1–3 (pgEnum definition pattern)

**pgEnum pattern from auth.ts** (line 3):

```typescript
export const userRole = pgEnum("user_role", ["admin", "mechanic", "customer"]);
```

**Current enum in purchase-orders.ts** (lines 14–19):

```typescript
export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "draft",
  "sent",
  "received",
  "cancelled",
]);
```

**Target enum** (D-05) — append `'confirmed'` as last value:

```typescript
export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "draft",
  "sent",
  "received",
  "cancelled",
  "confirmed",
]);
```

**Critical constraint:** Order matters for drizzle-kit snapshot diff. `'confirmed'` must be appended last. Do not reorder existing values.

---

### `src/_db/migrations/0003_<auto-name>.sql` (migration, batch)

**Change type:** Generated file — do NOT hand-write. Run `npm run db:generate` after updating schema.

**Analog:** `src/_db/migrations/0002_flat_reavers.sql` lines 1–2 (ALTER TYPE pattern)

**Expected output** (D-04) — drizzle-kit will generate:

```sql
ALTER TYPE "public"."purchase_order_status" ADD VALUE 'confirmed';
```

**Migration statement-breakpoint convention** from `0002_flat_reavers.sql`:

```sql
CREATE TYPE "public"."purchase_order_status" AS ENUM('draft', 'sent', 'received', 'cancelled');--> statement-breakpoint
```

Each DDL statement in drizzle migrations is separated by `--> statement-breakpoint`. The generated `0003` file will follow this exact convention.

**Anti-pattern to avoid:** Do not write `DROP TYPE` + `CREATE TYPE` — Postgres does not allow removing enum values. Only `ADD VALUE` is valid.

---

### `scripts/seed.ts` (utility, batch)

**Change type:** Surgical edit — add `verification` table to the `wipe()` function.

**Analog:** `scripts/seed.ts` (current file, lines 75–88)

**Current `wipe()` function** (lines 75–88) — missing `verification`:

```typescript
async function wipe() {
  console.log("🧹 Limpando tabelas...");
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
  await db.delete(userTable); // <-- verification must precede this
}
```

**Target `wipe()` function** (D-07, D-09) — insert `verificationTable` delete before `userTable`:

```typescript
async function wipe() {
  console.log("🧹 Limpando tabelas...");
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
  await db.delete(verificationTable); // ADD: FK references user.id
  await db.delete(userTable);
}
```

**Import to add** (line 17–29 region, add `verification as verificationTable`):

```typescript
import {
  account as accountTable,
  appointments,
  purchaseOrderItems,
  purchaseOrders,
  serviceOrderItems,
  serviceOrders,
  services,
  session as sessionTable,
  transactions,
  user as userTable,
  vehicles,
  verification as verificationTable, // ADD THIS
} from "@/_db/schema";
```

**Existing `createUser` pattern** (lines 50–73) — no change needed. D-08 pattern already correctly uses `auth.api.signUpEmail`:

```typescript
async function createUser(opts: { ... }): Promise<string> {
  const res = await auth.api.signUpEmail({
    body: { name: opts.name, email: opts.email, password: DEFAULT_PASSWORD },
  });
  const id = res.user.id;
  // db.update for custom fields (role, phone, cpf, address) after Better Auth creates the user
  await db.update(userTable).set({ ... }).where(eq(userTable.id, id));
  return id;
}
```

**`verification` table export location:** `src/_db/schema/auth.ts` line 56 — `export const verification = pgTable("verification", { ... })`.

---

## Shared Patterns

### DB Connection (singleton)

**Source:** `src/_db/index.ts` lines 6–8
**Apply to:** All server-side files that import `db`

```typescript
const globalForDb = globalThis as unknown as {
  pool: Pool | undefined;
};
```

The `as unknown as` cast is pre-existing and acceptable per CLAUDE.md (not new code introducing `any`).

### Schema import (barrel)

**Source:** `src/_db/schema/index.ts` (re-export barrel)
**Apply to:** All files that import schema tables — always import from `@/_db/schema`, not from individual schema files directly.

### Better Auth user creation

**Source:** `scripts/seed.ts` lines 58–73
**Apply to:** Any script or action that creates users — never `db.insert(userTable)` directly; always `auth.api.signUpEmail` then `db.update` for custom fields.

---

## No Analog Found

None — all Phase 5 changes modify existing files with clear self-analogs or well-precedented patterns.

---

## Metadata

**Analog search scope:** `src/_db/`, `scripts/`, `src/_lib/`
**Files scanned:** 6 source files + 3 migration files
**Pattern extraction date:** 2026-06-21
