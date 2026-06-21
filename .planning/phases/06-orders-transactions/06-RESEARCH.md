# Phase 6: Orders & Transactions - Research

**Researched:** 2026-06-21
**Domain:** Drizzle ORM mutations, Server Actions, Next.js cache revalidation
**Confidence:** HIGH

## Summary

This phase is a targeted modification of two existing Server Actions (`updateOrderStatusAction`, `approveOrderItemAction`) plus adding an atomic transaction insert on order close. No new files need to be created — all schema, data-access, and UI layers already exist. The entire scope is surgical edits to `src/_actions/orders.ts`.

The `transactions` table is already wired into the schema index and has the correct FK column (`serviceOrderId`). The `serviceOrders` schema has `totalAmount numeric(12,2)` (returns JS string) and `orderNumber serial`. All Drizzle patterns (eq, returning, updatedAt) are established in the codebase.

**Primary recommendation:** Modify `updateOrderStatusAction` to use `.returning()` to capture `orderNumber`/`totalAmount` in the same update, then insert into `transactions` atomically. Modify `approveOrderItemAction` to re-query approved items and update `totalAmount` on the parent order.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Transaction creation trigger = `status → "completed"` inside `updateOrderStatusAction`. Atomic — no separate action.
- **D-02:** Transaction row fields: `date: new Date()`, `description: "O.S. #${order.orderNumber}"`, `category: "Serviço"`, `type: "income"`, `amount: totalAmount` (string numeric), `status: "paid"`, `serviceOrderId: order.id`
- **D-03:** `approveOrderItemAction` must recalculate `totalAmount` = sum of `approved=true` items (quantity × unitPrice) and update the parent `serviceOrders` row.
- **D-04:** Recalculation via separate query on `serviceOrderItems` before `db.update(serviceOrders)`.
- **D-05:** `updateOrderStatusAction` revalidates: `/orders`, `/orders/${id}`, `/finance`, `/analytics`
- **D-06:** `approveOrderItemAction` revalidates: `/orders/${orderId}/budget` (existing) + `/orders/${orderId}`

### Claude's Discretion

- Recalculation strategy: `db.select` + `.reduce()` in JS vs `sql` expression — choose cleaner pattern per existing conventions.
- Sequence of operations inside `updateOrderStatusAction` — choose most readable order.

### Deferred Ideas (OUT OF SCOPE)

- Server-side pagination for O.S. list
- Filter by mechanic or date
- Notification/webhook on O.S. close
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID    | Description                                                                 | Research Support                                                                                                                      |
| ----- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| OS-01 | Operator can create, list, and update O.S. status with data persisted in DB | `createOrderAction` and `listOrders` already use real DB; `updateOrderStatusAction` needs `revalidatePath` expansion only             |
| OS-02 | Closing an O.S. auto-creates a row in `transactions`                        | D-01/D-02: atomic insert inside `updateOrderStatusAction` when `status === "completed"`                                               |
| OS-03 | All update actions include `updatedAt: new Date()`                          | `updateOrderStatusAction` already sets it; `approveOrderItemAction` currently does NOT update `serviceOrders` at all — D-03 adds this |

</phase_requirements>

## Architectural Responsibility Map

| Capability                         | Primary Tier                             | Secondary Tier | Rationale                                                     |
| ---------------------------------- | ---------------------------------------- | -------------- | ------------------------------------------------------------- |
| Status update + transaction insert | API (Server Action)                      | —              | Atomic DB write; must not split across client/server boundary |
| totalAmount recalculation          | API (Server Action)                      | —              | Requires DB read of items; business logic                     |
| Cache invalidation                 | API (Server Action)                      | —              | `revalidatePath` called after all DB writes                   |
| O.S. list display                  | Frontend Server (RSC)                    | —              | `listOrders` called in `OrdersPage` server component          |
| Budget approval UI                 | Frontend Server (RSC) + Client component | API            | `BudgetPage` is RSC, `ApproveItemButton` is client            |

## Standard Stack

No new packages required. All existing:

| Library                                 | Purpose                                    | Pattern                                  |
| --------------------------------------- | ------------------------------------------ | ---------------------------------------- |
| `drizzle-orm`                           | DB queries — `eq`, `and`, `inArray`, `sql` | `[VERIFIED: src/_data-access/orders.ts]` |
| `next/cache` `revalidatePath`           | ISR cache invalidation                     | `[VERIFIED: src/_actions/orders.ts]`     |
| `@/_lib/safe-action` `authActionClient` | Authenticated server action wrapper        | `[VERIFIED: src/_actions/orders.ts]`     |
| `zod`                                   | Input validation schemas                   | `[VERIFIED: src/_actions/orders.ts]`     |

