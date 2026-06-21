# Phase 7: Customers & Vehicles — Pattern Map

**Mapped:** 2026-06-21
**Files analyzed:** 6 new/modified files
**Analogs found:** 6 / 6

## File Classification

| New/Modified File                                                     | Role           | Data Flow        | Closest Analog                                                          | Match Quality |
| --------------------------------------------------------------------- | -------------- | ---------------- | ----------------------------------------------------------------------- | ------------- |
| `src/_actions/customers.ts`                                           | service/action | CRUD             | `src/_actions/customers.ts` (self — additions)                          | exact         |
| `src/_data-access/customers.ts`                                       | data-access    | CRUD             | `src/_data-access/customers.ts` (self — extension)                      | exact         |
| `src/app/(dashboard)/customers/page.tsx`                              | route/page     | request-response | `src/app/(dashboard)/customers/page.tsx` (self — addition)              | exact         |
| `src/app/(dashboard)/customers/customers-client.tsx`                  | component      | request-response | `src/app/(dashboard)/customers/customers-client.tsx` (self — migration) | exact         |
| `src/app/(dashboard)/customers/[id]/page.tsx`                         | route/page     | CRUD             | `src/app/(dashboard)/customers/[id]/page.tsx` (self — addition)         | exact         |
| `src/app/(dashboard)/customers/[id]/_components/EditVehicleModal.tsx` | component      | CRUD             | `src/app/(dashboard)/customers/_components/NewCustomerDrawer.tsx`       | role-match    |
| `src/_actions/customers.test.ts`                                      | test           | transform        | `src/_actions/orders.test.ts`                                           | exact         |

---

## Pattern Assignments

### `src/_actions/customers.ts` — additions: `updateVehicleAction`, `deleteVehicleAction`, email guards

**Analog:** `src/_actions/customers.ts` (existing) + `src/_lib/safe-action.ts`

**Imports pattern** (lines 1-9, existing file):

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { user, vehicles } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";
```

Add to imports: `import { ActionError } from "@/_lib/safe-action";`, `import { and, ne } from "drizzle-orm";`, and `serviceOrders` from `@/_db/schema`.

**Auth pattern** — all actions use `authActionClient` (lines 11, 38, 70):

```typescript
export const createCustomerAction = authActionClient
  .schema(z.object({ ... }))
  .action(async ({ parsedInput }) => { ... });
```

**Email guard pattern — D-01 (add to `createCustomerAction` before `db.insert`):**

```typescript
import { ActionError } from "@/_lib/safe-action";

// Before db.insert(user):
const existing = await db
  .select({ id: user.id })
  .from(user)
  .where(eq(user.email, parsedInput.email))
  .limit(1);

if (existing.length > 0) {
  throw new ActionError(
    "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.",
  );
}
```

**Email guard pattern — D-02 (add to `updateCustomerAction` before `db.update`, exclude self):**

```typescript
import { and, ne } from "drizzle-orm";

// Before db.update(user):
const existing = await db
  .select({ id: user.id })
  .from(user)
  .where(and(eq(user.email, parsedInput.email), ne(user.id, parsedInput.id)))
  .limit(1);

if (existing.length > 0) {
  throw new ActionError(
    "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.",
  );
}
```

**`updateVehicleAction` core pattern — D-05 (modeled on `createVehicleAction` lines 38-68):**

```typescript
export const updateVehicleAction = authActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      ownerId: z.string(),
      plate: z.string().min(7),
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.number().int().optional(),
      color: z.string().optional(),
      mileage: z.number().int().optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    // Plate UNIQUE guard (Pitfall 5 from RESEARCH.md):
    const plateConflict = await db
      .select({ id: vehicles.id })
      .from(vehicles)
      .where(
        and(
          eq(vehicles.plate, parsedInput.plate.toUpperCase()),
          ne(vehicles.id, parsedInput.id),
        ),
      )
      .limit(1);

    if (plateConflict.length > 0) {
      throw new ActionError(
        "Essa placa já está cadastrada para outro veículo.",
      );
    }

    await db
      .update(vehicles)
      .set({
        plate: parsedInput.plate.toUpperCase(),
        make: parsedInput.make,
        model: parsedInput.model,
        year: parsedInput.year ?? null,
        color: parsedInput.color ?? null,
        mileage: parsedInput.mileage ?? null,
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, parsedInput.id));

    revalidatePath(`/customers/${parsedInput.ownerId}`);
    revalidatePath("/customers");
    return { id: parsedInput.id };
  });
