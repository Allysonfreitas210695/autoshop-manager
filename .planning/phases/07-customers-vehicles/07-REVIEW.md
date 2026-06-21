---
phase: 07-customers-vehicles
reviewed: 2026-06-21T19:10:00Z
depth: standard
files_reviewed: 3
files_reviewed_list:
  - src/_actions/customers.ts
  - src/_actions/customers.test.ts
  - src/_data-access/customers.ts
findings:
  critical: 3
  warning: 4
  info: 2
  total: 9
status: issues_found
---

# Phase 7: Code Review Report

**Reviewed:** 2026-06-21T19:10:00Z
**Depth:** standard
**Files Reviewed:** 3
**Status:** issues_found

## Summary

Three source files reviewed: two action handlers (`createCustomerAction`, `updateCustomerAction`, `createVehicleAction`) and a data-access module with three query functions. The static-assertion test suite covers only the two email-guard checks and one search field check — it does not exercise runtime logic.

Critical issues: race condition in email uniqueness check (both actions), missing role filter in `getCustomerById` allowing non-customers to be fetched and updated, and SQL injection risk in `searchCustomers` via unparameterised `like` with raw `sql` template.

---

## Critical Issues

### CR-01: TOCTOU race condition — email uniqueness not enforced at DB level

**File:** `src/_actions/customers.ts:22-32` and `src/_actions/customers.ts:94-106`

**Issue:** Both `createCustomerAction` and `updateCustomerAction` perform a `SELECT` check for email uniqueness and then a separate `INSERT`/`UPDATE`. Between the two statements, a concurrent request can insert the same email, bypassing the guard and creating duplicate rows. The `user.email` column is `unique()` in the schema (auth.ts:8), so the DB constraint will eventually catch it — but this surfaces as an unhandled DB error (not `ActionError`), leaking a raw Drizzle/Postgres stack trace to the client via the generic `DEFAULT_SERVER_ERROR_MESSAGE` path only if `handleServerError` catches it; if not caught it crashes the action.

**Fix:** Remove the pre-check SELECT and catch the unique-constraint violation from the insert/update directly:

```ts
try {
  await db.insert(user).values({ ... });
} catch (e: unknown) {
  if (isUniqueConstraintError(e, "user_email_unique")) {
    throw new ActionError("E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.");
  }
  throw e;
}
```

Where `isUniqueConstraintError` checks for Postgres error code `23505` and the constraint name. This eliminates the race and removes the redundant round-trip.

---

### CR-02: `getCustomerById` fetches any user role — non-customer rows exposed

**File:** `src/_data-access/customers.ts:134-180`

**Issue:** The query at line 151 filters only by `user.id` with no `role = 'customer'` guard. An admin or mechanic user ID passed to this function returns their full profile (name, email, phone, CPF, address, spend aggregate). Any caller that routes by ID without verifying ownership/role (e.g., a customer-detail page with a URL param) can be used to enumerate all users. `listCustomers` correctly filters by role (line 69); `getCustomerById` does not.

**Fix:**

```ts
.where(and(eq(user.id, id), eq(user.role, "customer")))
```

---

### CR-03: `searchCustomers` uses raw `sql` template with interpolated LIKE operands — potential SQL injection

**File:** `src/_data-access/customers.ts:195`

**Issue:** The WHERE clause is constructed with a raw `sql` tagged template:

```ts
sql`${user.role} = 'customer' and (lower(${user.name}) like ${lq} or ...)`;
```

Drizzle parameterises the `${}` column references, but `${lq}` is the raw string `%${query.toLowerCase()}%` produced by string interpolation at line 183. Whether Drizzle treats a bare string inside `sql\`\``as a bound parameter or inlines it depends on the Drizzle version. In versions prior to the strict-parameterisation change, bare non-column values inside`sql\`\``are inlined as literals — making`lq`injectable. Additionally,`query.toLowerCase()`applied before`%`wrapping means a query containing`%`or`\_` characters acts as an unescaped wildcard, causing unintended result-set leakage.

**Fix:** Use Drizzle's `ilike` operator (case-insensitive, parameterised) and the `or` combinator to avoid raw SQL entirely:

```ts
import { ilike, or, and } from "drizzle-orm";

.where(
  and(
    eq(user.role, "customer"),
    or(
      ilike(user.name, `%${query}%`),
      ilike(user.email, `%${query}%`),
      ilike(user.cpf, `%${query}%`),
      ilike(vehicles.plate, `%${query}%`),
    ),
  ),
)
```

Note: `ilike` still requires `%`/`_` escaping if those characters should be treated literally; add an escape step if user-supplied wildcards are not desired.

---

## Warnings

### WR-01: `createVehicleAction` does not verify `ownerId` belongs to a customer

