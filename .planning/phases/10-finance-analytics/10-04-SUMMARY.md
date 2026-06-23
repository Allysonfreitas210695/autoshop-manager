---
phase: 10-finance-analytics
plan: "04"
subsystem: analytics-ui, finance-reports
tags: [null-guards, analytics, reports, period-filter, drizzle, next15]
dependency_graph:
  requires: ["10-01"]
  provides: ["analytics-null-safety", "reports-category-sql"]
  affects: ["analytics/page.tsx", "finance/reports/page.tsx"]
tech_stack:
  patterns:
    [
      "null-guard ternary",
      "searchParams await",
      "Promise.all",
      "getCategoryReport SQL GROUP BY",
    ]
key_files:
  modified:
    - src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx
    - src/app/(dashboard)/finance/reports/page.tsx
decisions:
  - "AnalyticsClient renders N/D for all 4 nullable KPIs (avgTicket, netMargin, nps, returnRate)"
  - "reports/page.tsx derives days from getPeriodDays() — never from searchParam directly"
  - "CategoryRow extends CategoryReport with synthetic id field for DataTable"
  - "Period filter links rendered inside category table card header"
metrics:
  duration: "~15 min"
  completed: "2026-06-23"
  tasks_completed: 2
  files_modified: 2
---

# Phase 10 Plan 04: Analytics Null-Guards + Reports Category SQL Summary

Null-guards for 4 nullable KPIs in AnalyticsClient (no more null%/NaN/-1) and SQL GROUP BY via getCategoryReport with period filter in finance/reports page.

## Tasks Completed

| #   | Task                                         | Commit  | Files               |
| --- | -------------------------------------------- | ------- | ------------------- |
| 1   | Null-guards in AnalyticsClient               | 19f09b4 | AnalyticsClient.tsx |
| 2   | getCategoryReport + period filter in reports | 19f09b4 | reports/page.tsx    |

## Changes Made

### AnalyticsClient.tsx

Applied null-guards for all 4 nullable KPIs from `AnalyticsKpis`:

- `avgTicket`: null → `"N/D"` in sub text; non-null → `formatCurrency(avgTicket)`
- `netMargin`: null → `"N/D"` as card value; non-null → `` `${netMargin}%` ``
- `nps`: null → `"N/D"` as card value; non-null → `nps.toString()`
- `returnRate`: null → `"Taxa de retorno N/D"` in sub; non-null → `` `${returnRate}% taxa de retorno` ``

### reports/page.tsx

- Removed `listTransactions(500)` import and call
- Removed `buildCategoryRows()` function and its usage
- Added `getCategoryReport(days)` from `@/_data-access/finance`
- Added `Period` type, `getPeriodDays()`, `PERIODS` array (copied from finance/page.tsx)
- Updated `Props` to `{ searchParams: Promise<{ periodo?: string }> }` — awaited in body
- `activePeriod` defaults to `"mensal"` (30 days); validated against allowlist — no raw searchParam in SQL
- `categoryRowsWithId` adds synthetic `id: String(i)` for DataTable's `getRowId`
- Period filter links (`mensal|trimestral|anual`) rendered inside category table card header
- `getFinanceMetrics(days)` now uses period-derived `days`

## Verification Results

- `grep -c "N/D" AnalyticsClient.tsx` = 4 (requirement: >= 4)
- `tsc --noEmit` exit 0 — no errors in modified files
- `grep -c "getCategoryReport" reports/page.tsx` = 2 (import + call)
- `grep -c "buildCategoryRows|listTransactions" reports/page.tsx` = 0 (removed)
- `grep -c "periodo" reports/page.tsx` = 4 (requirement: >= 3)

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None.

## Threat Flags

None — no new network endpoints or auth paths introduced.

## Self-Check: PASSED

- `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` — FOUND, committed 19f09b4
- `src/app/(dashboard)/finance/reports/page.tsx` — FOUND, committed 19f09b4
