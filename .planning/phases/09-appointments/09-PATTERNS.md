# Phase 9: Appointments - Pattern Map

**Mapped:** 2026-06-22
**Files analyzed:** 10
**Analogs found:** 10 / 10

---

## File Classification

| New/Modified File                                                        | Role      | Data Flow        | Closest Analog                     | Match Quality |
| ------------------------------------------------------------------------ | --------- | ---------------- | ---------------------------------- | ------------- |
| `src/_db/schema/appointments.ts`                                         | model     | CRUD             | itself (modify only)               | exact         |
| `src/_db/migrations/0004_*.sql`                                          | migration | batch            | `src/_db/migrations/0003_*.sql`    | role-match    |
| `src/_actions/appointments.ts`                                           | service   | request-response | itself (`createAppointmentAction`) | exact         |
| `src/_actions/appointments.test.ts`                                      | test      | —                | itself (extend)                    | exact         |
| `src/_actions/_audit.test.ts`                                            | test      | —                | itself (update count)              | exact         |
| `src/_data-access/appointments.ts`                                       | service   | CRUD             | itself (extend `AppointmentRow`)   | exact         |
| `src/_hooks/use-appointment-form.ts`                                     | hook      | request-response | itself (extend for edit mode)      | exact         |
| `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`  | component | request-response | itself (fix + reference)           | exact         |
| `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx`       | component | request-response | itself (modify)                    | exact         |
| `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx` | component | request-response | `NewAppointmentDrawer.tsx`         | exact         |
| `src/app/(dashboard)/appointments/appointments-client.tsx`               | component | request-response | itself (fix + extend)              | exact         |
| `scripts/seed.ts`                                                        | utility   | batch            | itself (extend appointment loop)   | exact         |

---

## Pattern Assignments

### `src/_actions/appointments.ts` — add `updateAppointmentAction`, fix `updateAppointmentStatusAction`

**Analog:** itself — `createAppointmentAction` (lines 11-39) and `updateAppointmentStatusAction` (lines 41-56)

**Imports pattern** (lines 1-9):

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { appointments } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";
```

**Fix for `updateAppointmentStatusAction` — return `{ id, status }` instead of `{ id }` (line 55):**

```typescript
// Before (broken):
return { id: parsedInput.id };

// After (D-02 fix):
return { id: parsedInput.id, status: parsedInput.status };
```

**Core action pattern — `updateAppointmentAction` (new, D-03):**

```typescript
export const updateAppointmentAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      customerId: z.string().optional(),
      vehicleId: z.uuid().optional(),
      mechanicId: z.string().optional(),
      scheduledAt: z.string().datetime(),
      serviceType: z.string().optional(),
      duration: z.number().int().min(1).optional(),
      notes: z.string().optional(),
      status: z
        .enum(["scheduled", "confirmed", "completed", "cancelled"])
        .optional(),
    }),
  )
  .action(async ({ parsedInput }) => {
    const { id, ...rest } = parsedInput;
    await db
      .update(appointments)
      .set({
        ...rest,
        scheduledAt: new Date(rest.scheduledAt),
        updatedAt: new Date(),
      })
      .where(eq(appointments.id, id));

    revalidatePath("/appointments");
    return { id };
  });
```

---

### `src/_data-access/appointments.ts` — extend `AppointmentRow` with raw FK IDs

**Analog:** itself — `AppointmentRow` type (lines 9-21) and `listAppointments` select (lines 43-64)

**Current `AppointmentRow` type (lines 9-21) — add three FK fields:**

```typescript
export type AppointmentRow = {
  id: string;
  // ... existing fields ...
  // ADD these three:
  customerId: string | null;
  vehicleId: string | null;
  mechanicId: string | null;
};
```

**Current `listAppointments` select — add FK IDs to the `.select({})` block (lines 44-57):**

```typescript
// Inside .select({...}), add alongside existing fields:
customerId: appointments.customerId,
vehicleId: appointments.vehicleId,
mechanicId: appointments.mechanicId,
```

**Current `rows.map()` return (lines 65-80) — add FK mappings:**

```typescript
// Inside rows.map((row) => ({...})), add:
customerId: row.customerId,
vehicleId: row.vehicleId,
mechanicId: row.mechanicId,
```

---

### `src/_hooks/use-appointment-form.ts` — extend for edit mode

**Analog:** itself — full file (lines 1-84)

**Current `Params` type (lines 28-32) — extend with edit params:**

```typescript
// Before:
type Params = {
  customers: CustomerOption[];
  mechanics: MechanicOption[];
  onClose: () => void;
};

