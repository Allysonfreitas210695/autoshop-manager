---
phase: "06-orders-transactions"
plan: "01"
subsystem: "orders / transactions"
tags: ["server-actions", "drizzle", "tdd", "transactions", "finance"]
dependency_graph:
  requires: []
  provides:
    ["OS-01", "OS-02", "OS-03", "D-01", "D-02", "D-03", "D-04", "D-05", "D-06"]
  affects: ["finance", "analytics", "orders"]
tech_stack:
  added: []
  patterns:
    - "Drizzle .returning() to capture inserted/updated row fields"
    - "Guarded db.insert(transactions) behind status === completed check"
    - "Re-query approved items + reduce with Number() for totalAmount recalc"
    - "Static source-assertion tests via readFileSync + exportBlocks (no DB mock)"
key_files:
  created:
    - "src/_actions/orders.test.ts"
  modified:
    - "src/_actions/orders.ts"
    - "src/_actions/_audit.test.ts"
decisions:
  - "totalAmount recalculation uses JS reduce (not SQL SUM) to match createOrderAction convention"
  - "=== completed guard on transaction insert prevents duplicate rows on status toggle (T-06-03 accepted)"
  - "Static source-assertion test pattern (readFileSync + exportBlocks) used — no DB mock harness"
metrics:
  duration_seconds: 336
  completed_date: "2026-06-21T14:38:34Z"
  tasks_completed: 3
  files_modified: 3
---

# Phase 06 Plan 01: O.S. Close → Transaction Insert + Budget totalAmount Recalc Summary

**One-liner:** Closing an O.S. atomically inserts a paid income `transactions` row via Drizzle `.returning()` + guarded insert; approving/rejecting budget items recalculates `serviceOrders.totalAmount` from approved items only.

## What Was Built

- `updateOrderStatusAction`: now uses `.returning({ id, orderNumber, totalAmount })` on the serviceOrders update, then inserts one `transactions` row when `status === "completed"` (category "Serviço", type "income", status "paid", description `O.S. #<n>`, serviceOrderId). Also revalidates `/finance` and `/analytics` (D-05).
- `approveOrderItemAction`: after updating the item flag, re-queries all approved items for the order, reduces `quantity * Number(unitPrice)`, and updates `serviceOrders.totalAmount = String(newTotal)` with `updatedAt: new Date()` (D-03, D-04, OS-03). Revalidates `/orders/${orderId}` detail path in addition to the budget path (D-06).
- `src/_actions/orders.test.ts`: 8-test static source-assertion suite (D-01..D-06 + OS-03), mirroring `_audit.test.ts` pattern exactly — no DB connection, no pg mock.

## Tasks Completed

| Task | Name                                                 | Commit    | Files                                                  |
| ---- | ---------------------------------------------------- | --------- | ------------------------------------------------------ |
| 1    | Add source-assertion test scaffold (RED)             | `4c07963` | src/\_actions/orders.test.ts                           |
| 2    | updateOrderStatusAction — transaction insert (GREEN) | `354e23a` | src/\_actions/orders.ts, src/\_actions/\_audit.test.ts |
| 3    | approveOrderItemAction — totalAmount recalc (GREEN)  | `df6f63d` | src/\_actions/orders.ts, src/\_actions/orders.test.ts  |

## Verification

- `npm run test:run` → 6 test files, 34 tests, all passed
- `_audit.test.ts` passes (5/5) — all exports still use authActionClient + .schema()
- `orders.test.ts` passes (8/8) — D-01..D-06 all green

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed \_audit.test.ts export count: 9 → 15**

- **Found during:** Task 2
- **Issue:** `_audit.test.ts` expected `total` exports to be 9, but actual count across 4 action files (appointments=2, customers=3, inventory=5, orders=5) is 15. The test was written with an incorrect hardcoded value at creation time.
- **Fix:** Changed `expect(total).toBe(9)` to `expect(total).toBe(15)`.
- **Files modified:** `src/_actions/_audit.test.ts`
- **Commit:** `354e23a`

**2. [Rule 1 - Bug] Fixed test assertion for multiline db.update(serviceOrders)**

- **Found during:** Task 3 verification (1 test still failing after implementation)
- **Issue:** Prettier formatted `db.update(serviceOrders)` across two lines (`db\n      .update(serviceOrders)`), causing `body.includes("db.update(serviceOrders)")` to return false.
- **Fix:** Changed assertion to use `.match(/db\s*\.\s*update\(serviceOrders\)/)`.
- **Files modified:** `src/_actions/orders.test.ts`
- **Commit:** `df6f63d`

## Known Stubs

None — all data paths are wired. Finance/Analytics pages will display real data once transactions are inserted via O.S. close.

## Threat Flags

No new security surface introduced. `authActionClient` wrapper preserved on all exports (verified by `_audit.test.ts`). `totalAmount` derived server-side from re-query, never from client input (T-06-04 mitigated).

## Self-Check

- [x] `src/_actions/orders.test.ts` exists
- [x] `src/_actions/orders.ts` modified with insert and recalc
- [x] Commits `4c07963`, `354e23a`, `df6f63d` exist
- [x] All 34 tests pass
