---
phase: 09-appointments
fixed_at: 2026-06-22T00:00:00Z
review_path: .planning/phases/09-appointments/09-REVIEW.md
iteration: 1
findings_in_scope: 7
fixed: 7
skipped: 0
status: all_fixed
---

# Phase 09: Code Review Fix Report

**Fixed at:** 2026-06-22T00:00:00Z
**Source review:** .planning/phases/09-appointments/09-REVIEW.md
**Iteration:** 1

**Summary:**

- Findings in scope: 7
- Fixed: 7
- Skipped: 0

## Fixed Issues

### CR-01: Any authenticated user can update or cancel any appointment (IDOR)

**Files modified:** `src/_actions/appointments.ts`
**Commit:** c53fade
**Applied fix:** Added `db.query.appointments.findFirst` existence check before update in both `updateAppointmentAction` and `updateAppointmentStatusAction`. Added customer-role IDOR guard (`existing.customerId !== ctx.user.id`). Imported `ActionError` from `@/_lib/safe-action`. Changed action signatures to `({ parsedInput, ctx })`.

### WR-01: `customerId` schema mismatch — server accepts any string, client requires UUID

**Files modified:** `src/_actions/appointments.ts`
**Commit:** c53fade
**Applied fix:** Changed `customerId: z.string().optional()` to `z.uuid().optional()` in both `createAppointmentAction` and `updateAppointmentAction` schemas.

### WR-02: `updateAppointmentAction` returns only `{ id }` — missing data for optimistic update

**Files modified:** `src/_actions/appointments.ts`
**Commit:** c53fade
**Applied fix:** Changed `await db.update(...)` to use `.returning()` and return the full updated row fields: `id`, `customerId`, `vehicleId`, `mechanicId`, `scheduledAt`, `status`, `serviceType`, `duration`, `notes`.

### CR-02: Edited appointment never reflected in UI — stale data shown until reload

**Files modified:** `src/_hooks/use-appointment-form.ts`, `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx`, `src/app/(dashboard)/appointments/appointments-client.tsx`
**Commit:** a5e8b1a
**Applied fix:** Added `onUpdated?: (updated: AppointmentRow) => void` to `Params` type and hook signature. `onSuccess` callback in `useAction(updateAppointmentAction)` now calls `onUpdated?.(data)` with the server-returned row (mapping DB fields to `AppointmentRow` shape). Added `onUpdated` prop to `EditAppointmentDrawer` and forwarded to `useAppointmentForm`. In `AppointmentsClient`, passed `onUpdated` to `EditAppointmentDrawer` that calls `setAppointments` to replace the stale entry.

### CR-03: Datetime construction ignores user timezone — appointments saved at wrong time

**Files modified:** `src/_hooks/use-appointment-form.ts`
**Commit:** a5e8b1a
**Applied fix:** Replaced `new Date(\`${data.date}T${data.time}:00\`).toISOString()`with explicit UTC-offset calculation using`getTimezoneOffset()`. The resulting string appends `+HH:MM`/`-HH:MM` suffix so the ISO string encodes the user's local timezone rather than being parsed as ambiguous local time.

### WR-03: List view `listEnd` date sets time to T23:59:59 instead of end-of-day

**Files modified:** `src/app/(dashboard)/appointments/appointments-client.tsx`
**Commit:** a5e8b1a
**Applied fix:** Imported `endOfDay` from `date-fns`. Changed `setListEnd(new Date(e.target.value + "T23:59:59"))` to `setListEnd(endOfDay(new Date(e.target.value)))`.

### WR-04: Edit form not reset when `appt` prop changes (stale initial values)

**Files modified:** `src/app/(dashboard)/appointments/appointments-client.tsx`
**Commit:** a5e8b1a
**Applied fix:** Added `key={editingAppt.id}` to the `<EditAppointmentDrawer>` render, guaranteeing React unmounts and remounts the component (and its `useForm` instance) whenever a different appointment is selected for editing.

---

_Fixed: 2026-06-22T00:00:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
