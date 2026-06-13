# Phase 3: Usabilidade (Usability) — Research

**Researched:** 2026-06-13
**Domain:** React form wiring (next-safe-action + react-hook-form), Next.js loading/error conventions, UI feedback patterns (toasts, skeletons, empty states, optimistic UI)
**Confidence:** HIGH — all findings verified against installed packages, in-codebase source files, and official Next.js 16 docs bundled at `node_modules/next/dist/docs/`

---

## Summary

Phase 3 corrects a pervasive problem: **forms submit mock data instead of calling server actions.** Three forms (`use-new-order-form`, `use-new-part-form`, `order-wizard`) use `setTimeout` or `console.log` stubs. One navigation bug sends "Cadastrar Novo Cliente" to the wrong route. Several server actions (`updateOrderStatusAction`, `approveOrderItemAction`, `updateStockAction`) exist but have no UI calling them. Additionally, no `loading.tsx` or `error.tsx` files exist anywhere in the dashboard route tree, so every data-fetching page shows a blank flash and unhandled errors crash rather than displaying a friendly message.

The correct wiring pattern already exists in the codebase: `use-appointment-form.ts` uses `useAction` from `next-safe-action/hooks` with `onSuccess`/`onError` callbacks. `NewPurchaseOrderClient.tsx` also demonstrates the same `useAction` pattern. The planner should replicate this pattern for every broken form. The `Skeleton` component already exists at `src/_components/ui/skeleton.tsx`. No new packages are required.

The critical complication for the order wizard: `createOrderAction` requires `vehicleId: z.uuid()` but the wizard collects `plate`, `customerName`, and `vehicleModel` — not a vehicle UUID. With the DB integration deferred (out of scope), the resolution is to change `createOrderAction`'s schema to accept `plate`/`vehicleModel`/`customerName` (string fields) instead of `vehicleId`, matching the mock-data-first milestone scope. The `BudgetPage` is a pure Server Component — to wire `approveOrderItemAction` it must be split into a Server/Client pair (Server Component fetches data, Client Component handles the interactive "Confirmar Aprovação" button and item approve toggles).

**Primary recommendation:** Wire all broken forms to their server actions using the `useAction` + `onSuccess` toast pattern from `use-appointment-form.ts`. Add `loading.tsx` + `error.tsx` per Next.js 16 App Router conventions to every dashboard route segment. No new packages are needed.

