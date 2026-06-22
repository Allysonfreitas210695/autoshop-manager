# Phase 10: Finance & Analytics - Context

**Gathered:** 2026-06-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire the remaining finance/analytics gaps: add full transaction CRUD (create/edit/delete) to `/finance`, fix analytics KPIs to show `N/D` instead of `0` for derived metrics when no data exists, migrate the category-profitability report from in-memory JS grouping to a SQL `GROUP BY` query, add period filter to the reports page, and seed realistic transaction data (linked to existing service orders) for development.

The data-access layer (`finance.ts`, `analytics.ts`) is already fully implemented with real Drizzle queries. This phase focuses on the remaining UI capabilities and correctness issues.

</domain>

<decisions>
## Implementation Decisions

### Transaction CRUD

- **D-01:** Add a `NewTransactionDrawer` component on `/finance` — opens via the existing `FinanceActions` "Quick Actions" button. Fields: tipo (income/expense), valor, data, descrição, categoria (texto livre), status (paid/pending/overdue). All fields required.
- **D-02:** Add edit capability: clicking a row in the transactions table opens an `EditTransactionDrawer` pre-populated with the transaction data.
- **D-03:** Add delete capability: a delete button inside `EditTransactionDrawer` (with confirmation) calls a `deleteTransactionAction`.
- **D-04:** Categorias são texto livre — sem enum restrito. Usuário digita qualquer string (reuses existing `category: text("category")` in schema).
- **D-05:** After create/edit/delete, invalidate the route (use `router.refresh()` pattern — consistent with how other CRUD operations work in this codebase).

### Empty-State / N/D Handling

- **D-06:** `getAnalyticsKpis` returns `null` (not `0`) for derived KPIs when the denominator is zero: `nps`, `returnRate`, `netMargin`, `avgTicket`. Update the return type: `AnalyticsKpis.nps: number | null`, etc.
- **D-07:** `AnalyticsClient` renders `"N/D"` when the value is `null`. Count-based KPIs (`totalOrders12m`, `activeCustomers`, `newCustomers`) keep `0`.
- **D-08:** Same null-guard pattern applied anywhere these KPIs are used as `sub` text (e.g., `"Ticket médio ${formatCurrency(kpis.avgTicket)}"` → `"Ticket médio N/D"` when null).

### Reports Optimization

- **D-09:** Replace `listTransactions(500)` + `buildCategoryRows()` in `finance/reports/page.tsx` with a new `getCategoryReport(days)` function in `finance.ts` that executes a SQL `GROUP BY category` query returning `{ category, grossRevenue, totalExpenses, netProfit }[]` directly from the DB.
- **D-10:** Add period filter to `/finance/reports` — same `?periodo=mensal|trimestral|anual` searchParam pattern used in `/finance`. All queries in the reports page receive the period-derived `days` parameter. Default: `mensal` (30 days).

### Seed Data

- **D-11:** `scripts/seed.ts` creates ~30 transactions spanning the last 6 months: receipts (`type: 'income'`, `status: 'paid'`) linked to existing service orders via `serviceOrderId`; fixed expenses (`type: 'expense'`, `status: 'paid'`, `serviceOrderId: null`) for categories like "Despesa Fixa", "Fornecedor", "Mão de Obra". Mix provides rich charts in development.
- **D-12:** Seed transactions are created after service orders (FK dependency). Amounts reflect realistic values for an auto-mechanic shop (R$200–R$2500 for income; R$100–R$800 for expenses).

### Claude's Discretion

- Exact placement of "Nova Transação" trigger inside `FinanceActions` dropdown (additional menu item).
- Drawer animation and field ordering within form.
- Server action names (`createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction`).
- Zod schema for transaction form validation (reuse pattern from `src/_actions/orders.ts`).

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema and Data Access

