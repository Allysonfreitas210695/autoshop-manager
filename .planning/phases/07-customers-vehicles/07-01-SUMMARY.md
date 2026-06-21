---
phase: 07-customers-vehicles
plan: "01"
subsystem: customers
tags: [data-access, actions, email-guard, search, tdd]
dependency_graph:
  requires: []
  provides: [email-uniqueness-guard, search-cpf-plate]
  affects: [src/_actions/customers.ts, src/_data-access/customers.ts]
tech_stack:
  added: []
  patterns:
    [static-source-assertion, ActionError-guard, drizzle-leftJoin-groupBy]
key_files:
  created:
    - src/_actions/customers.test.ts
  modified:
    - src/_actions/customers.ts
    - src/_data-access/customers.ts
decisions:
  - "Email guard uses pre-check SELECT before INSERT/UPDATE (not PG unique catch) for user-friendly messages"
  - "updateCustomerAction uses ne(user.id, parsedInput.id) to allow editing own email without conflict"
  - "searchCustomers uses groupBy(user.id) to deduplicate rows from leftJoin with vehicles"
metrics:
  duration: "~10 min"
  completed_date: "2026-06-21"
---

# Phase 7 Plan 01: Customers Data Layer Guards Summary

Email duplicate guard + expanded server-side search (CPF + plate) with static source-assertion test scaffold.

## Tasks Completed

| Task | Name                                                     | Commit  | Files                           |
| ---- | -------------------------------------------------------- | ------- | ------------------------------- |
| 0    | Test scaffold static source-assertion                    | 079a8fe | src/\_actions/customers.test.ts |
| 1    | Email guards createCustomerAction + updateCustomerAction | 324a648 | src/\_actions/customers.ts      |
| 2    | Expand searchCustomers for CPF and plate                 | 2680872 | src/\_data-access/customers.ts  |

## What Was Built

**Email guards (CLI-03):**

- `createCustomerAction`: SELECT pre-check before INSERT; throws `ActionError("E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.")` on duplicate
- `updateCustomerAction`: pre-check with `ne(user.id, parsedInput.id)` — allows updating own email; throws same `ActionError` on conflict with another user

**Expanded search (CLI-01):**

- `searchCustomers`: added `leftJoin(vehicles, eq(vehicles.ownerId, user.id))`, extended WHERE to include `user.cpf` and `vehicles.plate` via ILIKE, added `groupBy(user.id)` to deduplicate

**Test scaffold (Wave 0):**

- `exportBlocks()` helper replicates orders.test.ts pattern
- 3 static source assertions: D-01, D-02, CLI-01 — all GREEN

## Verification Results

- `npx vitest run src/_actions/customers.test.ts` — 3/3 passed
- `npx tsc --noEmit` — no new errors in customers files

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints or auth paths introduced. T-07-02 (ILIKE injection) mitigated by Drizzle sql template with bind params as planned.

## Self-Check: PASSED

- src/\_actions/customers.test.ts: FOUND
- src/\_actions/customers.ts: FOUND (ActionError, ne guard)
- src/\_data-access/customers.ts: FOUND (vehicles.plate, groupBy)
- Commits 079a8fe, 324a648, 2680872: FOUND in git log