**File:** `src/_actions/customers.ts:50-80`

**Issue:** `ownerId` is a raw `z.string()` (line 53) with no validation that the referenced user exists, is of role `customer`, or belongs to the authenticated mechanic/admin's shop. Any authenticated user can pass an arbitrary UUID and attach a vehicle to any user account, including admin/mechanic accounts.

**Fix:** Add a DB lookup before insert:

```ts
const owner = await db
  .select({ role: user.role })
  .from(user)
  .where(eq(user.id, parsedInput.ownerId))
  .limit(1);
if (!owner[0] || owner[0].role !== "customer") {
  throw new ActionError("Cliente não encontrado.");
}
```

---

### WR-02: `updateCustomerAction` does not confirm the target user exists or is a customer before UPDATE

**File:** `src/_actions/customers.ts:108-117`

**Issue:** The update at line 108 runs unconditionally after the email-guard check. If `parsedInput.id` does not exist (or is not a customer), the `UPDATE` silently affects zero rows and returns `{ id }` as if successful. The caller has no signal that the update was a no-op.

**Fix:** Check `returning()` or verify affected row count, and add a `role = 'customer'` guard to the WHERE clause:

```ts
const [updated] = await db.update(user)
  .set({ ... })
  .where(and(eq(user.id, parsedInput.id), eq(user.role, "customer")))
  .returning({ id: user.id });

if (!updated) {
  throw new ActionError("Cliente não encontrado.");
}
```

---

### WR-03: `listCustomers` — `updatedAt` is never set on UPDATE

**File:** `src/_actions/customers.ts:108-117`

**Issue:** The `user` schema declares `updatedAt` with a `$defaultFn` (auth.ts:21) which only runs on INSERT. The `updateCustomerAction` `.set({})` block does not include `updatedAt: new Date()`, so the timestamp is frozen at creation time permanently.

**Fix:**

```ts
await db.update(user).set({
  ...parsedInput fields,
  updatedAt: new Date(),
}).where(eq(user.id, parsedInput.id));
```

---

### WR-04: `searchCustomers` returns duplicate rows when a customer has multiple vehicles

**File:** `src/_data-access/customers.ts:193-198`

**Issue:** The `leftJoin` on `vehicles` (line 193) joined with `.groupBy(user.id)` does deduplicate rows, so that part is correct. However the SELECT list (lines 185-191) does not include any vehicle field, making the join load and group vehicle rows purely to enable the plate filter — this works functionally, but there is no `DISTINCT` or `GROUP BY` guard for the plate column in the WHERE, meaning a customer with two vehicles both matching `lq` is still returned once. **This is actually correct.** However: if the same `user.id` appears in multiple vehicle rows that match, the `groupBy` is on `user.id` alone (Postgres strict mode), which is valid. No duplicate row bug here — downgraded to a documentation/clarity warning.

**Issue (real):** The function returns columns including `cpf` (line 190) in a search autocomplete context. CPF is a sensitive government identifier. Exposing it in a search endpoint response that flows to a client component broadens the attack surface unnecessarily; only `id`, `name`, and a non-sensitive display field are needed for autocomplete.

**Fix:** Remove `cpf: user.cpf` from the `searchCustomers` SELECT and return it only from `getCustomerById` when rendering the full customer profile.

---

## Info

### IN-01: Test suite uses source-text assertions (grep-on-source) — tests are fragile and misleading

**File:** `src/_actions/customers.test.ts:18-25`

**Issue:** `exportBlocks()` and the subsequent string `.includes()` checks test that certain string literals appear in the source code, not that the code behaves correctly. Renaming a variable, extracting a helper, or changing the error message string breaks the test without any functional regression — and conversely, a test that passes does not prove the guard is reachable or correct. The pattern is inherited from `orders.test.ts` but is explicitly noted here as a quality concern.

**Fix:** Replace with a proper integration test using a test DB or mock that exercises the action's runtime behaviour (e.g., call `createCustomerAction` twice with the same email and assert the second call returns an `ActionError`).

---

### IN-02: `authActionClient` does not enforce role — any authenticated user can invoke all customer actions

**File:** `src/_lib/safe-action.ts:22-37` / `src/_actions/customers.ts:11,50,82`

**Issue:** `authActionClient` only checks that a session exists (line 27). All three customer actions (`createCustomerAction`, `updateCustomerAction`, `createVehicleAction`) are callable by any authenticated user including customers themselves. A customer could update another customer's record or create vehicles for arbitrary owner IDs.

**Fix:** Add a role check in the middleware or within each action:

```ts
if (!["admin", "mechanic"].includes(ctx.user.role)) {
  throw new ActionError("Sem permissão.");
}
```

---

_Reviewed: 2026-06-21T19:10:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
