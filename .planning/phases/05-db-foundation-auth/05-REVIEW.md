---
phase: 05-db-foundation-auth
reviewed: 2026-06-21T13:57:00Z
depth: standard
files_reviewed: 4
files_reviewed_list:
  - scripts/seed.ts
  - src/_db/index.ts
  - src/_db/migrations/0003_parched_donald_blake.sql
  - src/_db/schema/purchase-orders.ts
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 05: Code Review Report

**Reviewed:** 2026-06-21T13:57:00Z
**Depth:** standard
**Files Reviewed:** 4
**Status:** issues_found

## Summary

Reviewed database foundation layer: connection pool, schema definition for purchase orders, a DDL migration, and the seed script. The schema and migration are largely correct. The seed script contains multiple correctness bugs (silent data truncation, credential exposure in output, non-atomic destructive wipe, missing await guard) and the connection module has a missing-validation gap that will produce an unhelpful runtime failure. No injection vectors in the reviewed files; all queries use parameterised Drizzle APIs.

---

## Critical Issues

### CR-01: `DATABASE_URL` undefined produces silent pool failure, not a startup error

**File:** `src/_db/index.ts:13`
**Issue:** `process.env.DATABASE_URL` is passed directly to `new Pool()` without a null/undefined guard. When the env var is absent (e.g., missing `.env` on a fresh clone, CI without secrets), the Pool constructor receives `undefined` as the connection string. `pg` does not throw immediately; it falls back to OS-level socket defaults and fails only on the first query with a cryptic `ECONNREFUSED` or auth error that hides the real cause.
**Fix:**

```ts
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 2_000,
  });
```

---

### CR-02: Seed script wipe is non-atomic — partial failure leaves DB in broken state

**File:** `scripts/seed.ts:76-90`
**Issue:** `wipe()` executes nine sequential `DELETE` statements with no wrapping transaction. If any statement fails (e.g., FK violation because a table was missed, or a transient connection error), the function returns with some tables wiped and others still populated. Subsequent seed inserts will then fail on unique-constraint violations or FK errors that are impossible to diagnose without knowing which deletes succeeded.
**Fix:**

```ts
async function wipe() {
  console.log("🧹 Limpando tabelas...");
  await db.transaction(async (tx) => {
    await tx.delete(transactions);
    await tx.delete(serviceOrderItems);
    await tx.delete(serviceOrders);
    await tx.delete(appointments);
    await tx.delete(purchaseOrderItems);
    await tx.delete(purchaseOrders);
    await tx.delete(vehicles);
    await tx.delete(services);
    await tx.delete(sessionTable);
    await tx.delete(accountTable);
    await tx.delete(verificationTable);
    await tx.delete(userTable);
  });
}
```

---

### CR-03: Default password printed to stdout in plaintext at end of seed

**File:** `scripts/seed.ts:627`
**Issue:** `console.log(` Senha: ${DEFAULT_PASSWORD}\n`)` prints the shared demo password to stdout. In CI/CD environments stdout is often captured in build logs that are stored, indexed, or exported to log aggregators. Even for a demo password this establishes a bad pattern and the value `senha123` is also hardcoded at line 33 — two places where it appears in plaintext output. If this seed is ever used in a staging environment with real users the credential leaks.
**Fix:** Remove the password line from the printed summary. The value is documented in the file's header comment (line 10); that is sufficient.

```ts
console.log("✅ Seed concluído!");
console.log("   Admin:    admin@precisionauto.com");
console.log("   Mecânico: roberto@precisionauto.com");
console.log("   Cliente:  ricardo.almeida@email.com");
// Remove: console.log(`   Senha:    ${DEFAULT_PASSWORD}\n`);
```

---

## Warnings

### WR-01: `updatedAt` field never updated — always holds creation timestamp

**File:** `src/_db/schema/purchase-orders.ts:34-36`
**Issue:** `updatedAt` is set via `$defaultFn(() => new Date())`. This runs only on INSERT. There is no `$onUpdateFn` equivalent, so every UPDATE to a `purchase_orders` or `purchase_order_items` row leaves `updated_at` frozen at creation time. Any feature that relies on `updatedAt` for cache invalidation, optimistic locking, or audit will silently read stale data. The same pattern likely exists in other schema files (e.g., `services.ts` lines 28-30, `transactions.ts`).
**Fix:**

```ts
updatedAt: timestamp("updated_at")
  .$defaultFn(() => new Date())
  .$onUpdateFn(() => new Date())
  .notNull(),
```

