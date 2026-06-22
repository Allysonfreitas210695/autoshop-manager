---
phase: 09-appointments
plan: "01"
subsystem: appointments
tags: [migration, data-access, bug-fix, seed]
dependency_graph:
  requires: []
  provides:
    [
      appointments-schema-migrated,
      AppointmentRow-with-FKs,
      status-action-fix,
      duration-fix,
      seed-enriched,
    ]
  affects: [appointments-client, NewAppointmentDrawer, seed]
tech_stack:
  added: []
  patterns:
    [drizzle-kit-migrate, authActionClient, valueAsNumber, functional-setstate]
key_files:
  created: []
  modified:
    - src/_data-access/appointments.ts
    - src/_actions/appointments.ts
    - src/_actions/_audit.test.ts
    - src/_actions/appointments.test.ts
    - src/app/(dashboard)/appointments/appointments-client.tsx
    - src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx
    - scripts/seed.ts
decisions:
  - "Migration 0004 applied via npm run db:migrate — service_type + duration columns now in Neon DB"
  - "AppointmentRow extended with customerId/vehicleId/mechanicId for edit drawer pre-population (zero extra queries)"
  - "Audit test count bumped to 19 in anticipation of updateAppointmentAction in Plan 02"
  - "seed.ts uses apptServiceTypes/apptDurations arrays (renamed to avoid collision with serviceTypes at line 392)"
metrics:
  duration: "~15 min"
  completed_date: "2026-06-22"
  tasks_completed: 3
  files_modified: 7
---

# Phase 9 Plan 01: Appointments Foundation Summary

DB migrated, AppointmentRow extended with raw FK IDs, two bugs fixed (D-02 closure + duration valueAsNumber), seed enriched with serviceType/duration for all 8 rows, and audit test count prepared for 19.

## Tasks Completed

| Task | Name                                            | Commit  | Result                                                     |
| ---- | ----------------------------------------------- | ------- | ---------------------------------------------------------- |
| 1    | Apply migration 0004 to Neon DB                 | 52f729c | Applied — service_type + duration columns now exist        |
| 2    | Extend AppointmentRow with FK IDs + audit count | f2b77c2 | customerId/vehicleId/mechanicId added; toBe(19) set        |
| 3    | Fix closure bug D-02, valueAsNumber, seed D-01  | 4789c06 | All 3 fixes applied, tsc clean, appointments.test.ts green |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Variable name collision in seed.ts**

- **Found during:** Task 3
- **Issue:** `serviceTypes` already declared at line 392 in seed.ts (for O.S. types). Adding another `const serviceTypes` caused `TS2451: Cannot redeclare block-scoped variable`.
- **Fix:** Renamed appointment-specific arrays to `apptServiceTypes` and `apptDurations`.
- **Files modified:** `scripts/seed.ts`
- **Commit:** 4789c06

### Known Intentional Failure

The `_audit.test.ts` assertion `toBe(19)` currently fails (18 actual) because `updateAppointmentAction` is added in Plan 02. This is by design per RESEARCH.md Pitfall 1 — the count is set ahead of time so Plan 02 can add the action and the test immediately passes without needing to edit the assertion again.

## Threat Surface

| Mitigation                                                         | Status                  |
| ------------------------------------------------------------------ | ----------------------- |
| T-09-01: updateAppointmentStatusAction wrapped in authActionClient | Confirmed — not changed |
| T-09-02: status enum validated via z.enum([...])                   | Confirmed — unchanged   |

## Self-Check: PASSED

- src/\_data-access/appointments.ts: FOUND
- src/\_actions/appointments.ts: FOUND
- commit 52f729c (migration): FOUND
- commit f2b77c2 (FK IDs + audit): FOUND
- commit 4789c06 (bug fixes + seed): FOUND