// After:
type Params = {
  customers: CustomerOption[];
  mechanics: MechanicOption[];
  onClose: () => void;
  mode?: "create" | "edit";
  initialValues?: Partial<AppointmentFormData>;
  appointmentId?: string;
};
```

**Current `useForm` call (lines 41-45) — add `defaultValues` from `initialValues`:**

```typescript
// Before:
defaultValues: { customerId: "", vehicleId: "", mechanicId: "" },

// After (edit mode pre-population):
defaultValues: initialValues ?? { customerId: "", vehicleId: "", mechanicId: "" },
```

**Current `useAction` call (lines 50-59) — branch on mode:**

```typescript
// Replace single useAction with conditional:
const { execute: executeCreate, status: createStatus } = useAction(
  createAppointmentAction,
  {
    onSuccess: () => {
      toast.success("Agendamento criado com sucesso.");
      reset();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar agendamento.");
    },
  },
);

const { execute: executeUpdate, status: updateStatus } = useAction(
  updateAppointmentAction,
  {
    onSuccess: () => {
      toast.success("Agendamento atualizado com sucesso.");
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao atualizar agendamento.");
    },
  },
);

const execute = mode === "edit" ? executeUpdate : executeCreate;
const status = mode === "edit" ? updateStatus : createStatus;
```

**Current `onSubmit` (lines 61-72) — branch on mode:**

```typescript
function onSubmit(data: AppointmentFormData) {
  const vehicleId = data.vehicleId?.trim() || undefined;
  const payload = {
    customerId: data.customerId,
    vehicleId,
    mechanicId: data.mechanicId || undefined,
    scheduledAt: new Date(`${data.date}T${data.time}:00`).toISOString(),
    serviceType: data.serviceType || undefined,
    duration: data.duration || undefined,
    notes: data.notes || undefined,
  };
  if (mode === "edit" && appointmentId) {
    executeUpdate({ id: appointmentId, ...payload });
  } else {
    executeCreate(payload);
  }
}
```

---

### `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx` — CREATE NEW

**Analog:** `NewAppointmentDrawer.tsx` (lines 1-271) — mirror exactly

**Imports pattern** (copy from NewAppointmentDrawer lines 1-22, add `format` from date-fns and `updateAppointmentAction`):

```typescript
"use client";

import { format } from "date-fns";
import { CalendarDays, Clock, User } from "lucide-react";
import { Controller } from "react-hook-form";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import type {
  AppointmentRow,
  CustomerOption,
  MechanicOption,
} from "@/_data-access/appointments";
import { useAppointmentForm } from "@/_hooks/use-appointment-form";
```

**Props type (different from NewAppointmentDrawer — receives `appt`):**

```typescript
type Props = {
  open: boolean;
  onClose: () => void;
  mechanics: MechanicOption[];
  customers: CustomerOption[];
  appt: AppointmentRow;
};
```

**`initialValues` construction using `date-fns/format` (NOT `.toISOString().split('T')`):**

```typescript
const initialValues = {
  customerId: appt.customerId ?? "",
  vehicleId: appt.vehicleId ?? "",
  mechanicId: appt.mechanicId ?? "",
  date: format(new Date(appt.scheduledAt), "yyyy-MM-dd"),
  time: format(new Date(appt.scheduledAt), "HH:mm"),
  serviceType: appt.serviceType ?? "",
  duration: appt.duration ?? undefined,
  notes: appt.notes ?? "",
};
```

**Hook call (edit mode):**

```typescript
const { control, register, handleSubmit, errors, status, selectedCustomer } =
  useAppointmentForm({
    customers,
    mechanics,
    onClose,
    mode: "edit",
    initialValues,
    appointmentId: appt.id,
  });
```

**Sheet header (change title/description from NewAppointmentDrawer):**

```typescript
<SheetTitle className="text-on-surface flex items-center gap-2">
  <CalendarDays className="text-secondary size-5" />
  Editar Agendamento
</SheetTitle>
<SheetDescription className="text-on-surface-variant text-label-sm">
  Atualize os dados do agendamento
