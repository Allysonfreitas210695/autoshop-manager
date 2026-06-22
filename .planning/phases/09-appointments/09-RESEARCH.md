# Phase 9: Appointments - Research

**Researched:** 2026-06-22
**Domain:** Next.js 16 / Drizzle ORM / next-safe-action / React Hook Form — appointments module
**Confidence:** HIGH (all findings from direct codebase inspection)

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Update `scripts/seed.ts` appointment loop to include `serviceType` and `duration` for all 8 rows.
- **D-02:** `updateAppointmentStatusAction` must return `{ id, status }`. `onSuccess` in `appointments-client.tsx` must use `data.status` instead of closing over the pre-call value.
- **D-03:** Add `updateAppointmentAction` (all fields). Reuse `useAppointmentForm` hook with `mode: 'create' | 'edit'` + `initialValues`.
- **D-04:** Add `EditAppointmentDrawer` mirroring `NewAppointmentDrawer` structure; opened via "Editar" button in `AppointmentCard`.
- **D-05:** `AppointmentCard` displays `serviceType` (formatted label) and `duration` ("60 min") below mechanic/phone line, when non-null.

### Deferred Ideas (OUT OF SCOPE)

- Appointment search/filtering by serviceType, mechanic, date range
- Recurring appointments
- SMS/email confirmation notifications
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                        | Research Support                                                                                                                                                                   |
| ------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| APPT-01 | Operador pode criar, listar e cancelar agendamentos com dados persistidos no banco | Migration 0004 must be applied; `createAppointmentAction` and `updateAppointmentStatusAction` already use real Drizzle; D-02 fixes the closure bug that corrupts optimistic cancel |
| APPT-02 | Schema inclui `serviceType` e `duration` (sem perda de dados do formulário)        | Migration 0004 adds the two columns; `duration` register bug must be fixed; `updateAppointmentAction` persists all fields                                                          |

</phase_requirements>

---

## Summary

The appointments module is structurally complete — schema, data-access, and actions already use real Drizzle. The three gaps blocking APPT-01 and APPT-02 are: (1) migration 0004 not yet applied to Neon DB, (2) an optimistic-update closure bug in `appointments-client.tsx`, and (3) missing `updateAppointmentAction` + `EditAppointmentDrawer`.

A secondary bug was discovered during research: `duration` is registered via `{...register("duration")}` without `{ valueAsNumber: true }` in `NewAppointmentDrawer`. Since the schema expects `z.number().int()`, HTML returns a string and Zod coerces it to `NaN` — meaning duration is silently dropped on create. This must be fixed alongside the edit work.

The audit test `_audit.test.ts` currently asserts `total === 18` actions across five files. Adding `updateAppointmentAction` makes it 19 — that test expectation must be updated to 19 as part of this phase.

**Primary recommendation:** Apply migration 0004, fix D-02 closure bug + duration `valueAsNumber` bug, add `updateAppointmentAction`, build `EditAppointmentDrawer`, update `AppointmentCard`, and update seed + audit test count.

---

## Architectural Responsibility Map

| Capability               | Primary Tier                   | Secondary Tier             | Rationale                                           |
| ------------------------ | ------------------------------ | -------------------------- | --------------------------------------------------- |
| Migration application    | DB / Storage                   | —                          | DDL change to Neon PostgreSQL via drizzle-kit       |
| Appointment CRUD actions | API / Backend (Server Actions) | —                          | `authActionClient` + Drizzle; no client-side DB     |
| Optimistic status update | Browser / Client               | API/Backend (confirmation) | Optimistic in React state, confirmed in `onSuccess` |
| Edit drawer form         | Browser / Client               | —                          | RHF + Controller; executes server action on submit  |
| AppointmentCard display  | Browser / Client               | —                          | Pure presentational; reads `AppointmentRow` props   |
| Seed data                | DB / Storage                   | —                          | Server-side script, runs once                       |

---

## Standard Stack

