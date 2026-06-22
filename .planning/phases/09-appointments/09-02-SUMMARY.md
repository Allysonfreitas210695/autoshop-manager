---
phase: 09-appointments
plan: "02"
subsystem: appointments
tags: [action, hook, drawer, edit, tdd]
dependency_graph:
  requires: [appointments-schema-migrated, AppointmentRow-with-FKs]
  provides:
    [updateAppointmentAction, useAppointmentForm-bimodal, EditAppointmentDrawer]
  affects: [appointments-client]
tech_stack:
  added: []
  patterns:
    [authActionClient, date-fns-format, useAction-bimodal, TDD-red-green]
key_files:
  created:
    - src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx
  modified:
    - src/_actions/appointments.ts
    - src/_actions/appointments.test.ts
    - src/_hooks/use-appointment-form.ts
decisions:
  - "updateAppointmentAction uses spread ...rest with explicit scheduledAt/updatedAt overrides to avoid stale date fields"
  - "Hook exposes result from active branch (createResult or updateResult) so callers use same API regardless of mode"
  - "EditAppointmentDrawer uses date-fns format() for date/time split — avoids timezone corruption from toISOString().split('T')"
metrics:
  duration: "~10 min"
  completed_date: "2026-06-22"
  tasks_completed: 3
  files_modified: 4
---

# Phase 9 Plan 02: Appointment Edit — updateAppointmentAction + bimodal hook + EditAppointmentDrawer

`updateAppointmentAction` persists all appointment fields via Drizzle `db.update`; `useAppointmentForm` extended to bimodal create/edit; `EditAppointmentDrawer` mirrors `NewAppointmentDrawer` and pre-populates from `AppointmentRow` without extra queries.

## Tasks Completed

| Task | Name                                    | Commit  | Result                                                       |
| ---- | --------------------------------------- | ------- | ------------------------------------------------------------ |
| 1    | Add updateAppointmentAction (D-03)      | 293fead | TDD RED+GREEN; audit count 19 confirmed; all 11 tests pass   |
| 2    | Extend useAppointmentForm for edit mode | a9be5a4 | mode/initialValues/appointmentId; bimodal execute; tsc clean |
| 3    | Create EditAppointmentDrawer (D-04)     | d932e1b | date-fns format; mode "edit"; valueAsNumber; tsc clean       |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `result` removed from hook return then re-added**

- **Found during:** Task 2
- **Issue:** Initial rewrite of hook omitted `result` from return value, but `NewAppointmentDrawer` destructures `result` to display `result.serverError`.
- **Fix:** Added `createResult`/`updateResult` from each `useAction` call; derived `result = mode === "edit" ? updateResult : createResult`; included in return.
- **Files modified:** `src/_hooks/use-appointment-form.ts`
- **Commit:** a9be5a4

## Threat Surface

| Mitigation                                                              | Status    |
| ----------------------------------------------------------------------- | --------- |
| T-09-01: updateAppointmentAction wrapped in authActionClient            | Confirmed |
| T-09-02: all fields validated via zod schema before db.update           | Confirmed |
| T-09-03: vehicleId via z.uuid(); FK violations captured by actionClient | Confirmed |

## Self-Check: PASSED

- src/\_actions/appointments.ts: FOUND (updateAppointmentAction exported)
- src/\_hooks/use-appointment-form.ts: FOUND (mode/initialValues/appointmentId)
- src/app/(dashboard)/appointments/\_components/EditAppointmentDrawer.tsx: FOUND
- commit 293fead (updateAppointmentAction): FOUND
- commit a9be5a4 (bimodal hook): FOUND
- commit d932e1b (EditAppointmentDrawer): FOUND
- npm test 11/11 passed: CONFIRMED
- npx tsc --noEmit: CLEAN