Apply the same fix to all tables that carry `updatedAt`.

---

### WR-02: `purchaseOrderItems.serviceId` nullable FK with `onDelete: "set null"` — referential integrity gap

**File:** `src/_db/schema/purchase-orders.ts:44-46`
**Issue:** `serviceId` is nullable and set to NULL when the referenced service is deleted. A purchase order item then has no link back to the part it was purchasing. There is no `description` fallback enforcement at the DB level — `description` is `notNull` but the application could have inserted a generic string. Downstream inventory-reconciliation logic that joins `purchaseOrderItems` to `services` will silently drop these rows or return nulls.
**Fix:** Either use `onDelete: "restrict"` to prevent deleting a service that has purchase order items, or add a database-level check that when `serviceId IS NULL` then `description` must be non-empty (already enforced by `notNull` on `description`, so `restrict` is the safer choice):

```ts
serviceId: uuid("service_id").references(() => services.id, {
  onDelete: "restrict",
}),
```

---

### WR-03: Seed uses sequential async inserts inside a loop — any failure aborts with partial data committed

**File:** `scripts/seed.ts:423-507`
**Issue:** The 120-iteration nested loop (`6 months × 20 statuses`) issues individual awaited inserts for service orders, items, and transactions outside any transaction. A failure at iteration 60, for example, leaves 60 orders in the DB but not the subsequent ones. The seed is not re-runnable without first calling `wipe()`, but `wipe()` itself is not guarded (CR-02). The entire `main()` body should be wrapped in a transaction or at minimum use `db.transaction()` per logical group.
**Fix:** Wrap the entire `main()` body (after `wipe()`) in a single `db.transaction(async (tx) => { ... })`, replacing `db.insert(...)` calls with `tx.insert(...)`.

---

### WR-04: `pick()` silently wraps on out-of-bound index — masks logic errors

**File:** `scripts/seed.ts:47-49`
**Issue:** `pick<T>(arr, i)` returns `arr[i % arr.length]`. When `i` exceeds the array length the function wraps silently. This is used for `mechanicIds` (3 elements), `apptStatuses` (5 elements), and `serviceTypes` (4 elements). The wrapping behaviour is intentional for cycling, but `apptStatuses` has 5 entries while `apptOffsets` has 8 entries — so 3 appointments receive statuses that are overridden immediately after by the conditional `apptOffsets[i] < 0 ? "completed" : pick(...)` check (line 560). The second `pick` inside that conditional reconstructs a copy of the same array (`[...apptStatuses]`) unnecessarily, adding confusion. The spread is a no-op for `pick` since only the index is used.
**Fix:** Remove the unnecessary spread:

```ts
status: apptOffsets[i] < 0 ? "completed" : pick(apptStatuses, i),
```

And document that `pick` intentionally cycles, or rename it to `cycle` for clarity.

---

## Info

### IN-01: `pool` global singleton only guarded in non-production — leaks in production serverless

**File:** `src/_db/index.ts:19-21`
**Issue:** The `globalForDb.pool = pool` assignment is skipped in production (`NODE_ENV !== "production"`). This pattern exists to prevent hot-reload from creating multiple pools in Next.js dev mode. However, in production serverless (e.g., Vercel), each invocation is a fresh process so the guard is irrelevant — but the variable is declared as `globalThis` which works. The current code is functionally correct for serverless production but the comment-free guard will confuse readers who expect the singleton to persist across requests (it doesn't on serverless; each cold start creates a new pool, which is acceptable).
**Fix:** Add an inline comment explaining the intent:

```ts
// Prevent multiple Pool instances during Next.js dev hot-reload.
// In production (serverless), each invocation is a fresh process — no-op.
if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}
```

---

### IN-02: `confirmed` enum value added by migration but seed never uses it

**File:** `src/_db/migrations/0003_parched_donald_blake.sql:1` / `scripts/seed.ts:578-594`
**Issue:** Migration 0003 adds `'confirmed'` to `purchase_order_status`. The seed's `poSeed` array uses only `"sent"`, `"received"`, and `"draft"`. The `"confirmed"` value goes unexercised in seed data, so no UI screen will demonstrate it during demo. This is not a bug, but it means the migration adds a value that has no seed representation and therefore no guaranteed UI path test.
**Fix:** Add one purchase order with `status: "confirmed"` to `poSeed` in the seed script for completeness.

---

_Reviewed: 2026-06-21T13:57:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