All packages are already installed. No new dependencies required for this phase.

| Library            | Version (installed) | Role in this phase                           |
| ------------------ | ------------------- | -------------------------------------------- |
| `drizzle-orm`      | ^0.45.2             | DB queries in `updateAppointmentAction`      |
| `next-safe-action` | ^8.5.3              | `authActionClient.schema().action()` pattern |
| `react-hook-form`  | ^7.76.1             | Edit form via `useAppointmentForm` extension |
| `zod`              | ^4.4.3              | Schema validation in new action + hook       |
| `next`             | 16.2.6              | `revalidatePath` after mutations             |

[VERIFIED: direct `package.json` inspection]

---

## Package Legitimacy Audit

No new packages are installed in this phase. All libraries above were verified in prior phases and are already in `node_modules`.

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (AppointmentsClient)
  │
  ├─ handleStatusChange(id, status)
  │     optimistic setAppointments → execStatus({ id, status })
  │                                        │
  │                                        ▼
  │                               updateAppointmentStatusAction
  │                               (returns { id, status }) [D-02 fix]
  │                                        │
  │                               onSuccess: setAppointments with data.status
  │
  ├─ onEdit(id) → opens EditAppointmentDrawer
  │     useAppointmentForm(mode:'edit', initialValues)
  │     submit → updateAppointmentAction({ id, ...fields })
  │                    │
  │                    ▼
  │             db.update(appointments).set(...).where(eq(id))
  │             revalidatePath('/appointments')
  │
  └─ NewAppointmentDrawer (unchanged except valueAsNumber fix)