---

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                     | Research Support                                                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| USAB-01 | Data-fetching screens show loading states (skeletons/spinners)                  | `loading.tsx` file convention + existing `Skeleton` component; verified in Next.js 16 docs at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md`                   |
| USAB-02 | Error states render user-friendly messages instead of crashing or blank screens | `error.tsx` file convention; verified in Next.js 16 docs at `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`; prop is `unstable_retry` not `reset` in this version |
| USAB-03 | Forms give consistent inline validation feedback across all forms               | react-hook-form `formState.errors` already used in correctly-wired hooks; fix broken hooks to follow the canonical `use-appointment-form.ts` pattern                                                 |
| USAB-04 | Lists/tables with no data show empty states                                     | `DataTable` already accepts `emptyMessage` prop; pages without DataTable need standalone empty-state markup                                                                                          |
| USAB-05 | Create/update/delete actions give toast/confirmation feedback                   | sonner `toast.success`/`toast.error` already used in working examples; wire into `useAction` `onSuccess`/`onError` callbacks                                                                         |
| USAB-06 | Optimistic UI applied where appropriate                                         | `useOptimisticAction` from `next-safe-action/hooks` v8.5; apply to `updateOrderStatusAction` in OrdersClient                                                                                         |

</phase_requirements>

---

## Architectural Responsibility Map

| Capability                                 | Primary Tier                 | Secondary Tier             | Rationale                                                                                                  |
| ------------------------------------------ | ---------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Loading skeletons (USAB-01)                | Frontend Server (SSR)        | —                          | `loading.tsx` is a Server Component; Suspense boundary wraps `page.tsx` automatically                      |
| Error boundaries (USAB-02)                 | Frontend Server (SSR)        | Client (interactive retry) | `error.tsx` must be `"use client"` (React constraint); fetches on server trigger the boundary              |
| Form validation feedback (USAB-03)         | Browser / Client             | —                          | `formState.errors` from react-hook-form; purely client-side display                                        |
| Empty states (USAB-04)                     | Frontend Server (SSR)        | —                          | DataTable renders in Server Components that pass `data` prop; empty branch is just markup                  |
| Toast feedback for actions (USAB-05)       | Browser / Client             | —                          | `useAction` callbacks run on client after server responds                                                  |
| Optimistic UI for status updates (USAB-06) | Browser / Client             | API / Backend              | `useOptimisticAction` updates local state instantly; server action confirms persistence                    |
| Budget page item approval (USAB-05/06)     | Browser / Client (new) + API | —                          | BudgetPage is currently a pure Server Component; needs Server/Client split to support interactive approval |

---

## Standard Stack

### Core (already installed — no new installs required)

| Library               | Version (installed) | Purpose                                                 | Why Standard                                                                                              |
| --------------------- | ------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `next-safe-action`    | 8.5.3               | Type-safe server action execution + hooks               | Already wired via `authActionClient`; `useAction` and `useOptimisticAction` from `next-safe-action/hooks` |
| `react-hook-form`     | 7.76.1              | Form state management + validation                      | Already used in all form hooks; canonical pattern confirmed in `use-appointment-form.ts`                  |
| `@hookform/resolvers` | 5.4.0               | Zod integration with react-hook-form                    | Already used in all form hooks via `zodResolver`                                                          |
| `zod`                 | 4.4.3               | Schema validation                                       | Already used in all action schemas and form schemas                                                       |
| `sonner`              | 2.0.7               | Toast notifications                                     | Already used in the codebase; `<Toaster>` already in providers                                            |
| `next`                | 16.2.6              | `loading.tsx` / `error.tsx` file conventions, streaming | Verified in bundled docs                                                                                  |

### Supporting UI Components (already in codebase)

| Component   | Location                            | Purpose                                           |
| ----------- | ----------------------------------- | ------------------------------------------------- |
| `Skeleton`  | `src/_components/ui/skeleton.tsx`   | Pulse-animation placeholder for loading states    |
| `DataTable` | `src/_components/ui/data-table.tsx` | Already has `emptyMessage` prop for empty states  |
| `Button`    | `src/_components/ui/button.tsx`     | Disabled + loading states during action execution |

### No New Packages Required

Phase 3 exclusively uses what is already installed. No `npm install` steps are needed.

**Package Legitimacy Audit:** SKIPPED — no new packages are being installed in this phase. All libraries in use were validated in prior phases.

---

## Architecture Patterns

### System Architecture Diagram

```
User interaction (form submit / button click)
        │
        ▼
Client Component Hook (useAction / useOptimisticAction)
        │
        ├──► execute(input)
        │         │
        │         ▼
        │    authActionClient.action()  [Server — Drizzle insert/update]
        │         │
        │         ▼
        │    revalidatePath()           [Server — clears Next.js cache]
        │         │
        │         ▼
        │    return { data } or throw   [Server → Client via POST response]
        │
        ├── onSuccess → toast.success() + reset() + navigate
        └── onError   → toast.error(result.serverError)

Page load (Server Component):
  page.tsx (async) ──► data-access fn ──► DB query
        │
        ▼
  props to Client Component
  (loading.tsx shown by Next.js Suspense until page.tsx resolves)
  (error.tsx shown by React Error Boundary if page.tsx throws)
```

### Recommended Project Structure Changes

```
src/app/(dashboard)/
├── loading.tsx                    # NEW: global dashboard skeleton (Suspense boundary)
├── error.tsx                      # NEW: global dashboard error boundary
├── orders/
│   ├── loading.tsx                # NEW: orders-specific skeleton
│   ├── error.tsx                  # NEW: orders error boundary
│   └── [id]/budget/
│       ├── page.tsx               # MODIFY: keep as Server Component (data fetch only)
│       └── _components/
│           └── BudgetClient.tsx   # NEW: "use client" — approve toggles + useAction
├── customers/
│   ├── loading.tsx                # NEW: customers skeleton
│   └── error.tsx                  # NEW
├── inventory/
│   ├── loading.tsx                # NEW
│   └── error.tsx                  # NEW
└── appointments/
    ├── loading.tsx                # NEW
    └── error.tsx                  # NEW

src/_hooks/
├── use-appointment-form.ts        # UNCHANGED — canonical reference
├── use-new-order-form.ts          # DELETE or IGNORE — wizard handles submission directly
├── use-new-part-form.ts           # FIX: wire to createPartAction
└── use-update-order-status.ts     # NEW: useOptimisticAction for status chip

src/app/(dashboard)/customers/
└── _components/
    └── NewCustomerDrawer.tsx      # NEW: customer creation form (Sheet/Drawer pattern)
