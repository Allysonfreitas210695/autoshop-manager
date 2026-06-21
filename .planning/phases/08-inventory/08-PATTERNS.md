# Phase 8: Inventory - Pattern Map

**Mapped:** 2026-06-21
**Files analyzed:** 4 modified files
**Analogs found:** 4 / 4

---

## File Classification

| Modified File                                            | Role                     | Data Flow        | Closest Analog                                              | Match Quality                                                                     |
| -------------------------------------------------------- | ------------------------ | ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `src/_actions/orders.ts`                                 | service / server-action  | CRUD + batch     | `src/_actions/orders.ts` itself (updateOrderStatusAction)   | exact — same file, same authActionClient + sequential-await pattern to be wrapped |
| `src/_schemas/order-wizard.ts`                           | schema / validation      | transform        | `src/_schemas/order-wizard.ts` itself (checklistItemSchema) | exact — same schema file, same z.object() extension pattern                       |
| `src/app/(dashboard)/orders/new/order-wizard.tsx`        | component / orchestrator | request-response | same file — `handleFinalSubmit`                             | exact — one-line field addition in existing map()                                 |
| `src/app/(dashboard)/orders/new/steps/step-03-parts.tsx` | component / form         | event-driven     | same file — `addPart()` function                            | exact — `appendPart({...})` call site                                             |

---

## Pattern Assignments

### `src/_actions/orders.ts` — `createOrderAction` (wrap in db.transaction + stock decrement)

**What to change:** Lines 49–111. Currently three sequential `await db.insert()` calls. Wrap all three plus a decrement loop inside `db.transaction(async (tx) => { ... })`. Replace `db.` with `tx.` throughout.

**Imports to add** (line 3 — extend existing drizzle-orm import):

```typescript
// BEFORE
import { and, eq } from "drizzle-orm";
// AFTER
import { and, eq, sql } from "drizzle-orm";
```

**Schema import to add** (line 8–14 — extend existing schema destructure):

```typescript
import {
  serviceOrderItems,
  serviceOrders,
  services, // ADD — needed for stock UPDATE
  transactions,
  vehicles,
} from "@/_db/schema";
```

**Core transaction pattern** — replace lines 50–110 body with:

```typescript
.action(async ({ parsedInput }) => {
  const totalAmount = parsedInput.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );

  const result = await db.transaction(async (tx) => {
    const [vehicle] = await tx
      .insert(vehicles)
      .values({
        plate: parsedInput.plate.toUpperCase(),
        make: "Não informado",
        model: parsedInput.vehicleModel,
        mileage: parsedInput.mileage ?? null,
      })
      .onConflictDoUpdate({
        target: vehicles.plate,
        set: {
          model: parsedInput.vehicleModel,
          mileage: parsedInput.mileage ?? null,
          updatedAt: new Date(),
        },
      })
      .returning({ id: vehicles.id });

    const [order] = await tx
      .insert(serviceOrders)
      .values({
        vehicleId: vehicle.id,
        customerId: parsedInput.customerId ?? null,
        mechanicId: parsedInput.mechanicId ?? null,
        description: parsedInput.description ?? null,
        clientReport: parsedInput.clientReport ?? null,
        diagnosis: parsedInput.diagnosis ?? null,
        serviceType: parsedInput.serviceType ?? null,
        priority: parsedInput.priority,
        status: parsedInput.status ?? "pending",
        dueAt: parsedInput.dueAt ? new Date(parsedInput.dueAt) : null,
        checklist: parsedInput.checklist ?? null,
        signatureUrl: parsedInput.signatureUrl ?? null,
        totalAmount: String(totalAmount),
      })
      .returning({
        id: serviceOrders.id,
        orderNumber: serviceOrders.orderNumber,
      });

    if (parsedInput.items.length > 0) {
      await tx.insert(serviceOrderItems).values(
        parsedInput.items.map((i) => ({
          serviceOrderId: order.id,
          description: i.description,
          itemType: i.itemType,
          quantity: i.quantity,
          unitPrice: String(i.unitPrice),
          serviceId: i.serviceId ?? null,
          approved: true,
        })),
      );
    }

    // INV-03: atomic stock decrement for catalog-linked parts (D-01, D-02, D-03)
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

  revalidatePath("/orders");
  revalidatePath("/inventory");        // ADD — D-05 revalidation
  revalidatePath("/inventory/alerts"); // ADD — D-05 revalidation
  return result;
});
```

**Key rules:**

- `sql` template avoids read-modify-write race (D-04, Pitfall 3)
- All `db.` calls become `tx.` inside the callback
- `revalidatePath` stays OUTSIDE the transaction callback (it is not a DB operation)
- D-04: no stock floor check — allow negative values

---

### `src/_actions/orders.ts` — `deleteOrderAction` (wrap in db.transaction + stock restore)

**What to change:** Lines 153–161. Currently two sequential deletes. Must SELECT items BEFORE deleting (Pitfall 2 — cascade removes them after delete).

**Core transaction pattern** — replace lines 155–160 with:

