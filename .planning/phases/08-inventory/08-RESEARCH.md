# Phase 8: Inventory - Research

**Researched:** 2026-06-21
**Domain:** Drizzle ORM transactional mutations, wizard-to-action data flow, seed data
**Confidence:** HIGH

## Summary

Phase 8 is almost entirely an integration/wiring phase. The inventory UI (parts list, low-stock alerts, purchase orders) is already wired to real Drizzle queries via `listParts`, `getLowStockParts`, `getInventoryMetrics`, and `listPurchaseOrders`. No new UI is required for INV-01 and INV-02 — the gap is seed data so those pages render real rows.

INV-03 (stock decrement at O.S. creation) requires two changes to `src/_actions/orders.ts` and one schema fix in `src/_schemas/order-wizard.ts`. The critical blocker discovered in research: `handleFinalSubmit` in `order-wizard.tsx` builds the `partItems` array from `PartItem` records but **does not forward `serviceId`** to `createOrderAction`. The `PartItem` schema stores `id` (the part's DB UUID) but the field is excluded from the final payload. `createOrderAction` already accepts `serviceId` per item (`z.uuid().optional()`), so the wire-up is a one-line fix in `order-wizard.tsx` — but it must happen before the decrement loop can match items.

The seed in `scripts/seed.ts` already has 15 rich parts and 3 purchase orders — D-06 and D-07 are already fully satisfied. No seed changes are needed; the planner should verify against the seed at execution time.

**Primary recommendation:** Fix `partItemSchema` to include `serviceId`, forward it through `order-wizard.tsx`, then wrap `createOrderAction` and `deleteOrderAction` in `db.transaction()` with the decrement/restore loop.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Stock decrement happens at O.S. **creation** (`createOrderAction`), not at completion.
- **D-02:** Decrement is atomic — wrapped in `db.transaction()` together with the `serviceOrders` insert and `serviceOrderItems` insert.
- **D-03:** Only decrement items where `itemType = 'part'` AND `serviceId != null`.
- **D-04:** No blocking guard — allow negative stock.
- **D-05:** `deleteOrderAction` must restore stock atomically inside `db.transaction()`. Formula: `stockQuantity += item.quantity` per affected `services` row.
- **D-06:** Add 6–8 parts to `scripts/seed.ts` covering 4 categories (Filtros, Óleo, Freios, Elétrico); at least one with `stockQuantity < minStock`.
- **D-07:** No seed for purchase orders needed.

### Claude's Discretion

None specified.

### Deferred Ideas (OUT OF SCOPE)

- CLI-02 (`/customers/[id]` vehicle history) — Phase 7 scope.
- Server-side pagination for large parts lists.
- Purchase order seed data.
  </user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                | Research Support                                                                                                                                                                                                 |
| ------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-01 | Operator can list parts, view real low-stock alerts, update quantities                     | Seed data enables this; `listParts`, `getLowStockParts`, `getInventoryMetrics` already wired                                                                                                                     |
| INV-02 | Operator can create and list purchase orders with all valid statuses including "confirmed" | `purchaseOrderStatus` enum has "confirmed" (migration 0003 applied); `listPurchaseOrders` already wired                                                                                                          |
| INV-03 | When a part is added to an O.S., system decrements `stockQuantity` in the DB automatically | Requires: fix `partItemSchema` + `order-wizard.tsx` to forward `serviceId`, wrap `createOrderAction` in `db.transaction()` with decrement loop, wrap `deleteOrderAction` in `db.transaction()` with restore loop |

</phase_requirements>

---

## Architectural Responsibility Map

| Capability                     | Primary Tier                  | Secondary Tier | Rationale                                                                                         |
| ------------------------------ | ----------------------------- | -------------- | ------------------------------------------------------------------------------------------------- |
| Parts list / low-stock display | Frontend Server (RSC)         | —              | `listParts`, `getLowStockParts` are `server-only` data-access functions called in page components |
| Inventory metrics              | Frontend Server (RSC)         | —              | `getInventoryMetrics` is a server-only aggregation                                                |
| Purchase order list            | Frontend Server (RSC)         | —              | `listPurchaseOrders` is server-only                                                               |
| Stock decrement on O.S. create | API / Backend (Server Action) | —              | Must be transactional; belongs in `createOrderAction`                                             |
| Stock restore on O.S. delete   | API / Backend (Server Action) | —              | Must be transactional; belongs in `deleteOrderAction`                                             |
| Manual stock update            | API / Backend (Server Action) | —              | `updateStockAction` already implemented                                                           |
| Seed data                      | Database / Storage            | —              | `scripts/seed.ts` inserts directly via Drizzle                                                    |

## Standard Stack

No new packages are required for this phase. All dependencies are already installed.

### Core (already in project)

| Library            | Purpose                                   | Notes                                          |
| ------------------ | ----------------------------------------- | ---------------------------------------------- |
| `drizzle-orm`      | Transactional queries, `db.transaction()` | Pattern established in Phase 6                 |
| `next-safe-action` | `authActionClient` wrapper                | All actions use this                           |
| `zod`              | Schema validation                         | `partItemSchema` needs `serviceId` field added |

### Installation

None required.

## Package Legitimacy Audit

No new packages to install this phase.

---

## Architecture Patterns

### System Architecture Diagram

```
Wizard UI (client)
  └── appendPart({ id, name, category, quantity, unitPrice })
        └── [MISSING: serviceId not forwarded] ← FIX HERE
              └── handleFinalSubmit() in order-wizard.tsx
                    └── createOrderAction({ items: [...partItems, ...laborItems] })
                          └── db.transaction()
                                ├── INSERT into vehicles (upsert)
                                ├── INSERT into service_orders → order.id
                                ├── INSERT into service_order_items (all items)
                                └── FOR each item WHERE itemType='part' AND serviceId!=null
                                      UPDATE services SET stock_quantity = stock_quantity - item.quantity
                                            WHERE id = item.serviceId

deleteOrderAction({ id })
  └── db.transaction()
        ├── SELECT service_order_items WHERE serviceOrderId = id AND itemType='part' AND serviceId!=null
        ├── FOR each item → UPDATE services SET stock_quantity += item.quantity WHERE id = item.serviceId
        └── DELETE service_orders WHERE id = id (cascade deletes items)
```

### Fix Chain for INV-03

Three files need changes in sequence:

1. **`src/_schemas/order-wizard.ts`** — Add `serviceId` to `partItemSchema`:

   ```typescript
   const partItemSchema = z.object({
     id: z.string(), // keep — used by useFieldArray key
     serviceId: z.string().optional(), // ADD — the services.id for decrement
     name: z.string(),
     category: z.string(),
     quantity: z.number().min(1),
     unitPrice: z.number(),
   });
   ```

2. **`src/app/(dashboard)/orders/new/steps/step-03-parts.tsx`** — Pass `serviceId` when calling `appendPart`:

   ```typescript
   appendPart({
     id: part.id,
     serviceId: part.id, // ADD — same UUID, maps to services.id
     name: part.name,
     category: part.category ?? "",
     quantity: 1,
     unitPrice: part.unitPrice,
   });
   ```

3. **`src/app/(dashboard)/orders/new/order-wizard.tsx`** — Forward `serviceId` in `handleFinalSubmit`:
   ```typescript
   const partItems = (wizardData.step3.parts as PartItem[] | undefined) ?? []).map((p) => ({
     description: p.name,
     itemType: "part" as const,
     quantity: p.quantity,
     unitPrice: p.unitPrice,
     serviceId: p.serviceId,   // ADD
   }));
   ```

### Pattern: db.transaction() for createOrderAction

[CITED: drizzle-orm docs — transactions] [ASSUMED: exact API shape from Phase 6 established pattern]

The current `createOrderAction` performs three sequential `await db.insert()` calls (vehicles upsert, serviceOrders insert, serviceOrderItems insert). Wrapping in `db.transaction()` requires moving all three plus the decrement loop into the transaction callback:

```typescript
// src/_actions/orders.ts — createOrderAction (restructured)
import { sql } from "drizzle-orm";

// Inside .action(async ({ parsedInput }) => { ... })
await db.transaction(async (tx) => {
  const [vehicle] = await tx.insert(vehicles).values({ ... }).onConflictDoUpdate({ ... }).returning({ id: vehicles.id });

  const [order] = await tx.insert(serviceOrders).values({ ... }).returning({ id: serviceOrders.id, orderNumber: serviceOrders.orderNumber });

  if (parsedInput.items.length > 0) {
    await tx.insert(serviceOrderItems).values(parsedInput.items.map((i) => ({ ... })));
  }

  // INV-03: decrement stock for catalog-linked parts
  const partItemsToDecrement = parsedInput.items.filter(
    (i) => i.itemType === "part" && i.serviceId != null,
  );
  for (const item of partItemsToDecrement) {
    await tx
      .update(services)
      .set({ stockQuantity: sql`${services.stockQuantity} - ${item.quantity}` })
      .where(eq(services.id, item.serviceId!));
  }

  return { id: order.id, orderNumber: order.orderNumber };
});
```

Key: use `sql` template for `stockQuantity - quantity` to avoid a read-then-write race.
`sql` is already imported in `src/_data-access/inventory.ts`; needs importing in `src/_actions/orders.ts`.

### Pattern: db.transaction() for deleteOrderAction

Current `deleteOrderAction` does two sequential deletes without a transaction. Restructure:

```typescript
// src/_actions/orders.ts — deleteOrderAction (restructured)
await db.transaction(async (tx) => {
  // Fetch part items before delete (cascade will remove them)
  const items = await tx
    .select()
    .from(serviceOrderItems)
    .where(
      and(
        eq(serviceOrderItems.serviceOrderId, parsedInput.id),
        eq(serviceOrderItems.itemType, "part"),
      ),
    );

  const partItems = items.filter((i) => i.serviceId != null);

  // Restore stock
  for (const item of partItems) {
    await tx
      .update(services)
      .set({ stockQuantity: sql`${services.stockQuantity} + ${item.quantity}` })
      .where(eq(services.id, item.serviceId!));
  }

  // Delete order (cascade removes serviceOrderItems)
  await tx.delete(serviceOrders).where(eq(serviceOrders.id, parsedInput.id));
});
```

Note: `serviceOrderItems` has `onDelete: "cascade"` on `serviceOrderId`, so only deleting `serviceOrders` is sufficient — the items row-delete is already handled. Remove the explicit `serviceOrderItems` delete or do it before the restore.

### Pattern: revalidatePath after stock mutations

After `createOrderAction` and `deleteOrderAction`, revalidate inventory paths so the parts list and alerts page reflect new counts:

```typescript
revalidatePath("/orders");
revalidatePath("/inventory");
revalidatePath("/inventory/alerts");
```

Current `deleteOrderAction` only calls `revalidatePath("/orders")` — must add inventory paths.

### Seed Data Status

**D-06 is already satisfied.** `scripts/seed.ts` already contains 15 parts covering more than the required 4 categories, with multiple parts below `minStock` (marked "crítico" in comments). The seed also already inserts 3 purchase orders with statuses `sent`, `received`, and `draft` (satisfying INV-02 display).

The CONTEXT.md instruction to "add 6–8 parts to `scripts/seed.ts`" reflects the state before the seed was written. The current seed already exceeds D-06 requirements. No seed changes are needed for this phase.

**Planner note:** Wave 0 should verify the seed runs cleanly (`npm run db:seed`) and that `/inventory` and `/inventory/alerts` render data before implementing INV-03.

---

## Don't Hand-Roll

| Problem                 | Don't Build                                    | Use Instead                                                                               |
| ----------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Atomic decrement        | Manual read + compute + write (race condition) | `sql\`${services.stockQuantity} - ${item.quantity}\`` in single UPDATE inside transaction |
| Rollback on failure     | Try/catch with compensating writes             | `db.transaction()` — rolls back all changes if any statement throws                       |
| Stock restore on delete | Re-fetching items after delete                 | SELECT items BEFORE deleting the order (cascade removes them)                             |

---

## Common Pitfalls

### Pitfall 1: serviceId Not Forwarded to createOrderAction

**What goes wrong:** `handleFinalSubmit` in `order-wizard.tsx` builds `partItems` from `PartItem[]` but maps only `description`, `itemType`, `quantity`, `unitPrice`. `serviceId` is not included. The decrement loop in `createOrderAction` filters by `serviceId != null` — all items will be skipped.

**Why it happens:** `partItemSchema` in `order-wizard.ts` defines `id` (for `useFieldArray` key) but never maps it to `serviceId`. The wizard treats `id` as a React key, not a DB reference.

**How to avoid:** Add `serviceId: z.string().optional()` to `partItemSchema`, pass it in `appendPart`, and include it in the final execute call.

**Warning signs:** Decrement loop runs 0 iterations; stock values never change after O.S. creation.

### Pitfall 2: Deleting Items Before Reading Them (restore fails)

**What goes wrong:** Current `deleteOrderAction` deletes `serviceOrderItems` first, then `serviceOrders`. If restructured naively, reading items after the cascade delete returns empty — nothing to restore.

**How to avoid:** SELECT items first, then delete the order (cascade handles items). Or delete items explicitly after restore. Either way, SELECT must happen before any DELETE.

### Pitfall 3: Read-Modify-Write Race on stockQuantity

**What goes wrong:** `SELECT stockQuantity`, subtract in JS, `UPDATE SET stockQuantity = newValue` — concurrent requests can produce incorrect results.

**How to avoid:** Use `sql\`${services.stockQuantity} - ${item.quantity}\`` in a single UPDATE statement. The DB evaluates this atomically.

### Pitfall 4: Missing sql Import in orders.ts

**What goes wrong:** `sql` template literal is needed for the atomic decrement/restore; it is not currently imported in `src/_actions/orders.ts`.

**How to avoid:** Add `sql` to the `import { and, eq } from "drizzle-orm"` import.

### Pitfall 5: revalidatePath Not Called for Inventory After Order Mutations

**What goes wrong:** After creating or deleting an O.S., the inventory pages show stale stock counts until next cache revalidation.

**How to avoid:** Add `revalidatePath("/inventory")` and `revalidatePath("/inventory/alerts")` after both `createOrderAction` and `deleteOrderAction`.

---

## Code Examples

### Drizzle sql atomic decrement (established pattern)

```typescript
// [CITED: drizzle-orm docs]
import { sql } from "drizzle-orm";

await tx
  .update(services)
  .set({ stockQuantity: sql`${services.stockQuantity} - ${item.quantity}` })
  .where(eq(services.id, item.serviceId!));
```

### db.transaction() pattern (from Phase 6 — updateOrderStatusAction)

```typescript
// [ASSUMED — Phase 6 pattern; exact syntax matches drizzle-orm API]
await db.transaction(async (tx) => {
  const [result] = await tx.insert(table).values({ ... }).returning({ id: table.id });
  await tx.insert(otherTable).values({ ... });
  // If any statement throws, entire transaction rolls back
});
```

---

## State of the Art

| Old Approach                          | Current Approach                                  | Impact                                       |
| ------------------------------------- | ------------------------------------------------- | -------------------------------------------- |
| Sequential awaits for related inserts | `db.transaction()` wrapping all related mutations | Atomicity: partial writes no longer possible |
| Read-modify-write stock update        | Single `UPDATE SET qty = qty - N`                 | No race condition under concurrent requests  |

---

## Assumptions Log

| #   | Claim                                                                                      | Section                                  | Risk if Wrong                                                                                                     |
| --- | ------------------------------------------------------------------------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| A1  | Seed already satisfies D-06; no seed changes needed                                        | Architecture Patterns / Seed Data Status | If seed is stale or was wiped, INV-01/INV-02 will show empty tables — verify with `npm run db:seed` before INV-03 |
| A2  | `db.transaction()` callback receives a `tx` proxy identical to `db` for queries            | Code Examples                            | Wrong if Drizzle version uses a different transaction API — verify against installed version                      |
| A3  | `serviceOrderItems` cascade delete via `serviceOrders` delete is safe for restore workflow | Common Pitfalls                          | If FK behavior differs, items may persist or be deleted at wrong time                                             |

---

## Open Questions

1. **Does the seed need to be re-run as part of Wave 0?**
   - What we know: `scripts/seed.ts` has correct parts data; migration 0003 is applied.
   - What's unclear: Whether the live Neon DB already has parts from a previous seed run.
   - Recommendation: Make Wave 0 task 1 a smoke-test: `GET /inventory` returns non-empty parts list. If empty, run `npm run db:seed`.

2. **Should `updateStockAction` also revalidate `/inventory/alerts`?**
   - What we know: It only calls `revalidatePath("/inventory")` currently.
   - What's unclear: Whether this is intentional.
   - Recommendation: Add `/inventory/alerts` revalidation to `updateStockAction` as part of this phase — low risk, improves correctness.

---

## Environment Availability

Step 2.6: SKIPPED — no new external dependencies. All tools (Node, Drizzle, pg) are already confirmed operational from Phase 6/7.

---

## Validation Architecture

`workflow.nyquist_validation` is absent from `.planning/config.json` — treated as enabled.

### Test Framework

| Property           | Value                                                             |
| ------------------ | ----------------------------------------------------------------- |
| Framework          | Not detected (no jest.config, vitest.config, or pytest.ini found) |
| Config file        | None — Wave 0 gap                                                 |
| Quick run command  | N/A until framework installed                                     |
| Full suite command | N/A                                                               |

### Phase Requirements → Test Map

| Req ID | Behavior                                                             | Test Type        | Automated Command | File Exists?  |
| ------ | -------------------------------------------------------------------- | ---------------- | ----------------- | ------------- |
| INV-01 | Parts list renders real rows from DB                                 | smoke/manual     | —                 | ❌ Wave 0 gap |
| INV-01 | Low-stock alert appears for parts with stock <= minStock             | smoke/manual     | —                 | ❌ Wave 0 gap |
| INV-02 | Purchase orders list renders with "confirmed" status                 | smoke/manual     | —                 | ❌ Wave 0 gap |
| INV-03 | O.S. creation decrements stockQuantity for part items with serviceId | unit/integration | —                 | ❌ Wave 0 gap |
| INV-03 | O.S. deletion restores stockQuantity atomically                      | unit/integration | —                 | ❌ Wave 0 gap |
| INV-03 | Items with itemType='labor' or serviceId=null are not decremented    | unit             | —                 | ❌ Wave 0 gap |

Given no test framework is installed, INV-01 and INV-02 validations are manual (browser smoke test). INV-03 can be verified manually by observing `stockQuantity` before/after O.S. creation via the inventory page.

### Wave 0 Gaps

- [ ] No test framework installed — manual verification is the fallback for this phase
- [ ] Manual verification script: create O.S. with a catalog part, verify stock decremented on `/inventory`; delete O.S., verify stock restored

---

## Security Domain

| ASVS Category       | Applies | Standard Control                                                                            |
| ------------------- | ------- | ------------------------------------------------------------------------------------------- |
| V4 Access Control   | yes     | `authActionClient` wraps all mutations — only authenticated users can trigger stock changes |
| V5 Input Validation | yes     | Zod schema in `createOrderAction` validates `itemType` enum and `serviceId` as UUID         |
| V2 Authentication   | no      | Auth established in Phase 5                                                                 |
| V6 Cryptography     | no      | No crypto operations                                                                        |

No new security surface is introduced. Stock mutations are gated by `authActionClient` (session-checked). The `serviceId` field is validated as a UUID before being used in a Drizzle parameterized query — no injection risk.

---

## Sources

### Primary (HIGH confidence)

- Source code read directly: `src/_actions/orders.ts`, `src/_actions/inventory.ts`, `src/_data-access/inventory.ts`, `src/_db/schema/services.ts`, `src/_db/schema/service-orders.ts`, `src/_db/schema/purchase-orders.ts`, `src/_schemas/order-wizard.ts`, `src/_hooks/use-step-3-form.ts`, `src/app/(dashboard)/orders/new/order-wizard.tsx`, `scripts/seed.ts`
- `src/app/(dashboard)/inventory/inventory-client.tsx` — confirmed inventory UI is complete and reads from props (no mock data)
- `.planning/phases/08-inventory/08-CONTEXT.md` — locked decisions D-01 through D-07

### Secondary (MEDIUM confidence)

- Drizzle ORM transaction pattern — inferred from Phase 6 established pattern (`updateOrderStatusAction`) [ASSUMED API shape]

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all dependencies verified by reading source files
- Architecture: HIGH — exact code paths traced through wizard → action → schema
- Pitfalls: HIGH — serviceId gap confirmed by reading `order-wizard.tsx` lines 119–135
- Seed status: HIGH — `scripts/seed.ts` read in full; 15 parts and 3 POs confirmed present

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (stable codebase, no fast-moving dependencies)