</SheetDescription>
```

**Form body:** Copy verbatim from `NewAppointmentDrawer.tsx` lines 68-254. Apply `{ valueAsNumber: true }` fix to duration field (line 202):

```tsx
{...register("duration", { valueAsNumber: true })}
```

**Footer button label:**

```tsx
{
  status === "executing" ? "Salvando..." : "Salvar Alterações";
}
```

---

### `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` — fix `valueAsNumber`

**Analog:** itself — line 202

**Single-line fix:**

```tsx
// Before (line 202):
{...register("duration")}

// After:
{...register("duration", { valueAsNumber: true })}
```

---

### `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx` — add serviceType/duration display + Editar button

**Analog:** itself — full file (lines 1-99)

**Props type change (lines 24-27) — add `onEdit`:**

```typescript
type Props = {
  appt: AppointmentRow;
  onStatusChange: (id: string, status: AppointmentStatus) => void;
  onEdit?: (id: string) => void;
};
```

**serviceType label map — add as module-level constant:**

```typescript
const SERVICE_TYPE_LABELS: Record<string, string> = {
  preventiva: "Preventiva",
  corretiva: "Corretiva",
  garantia: "Garantia",
  estetica: "Estética",
  revisao: "Revisão",
  eletrica: "Elétrica",
  funilaria: "Funilaria",
};
```

**serviceType/duration display — insert after `appt.notes` block (after line 70), before action buttons:**

```tsx
{
  (appt.serviceType || appt.duration) && (
    <div className="text-label-sm text-on-surface-variant flex flex-wrap gap-x-3 gap-y-1">
      {appt.serviceType && (
        <span className="font-mono">
          {SERVICE_TYPE_LABELS[appt.serviceType] ?? appt.serviceType}
        </span>
      )}
      {appt.duration && <span className="font-mono">{appt.duration} min</span>}
    </div>
  );
}
```

**Editar button — add to the existing action button row (after line 72, inside the existing `<div className="border-outline-variant/20 flex gap-2 border-t pt-2">`):**

```tsx
{
  onEdit && (
    <button
      onClick={() => onEdit(appt.id)}
      className="text-label-xs bg-secondary/10 text-secondary hover:bg-secondary/20 ml-auto rounded px-2 py-1 font-mono transition-colors"
    >
      Editar
    </button>
  );
}
```

---

### `src/app/(dashboard)/appointments/appointments-client.tsx` — fix closure bug + integrate EditAppointmentDrawer

**Analog:** itself — lines 1-120+ and render sites at lines 342, 516

**Import additions (after line 42):**

```typescript
import { updateAppointmentAction } from "@/_actions/appointments";
import { EditAppointmentDrawer } from "./_components/EditAppointmentDrawer";
```

**New state (after line 75 `const [drawerOpen, setDrawerOpen] = useState(false)`):**

```typescript
const [editDrawerOpen, setEditDrawerOpen] = useState(false);
const [editingAppt, setEditingAppt] = useState<AppointmentRow | null>(null);
```

**D-02 closure bug fix — `onSuccess` callback (lines 82-95):**

```typescript
// Before (broken — stale closure):
onSuccess: ({ data }) => {
  if (!data) return;
  setAppointments((prev) =>
    prev.map((a) =>
      a.id === data.id
        ? { ...a, status: appointments.find((x) => x.id === data.id)?.status ?? a.status }
        : a,
    ),
  );
},

// After (fixed — uses data.status from server):
onSuccess: ({ data }) => {
  if (!data) return;
  setAppointments((prev) =>
    prev.map((a) => (a.id === data.id ? { ...a, status: data.status } : a)),
  );
},
```

**`handleEdit` function (add alongside `handleStatusChange`):**

```typescript
function handleEdit(id: string) {
  const appt = appointments.find((a) => a.id === id);
  if (!appt) return;
  setEditingAppt(appt);
  setEditDrawerOpen(true);
}
```

**AppointmentCard render sites — add `onEdit` prop (lines 342 and 516):**

```tsx
// Both render sites:
<AppointmentCard
  key={appt.id}
  appt={appt}
  onStatusChange={handleStatusChange}
  onEdit={handleEdit}
