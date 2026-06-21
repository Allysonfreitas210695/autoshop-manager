# Phase 8: Inventory - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the inventory module (parts list, low-stock alerts, purchase orders) to the real database, and implement stock decrement when parts are added to a service order (INV-03). All data-access and action files already import from Drizzle — the gap is INV-03 (no stock decrement in createOrderAction) and seed data for parts.

</domain>

<decisions>
## Implementation Decisions

### Stock Decrement (INV-03)

- **D-01:** Decrement happens at O.S. **creation** (in `createOrderAction`, when the wizard is completed) — not at completion. Parts are considered reserved as soon as the O.S. is created.
- **D-02:** Decrement must be atomic — wrapped in `db.transaction()` together with the `serviceOrders` insert and `serviceOrderItems` insert. If any insert fails, no decrement occurs.
- **D-03:** Only decrement for items where `itemType = 'part'` AND `serviceId != null` (catalog-linked parts). Ad-hoc labor items and parts without a catalog entry are ignored.

### Stock Guard

- **D-04:** No blocking guard — allow stock to go negative. The existing low-stock alerts (`/inventory/alerts`) serve as the warning mechanism. INV-03 only requires the decrement, not a stock-floor constraint.

### Stock Restore on Delete

- **D-05:** When `deleteOrderAction` is called, restore the stock for all `serviceOrderItems` with `itemType = 'part'` AND `serviceId != null`. Restore must be atomic — wrapped in the same `db.transaction()` as the delete. Formula: `stockQuantity += item.quantity` per affected `services` row.

### Seed Data

- **D-06:** Add representative parts to `scripts/seed.ts`. Cover 4 categories: Filtros, Óleo, Freios, Elétrico. Include at least one part with `stockQuantity < minStock` to trigger the low-stock alert path. ~6–8 parts total.
- **D-07:** No seed required for purchase orders — the UI allows creation and the enum already includes "confirmed" (migration 0003 applied). Manual creation is sufficient for UAT.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema and Data Access

- `src/_db/schema/services.ts` — `services` table (parts use `type = 'part'`; `stockQuantity`, `minStock`, `price numeric(12,2)`)
- `src/_db/schema/purchase-orders.ts` — `purchaseOrders` + `purchaseOrderItems` tables; `purchaseOrderStatus` enum (includes "confirmed")
- `src/_data-access/inventory.ts` — existing Drizzle queries: `listParts`, `getLowStockParts`, `getInventoryMetrics`, `searchParts`, `listPurchaseOrders`, `getPurchaseOrderItems`
- `src/_actions/inventory.ts` — existing actions: `createPartAction`, `updateStockAction`, `createPurchaseOrderAction`, `updatePurchaseOrderStatusAction`

### Orders Integration (INV-03)

- `src/_actions/orders.ts` — `createOrderAction` (needs stock decrement added), `deleteOrderAction` (needs stock restore added)
- `src/_db/schema/service-orders.ts` — `serviceOrderItems` table with `itemType`, `serviceId`, `quantity`

### Seed

- `scripts/seed.ts` — must be updated to insert parts into `services` table with `type = 'part'`

### Requirements

- `.planning/REQUIREMENTS.md` — INV-01, INV-02, INV-03 (Phase 8 scope)

### Prior Phase Decisions

- `numeric(12,2)` columns return JS strings — wrap with `Number()` at data-access layer (established in Phase 6)
- `db.transaction()` pattern established in Phase 6 (see `updateOrderStatusAction`)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `UpdateStockDialog` (`src/app/(dashboard)/inventory/_components/UpdateStockDialog.tsx`) — existing UI for manual stock update; uses `updateStockAction`
- `authActionClient` (`src/_lib/safe-action.ts`) — standard action wrapper for all server actions
- `db.transaction()` — already used in Phase 6 patterns; same pattern for INV-03

### Established Patterns

- Data-access functions return typed objects with `Number()` applied to `numeric` columns
- Actions use `authActionClient.schema(z.object({...})).action(async ({ parsedInput }) => {...})`
- `revalidatePath` called after mutations — inventory pages need `/inventory` and `/inventory/alerts` revalidated after stock changes

### Integration Points

- `createOrderAction` in `src/_actions/orders.ts` — add `db.transaction()` wrapping existing inserts + stock decrement loop for part items with serviceId
- `deleteOrderAction` in `src/_actions/orders.ts` — add stock restore inside transaction
- `scripts/seed.ts` — add part inserts after existing seed data

### What's Already Wired (no changes needed)

- `/inventory` page → `listParts()` → real Drizzle
- `/inventory/alerts` page → `getLowStockParts()` → real Drizzle
- `/inventory/purchase-orders` page → `listPurchaseOrders()` → real Drizzle
- All inventory CRUD actions → real Drizzle inserts/updates

</code_context>

<specifics>
## Specific Ideas

- Low-stock seed: at least one part with `stockQuantity = 0` and `minStock = 5` to make the alerts page immediately testable
- The wizard step 3 (`step-03-parts.tsx`) already passes `serviceId` via `appendPart({ id: part.id, ... })` and `useStep3Form` maps it to `serviceId` in the order items array — confirm this field reaches `createOrderAction.items[].serviceId` before implementing the decrement

</specifics>

<deferred>
## Deferred Ideas

- CLI-02 (`/customers/[id]` with vehicles + O.S. history) — pending from Phase 7 UAT; belongs to Phase 7 scope or a dedicated fix task, not Phase 8
- Server-side pagination for large parts lists — Future requirement (documented in REQUIREMENTS.md)
- Purchase order seed data — deferred; manual creation via UI is sufficient for v1.1 UAT

</deferred>

---

_Phase: 8-inventory_
_Context gathered: 2026-06-21_