```

**`deleteVehicleAction` core pattern — D-05, D-07:**

```typescript
export const deleteVehicleAction = authActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      ownerId: z.string(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const linkedOrders = await db
      .select({ id: serviceOrders.id })
      .from(serviceOrders)
      .where(eq(serviceOrders.vehicleId, parsedInput.id))
      .limit(1);

    if (linkedOrders.length > 0) {
      throw new ActionError(
        "Este veículo possui ordens de serviço e não pode ser excluído.",
      );
    }

    await db.delete(vehicles).where(eq(vehicles.id, parsedInput.id));
    revalidatePath(`/customers/${parsedInput.ownerId}`);
    revalidatePath("/customers");
  });
```

**Error handling pattern** — `ActionError` caught by `handleServerError` in `safe-action.ts` (lines 11-19):

```typescript
// src/_lib/safe-action.ts lines 11-19
export const actionClient = createSafeActionClient({
  handleServerError(error) {
    if (error instanceof ActionError) {
      return error.message; // returned as error.serverError on client
    }
    console.error("Action error:", error);
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});
```

---

### `src/_data-access/customers.ts` — extension: `searchCustomers()` to cover CPF and plate

**Analog:** `src/_data-access/customers.ts` (existing, lines 182-197)

**Current `searchCustomers` pattern** (lines 182-197):

```typescript
export async function searchCustomers(query: string) {
  const lq = `%${query.toLowerCase()}%`;
  return db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      cpf: user.cpf,
    })
    .from(user)
    .where(
      sql`${user.role} = 'customer' and (lower(${user.name}) like ${lq} or lower(${user.email}) like ${lq})`,
    )
    .limit(10);
}
```

**Required extension — add CPF and plate (ILIKE join with vehicles):**

- Add `lower(${user.cpf}) like ${lq}` to the WHERE clause for CPF search.
- Add a `leftJoin(vehicles, eq(vehicles.ownerId, user.id))` and `lower(${vehicles.plate}) like ${lq}` for plate search.
- Pattern for leftJoin already used in `listCustomers` lines 68-73.

---

### `src/app/(dashboard)/customers/page.tsx` — add `q` searchParam for server-side search

**Analog:** `src/app/(dashboard)/customers/page.tsx` (existing, all 14 lines)

**Current pattern** (lines 1-14):

```typescript
import { listCustomers } from "@/_data-access/customers";
import { CustomersClient } from "./customers-client";

export const metadata = { title: "Clientes — Precision Auto" };

