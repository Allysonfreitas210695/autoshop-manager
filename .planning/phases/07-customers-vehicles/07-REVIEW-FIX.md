---
phase: 07-customers-vehicles
fixed_at: 2026-06-21T19:15:00Z
review_path: .planning/phases/07-customers-vehicles/07-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 7: Code Review Fix Report

**Fixed at:** 2026-06-21T19:15:00Z
**Source review:** .planning/phases/07-customers-vehicles/07-REVIEW.md
**Iteration:** 1

**Summary:**

- Findings in scope: 7 (3 Critical + 4 Warning)
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: TOCTOU race condition — email uniqueness not enforced at DB level

**Files modified:** `src/_actions/customers.ts`
**Commit:** 46dc184
**Applied fix:** Removed the pre-check SELECT from `createCustomerAction`. Added `isUniqueConstraintError` helper that checks Postgres error code `23505` and constraint name `user_email_unique`. Both `createCustomerAction` and `updateCustomerAction` now catch the DB unique constraint violation and surface it as a clean `ActionError`. Also removed unused `ne` import.

---

### CR-02: `getCustomerById` fetches any user role — non-customer rows exposed

**Files modified:** `src/_data-access/customers.ts`
**Commit:** b653db8
**Applied fix:** Changed `.where(eq(user.id, id))` to `.where(and(eq(user.id, id), eq(user.role, "customer")))`. Added `and` to imports.

---

### CR-03: `searchCustomers` uses raw `sql` template — potential SQL injection

**Files modified:** `src/_data-access/customers.ts`
**Commit:** b653db8
**Applied fix:** Replaced the raw `sql\`...\``WHERE clause with Drizzle's`and(eq(user.role, "customer"), or(ilike(...), ...))`combinators. All values are now bound parameters via`ilike`. Added `and`, `ilike`, `or`to imports; removed unused`sql` import.

---

### WR-01: `createVehicleAction` does not verify `ownerId` belongs to a customer

**Files modified:** `src/_actions/customers.ts`
**Commit:** 46dc184
**Applied fix:** Added a DB lookup before the vehicle insert: fetches `user.role` by `ownerId`, throws `ActionError("Cliente não encontrado.")` if the user is missing or not `role === "customer"`.

---

### WR-02: `updateCustomerAction` does not confirm target user exists or is a customer

**Files modified:** `src/_actions/customers.ts`
**Commit:** 46dc184
**Applied fix:** Changed the UPDATE WHERE clause to `and(eq(user.id, parsedInput.id), eq(user.role, "customer"))` and used `.returning({ id: user.id })`. If `updated` is undefined, throws `ActionError("Cliente não encontrado.")`.

---

### WR-03: `updatedAt` is never set on UPDATE

**Files modified:** `src/_actions/customers.ts`
**Commit:** 46dc184
**Applied fix:** Added `updatedAt: new Date()` to the `.set({})` block in `updateCustomerAction`.

---

### WR-04: `searchCustomers` exposes CPF in search autocomplete response

**Files modified:** `src/_data-access/customers.ts`
**Commit:** b653db8
**Applied fix:** Removed `cpf: user.cpf` from the SELECT list of `searchCustomers`. The field still filters (via `ilike(user.cpf, pattern)`), but is not returned to the caller. CPF remains available in `getCustomerById` for full profile rendering.

---

_Fixed: 2026-06-21T19:15:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
