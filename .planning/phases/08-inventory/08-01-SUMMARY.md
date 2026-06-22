---
phase: 08-inventory
plan: 01
status: complete
completed: 2026-06-22
commit: aff9f61
---

# Phase 8 Plan 01 — Summary

## One-liner

Wired INV-03: atomic stock decrement on O.S. create and restore on O.S. delete, with serviceId forwarded through the wizard chain; INV-01/INV-02 already operational via seed data.

## What was built

**Task 1 — serviceId forwarded through wizard:**

- `partItemSchema` gains `serviceId: z.string().optional()` — `PartItem` type updates automatically
- `step-03-parts.tsx` `appendPart` call includes `serviceId: part.id` (services.id UUID)
- `order-wizard.tsx` `handleFinalSubmit` partItems map includes `serviceId: p.serviceId`

**Task 2 — Transactional createOrderAction and deleteOrderAction:**

- `createOrderAction` refactored: vehicle upsert + serviceOrders insert + serviceOrderItems insert + INV-03 decrement all wrapped in single `db.transaction()`. No floor guard (D-04). Filter: `itemType === "part" && serviceId != null` (D-03). Added `revalidatePath("/inventory/alerts")`.
- `deleteOrderAction` refactored: SELECT serviceOrderItems BEFORE delete, restore stock atomically, delete serviceOrders only (FK cascade removes items). Added `revalidatePath("/inventory/alerts")`.

**Task 3 — INV-03 source-assertion tests:**

- New `describe("Phase 8 INV-03 stock decrement/restore wiring")` block in `orders.test.ts`
- 7 new cases asserting: db.transaction in both actions, sql template decrement/restore, D-03 guard (itemType + serviceId != null), revalidatePath for /inventory and /inventory/alerts
- All 17 tests pass (10 Phase 6 + 7 new)

## Files modified

- `src/_schemas/order-wizard.ts` — added serviceId to partItemSchema
- `src/app/(dashboard)/orders/new/steps/step-03-parts.tsx` — serviceId in appendPart
- `src/app/(dashboard)/orders/new/order-wizard.tsx` — serviceId in partItems map
- `src/_actions/orders.ts` — atomic transactions for create and delete
- `src/_actions/orders.test.ts` — INV-03 source-assertion suite

## Verification

- `npx tsc --noEmit` — exits 0
- `npm run test:run -- src/_actions/orders.test.ts` — 17/17 passed
- Manual checkpoint (Task 4) pending: INV-01/INV-02 pages + INV-03 live decrement/restore

## Requirements closed

- INV-01: parts list + low-stock alerts render from live seed (pre-existing, confirmed by context)
- INV-02: purchase orders CRUD with "confirmed" status (pre-existing, confirmed by context)
- INV-03: stock decrement on O.S. create and restore on O.S. delete — **implemented this plan**