```

### Key Files and Responsibilities

| File                                                                     | Change Type  | What Changes                                                                                            |
| ------------------------------------------------------------------------ | ------------ | ------------------------------------------------------------------------------------------------------- |
| `src/_db/migrations/0004_*.sql`                                          | Apply only   | `npm run db:migrate` — adds `service_type`, `duration` columns                                          |
| `src/_actions/appointments.ts`                                           | Modify + Add | Fix `updateAppointmentStatusAction` return; add `updateAppointmentAction`                               |
| `src/_actions/appointments.test.ts`                                      | Extend       | Add test for `updateAppointmentAction` static wiring                                                    |
| `src/_actions/_audit.test.ts`                                            | Modify       | Change `toBe(18)` to `toBe(19)`                                                                         |
| `src/_hooks/use-appointment-form.ts`                                     | Modify       | Add `mode`, `initialValues`, `appointmentId` params; wire `updateAppointmentAction` in edit mode        |
| `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`  | Fix          | Add `{ valueAsNumber: true }` to `register("duration")`                                                 |
| `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx`       | Modify       | Add serviceType label + duration display + "Editar" button + `onEdit` prop                              |
| `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx` | Create       | New component mirroring NewAppointmentDrawer                                                            |
| `src/app/(dashboard)/appointments/appointments-client.tsx`               | Modify       | Fix `onSuccess` closure bug; add `editDrawerOpen`, `editingAppt` state; integrate EditAppointmentDrawer |
| `scripts/seed.ts`                                                        | Modify       | Add `serviceType` + `duration` to appointment loop (lines ~555-570)                                     |

---

## Critical Bugs Found

### Bug 1: Closure Bug in `updateAppointmentStatusAction` onSuccess (D-02)

**Location:** `appointments-client.tsx` lines 82-96

**Current code (broken):**

```typescript
onSuccess: ({ data }) => {
  if (!data) return;
  setAppointments((prev) =>
    prev.map((a) =>
      a.id === data.id
        ? {
            ...a,
            status:
              appointments.find((x) => x.id === data.id)?.status ?? // BUG: stale closure
              a.status,
          }
        : a,
    ),
  );
},
```

**Root cause:** `appointments` in the closure is the value captured when `useAction` was initialized, not the current state after the optimistic update. `appointments.find(...)?.status` resolves to the _pre-optimistic_ status — reverting the visual update.

**Fix:** Return `{ id, status }` from the action (D-02), then:

```typescript
onSuccess: ({ data }) => {
  if (!data) return;
  setAppointments((prev) =>
    prev.map((a) =>
      a.id === data.id ? { ...a, status: data.status } : a,
    ),
  );
},
```

### Bug 2: `duration` Field Missing `valueAsNumber: true`

**Location:** `NewAppointmentDrawer.tsx` line 202; `use-appointment-form.ts` onSubmit line 69

**Current code:**

```tsx
{...register("duration")}  // returns string from HTML input
```

**Schema expects:** `z.number().int().min(1).optional()`

**Impact:** `duration` is silently dropped on every create (string → NaN → coercion fails → `undefined`). The same pattern must not be repeated in EditAppointmentDrawer.

**Fix in NewAppointmentDrawer:**

```tsx
{...register("duration", { valueAsNumber: true })}
```

---

## Don't Hand-Roll

| Problem             | Don't Build                | Use Instead                                             | Why                                                    |
| ------------------- | -------------------------- | ------------------------------------------------------- | ------------------------------------------------------ |
| Action auth guard   | Custom middleware          | `authActionClient` from `src/_lib/safe-action.ts`       | Already handles session check + ActionError            |
| Form state for edit | New hook from scratch      | Extend `useAppointmentForm` with `mode`/`initialValues` | Same schema, same fields — only action differs         |
| Drawer layout       | New component from scratch | Mirror `NewAppointmentDrawer` exactly                   | Same Sheet/SheetContent structure, same field sections |

---

## Common Pitfalls

### Pitfall 1: `updateAppointmentAction` Breaks the Audit Test

**What goes wrong:** `_audit.test.ts` line 57 asserts `total === 18`. Adding one action makes it 19 and the test fails.
**Fix:** Update `toBe(18)` to `toBe(19)` in `_audit.test.ts`.

### Pitfall 2: Migration 0004 Already Registered in Journal but Not Applied

**What goes wrong:** The journal (`_journal.json`) records 0004 as entry idx=4. Drizzle-kit tracks applied migrations in the `__drizzle_migrations` table in Neon. If 0004 was never pushed (only generated), the columns don't exist in production but the local journal says they do.
**Detection:** Run `npm run db:migrate` — it will either apply the pending DDL or report "No migrations to run" if already applied.
**Risk:** If already applied (e.g., via `db:push`), `npm run db:migrate` is a no-op. If not applied, it adds the two columns atomically.

### Pitfall 3: EditAppointmentDrawer `initialValues` Date/Time Parsing

**What goes wrong:** `AppointmentRow.scheduledAt` is a `Date` object. The form splits it into separate `date` (string `yyyy-MM-dd`) and `time` (string `HH:mm`) fields. Parsing with `new Date(scheduledAt)` requires `format(scheduledAt, 'yyyy-MM-dd')` and `format(scheduledAt, 'HH:mm')` — not a plain `.toISOString().split('T')` split (timezone offset will corrupt local time).
**Fix:** Use `date-fns/format` (already a project dependency) for both fields.

### Pitfall 4: `AppointmentCard` `onEdit` Prop Not Passed in All Render Sites

**What goes wrong:** `AppointmentCard` is rendered in three places in `appointments-client.tsx` (calendar day detail, week view — only via AppointmentBadge, list view). The `onEdit` prop must be threaded through all `AppointmentCard` call sites. Week view uses `AppointmentBadge` (not AppointmentCard), so no change needed there.
**Render sites:** lines 342 and 516 in `appointments-client.tsx`.

### Pitfall 5: `useAppointmentForm` Hook Type Signature Mismatch

**What goes wrong:** `NewAppointmentDrawer` passes `mechanics` to `useAppointmentForm` but the hook signature only accepts `customers` and `onClose` (line 28-33 of hook). The `mechanics` param is silently dropped. When editing with the extended hook, `mechanics` must be added to the `Params` type.
**Current hook Params type:**

```typescript
type Params = {
  customers: CustomerOption[];
  mechanics: MechanicOption[]; // received but unused in hook body
  onClose: () => void;
};
```

Actually the Params type only declares `customers` and `onClose` — `mechanics` is passed by the drawer but not declared. Both create and edit drawers need to pass `mechanics` for the mechanic select.

---

## Code Examples

### updateAppointmentStatusAction fix (D-02)

```typescript
// src/_actions/appointments.ts
export const updateAppointmentStatusAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      status: z.enum(["scheduled", "confirmed", "completed", "cancelled"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(appointments)
      .set({ status: parsedInput.status, updatedAt: new Date() })
      .where(eq(appointments.id, parsedInput.id));

    revalidatePath("/appointments");
    return { id: parsedInput.id, status: parsedInput.status }; // D-02: add status
  });