```

---

## Pattern 1: Correct Form Wiring (Canonical — use-appointment-form.ts)

**What:** `useAction` from `next-safe-action/hooks` wraps the server action. `execute()` is called inside `onSubmit`. Callbacks `onSuccess` and `onError` handle side effects.

**When to use:** Every form that calls an `authActionClient` action.

```typescript
// Source: src/_hooks/use-appointment-form.ts (in-codebase verified example)
// REPLICATE this pattern for use-new-part-form.ts and the order wizard

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

const { execute, status } = useAction(createPartAction, {
  onSuccess: () => {
    toast.success("Peça cadastrada com sucesso.");
    reset();
    router.push("/inventory");
  },
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Erro ao cadastrar peça.");
  },
});

function onSubmit(data: NewPartValues) {
  execute({
    name: data.name,
    sku: data.sku,
    price: data.unitPrice,
    stockQuantity: data.stock,
    minStock: data.minStock,
  });
}

// Disable submit button while executing:
// <Button disabled={status === "executing"} type="submit">
```

**Note on field mapping for createPartAction:** `use-new-part-form.ts` schema has `unitPrice` and `stock`; `createPartAction` expects `price` and `stockQuantity`. The hook's `onSubmit` must remap these fields.

---

## Pattern 2: Order Wizard Final Submit

**What:** `handleFinalSubmit` in `order-wizard.tsx` must call `createOrderAction`. Critical mismatch: `createOrderAction` requires `vehicleId: z.uuid()` but the wizard collects `plate`, `customerName`, `vehicleModel`.

**Resolution (mock-data-first scope):** `createOrderAction` schema must be updated to accept string fields instead of a vehicle UUID. The new schema aligns with what the wizard provides.

```typescript
// PROPOSED fix to src/_actions/orders.ts createOrderAction schema:
z.object({
  plate: z
    .string()
    .min(6)
    .max(8)
    .transform((v) => v.toUpperCase()),
  customerName: z.string().min(2),
  vehicleModel: z.string().min(2),
  clientReport: z.string().optional(),
  diagnosis: z.string().optional(),
  serviceType: z.string().optional(),
  priority: z.string().default("normal"),
  dueAt: z.string().datetime().optional(),
  items: z
    .array(
      z.object({
        description: z.string(),
        itemType: z.enum(["part", "labor"]),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      }),
    )
    .default([]),
});
```

**Wizard → action field mapping:**
| Wizard field | Source step | createOrderAction field |
|---|---|---|
| `step1.plate` | step1 | `plate` |
| `step1.customerName` | step1 | `customerName` |
| `step1.vehicleModel` | step1 | `vehicleModel` |
| `step2.customerReport` | step2 | `clientReport` |
| `step2.initialDiagnosis` | step2 | `diagnosis` |
| `step2.serviceType` | step2 | `serviceType` |
| `step2.priority` | step2 | `priority` |
| `step3.parts` → mapped to items | step3 | `items` (itemType: "part") |
| `step3.laborItems` → mapped to items | step3 | `items` (itemType: "labor") |
| `step4` (signature) | step4 | not stored in action (client-only) |

**Where to call `execute`:** in `handleFinalSubmit` in `order-wizard.tsx`. The wizard already collects all step data in `wizardData` state.

```typescript
// In order-wizard.tsx handleFinalSubmit — replace setTimeout stub:
import { useAction } from "next-safe-action/hooks";
import { createOrderAction } from "@/_actions/orders";
import { toast } from "sonner";

const { execute, status } = useAction(createOrderAction, {
  onSuccess: ({ data }) => {
    toast.success(`O.S. #${data?.orderNumber} criada com sucesso.`);
    router.push("/orders");
  },
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Erro ao criar O.S.");
  },
});