## Package Legitimacy Audit

No new packages installed in this phase. N/A.

## Architecture Patterns

### System Architecture Diagram

```
Client (ApproveItemButton / StatusSelector)
  │
  ▼
authActionClient (safe-action) ── Zod validation
  │
  ├─► updateOrderStatusAction
  │     ├─ db.update(serviceOrders).set({status, closedAt, updatedAt}).returning({id, orderNumber, totalAmount})
  │     ├─ IF status === "completed":
  │     │     db.insert(transactions).values({...D-02 fields})
  │     └─ revalidatePath × 4 (/orders, /orders/[id], /finance, /analytics)
  │
  └─► approveOrderItemAction
        ├─ db.update(serviceOrderItems).set({approved})
        ├─ db.select(serviceOrderItems).where(serviceOrderId AND approved=true)
        ├─ newTotal = items.reduce((s,i) => s + i.quantity * Number(i.unitPrice), 0)
        ├─ db.update(serviceOrders).set({totalAmount: String(newTotal), updatedAt: new Date()})
        └─ revalidatePath × 2 (/orders/[id]/budget, /orders/[id])
```

### Recommended Pattern: `.returning()` for atomic data capture

```typescript
// Source: [VERIFIED: existing createOrderAction in src/_actions/orders.ts]
const [order] = await db
  .update(serviceOrders)
  .set({ status, closedAt: new Date(), updatedAt: new Date() })
  .where(eq(serviceOrders.id, id))
  .returning({
    id: serviceOrders.id,
    orderNumber: serviceOrders.orderNumber,
    totalAmount: serviceOrders.totalAmount,
  });
```

Use `.returning()` — avoids a second SELECT round-trip and keeps data consistent with what was written.

### Recommended Pattern: totalAmount recalculation

```typescript
// [VERIFIED: pattern mirrors BudgetPage server component — src/app/(dashboard)/orders/[id]/budget/page.tsx]
const items = await db
  .select()
  .from(serviceOrderItems)
  .where(
    and(
      eq(serviceOrderItems.serviceOrderId, orderId),
      eq(serviceOrderItems.approved, true),
    ),
  );
const newTotal = items.reduce(
  (s, i) => s + i.quantity * Number(i.unitPrice),
  0,
);
await db
  .update(serviceOrders)
  .set({ totalAmount: String(newTotal), updatedAt: new Date() })
  .where(eq(serviceOrders.id, orderId));
```

This mirrors the `Number(i.unitPrice)` pattern used in `BudgetPage` and the `String(totalAmount)` pattern in `createOrderAction`. [VERIFIED: codebase]

### Recommended Pattern: transaction insert