/>
```

**EditAppointmentDrawer integration — add after `<NewAppointmentDrawer .../>` (line 530+):**

```tsx
{
  editingAppt && (
    <EditAppointmentDrawer
      open={editDrawerOpen}
      onClose={() => {
        setEditDrawerOpen(false);
        setEditingAppt(null);
      }}
      mechanics={mechanics}
      customers={customers}
      appt={editingAppt}
    />
  );
}
```

---

### `src/_actions/appointments.test.ts` — extend with `updateAppointmentAction` block

**Analog:** itself — `describe` block pattern (lines 23-45)

**Add new block mirroring existing test structure:**

```typescript
describe("Appointments Actions Wiring", () => {
  // ... existing blocks ...

  const updateBlock = blocks.find((b) => b.name === "updateAppointmentAction");

  it("updateAppointmentAction uses db.update and revalidates path", () => {
    expect(updateBlock?.body.includes("update(appointments)")).toBe(true);
    expect(updateBlock?.body.includes('revalidatePath("/appointments")')).toBe(
      true,
    );
  });

  it("updateAppointmentStatusAction returns { id, status }", () => {
    expect(
      updateBlock?.body.includes("status: parsedInput.status") ||
        source.includes(
          "return { id: parsedInput.id, status: parsedInput.status }",
        ),
    ).toBe(true);
  });
});
```

---

### `src/_actions/_audit.test.ts` — update count from 18 to 19

**Analog:** itself — line 57

**Single-line change:**

```typescript
// Before (line 57):
expect(total).toBe(18);

// After:
expect(total).toBe(19);
```

---

### `scripts/seed.ts` — add `serviceType` and `duration` to appointment loop

**Analog:** itself — appointment loop (lines 541-571)

**Pattern — add arrays before the loop and include in `.values({...})`:**

```typescript
const serviceTypes = [
  "preventiva", "corretiva", "revisao", "garantia",
  "eletrica", "estetica", "funilaria", "corretiva",
] as const;
const durations = [60, 90, 45, 120, 60, 90, 60, 45];

// Inside the existing db.insert(appointments).values({...}):
serviceType: serviceTypes[i],
duration: durations[i],
```

---

## Shared Patterns

### `authActionClient` — all server actions

**Source:** `src/_lib/safe-action.ts`
**Apply to:** `updateAppointmentAction` (new)
**Pattern from existing usage** (`src/_actions/appointments.ts` lines 11-23):

```typescript
export const myAction = authActionClient
  .schema(
    z.object({
      /* input shape */
    }),
  )
  .action(async ({ parsedInput }) => {
    // ... db operation ...
    revalidatePath("/appointments");
    return {
      /* typed return */
    };
  });
```

### `revalidatePath` after mutations

**Source:** every existing action in `src/_actions/appointments.ts`
**Apply to:** `updateAppointmentAction`
**Pattern:** `revalidatePath("/appointments")` called immediately before `return`, after every DB mutation.

### Sheet/Drawer layout

**Source:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` lines 47-270
**Apply to:** `EditAppointmentDrawer.tsx` (copy verbatim, change header text + hook params)
**Key structural elements:**

- `<Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>`
- `<SheetContent side="right" className="bg-surface w-full overflow-y-auto sm:max-w-lg">`
- `<form onSubmit={handleSubmit} className="space-y-5 px-4 py-5">`
- `<section>` blocks for logical field groups
- `<SheetFooter>` with SheetClose cancel + submit Button

### Optimistic state update pattern

**Source:** `src/app/(dashboard)/appointments/appointments-client.tsx` lines 102-108
**Apply to:** edit flow in `appointments-client.tsx` if optimistic edit is needed

```typescript
// Optimistic update before execute():
setAppointments((prev) =>
  prev.map((a) => (a.id === id ? { ...a, ...changes } : a)),
);
execute({ id, ...changes });
```

### `date-fns/format` for date/time split

**Source:** `src/app/(dashboard)/appointments/appointments-client.tsx` line 1-17 (format already imported)
**Apply to:** `EditAppointmentDrawer.tsx` `initialValues` construction

```typescript
import { format } from "date-fns";
date: format(new Date(appt.scheduledAt), "yyyy-MM-dd"),
time: format(new Date(appt.scheduledAt), "HH:mm"),
// NOT: new Date(appt.scheduledAt).toISOString().split("T") — timezone corruption
```

---

## No Analog Found

None. All files have direct analogs in the codebase.

---

## Metadata

**Analog search scope:** `src/_actions/`, `src/_data-access/`, `src/_hooks/`, `src/app/(dashboard)/appointments/`, `scripts/`
**Files scanned:** 10 source files read directly
**Pattern extraction date:** 2026-06-22