type Props = { searchParams: Promise<{ page?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const result = await listCustomers(page);
  return <CustomersClient result={result} />;
}
```

**Required change — read `q` param and branch:**

```typescript
type Props = { searchParams: Promise<{ page?: string; q?: string }> };

export default async function CustomersPage({ searchParams }: Props) {
  const { page: pageParam, q } = await searchParams;

  if (q && q.trim().length >= 2) {
    const customers = await searchCustomers(q.trim());
    return <CustomersClient searchResults={customers} query={q} />;
  }

  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const result = await listCustomers(page);
  return <CustomersClient result={result} />;
}
```

---

### `src/app/(dashboard)/customers/customers-client.tsx` — migrate search to server-side

**Analog:** `src/app/(dashboard)/customers/customers-client.tsx` (existing, all 283 lines)

**Debounce pattern — D-04 (replace client-side `filtered` logic):**

```typescript
// Current pattern to REMOVE (lines 107-115):
const filtered =
  search.trim().length >= 2
    ? customers.filter((c) => ...)
    : customers;

// Replace with debounced router.push:
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleSearchChange(value: string) {
  setSearch(value);
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim().length >= 2) {
      params.set("q", value.trim());
      params.delete("page");
    } else {
      params.delete("q");
    }
    router.push(`?${params.toString()}`);
  }, 300);
}
```

**`goToPage` pattern** (lines 122-129) — reuse unchanged for pagination:

```typescript
const goToPage = useCallback(
  (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  },
  [router, searchParams],
);
```

**Props update — accept both paginated result and search results:**

- When `q` present, page receives flat `customers` array (no pagination) → hide pagination controls.
- When `q` absent, page receives `ListCustomersResult` → show pagination normally.

---

### `src/app/(dashboard)/customers/[id]/page.tsx` — add edit/delete icons on vehicle cards

**Analog:** `src/app/(dashboard)/customers/[id]/page.tsx` (existing, lines 182-221)

**Current vehicle card pattern** (lines 189-220):

```typescript
{customer.vehicles.map((vehicle) => (
  <div
    key={vehicle.id}
    className="border-outline-variant bg-surface-container space-y-3 rounded-lg border p-4"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-body-md text-on-surface font-semibold">
          {vehicle.make} {vehicle.model}
        </p>
        <p className="text-label-sm text-on-surface-variant font-mono">
          {vehicle.year ?? "—"} · {vehicle.color ?? "—"}
        </p>
      </div>
      <span className="border-secondary/30 bg-secondary/10 text-label-sm text-secondary rounded-full border px-2 py-0.5 font-mono font-bold">
        {vehicle.plate}
      </span>
    </div>
    {/* mileage section */}
  </div>
))}
```

**Required change — add `VehicleCardActions` client component inline or as import:**

```tsx
// Add Pencil and Trash2 icons from lucide-react to vehicle card header
import { Pencil, Trash2 } from "lucide-react";

// In card header flex, replace static plate badge with:
<div className="flex items-center gap-1">
  <span className="border-secondary/30 bg-secondary/10 text-label-sm text-secondary rounded-full border px-2 py-0.5 font-mono font-bold">
    {vehicle.plate}
  </span>
  <VehicleCardActions vehicle={vehicle} customerId={customer.id} />
</div>;
```

`VehicleCardActions` is a `"use client"` component that manages `EditVehicleModal` open state and `deleteVehicleAction` call. See component pattern below.

---

### `src/app/(dashboard)/customers/[id]/_components/EditVehicleModal.tsx` — new component

**Analog:** `src/app/(dashboard)/customers/_components/NewCustomerDrawer.tsx` (all 187 lines)

**Imports pattern** (from analog, lines 1-22):

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Car } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { updateVehicleAction } from "@/_actions/customers";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import type { CustomerVehicle } from "@/_data-access/customers";
```

**useAction + toast pattern** (from analog lines 56-65):

```typescript
const { execute, status } = useAction(updateVehicleAction, {
  onSuccess: () => {
    toast.success("Veículo atualizado com sucesso.");
    onClose();
  },
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Erro ao atualizar veículo.");
  },
});
```

**SheetClose render prop pattern** (from analog lines 171-173) — CRITICAL for Base UI:

```typescript
<SheetClose
  render={
    <Button variant="outline" onClick={onClose}>
      Cancelar
    </Button>
  }
/>
```

**Props type — include `customerId` for `ownerId` in action:**

```typescript
type Props = {
  vehicle: CustomerVehicle;
  customerId: string;
  open: boolean;
  onClose: () => void;
};
```

**Delete action — separate `VehicleCardActions` or inline in card:**

```typescript
const { execute: execDelete, status: deleteStatus } = useAction(
  deleteVehicleAction,
  {
    onSuccess: () => toast.success("Veículo removido."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao remover veículo."),
  },
);
```

---

### `src/_actions/customers.test.ts` — new static source-assertion test file

**Analog:** `src/_actions/orders.test.ts` (all 174 lines — exact copy of structure)

**File scaffold pattern** (lines 1-29):