async function handleFinalSubmit(
  data: Step4Values,
  signatureDataUrl: string | null,
) {
  const parts = (wizardData.step3.parts ?? []).map((p) => ({
    description: p.name,
    itemType: "part" as const,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
  }));
  const labor = (wizardData.step3.laborItems ?? []).map((l) => ({
    description: l.description,
    itemType: "labor" as const,
    quantity: 1,
    unitPrice: l.price,
  }));

  execute({
    plate: wizardData.step1.plate ?? "",
    customerName: wizardData.step1.customerName ?? "",
    vehicleModel: wizardData.step1.vehicleModel ?? "",
    clientReport: wizardData.step2.customerReport,
    diagnosis: wizardData.step2.initialDiagnosis,
    serviceType: wizardData.step2.serviceType,
    priority: wizardData.step2.priority ?? "normal",
    items: [...parts, ...labor],
  });
}
```

**Loading state during wizard submit:** Disable "Gerar O.S." button when `status === "executing"`. The wizard footer button already has `form="wizard-step-form"` — Step04Signature's `onSubmit` calls `handleFinalSubmit`.

---

## Pattern 3: Customer Creation Form (Fix Wrong Route)

**What:** `customers-client.tsx` line 126 navigates to `/orders/new` — wrong. No customer creation form exists.

**Resolution:** Create `NewCustomerDrawer.tsx` as a `"use client"` Sheet (same pattern as `NewAppointmentDrawer.tsx`). Wire to `createCustomerAction`.

**`createCustomerAction` schema fields:**
| Field | Required | Validation |
|---|---|---|
| `name` | Yes | `z.string().min(2)` |
| `email` | Yes | `z.string().email()` |
| `phone` | No | `z.string().optional()` |
| `cpf` | No | `z.string().optional()` |
| `address` | No | `z.string().optional()` |

**Button fix:** Change `onClick={() => router.push("/orders/new")}` to open the `NewCustomerDrawer` with local `useState(false)` for open state.

---

## Pattern 4: Budget Page — Server/Client Split for approveOrderItemAction

**What:** `BudgetPage` at `src/app/(dashboard)/orders/[id]/budget/page.tsx` is a pure Server Component. The "Confirmar Aprovação" button and item approve toggles are plain `<button>` elements with no `onClick`.

**Resolution:** Extract interactive parts to `BudgetClient.tsx` (`"use client"`).

```typescript
// src/app/(dashboard)/orders/[id]/budget/_components/BudgetClient.tsx
"use client";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { approveOrderItemAction } from "@/_actions/orders";

export function ApproveItemButton({
  itemId, orderId, approved
}: { itemId: string; orderId: string; approved: boolean }) {
  const { execute, status } = useAction(approveOrderItemAction, {
    onSuccess: () => toast.success(approved ? "Item reprovado." : "Item aprovado."),
    onError: ({ error }) => toast.error(error.serverError ?? "Erro ao atualizar item."),
  });

  return (
    <button
      disabled={status === "executing"}
      onClick={() => execute({ itemId, orderId, approved: !approved })}
    >
      {/* toggle icon */}
    </button>
  );
}
```

`BudgetPage` (Server Component) fetches `order` data and renders it, passing `orderId` + item IDs to `ApproveItemButton` client components.

---

## Pattern 5: Optimistic UI for Order Status Updates (USAB-06)

**What:** `updateOrderStatusAction` exists but no UI calls it. `OrdersClient.tsx` shows status chips but has no status change UI.

**Resolution:** Add a status dropdown/select in each order row (or in a detail panel) using `useOptimisticAction`.

```typescript
// Source: next-safe-action/dist/hooks.d.mts (in-codebase verified)
// useOptimisticAction signature:
declare const useOptimisticAction: <ServerError, Schema, ShapedErrors, Data, State>(
  safeActionFn: SingleInputActionFn<...>,
  utils: {
    currentState: State;
    updateFn: (state: State, input: Input) => State;
  } & HookBaseOptions<...>
) => UseOptimisticActionHookReturn<..., State>;

// Usage pattern for order status:
const { execute, optimisticState } = useOptimisticAction(updateOrderStatusAction, {
  currentState: { status: order.status },
  updateFn: (state, input) => ({ status: input.status }),
  onSuccess: () => toast.success("Status atualizado."),
  onError: ({ error }) => toast.error(error.serverError ?? "Erro ao atualizar status."),
});
```

`optimisticState.status` updates immediately on click; server confirms or rolls back.

---

## Pattern 6: Next.js 16 loading.tsx Convention

**What:** Place `loading.tsx` in a route segment folder. Next.js wraps `page.tsx` in a `<Suspense>` boundary automatically, showing the loading component as fallback during streaming.

```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md
// src/app/(dashboard)/orders/loading.tsx
import { Skeleton } from "@/_components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}
```

`loading.tsx` is a Server Component by default. No `"use client"` needed unless interactive.

**Important Next.js 16 note:** `loading.tsx` alone does not guarantee instant client-side navigation. This is acceptable for Phase 3 — the goal is preventing blank flashes on initial load, not navigation optimization.

---

## Pattern 7: Next.js 16 error.tsx Convention

**What:** `error.tsx` must be `"use client"` (React Error Boundary constraint). In Next.js 16, the retry prop is `unstable_retry` (not `reset` from earlier versions).

```typescript
// Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md
"use client";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6">
      <p className="text-on-surface-variant font-mono text-sm">
        Ocorreu um erro inesperado.
      </p>
      <button
        onClick={unstable_retry}
        className="text-secondary font-mono text-sm underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}