- `src/_db/schema/transactions.ts` — transactions table: `id`, `date`, `description`, `category`, `type` (enum: income/expense), `amount` (numeric 12,2), `status` (enum: paid/pending/overdue), `serviceOrderId` (FK nullable), `createdAt`, `updatedAt`
- `src/_data-access/finance.ts` — existing queries: `listTransactions`, `getFinanceMetrics`, `getWeeklyCashFlow`, `getMonthlyCashFlow`, `getCostBreakdown`, `getReportOrderCount` — new `getCategoryReport` goes here
- `src/_data-access/analytics.ts` — `getAnalyticsKpis` return type must be updated (null for derived fields)

### Finance UI

- `src/app/(dashboard)/finance/page.tsx` — existing finance page; `FinanceActions` is the entry point for new transaction trigger; transactions table at bottom
- `src/app/(dashboard)/finance/finance-actions.tsx` — `FinanceActions` component (dropdown pattern to extend)
- `src/app/(dashboard)/finance/reports/page.tsx` — `buildCategoryRows` to be replaced; period filter to be added

### Analytics UI

- `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` — KPI grid rendering; null guard for `N/D` values needed here
- `src/app/(dashboard)/analytics/page.tsx` — calls `getAnalyticsKpis`, `getMonthlyRevenue`, `getMechanicPerformance`, `getServiceCategories`

### Patterns to Follow

- `src/_actions/orders.ts` — server action pattern (Zod schema, `actionClient`, error handling)
- `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` — Drawer + form pattern to replicate for `NewTransactionDrawer`
- `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx` — edit trigger pattern (button → open drawer with data)

### Seed

- `scripts/seed.ts` — seed script; transactions section goes after service orders loop (FK dependency)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `FinanceActions` (finance-actions.tsx): existing dropdown pattern — extend with "Nova Transação" link/button triggering the drawer
- `NewAppointmentDrawer` + `useAppointmentForm` hook: canonical Drawer + react-hook-form + Zod pattern to replicate for transactions
- `DataTable` (ui/data-table): already renders the transactions table; row click can open EditTransactionDrawer
- `createTransactionAction` pattern: follows `src/_actions/orders.ts` — `actionClient.schema(zodSchema).action(async ({ parsedInput }) => { ... })`

### Established Patterns

- Server Components by default; `"use client"` only for interactive drawers
- `router.refresh()` after mutations (used in appointments and orders flows)
- `Number(r.amount)` conversion at data-access boundary (already applied in finance.ts, analytics.ts — maintain this pattern)
- `sql.raw(String(days))` for dynamic interval injection (already used in finance.ts — maintain verbatim)

### Integration Points

- `getCategoryReport(days)` replaces `listTransactions(500)` call in reports/page.tsx — same import path `@/_data-access/finance`
- `getAnalyticsKpis` return type change (null fields) requires update in `analytics/page.tsx` (destructuring) and `AnalyticsClient` props type
- Seed transactions created after `serviceOrders` loop in seed.ts (uses IDs from the created O.S. records)

</code_context>

<specifics>
## Specific Ideas

- Period filter on reports page uses `?periodo=mensal|trimestral|anual` searchParam — same pattern as `/finance?periodo=`
- `getCategoryReport` function returns `{ category: string; grossRevenue: number; totalExpenses: number; netProfit: number; status: 'positive' | 'neutral' | 'negative' }[]` (status derived in SQL or in the function, not in the page component)
- Seed: ~30 transactions total (not just the number, needs to fill 6 months worth of chart data for `getMonthlyCashFlow` to show non-empty bars)

</specifics>

<deferred>
## Deferred Ideas

- **Paginação da tabela de transações**: `/finance` currently loads the last 50 transactions. Server-side pagination deferred to a future phase (listed in REQUIREMENTS.md Future Requirements).
- **Driver swap**: Substituir pg.Pool por @neondatabase/serverless — explicitly out of scope per REQUIREMENTS.md.
- **Relatórios exportáveis**: `ExportPdfButton` exists in reports page but is a placeholder; PDF export is out of scope for Phase 10.
- **Filtro avançado de transações**: Filtrar tabela por tipo/status/categoria — não foi solicitado para esta fase.

</deferred>

---

_Phase: 10-finance-analytics_
_Context gathered: 2026-06-22_