```typescript
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const ACTIONS_DIR = dirname(fileURLToPath(import.meta.url));

interface ExportBlock {
  name: string;
  body: string;
}

function exportBlocks(source: string): ExportBlock[] {
  const matches = [...source.matchAll(/export const (\w+)\s*=/g)];
  return matches.map((match, index) => {
    const start = match.index ?? 0;
    const end = matches[index + 1]?.index ?? source.length;
    return { name: match[1], body: source.slice(start, end) };
  });
}

describe("Phase 7 customers actions wiring (D-01..D-07)", () => {
  const source = readFileSync(join(ACTIONS_DIR, "customers.ts"), "utf8");
  const blocks = exportBlocks(source);
  // ... assertions per requirement
});
```

**Assertion pattern** (from analog lines 35-45):

```typescript
it("D-01: createCustomerAction contains email guard before db.insert", () => {
  const block = blocks.find((b) => b.name === "createCustomerAction");
  expect(
    block?.body.includes("ActionError"),
    "createCustomerAction must throw ActionError for duplicate email",
  ).toBe(true);
  expect(
    block?.body.includes("E-mail já cadastrado"),
    "createCustomerAction must use the exact error message",
  ).toBe(true);
});
```

---

## Shared Patterns

### Authentication

**Source:** `src/_lib/safe-action.ts` lines 22-37
**Apply to:** All new server actions (`updateVehicleAction`, `deleteVehicleAction`)

```typescript
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new ActionError("Não autenticado.");
  return next({ ctx: { user: session.user, session: session.session } });
});
```

### Error Handling via ActionError

**Source:** `src/_lib/safe-action.ts` lines 9-19 + client usage in `NewCustomerDrawer.tsx` lines 62-64
**Apply to:** All new server actions and client components

```typescript
// Server side — throw for business rule violations:
throw new ActionError("Exact user-facing message here.");

// Client side — display in toast:
onError: ({ error }) => {
  toast.error(error.serverError ?? "Erro ao ...");
},
```

### revalidatePath after vehicle mutations

**Source:** `src/_actions/customers.ts` lines 66-67, 93-94
**Apply to:** `updateVehicleAction`, `deleteVehicleAction`

```typescript
revalidatePath(`/customers/${parsedInput.ownerId}`);
revalidatePath("/customers");
```

### searchParams-driven navigation (debounce)

**Source:** `src/app/(dashboard)/customers/customers-client.tsx` lines 122-129
**Apply to:** `customers-client.tsx` search migration

```typescript
const goToPage = useCallback(
  (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`?${params.toString()}`);
  },
  [router, searchParams],
);
// Same pattern for search: params.set("q", ...) / params.delete("q")
```

### useRef debounce (no extra lib)

**Source:** Standard React pattern (no existing codebase usage — apply directly)

```typescript
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
// In handler:
if (debounceRef.current) clearTimeout(debounceRef.current);
debounceRef.current = setTimeout(() => {
  /* router.push */
}, 300);
```

---

## No Analog Found

All files have close analogs in the codebase. No entries.

---

## Key Pitfalls (from RESEARCH.md)

| Pitfall                                                    | Guard                                                   |
| ---------------------------------------------------------- | ------------------------------------------------------- |
| `updateCustomerAction` email guard blocks self             | Use `ne(user.id, parsedInput.id)` in WHERE              |
| `searchCustomers()` misses CPF and plate                   | Extend query with `user.cpf` ILIKE + vehicles join      |
| `revalidatePath` after vehicle ops misses `/customers`     | Call both paths in every vehicle action                 |
| `deleteVehicleAction` missing `ownerId` for revalidatePath | Include `ownerId` in Zod schema                         |
| `updateVehicleAction` plate UNIQUE collision               | Pre-check `WHERE plate = ? AND id != ?` + `ActionError` |

---

## Metadata

**Analog search scope:** `src/_actions/`, `src/_data-access/`, `src/app/(dashboard)/customers/`, `src/_lib/`
**Files scanned:** 8
**Pattern extraction date:** 2026-06-21