```

**Design system alignment:** Use `text-on-surface-variant`, `font-mono`, `text-secondary` tokens consistent with Industrial Precision.

---

## Pattern 8: Empty States (USAB-04)

**What:** `DataTable` already renders `emptyMessage` as centered text when `data.length === 0`. This covers all table-based screens. Pages that show non-table lists or cards need standalone empty-state markup.

**Current DataTable behavior (verified in source):**

```typescript
// src/_components/ui/data-table.tsx — already handles empty:
{data.length === 0 ? (
  <TableRow>
    <TableCell colSpan={columns.length} className="text-body-md text-on-surface-variant py-10 text-center">
      {emptyMessage}
    </TableCell>
  </TableRow>
) : ...}
```

**What needs adding:** The `emptyMessage` prop is already available everywhere DataTable is used (e.g., `customers-client.tsx` line 170 already passes `emptyMessage="Nenhum cliente encontrado."`). The gap is pages with no data at all — appointments calendar with no appointments, inventory alerts with no critical items. For these, add an inline empty-state block:

```tsx
// Design-system-consistent empty state markup (no new component needed):
{
  items.length === 0 && (
    <div className="text-on-surface-variant flex flex-col items-center gap-3 py-12 font-mono">
      <PackageSearch className="size-8 opacity-40" />
      <p className="text-sm">Nenhum item encontrado.</p>
    </div>
  );
}
```

---

## Don't Hand-Roll

| Problem                     | Don't Build                                                       | Use Instead                                 | Why                                                                                                |
| --------------------------- | ----------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Loading boundary            | Custom `isLoading` state + conditional render in Server Component | `loading.tsx` file convention               | Next.js wraps `page.tsx` in Suspense automatically; no state needed                                |
| Error boundary              | Custom React ErrorBoundary class                                  | `error.tsx` file convention                 | Next.js 16 integrates this natively; `unstable_retry` triggers re-render                           |
| Optimistic state management | Local `useState` + rollback logic                                 | `useOptimisticAction` from next-safe-action | Built-in rollback on error; integrates with server action lifecycle                                |
| Toast configuration         | Custom toast component                                            | sonner `toast.success/error`                | Already configured, `<Toaster>` already in providers                                               |
| Form submission loading     | `isSubmitting` from react-hook-form                               | `status === "executing"` from `useAction`   | `isSubmitting` never resolves to true when action runs via `execute()`, not `handleSubmit(action)` |
| Schema duplication          | New form schema per hook                                          | Reuse action schema fields                  | `createOrderAction` schema is the source of truth; wizard schema can be a subset                   |

**Key insight:** The entire issue in Phase 3 is that developers used `isSubmitting` from react-hook-form as a loading indicator while calling `execute()` from `useAction` — these are decoupled. `isSubmitting` tracks react-hook-form's own async `onSubmit`; `execute()` bypasses that. Use `status === "executing"` from `useAction` for button disabled states.

---

## Common Pitfalls

### Pitfall 1: isSubmitting vs status from useAction

**What goes wrong:** Button stays enabled during server action execution because `isSubmitting` from `useForm` never becomes `true` when `execute()` is called directly (not via `handleSubmit(asyncFn)`).
**Why it happens:** react-hook-form only tracks `isSubmitting` for its own `handleSubmit` wrapper async function. `useAction.execute()` runs outside that lifecycle.
**How to avoid:** Disable submit button with `status === "executing"` from `useAction`, not `isSubmitting` from `useForm`.
**Warning signs:** Button can be clicked multiple times during submission.

### Pitfall 2: error.tsx retry prop name changed in Next.js 16

**What goes wrong:** Using `reset` as the retry prop (Next.js 14/15 name) causes TypeScript error or no-op.
**Why it happens:** Next.js 16 renamed the prop to `unstable_retry`.
**How to avoid:** Always use `unstable_retry` as confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md`.
**Warning signs:** `tsc` reports "Property 'reset' does not exist on type..."

### Pitfall 3: createOrderAction vehicleId mismatch

