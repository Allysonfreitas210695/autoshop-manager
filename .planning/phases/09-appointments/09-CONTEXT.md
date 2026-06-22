# Phase 9: Appointments - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Apply migration 0004 (`serviceType` + `duration`) to the Neon DB, wire the appointments module to read/write real data, fix the optimistic status-update bug, add an EditAppointmentDrawer (all fields), and update AppointmentCard to display serviceType/duration. Seed data updated with serviceType/duration values.

The data-access layer, actions, and page already call real Drizzle — the gaps are the unapplied migration, the onSuccess closure bug, and the missing edit capability.

</domain>

<decisions>
## Implementation Decisions

### Seed Data

- **D-01:** Update `scripts/seed.ts` appointment entries to include `serviceType` (e.g., `'preventiva'`, `'corretiva'`, `'revisao'`) and `duration` (e.g., 60, 90 min). All 8 existing appointment seed rows should get values so the calendar is immediately rich after migration.

### Cancel Optimistic Bug Fix

- **D-02:** Change `updateAppointmentStatusAction` to return `{ id, status }` (currently returns only `{ id }`). Update the `onSuccess` callback in `appointments-client.tsx` to use `data.status` when setting the confirmed state — eliminates the closure bug that reverts the optimistic status to the old value.

### Edit Appointment

- **D-03:** Add `updateAppointmentAction` (all fields: date/time, customerId, vehicleId, mechanicId, serviceType, duration, notes, status). Reuse `useAppointmentForm` hook structure for the edit form — receives initial values and calls update instead of create.
- **D-04:** Add `EditAppointmentDrawer` component (same field structure as `NewAppointmentDrawer`) opened via an "Editar" button added to `AppointmentCard`, alongside the existing Confirmar/Cancelar buttons.

### Calendar Display

- **D-05:** `AppointmentCard` shows `serviceType` (formatted label, e.g., "Preventiva") and `duration` (e.g., "60 min") when non-null, as additional metadata below the mechanic/phone line. `AppointmentBadge` stays compact — no change.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema and Actions

- `src/_db/schema/appointments.ts` — appointments table definition (`serviceType`, `duration`, `status` enum, FK refs to `user` and `vehicles`)
- `src/_db/migrations/0004_appointments_service_type_duration.sql` — migration to apply; adds `service_type` and `duration` columns
- `src/_actions/appointments.ts` — existing `createAppointmentAction` and `updateAppointmentStatusAction`; update action must be added here
- `src/_data-access/appointments.ts` — `listAppointments`, `listMechanics`, `listCustomerOptions`; `AppointmentRow` type

### Form and UI

- `src/_hooks/use-appointment-form.ts` — existing form hook (`appointmentSchema`, `useAppointmentForm`); extend for edit mode
- `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` — reference for EditAppointmentDrawer structure
- `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx` — needs: edit button + serviceType/duration display
- `src/app/(dashboard)/appointments/appointments-client.tsx` — needs: onSuccess fix + EditAppointmentDrawer integration

### Seed

- `scripts/seed.ts` — update appointment loop (lines ~553-575) to include `serviceType` + `duration`

### Requirements

- `.planning/REQUIREMENTS.md` — APPT-01, APPT-02

### Prior Phase Patterns

- Phase 7 customers-vehicles CONTEXT.md: `src/_lib/safe-action.ts` (`authActionClient`) — standard action wrapper
- Phase 6 orders CONTEXT.md: `revalidatePath` after mutations; `db.transaction()` pattern

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `useAppointmentForm` (`src/_hooks/use-appointment-form.ts`) — extend with `mode: 'create' | 'edit'` and `initialValues` param for edit mode
- `NewAppointmentDrawer` — reference layout; EditAppointmentDrawer mirrors this structure
- `authActionClient` (`src/_lib/safe-action.ts`) — all new actions use this wrapper
- `AppointmentCard` cancel/confirm/complete buttons — already wired via `onStatusChange` prop; add Editar button to same row

### Established Patterns

- Actions return typed objects: `{ id, status }` pattern (update after D-02)
- `revalidatePath('/appointments')` called in all appointment mutations
- `useAction` from `next-safe-action/hooks` with `onSuccess`/`onError` callbacks
- Optimistic state update before `execute()` call, confirmed in `onSuccess`

### Integration Points

- `appointments-client.tsx` → `updateAppointmentAction` (new, for edit)
- `AppointmentCard` → `onEdit` prop callback → opens `EditAppointmentDrawer`
- `scripts/seed.ts` → appointment loop needs serviceType + duration values

### What's Already Wired (no changes needed)

- `page.tsx` → `listAppointments()` → real Drizzle ✅
- `createAppointmentAction` → DB insert ✅
- `updateAppointmentStatusAction` → DB update (fix return value only) ✅
- `listMechanics` / `listCustomerOptions` → real Drizzle ✅

</code_context>

<specifics>
## Specific Ideas

- serviceType labels for display in AppointmentCard: `{ preventiva: 'Preventiva', corretiva: 'Corretiva', garantia: 'Garantia', estetica: 'Estética', revisao: 'Revisão', eletrica: 'Elétrica', funilaria: 'Funilaria' }` — these match the existing `<select>` options in `NewAppointmentDrawer`
- Duration format: "60 min", "90 min" — short suffix, no localization needed
- Migration 0004 is the hard blocker — must be applied before any appointment data with serviceType/duration can be persisted; `npx drizzle-kit migrate` is the command

</specifics>

<deferred>
## Deferred Ideas

- Appointment search/filtering by serviceType, mechanic, date range — Future requirement
- Recurring appointments — Future requirement
- SMS/email confirmation notifications — Future requirement

</deferred>

---

_Phase: 9-appointments_
_Context gathered: 2026-06-22_