```

### updateAppointmentAction (new, D-03)

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

### serviceType label map (D-05)

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

### Date/time split for initialValues (D-03)

```typescript
import { format } from "date-fns";

// In EditAppointmentDrawer, before passing to useAppointmentForm:
const initialValues = {
  customerId: appt.customerId ?? "",
  vehicleId: appt.vehicleId ?? "",
  mechanicId: appt.mechanicId ?? "",
  date: format(new Date(appt.scheduledAt), "yyyy-MM-dd"),
  time: format(new Date(appt.scheduledAt), "HH:mm"),
  serviceType: appt.serviceType ?? "",
  duration: appt.duration ?? undefined,
  notes: appt.notes ?? "",
  status: appt.status,
};
```

### Seed update pattern (D-01)

```typescript
// scripts/seed.ts — inside the appointment loop
const serviceTypes = [
  "preventiva",
  "corretiva",
  "revisao",
  "garantia",
  "eletrica",
  "estetica",
  "funilaria",
  "corretiva",
] as const;
const durations = [60, 90, 45, 120, 60, 90, 60, 45];

await db.insert(appointments).values({
  // ...existing fields...
  serviceType: serviceTypes[i],
  duration: durations[i],
});
```

---

## Validation Architecture

### Test Framework

| Property           | Value                                              |
| ------------------ | -------------------------------------------------- |
| Framework          | Vitest 4.1.7                                       |
| Config file        | `vitest.config.ts`                                 |
| Quick run command  | `npx vitest run src/_actions/appointments.test.ts` |
| Full suite command | `npx vitest run`                                   |

### Phase Requirements → Test Map

| Req ID  | Behavior                                                                     | Test Type     | Automated Command                                              | File Exists?          |
| ------- | ---------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------- | --------------------- |
| APPT-01 | `updateAppointmentStatusAction` returns `{ id, status }`                     | unit (static) | `npx vitest run src/_actions/appointments.test.ts`             | ✅ extend existing    |
| APPT-01 | Cancel optimistic update confirms correct status                             | manual smoke  | open app, click Cancelar, verify status chip updates and stays | —                     |
| APPT-02 | `updateAppointmentAction` exists, uses `authActionClient` + `.schema()`      | unit (static) | `npx vitest run src/_actions/_audit.test.ts`                   | ✅ update count to 19 |
| APPT-02 | `updateAppointmentAction` calls `db.update(appointments)` + `revalidatePath` | unit (static) | `npx vitest run src/_actions/appointments.test.ts`             | ✅ add test block     |
| APPT-02 | `duration` field persists as integer after create/edit                       | manual smoke  | create appointment with duration=60, check DB row              | —                     |

### Sampling Rate

- **Per task commit:** `npx vitest run src/_actions/appointments.test.ts src/_actions/_audit.test.ts`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] No new test file needed — extend `src/_actions/appointments.test.ts` with `updateAppointmentAction` block
- [ ] Update `_audit.test.ts` count from 18 to 19 before adding the new action (or the test will fail during development)

---

## Environment Availability

| Dependency           | Required By          | Available   | Notes                                              |
| -------------------- | -------------------- | ----------- | -------------------------------------------------- |
| `npm run db:migrate` | Apply migration 0004 | ✓           | Requires `DATABASE_URL` in `.env` pointing to Neon |
| Neon DB connection   | Migration + runtime  | ✓ (assumed) | Prior phases applied 0003 — connection works       |
| Vitest               | Test suite           | ✓ 4.1.7     | Already installed                                  |

**Missing dependencies with no fallback:** None identified.

---

## Assumptions Log

| #   | Claim                                                                                                          | Section                   | Risk if Wrong                                                                                                         |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| A1  | Migration 0004 has not yet been applied to Neon DB                                                             | Critical Bugs / Pitfall 2 | If already applied, `npm run db:migrate` is a no-op — no harm, but task description should note this                  |
| A2  | `AppointmentRow` does not include `customerId`, `vehicleId`, `mechanicId` as raw IDs — only as display strings | Architecture Patterns     | EditAppointmentDrawer may need to add raw FK fields to `AppointmentRow` or use a separate query to load editable data |

**Note on A2:** Checking `AppointmentRow` type: `id`, `customer` (name), `phone`, `vehicle` (make+model string), `plate`, `mechanic` (name), `scheduledAt`, `status`, `serviceType`, `duration`, `notes`. The raw `customerId`, `vehicleId`, `mechanicId` are NOT in `AppointmentRow`. The edit drawer needs raw FK IDs to pre-populate the selects. The planner must add raw ID fields to `AppointmentRow` OR pass them separately to `AppointmentCard`/`EditAppointmentDrawer`.

---

## Open Questions

1. **Raw FK IDs for EditAppointmentDrawer**
   - What we know: `AppointmentRow` exposes display strings, not raw UUIDs needed to pre-populate selects.
   - What's unclear: Should `AppointmentRow` be extended with `customerId`, `vehicleId`, `mechanicId` fields (already available in the `listAppointments` query join), or should EditAppointmentDrawer fetch the appointment fresh?
   - Recommendation: Extend `AppointmentRow` with `customerId: string | null`, `vehicleId: string | null`, `mechanicId: string | null` — they are already selected in the Drizzle query but not mapped in the return object. Zero extra DB round-trips.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)

- `src/_db/schema/appointments.ts` — full schema with `serviceType` (text), `duration` (integer), `appointmentStatus` enum
- `src/_db/migrations/0004_appointments_service_type_duration.sql` — 2 ALTER TABLE statements
- `src/_db/migrations/meta/_journal.json` — confirms 0004 registered as idx=4
- `src/_actions/appointments.ts` — current actions + closure bug confirmed
- `src/_actions/appointments.test.ts` — existing static wiring tests
- `src/_actions/_audit.test.ts` — 18-action count assertion at line 57
- `src/_data-access/appointments.ts` — `AppointmentRow` type (missing raw FK IDs confirmed)
- `src/_hooks/use-appointment-form.ts` — `Params` type, `duration` without `valueAsNumber`
- `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` — reference drawer structure
- `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx` — current render + button structure
- `src/app/(dashboard)/appointments/appointments-client.tsx` — closure bug at lines 82-96
- `scripts/seed.ts` lines 541-571 — appointment loop, no serviceType/duration
- `src/_lib/safe-action.ts` — `authActionClient` pattern
- `package.json` — all dependency versions

---

## Metadata

**Confidence breakdown:**

- Schema/migration: HIGH — files read directly
- Closure bug: HIGH — code path traced in full
- `valueAsNumber` bug: HIGH — confirmed against project pattern in 5 other files
- Audit test impact: HIGH — count verified by grepping all action files
- FK IDs gap: HIGH — `AppointmentRow` type read directly

**Research date:** 2026-06-22
**Valid until:** 2026-07-22 (stable codebase — no fast-moving dependencies)
