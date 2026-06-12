---
phase: 02-responsividade-responsiveness
plan: "03"
subsystem: responsive-layout
tags: [responsiveness, tailwind, charts, step-indicator, horizontal-scroll]
dependency_graph:
  requires: []
  provides: [RESP-03]
  affects:
    - src/app/(dashboard)/orders/new/step-indicator.tsx
    - src/app/(dashboard)/finance/page.tsx
    - src/app/(dashboard)/finance/reports/page.tsx
tech_stack:
  added: []
  patterns:
    - overflow-x-auto + min-w wrapper for recharts ResponsiveContainer charts on mobile
    - hidden-scrollbar horizontal-scroll step row with shrink-0 min-width step items
key_files:
  created: []
  modified:
    - src/app/(dashboard)/orders/new/step-indicator.tsx
    - src/app/(dashboard)/finance/page.tsx
    - src/app/(dashboard)/finance/reports/page.tsx
decisions:
  - "Use min-w-[56px] shrink-0 per step item so 5 steps fit within 320px without auto-scroll-into-view logic"
  - "Connector line retains flex-1 to stretch naturally between fixed-width step items"
  - "Chart readability floors: CashFlowBarChart=300px (6 bars), MonthlyLineChart=360px (6 months x 3 series), CostDonutChart=280px (radial scales well)"
  - "CostDonutChart wrapper omits extra p-4 because parent Card already pads"
metrics:
  duration: "~5 min"
  completed: "2026-06-12"
  tasks_completed: 3
  tasks_total: 3
---

# Phase 02 Plan 03: Horizontal-Scroll Step Indicator and Finance Charts Summary

**One-liner:** Pure Tailwind overflow-x-auto wrappers applied to the 5-step order-wizard row and three recharts charts so narrow viewports scroll instead of compress.

## What Was Built

Three files modified with no logic changes — only wrapper class edits:

1. **Step indicator** (`orders/new/step-indicator.tsx`): outer step row changed from `flex justify-between` to `flex overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`; each step item changed from `flex-1` to `min-w-[56px] shrink-0`. Connector line `flex-1` preserved so it stretches between fixed-width items.

2. **CashFlowBarChart** (`finance/page.tsx`): existing `<div className="p-4">` split into outer `overflow-x-auto p-4` + inner `min-w-[300px]` wrapping the chart component.

3. **MonthlyLineChart and CostDonutChart** (`finance/reports/page.tsx`): MonthlyLineChart wrapped in `overflow-x-auto p-4` + `min-w-[360px]`; CostDonutChart wrapped in `overflow-x-auto` + `min-w-[280px]` (no extra padding — parent Card pads).

## Tasks

| #   | Name                                                 | Commit  | Status |
| --- | ---------------------------------------------------- | ------- | ------ |
| 1   | Convert step indicator to horizontal scroll          | c8ed4ae | Done   |
| 2   | Wrap CashFlowBarChart in horizontal-scroll container | d56710e | Done   |
| 3   | Wrap reports charts in horizontal-scroll containers  | fbf1c47 | Done   |

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — this plan adds CSS wrapper classes only; no data wiring involved.

## Threat Flags

None — pure CSS layout change; no new network endpoints, auth paths, or schema changes.

## Self-Check: PASSED

- `src/app/(dashboard)/orders/new/step-indicator.tsx` — modified, committed c8ed4ae
- `src/app/(dashboard)/finance/page.tsx` — modified, committed d56710e
- `src/app/(dashboard)/finance/reports/page.tsx` — modified, committed fbf1c47
- All three source assertions passed via grep/node verification before commit
