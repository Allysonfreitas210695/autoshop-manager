---
phase: 02-responsividade-responsiveness
plan: "02"
subsystem: ui
tags: [tailwind, responsive, data-table, column-hiding]

requires:
  - phase: 02-responsividade-responsiveness
    provides: DataTable with className propagation to TableHead/TableCell (D-03)

provides:
  - Orders table totalAmount column hidden below sm (640px)
  - Dashboard recent-orders table totalAmount column hidden below sm (640px)

affects:
  - 02-03-PLAN (further responsive column polish, if any)
  - 02-04-PLAN (RESP-05 final gate: tsc + lint + build)

tech-stack:
  added: []
  patterns:
    - "column className hidden sm:table-cell on DataTableColumn definition hides column below 640px"

key-files:
  created: []
  modified:
    - src/app/(dashboard)/orders/_components/OrdersClient.tsx
    - src/app/(dashboard)/page.tsx

key-decisions:
  - "D-05: totalAmount (price/Total) is secondary detail — hidden below sm, keeping O.S.#, Cliente/Veículo, Status always visible"

patterns-established:
  - 'Column hiding pattern: add className: "hidden sm:table-cell" to DataTableColumn definition object; no wrapper/Card changes needed'

requirements-completed: [RESP-02, RESP-03]

duration: 5min
completed: 2026-06-12
---

# Phase 2 Plan 02: Responsive Column Hiding — Total Column Summary

**Tailwind `hidden sm:table-cell` added to `totalAmount` column in both the Orders table and dashboard recent-orders table, hiding the price column on phones while keeping O.S.#, Cliente/Veículo, and Status always visible.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-06-12T19:55:00Z
- **Completed:** 2026-06-12T20:00:00Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Orders table (`OrdersClient.tsx`) `totalAmount` column now hides below 640px via `className: "hidden sm:table-cell"`.
- Dashboard recent-orders table (`page.tsx` `orderColumns`) `totalAmount` column now hides below 640px, mirroring the Orders table rule.
- All other columns left untouched: `plate` (hidden sm), `mechanic` (hidden md), `orderNumber`/`customer`/`status` (always visible).
- No wrapper or DataTable internal markup altered; horizontal scroll (D-03) preserved.

## Task Commits

1. **Task 1: Hide Total column below sm in Orders table** - `d3cc096` (feat)
2. **Task 2: Hide Total column below sm in dashboard recent-orders table** - `622d84c` (feat)

## Files Created/Modified

- `src/app/(dashboard)/orders/_components/OrdersClient.tsx` - Added `className: "hidden sm:table-cell"` to `totalAmount` column definition
- `src/app/(dashboard)/page.tsx` - Added `className: "hidden sm:table-cell"` to `totalAmount` column in `orderColumns`

## Decisions Made

None — followed plan exactly as specified. Pattern `className: "hidden sm:table-cell"` was already established in `customers-client.tsx` and `plate`/`mechanic` columns; this plan extended it to `totalAmount` per D-05.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- RESP-02 and RESP-03 satisfied: both order tables hide Total column on phones.
- Ready for plan 02-03 (next responsiveness tasks in wave 1).
- Final gate (RESP-05: `npx tsc --noEmit && npm run lint && npm run build`) runs in plan 02-04.

---

_Phase: 02-responsividade-responsiveness_
_Completed: 2026-06-12_