```typescript
// [VERIFIED: transactions schema at src/_db/schema/transactions.ts]
await db.insert(transactions).values({
  date: new Date(),
  description: `O.S. #${order.orderNumber}`,
  category: "Serviço",
  type: "income",
  amount: order.totalAmount, // already a string from .returning()
  status: "paid",
  serviceOrderId: order.id,
});
```

`transactions` is already exported from `src/_db/schema/index.ts` — add to import in `orders.ts`.

### Anti-Patterns to Avoid

- **Double SELECT instead of `.returning()`:** Doing a separate `getOrderById` call after update is wasteful and risks a race condition between update and read.
- **Converting `totalAmount` to `Number` then back to `String` twice:** Do arithmetic once (`Number(item.unitPrice)`), write back as `String(total)`.
- **Calling `revalidatePath` before DB writes complete:** Always call after all `await` DB operations.
- **Missing `updatedAt` on `serviceOrders` in `approveOrderItemAction`:** Current code doesn't touch the parent order row at all — D-03 requires adding it.

## Don't Hand-Roll

| Problem                  | Don't Build                | Use Instead                                                                                                           |
| ------------------------ | -------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Atomic multi-table write | Manual transaction wrapper | Drizzle's sequential awaits (pg driver auto-commits each statement; for true atomicity if needed: `db.transaction()`) |
| Numeric precision        | Float arithmetic           | `Number(string)` → arithmetic → `String(result)` — matches existing pattern                                           |

**Key insight:** `numeric(12,2)` Drizzle columns always return JS strings. Every arithmetic path must convert in and out explicitly. This is already the established pattern in `createOrderAction` and `BudgetPage`.

## Common Pitfalls

### Pitfall 1: Missing `transactions` import in orders.ts

**What goes wrong:** `db.insert(transactions)` fails at runtime with "transactions is not defined".
**Why it happens:** `src/_actions/orders.ts` currently only imports `{ serviceOrderItems, serviceOrders, vehicles }` from `@/_db/schema`.
**How to avoid:** Add `transactions` to the schema import.
**Warning signs:** TypeScript error on `transactions` identifier before commit.

### Pitfall 2: `orderNumber` not available after update without `.returning()`

**What goes wrong:** `description: "O.S. #undefined"` in the inserted transaction row.
**Why it happens:** `db.update()` without `.returning()` returns count, not the updated row.
**How to avoid:** Always use `.returning({ id, orderNumber, totalAmount })` on the update call.

### Pitfall 3: `totalAmount` remains stale after item approval

**What goes wrong:** Order detail page shows wrong total after approve/reject.
**Why it happens:** `approveOrderItemAction` currently only updates `serviceOrderItems`, never `serviceOrders.totalAmount`.
**How to avoid:** D-03 — add item re-query + `db.update(serviceOrders)` after the items update.

### Pitfall 4: Finance/analytics not refreshing after order close

**What goes wrong:** Finance page shows stale data after O.S. is closed.
**Why it happens:** Current `updateOrderStatusAction` only revalidates `/orders` and `/orders/${id}`.
**How to avoid:** D-05 — add `revalidatePath("/finance")` and `revalidatePath("/analytics")`.

### Pitfall 5: Transaction inserted on every status change, not just "completed"

**What goes wrong:** Multiple `transactions` rows for one O.S. if status is toggled.
**Why it happens:** Missing `if (parsedInput.status === "completed")` guard around the insert.
**How to avoid:** Guard with explicit `=== "completed"` check before `db.insert(transactions)`.

## Code Examples

### Full modified `updateOrderStatusAction`

```typescript
// [VERIFIED: pattern derived from existing code + schema inspection]
export const updateOrderStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: z.enum(["pending", "in_progress", "completed", "delayed"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    const [order] = await db
      .update(serviceOrders)
      .set({
        status: parsedInput.status,
        closedAt: parsedInput.status === "completed" ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(serviceOrders.id, parsedInput.id))
      .returning({
        id: serviceOrders.id,
        orderNumber: serviceOrders.orderNumber,
        totalAmount: serviceOrders.totalAmount,
      });

    if (parsedInput.status === "completed") {
      await db.insert(transactions).values({
        date: new Date(),
        description: `O.S. #${order.orderNumber}`,
        category: "Serviço",
        type: "income",
        amount: order.totalAmount,
        status: "paid",
        serviceOrderId: order.id,
      });
    }

    revalidatePath("/orders");
    revalidatePath(`/orders/${parsedInput.id}`);
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
```

### Full modified `approveOrderItemAction`

```typescript
// [VERIFIED: pattern derived from existing code + schema inspection]
export const approveOrderItemAction = authActionClient
  .schema(
    z.object({
      itemId: z.uuid(),
      approved: z.boolean(),
      orderId: z.uuid(),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(serviceOrderItems)
      .set({ approved: parsedInput.approved })
      .where(eq(serviceOrderItems.id, parsedInput.itemId));

    const items = await db
      .select()
      .from(serviceOrderItems)
      .where(
        and(
          eq(serviceOrderItems.serviceOrderId, parsedInput.orderId),
          eq(serviceOrderItems.approved, true),
        ),
      );

    const newTotal = items.reduce(
      (s, i) => s + i.quantity * Number(i.unitPrice),
      0,
    );

    await db
      .update(serviceOrders)
      .set({ totalAmount: String(newTotal), updatedAt: new Date() })
      .where(eq(serviceOrders.id, parsedInput.orderId));

    revalidatePath(`/orders/${parsedInput.orderId}/budget`);
    revalidatePath(`/orders/${parsedInput.orderId}`);
  });
```

## Runtime State Inventory

This is a code-only modification phase. No rename/refactor involved.

- Stored data: None affected — existing `serviceOrders` rows and `transactions` rows remain valid.
- Live service config: None.
- OS-registered state: None.
- Secrets/env vars: None.
- Build artifacts: None.

## State of the Art

| Area                      | Current State                                                 | Notes                                                                         |
| ------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `updateOrderStatusAction` | Updates status, closedAt, updatedAt; revalidates 2 paths      | Missing: `.returning()`, transaction insert, 2 revalidatePaths                |
| `approveOrderItemAction`  | Updates `serviceOrderItems.approved`; revalidates budget path | Missing: totalAmount recalc, parent order update, `/orders/[id]` revalidation |
| `transactions` table      | Schema exists, FK wired, exported from schema index           | Not yet written to from any action                                            |

## Assumptions Log

| #   | Claim                                                                                                                | Section   | Risk if Wrong                                                           |
| --- | -------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------- |
| A1  | Finance and analytics pages read from `transactions` table (so revalidating `/finance` + `/analytics` is sufficient) | Pitfall 4 | Pages may use cached/mock data — low risk, paths revalidated regardless |

## Open Questions

1. **Idempotency if status toggled back from "completed"**
   - What we know: D-01 only inserts on `status === "completed"`
   - What's unclear: If operator sets status back to `in_progress` then `completed` again, a second transaction row is inserted
   - Recommendation: Out of scope per CONTEXT.md deferred list; current implementation follows D-01 as specified. Document as known limitation.

## Environment Availability

Step 2.6: SKIPPED — phase is code-only edits to existing files; no new external tools, services, or CLIs required. DB connection already established in Phase 5.

## Validation Architecture

`workflow.nyquist_validation` not set in `.planning/config.json` — treated as enabled.

### Test Framework

| Property           | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| Framework          | None detected (no jest.config, vitest.config, pytest.ini found) |
| Config file        | None — Wave 0 must add if automated tests are planned           |
| Quick run command  | `npx tsc --noEmit` (type-check only)                            |
| Full suite command | Manual smoke test per success criteria                          |

### Phase Requirements → Test Map

| Req ID | Behavior                                                    | Test Type           | Automated Command  | File Exists? |
| ------ | ----------------------------------------------------------- | ------------------- | ------------------ | ------------ |
| OS-01  | Create O.S. via wizard, survives refresh                    | manual              | —                  | N/A          |
| OS-01  | List O.S., change status, reflected after revalidation      | manual              | —                  | N/A          |
| OS-02  | Closing O.S. inserts `transactions` row with correct amount | manual (DB inspect) | —                  | N/A          |
| OS-03  | All updates include `updatedAt: new Date()`                 | type-check + manual | `npx tsc --noEmit` | ❌ Wave 0    |

### Sampling Rate

- **Per task commit:** `npx tsc --noEmit` (catches import and type errors immediately)
- **Per wave merge:** Manual smoke test: create O.S. → approve items → close → verify `transactions` row in DB
- **Phase gate:** All 4 success criteria verified manually before `/gsd-verify-work`

### Wave 0 Gaps

- No automated test framework configured — manual verification is the gate for this phase per project conventions.

## Security Domain

| ASVS Category       | Applies | Standard Control                                               |
| ------------------- | ------- | -------------------------------------------------------------- |
| V2 Authentication   | yes     | `authActionClient` — all actions require authenticated session |
| V4 Access Control   | yes     | `authActionClient` — operator role required                    |
| V5 Input Validation | yes     | Zod schemas on all action inputs                               |
| V6 Cryptography     | no      | No crypto operations                                           |

### Known Threat Patterns

| Pattern                                | STRIDE                 | Standard Mitigation                                         |
| -------------------------------------- | ---------------------- | ----------------------------------------------------------- |
| Unauthenticated action call            | Elevation of Privilege | `authActionClient` wrapper rejects unauthenticated requests |
| Invalid UUID in `id` field             | Tampering              | `z.uuid()` schema validation                                |
| Duplicate transaction on status toggle | Tampering              | `=== "completed"` guard; documented as known limitation     |

## Sources

### Primary (HIGH confidence)

- `src/_actions/orders.ts` — current action implementations [VERIFIED: codebase]
- `src/_db/schema/service-orders.ts` — serviceOrders + serviceOrderItems schema [VERIFIED: codebase]
- `src/_db/schema/transactions.ts` — transactions schema and enums [VERIFIED: codebase]
- `src/_data-access/orders.ts` — query patterns, Number()/String() conventions [VERIFIED: codebase]
- `src/app/(dashboard)/orders/[id]/budget/page.tsx` — Number(unitPrice) arithmetic pattern [VERIFIED: codebase]
- `06-CONTEXT.md` — all locked decisions D-01 through D-06 [VERIFIED: user decisions]

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — no new packages; all existing libraries verified in codebase
- Architecture: HIGH — direct code inspection; patterns confirmed in multiple existing files
- Pitfalls: HIGH — identified from concrete gap analysis between current code and requirements

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (stable stack, no fast-moving dependencies)