**What goes wrong:** Calling `createOrderAction` with `plate`/`vehicleModel` from the wizard without updating the action schema causes a Zod validation error at runtime (action rejects `vehicleId` missing).
**Why it happens:** `createOrderAction` was written for a future DB-integrated flow where vehicle lookup by plate returns a UUID. The wizard is mock-data-first.
**How to avoid:** Update `createOrderAction` schema to accept `plate`/`customerName`/`vehicleModel` strings, and update the DB insert accordingly (create a vehicle record inline or look up by plate). This is a required schema migration task before wiring the wizard.
**Warning signs:** Action returns validation error on submit, no O.S. created.

### Pitfall 4: BudgetPage Server Component cannot use hooks

**What goes wrong:** Adding `useAction` or `useState` directly to `BudgetPage` causes a build error ("Hooks can only be used in Client Components").
**Why it happens:** `BudgetPage` is `async` and a Server Component — React hooks are not available.
**How to avoid:** Extract the interactive elements (approve toggles, confirm button) to a new `"use client"` component (`BudgetClient.tsx` or `ApproveItemButton.tsx`). Pass data as props from the Server Component.
**Warning signs:** Build error "Error: You're importing a component that needs useState/useAction."

### Pitfall 5: Base UI render prop (not asChild)

**What goes wrong:** Writing `<Dialog.Trigger asChild><Button>...</Button></Dialog.Trigger>` instead of `<Dialog.Trigger render={<Button>...</Button>}>`.
**Why it happens:** @base-ui/react v1 uses the `render` prop pattern, not Radix UI's `asChild`.
**How to avoid:** Follow the LOCKED decision: Base UI uses `render` prop, never `asChild`.
**Warning signs:** TypeScript error "Property 'asChild' does not exist."

### Pitfall 6: Zod v4 `.default()` in form schemas

**What goes wrong:** Adding `.default()` in a form-facing Zod schema breaks react-hook-form's type inference.
**Why it happens:** LOCKED project decision: "no `.default()` in form schemas."
**How to avoid:** Use `defaultValues` in `useForm({ defaultValues: {...} })` instead of `.default()` in Zod schemas.
**Warning signs:** Form field TypeScript types become `T | undefined` unexpectedly.

---

## Critical Analysis: Schema/Field Mapping Summary

### createOrderAction (action schema vs wizard schema)

| Action field   | Type                    | Wizard source                      | Status                               |
| -------------- | ----------------------- | ---------------------------------- | ------------------------------------ |
| `vehicleId`    | `z.uuid()`              | **NOT collected**                  | CONFLICT — must change action schema |
| `customerId`   | optional string         | `step1.customerId` (optional)      | OK                                   |
| `mechanicId`   | optional string         | not collected                      | OK (optional)                        |
| `clientReport` | optional string         | `step2.customerReport`             | rename needed                        |
| `diagnosis`    | optional string         | `step2.initialDiagnosis`           | rename needed                        |
| `serviceType`  | optional string         | `step2.serviceType`                | OK                                   |
| `priority`     | string default "normal" | `step2.priority`                   | OK                                   |
| `items[]`      | array of objects        | `step3.parts` + `step3.laborItems` | mapping needed                       |

**Proposed fix:** Replace `vehicleId: z.uuid()` with `plate: z.string()`, `vehicleModel: z.string()`, `customerName: z.string()` in `createOrderAction`. Update the DB insert to store these fields directly (or look up vehicle by plate).

### createPartAction (action schema vs use-new-part-form schema)

| Form field  | Form type       | Action field      | Action type      | Status                                                                      |
| ----------- | --------------- | ----------------- | ---------------- | --------------------------------------------------------------------------- |
| `name`      | string min 2    | `name`            | string min 1     | OK                                                                          |
| `sku`       | string          | `sku`             | optional string  | OK                                                                          |
| `unitPrice` | number min 0.01 | `price`           | number min 0     | RENAME: `unitPrice` → `price`                                               |
| `stock`     | number min 0    | `stockQuantity`   | number int min 0 | RENAME: `stock` → `stockQuantity`                                           |
| `minStock`  | number min 1    | `minStock`        | number int min 0 | OK                                                                          |
| `category`  | enum string     | **NOT in action** | —                | category not stored via this action (services table has no category column) |
| `supplier`  | optional string | **NOT in action** | —                | supplier not stored via this action                                         |
| `location`  | optional string | **NOT in action** | —                | location not stored via this action                                         |

**Conclusion:** The form collects `category`, `supplier`, `location` fields that the `createPartAction` schema doesn't accept (and the `services` table apparently doesn't have columns for them either). Two options: (a) trim the form to only fields the action accepts, or (b) accept the extra fields in the action as `description` passthrough. Given mock-data-first scope, option (a) is simpler: drop unsupported fields from `newPartSchema` or ignore them in `onSubmit` mapping.

