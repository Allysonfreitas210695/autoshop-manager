# Phase 6: Orders & Transactions - Pattern Map

**Mapped:** 2026-06-21
**Files analyzed:** 1 (single file modified — `src/_actions/orders.ts`)
**Analogs found:** 1 / 1

## File Classification

| New/Modified File        | Role                    | Data Flow                                                 | Closest Analog                                             | Match Quality |
| ------------------------ | ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------- | ------------- |
| `src/_actions/orders.ts` | service / server-action | CRUD + event-driven (transaction insert on status change) | `src/_actions/orders.ts` (existing functions in same file) | exact         |

## Pattern Assignments

### `src/_actions/orders.ts` — `updateOrderStatusAction` (modify existing)

**Analog:** `createOrderAction` in the same file (`src/_actions/orders.ts`, lines 11–106)

**Imports pattern** (lines 1–9 — current state, requires adding `transactions` and `and`):

```typescript
"use server";

import { and, eq } from "drizzle-orm"; // add `and`
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import {
  serviceOrderItems,
  serviceOrders,
  transactions,
  vehicles,
} from "@/_db/schema"; // add `transactions`
import { authActionClient } from "@/_lib/safe-action";
```

**Auth/wrapper pattern** (lines 108–114 — unchanged, keep as-is):

```typescript
export const updateOrderStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: z.enum(["pending", "in_progress", "completed", "delayed"]),
    }),
  )
  .action(async ({ parsedInput }) => {
```

**Core pattern — `.returning()` for atomic data capture** (analog: `createOrderAction` lines 68–88):

```typescript
// createOrderAction already demonstrates .returning() — copy this shape
const [order] = await db
  .insert(serviceOrders)
  .values({ ... })
  .returning({
    id: serviceOrders.id,
    orderNumber: serviceOrders.orderNumber,
  });
```

Apply to `updateOrderStatusAction` update:

```typescript
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
```

**Transaction insert pattern — guarded on "completed"** (analog: `createOrderAction` lines 90–102, batch insert pattern):

```typescript
if (parsedInput.status === "completed") {
  await db.insert(transactions).values({
    date: new Date(),
    description: `O.S. #${order.orderNumber}`,
    category: "Serviço",
    type: "income",
    amount: order.totalAmount, // string from .returning() — matches numeric(12,2) column type
    status: "paid",
    serviceOrderId: order.id,
  });
}
```

**revalidatePath pattern** (analog: lines 104–126 — expand existing calls):

```typescript
// Current: 2 paths. New: 4 paths
revalidatePath("/orders");
revalidatePath(`/orders/${parsedInput.id}`);
revalidatePath("/finance");
revalidatePath("/analytics");
```

Rule: always call `revalidatePath` after all `await` DB operations, never before.

---

### `src/_actions/orders.ts` — `approveOrderItemAction` (modify existing)

**Analog:** `getOrderById` in `src/_data-access/orders.ts` lines 173–177 (select from `serviceOrderItems`), and `createOrderAction` lines 63–66 (`reduce` totalAmount arithmetic).

**Core pattern — re-query approved items + reduce** (analog: `createOrderAction` lines 63–66 + `getOrderById` items select lines 173–177):

```typescript
// Pattern A — reduce in createOrderAction (lines 63–66):
const totalAmount = parsedInput.items.reduce(
  (s, i) => s + i.quantity * i.unitPrice,
  0,
);
String(totalAmount); // stored back as string

// Pattern B — items select from data-access (lines 173–177):
const items = await db
  .select()
  .from(serviceOrderItems)
  .where(eq(serviceOrderItems.serviceOrderId, id));
```

Combined into `approveOrderItemAction`:

```typescript
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
  (s, i) => s + i.quantity * Number(i.unitPrice), // Number() required — column is string
  0,
);

await db
  .update(serviceOrders)
  .set({ totalAmount: String(newTotal), updatedAt: new Date() })
  .where(eq(serviceOrders.id, parsedInput.orderId));
```

**revalidatePath pattern** (expand existing — line 160):

```typescript
// Current: 1 path. New: 2 paths
revalidatePath(`/orders/${parsedInput.orderId}/budget`);
revalidatePath(`/orders/${parsedInput.orderId}`);
```

---

## Shared Patterns

### Authentication wrapper

**Source:** `src/_actions/orders.ts` (all exported actions, lines 11, 108, 129, 139, 146)
**Apply to:** All action modifications — preserve `authActionClient` wrapper, never bypass.

```typescript
export const myAction = authActionClient
  .schema(z.object({ ... }))
  .action(async ({ parsedInput }) => { ... });
```

### numeric(12,2) string-arithmetic-string cycle

**Source:** `src/_actions/orders.ts` lines 63–66, 83, 97; `src/_data-access/orders.ts` line 201
**Apply to:** Any code reading `totalAmount` or `unitPrice` for arithmetic.

```typescript
// Read: always Number()
Number(i.unitPrice); // unitPrice column → JS number for math
// Write: always String()
totalAmount: String(newTotal); // back to string for Drizzle numeric column
```

### updatedAt on every business data update

**Source:** `src/_actions/orders.ts` lines 57–59, 119–123
**Apply to:** Every `db.update()` that touches business data.

```typescript
.set({ ..., updatedAt: new Date() })
```

### revalidatePath after all awaits

**Source:** `src/_actions/orders.ts` lines 104–105, 125–126
**Apply to:** All actions — call `revalidatePath` only after all DB operations complete.

```typescript
// wrong: revalidatePath before DB ops
// correct:
await db.update(...);
await db.insert(...);
revalidatePath("/path");
```

### `.returning()` to avoid second SELECT

**Source:** `src/_actions/orders.ts` lines 85–88 (`createOrderAction`)
**Apply to:** `updateOrderStatusAction` — capture `orderNumber` and `totalAmount` from the update itself.

```typescript
.returning({
  id: serviceOrders.id,
  orderNumber: serviceOrders.orderNumber,
  totalAmount: serviceOrders.totalAmount,
})
```

---

## No Analog Found

None. Both modifications follow patterns already established in `src/_actions/orders.ts` and `src/_data-access/orders.ts`.

---

## Metadata

**Analog search scope:** `src/_actions/`, `src/_data-access/`, `src/_db/schema/`
**Files scanned:** 4 (`orders.ts` actions, `orders.ts` data-access, `transactions.ts` schema, `schema/index.ts`)
**Pattern extraction date:** 2026-06-21