```typescript
.action(async ({ parsedInput }) => {
  await db.transaction(async (tx) => {
    // D-05: SELECT before DELETE — cascade removes items after serviceOrders delete
    const items = await tx
      .select()
      .from(serviceOrderItems)
      .where(eq(serviceOrderItems.serviceOrderId, parsedInput.id));

    const partItemsToRestore = items.filter(
      (i) => i.itemType === "part" && i.serviceId != null,
    );

    // Restore stock atomically (D-05)
    for (const item of partItemsToRestore) {
      await tx
        .update(services)
        .set({ stockQuantity: sql`${services.stockQuantity} + ${item.quantity}` })
        .where(eq(services.id, item.serviceId!));
    }

    // Delete order — cascade removes serviceOrderItems via FK
    await tx.delete(serviceOrders).where(eq(serviceOrders.id, parsedInput.id));
  });

  revalidatePath("/orders");
  revalidatePath("/inventory");        // ADD
  revalidatePath("/inventory/alerts"); // ADD
});
```

**Key rules:**

- Remove the explicit `serviceOrderItems` delete (line 157–159 currently) — cascade handles it
- SELECT items first, then delete order
- `revalidatePath` outside transaction

---

### `src/_schemas/order-wizard.ts` — Add `serviceId` to `partItemSchema`

**Analog pattern:** `checklistItemSchema` (lines 36–41) — same z.object() with an optional string field.

**What to change:** Lines 52–58. Add `serviceId` field:

```typescript
// BEFORE (lines 52–58)
const partItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
});

// AFTER
const partItemSchema = z.object({
  id: z.string(),
  serviceId: z.string().optional(), // ADD — services.id for stock decrement
  name: z.string(),
  category: z.string(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
});
```

`PartItem` type (line 82) is inferred from this schema — it updates automatically, no separate type change needed.

---

### `src/app/(dashboard)/orders/new/steps/step-03-parts.tsx` — Pass `serviceId` in `appendPart`

**Analog pattern:** existing `appendPart` call site at lines 62–69.

**What to change:** Lines 62–69. Add `serviceId` field:

```typescript
// BEFORE
appendPart({
  id: part.id,
  name: part.name,
  category: part.category ?? "",
  quantity: 1,
  unitPrice: part.unitPrice,
});

// AFTER
appendPart({
  id: part.id,
  serviceId: part.id, // ADD — same UUID; part.id === services.id
  name: part.name,
  category: part.category ?? "",
  quantity: 1,
  unitPrice: part.unitPrice,
});
```

**Note:** `part.id` is the `services.id` UUID. The `id` field is used by `useFieldArray` as React key; `serviceId` is the DB reference forwarded to `createOrderAction`.

---

### `src/app/(dashboard)/orders/new/order-wizard.tsx` — Forward `serviceId` in `handleFinalSubmit`

**Analog pattern:** existing `partItems` map at lines 119–126.

**What to change:** Lines 119–126. Add `serviceId` to the mapped object:

```typescript
// BEFORE (lines 119–126)
const partItems = (
  (wizardData.step3.parts as PartItem[] | undefined) ?? []
).map((p) => ({
  description: p.name,
  itemType: "part" as const,
  quantity: p.quantity,
  unitPrice: p.unitPrice,
}));

// AFTER
const partItems = (
  (wizardData.step3.parts as PartItem[] | undefined) ?? []
).map((p) => ({
  description: p.name,
  itemType: "part" as const,
  quantity: p.quantity,
  unitPrice: p.unitPrice,
  serviceId: p.serviceId, // ADD — forwarded to createOrderAction for decrement
}));
```

No import changes needed — `PartItem` type already imported from `@/_schemas/order-wizard` (line 14).

---

## Shared Patterns

### authActionClient wrapper

**Source:** `src/_actions/orders.ts` lines 16–18, 113–115, 153–154
**Apply to:** All action modifications — do not change the outer wrapper, only the `.action()` body.

```typescript
export const someAction = authActionClient
  .schema(z.object({ ... }))
  .action(async ({ parsedInput }) => {
    // all mutations here
  });
```

### revalidatePath placement

**Source:** `src/_actions/orders.ts` lines 109, 147–150
**Apply to:** Both `createOrderAction` and `deleteOrderAction` after this phase
**Rule:** `revalidatePath` is called AFTER `await db.transaction(...)` resolves — never inside the transaction callback.

```typescript
// outside transaction:
revalidatePath("/orders");
revalidatePath("/inventory");
revalidatePath("/inventory/alerts");
```

### sql atomic update

**Source:** `src/_actions/inventory.ts` (established pattern); `drizzle-orm` docs
**Apply to:** Both decrement and restore loops in `orders.ts`

```typescript
import { sql } from "drizzle-orm";

// decrement
.set({ stockQuantity: sql`${services.stockQuantity} - ${item.quantity}` })

// restore
.set({ stockQuantity: sql`${services.stockQuantity} + ${item.quantity}` })
```

### Number() for numeric columns

**Source:** Phase 6 established pattern; `src/_data-access/inventory.ts`
**Apply to:** Any place `stockQuantity` is read back as a value (not needed for the UPDATE path since we use sql template)
**Rule:** `numeric(12,2)` columns return JS strings — wrap with `Number()` if used in arithmetic after SELECT.

---

## No Analog Found

None. All four files have direct analogs (three are self-referential — patterns exist within the same file being modified).

---

## Metadata

**Analog search scope:** `src/_actions/`, `src/_schemas/`, `src/app/(dashboard)/orders/new/`
**Files read:** 4 source files (orders.ts, order-wizard.ts schema, order-wizard.tsx, step-03-parts.tsx)
**Pattern extraction date:** 2026-06-21