### createCustomerAction schema (for new NewCustomerDrawer)

All fields directly map to form fields — no conflict. Required: `name` (min 2), `email` (valid email). Optional: `phone`, `cpf`, `address`.

---

## Runtime State Inventory

SKIPPED — Phase 3 is not a rename/refactor/migration phase. No runtime state is being renamed.

---

## Environment Availability

| Dependency             | Required By   | Available | Version  | Fallback |
| ---------------------- | ------------- | --------- | -------- | -------- |
| Node.js                | All           | ✓         | (system) | —        |
| next-safe-action hooks | USAB-05/06    | ✓         | 8.5.3    | —        |
| sonner                 | USAB-05       | ✓         | 2.0.7    | —        |
| react-hook-form        | USAB-03       | ✓         | 7.76.1   | —        |
| zod                    | USAB-03       | ✓         | 4.4.3    | —        |
| @base-ui/react         | UI components | ✓         | 1.5.0    | —        |

**No missing dependencies.** All required packages are installed.

---

## Validation Architecture

> `workflow.nyquist_validation` not set in `.planning/config.json` — treating as enabled.

### Test Framework

| Property           | Value                                                        |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Vitest + @testing-library/react (detected from package.json) |
| Config file        | `vite.config.ts` or project root (check)                     |
| Quick run command  | `npx vitest run --reporter=verbose`                          |
| Full suite command | `npx vitest run`                                             |

### Phase Requirements → Test Map

| Req ID  | Behavior                                             | Test Type | Notes                                                                    |
| ------- | ---------------------------------------------------- | --------- | ------------------------------------------------------------------------ |
| USAB-01 | `loading.tsx` files exist in correct route segments  | smoke     | Manual render check; `tsc --noEmit` verifies types                       |
| USAB-02 | `error.tsx` uses `unstable_retry` prop (not `reset`) | unit      | TypeScript compilation catches wrong prop name                           |
| USAB-03 | Form `errors` rendered when validation fails         | unit      | Test `useNewPartForm` with invalid data → errors populated               |
| USAB-04 | `DataTable` renders `emptyMessage` when `data=[]`    | unit      | Already partially covered by component; verify `emptyMessage` prop shown |
| USAB-05 | `execute()` called on submit (not setTimeout)        | unit      | Spy on action mock; assert `execute` called with correct args            |
| USAB-06 | `optimisticState` updates before server responds     | unit      | Mock server delay; check `optimisticState.status` updates immediately    |

### Sampling Rate

- Per task commit: `npx tsc --noEmit && npm run lint`
- Per wave merge: `npx vitest run`
- Phase gate: Full suite green + manual render check of all touched routes

### Wave 0 Gaps

- [ ] Test for `use-new-part-form.ts` after fix — covers USAB-03/05
- [ ] Test for `order-wizard.tsx` final submit — covers USAB-05
- [ ] Verify existing `src/_actions/_audit.test.ts` still passes after `createOrderAction` schema change

---

## Security Domain

> `security_enforcement` not set in config — treating as enabled.

### Applicable ASVS Categories

| ASVS Category       | Applies        | Standard Control                                                                    |
| ------------------- | -------------- | ----------------------------------------------------------------------------------- |
| V5 Input Validation | Yes            | Zod schemas in all server actions; already enforced via `authActionClient.schema()` |
| V2 Authentication   | Yes (existing) | `authActionClient` already checks session; no change needed for Phase 3             |
| V4 Access Control   | No             | No new routes being added in Phase 3                                                |
| V6 Cryptography     | No             | Not applicable                                                                      |

### Known Threat Patterns

| Pattern                                                 | STRIDE                 | Standard Mitigation                                                                                                                              |
| ------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Double-submit (form submitted twice during `executing`) | Tampering              | Disable submit button when `status === "executing"`                                                                                              |
| Client-side-only validation bypass                      | Tampering              | Server-side Zod validation in `authActionClient.schema()` — already enforced                                                                     |
| Exposed server errors in toast                          | Information Disclosure | Use `DEFAULT_SERVER_ERROR_MESSAGE` for unexpected errors; only surface `ActionError` messages to client (already configured in `safe-action.ts`) |

---

## Project Constraints (from CLAUDE.md / AGENTS.md)

1. **Read Next.js docs before writing code:** `node_modules/next/dist/docs/` — done for `loading.md`, `error.md`, `streaming.md`, `mutating-data.md`.
2. **Breaking changes warning:** Next.js 16 `error.tsx` uses `unstable_retry` (not `reset`). Verified.
3. **No `any`/`as unknown`:** All new code must be fully typed.
4. **Server Components by default:** `loading.tsx` is Server Component; `error.tsx` must be `"use client"` (framework constraint).
5. **Zod in `src/_schemas/` — no `.default()` in form schemas.**
6. **Controlled Select via `<Controller>`** — any new Select in customer/order forms must use Controller.
7. **Base UI uses `render` prop, never `asChild`.**
8. **Mock-data-first:** DB integration deferred. `createOrderAction` schema fix must work with the existing DB insert (not require a vehicle lookup join).
9. **Design system "Industrial Precision":** font-mono/uppercase/rounded-full for status chips; `text-on-surface-variant` for secondary text; `text-secondary` for accents.

---

## Assumptions Log

| #   | Claim                                                                                                                                            | Section        | Risk if Wrong                                                                                                                                                                       |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A1  | `createOrderAction` DB insert must be updated to store `plate`/`vehicleModel` directly (not via vehicle join) because DB integration is deferred | Pattern 2      | If the vehicles table requires an existing vehicle record, the action insert will fail with FK constraint. Mitigation: use `ON CONFLICT DO NOTHING` or create a vehicle row inline. |
| A2  | `NewPurchaseOrderClient.tsx` is already correctly wired (not broken) — no fix needed in Phase 3                                                  | Standard Stack | If it has bugs, they're out of Phase 3 scope                                                                                                                                        |
| A3  | `<Toaster>` from sonner is already mounted in providers — no setup needed                                                                        | Standard Stack | If missing, toasts won't appear. Verify in `src/_components/shared/providers.tsx`.                                                                                                  |

---

## Open Questions

1. **createOrderAction DB insert with plate instead of vehicleId**
   - What we know: `serviceOrders` table has `vehicleId` as FK to `vehicles`. Changing to store `plate` as text requires either (a) a new column or (b) creating a vehicle record inline.
   - What's unclear: Does `serviceOrders` schema allow `vehicleId` to be null?
   - Recommendation: Check `serviceOrders` schema for nullability of `vehicleId`. If nullable, store null and add `plate` as a new text column. If not nullable, create a vehicle record inline in `createOrderAction`.

2. **Toaster provider location**
   - What we know: sonner is installed; `toast.success` is called in the codebase.
   - What's unclear: Is `<Toaster>` actually rendered in `src/_components/shared/providers.tsx`?
   - Recommendation: Verify before Phase 3 execution begins.

3. **NewCustomerDrawer: is email required for the create flow?**
   - What we know: `createCustomerAction` requires `email: z.string().email()` (non-optional).
   - What's unclear: The workshop intake UX may not always have a customer email at registration time.
   - Recommendation: Keep email required to match action schema. If UX needs email optional, that's a schema change — note for planner.

---

## Sources

### Primary (HIGH confidence)

- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/loading.md` — `loading.tsx` convention, Suspense wrapping behavior
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/error.md` — `error.tsx` convention, `unstable_retry` prop name
- `node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md` — Server Functions / Server Actions pattern
- `node_modules/next/dist/docs/01-app/02-guides/streaming.md` — Streaming and Suspense boundaries
- `node_modules/next-safe-action/dist/hooks.d.mts` — `useAction`, `useOptimisticAction` type signatures
- `src/_hooks/use-appointment-form.ts` — canonical correct wiring pattern (in-codebase)
- `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` — second verified `useAction` usage
- `src/_actions/orders.ts`, `src/_actions/customers.ts`, `src/_actions/inventory.ts`, `src/_actions/appointments.ts` — all action schemas verified
- `src/_schemas/order-wizard.ts` — wizard step schemas, field names
- `src/_schemas/service-order.ts` — `createServiceOrderSchema` (used by broken `use-new-order-form.ts`)
- `src/_components/ui/skeleton.tsx` — existing Skeleton component
- `src/_components/ui/data-table.tsx` — `emptyMessage` prop pattern

### Secondary (MEDIUM confidence)

- `package.json` — verified installed versions of all packages

### Tertiary (LOW confidence)

- None

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — verified against installed packages and in-codebase source
- Architecture: HIGH — based on direct code reading, not assumptions
- Pitfalls: HIGH — root causes verified in source code (setTimeout stubs, schema mismatches)
- Next.js 16 API: HIGH — verified in bundled docs, not training data

**Research date:** 2026-06-13
**Valid until:** 2026-07-13 (packages are stable; Next.js 16 is current)
