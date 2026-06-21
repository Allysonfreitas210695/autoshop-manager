# Feature Research

**Domain:** AutoShop Manager — DB Integration (v1.1 milestone)
**Researched:** 2026-06-20
**Confidence:** HIGH (based on direct codebase inspection)

---

## Context: Current Wiring State

This milestone replaces mock data with Drizzle ORM queries. The research below maps
what each module needs to "become real" and what new behaviors emerge.

**Already fully wired to DB (actions + data-access + pages):**

- Orders: `listOrders`, `getOrderById`, `createOrderAction`, `updateOrderStatusAction`, `deleteOrderAction`, `approveOrderItemAction`
- Customers: `listCustomers`, `getCustomerById`, `createCustomerAction`, `updateCustomerAction`, `createVehicleAction`
- Inventory: `listParts`, `getLowStockParts`, `getInventoryMetrics`, `listPurchaseOrders`, `createPartAction`, `updateStockAction`, `createPurchaseOrderAction`, `updatePurchaseOrderStatusAction`
- Appointments: `listAppointments`, `listMechanics`, `listCustomerOptions`, `createAppointmentAction`, `updateAppointmentStatusAction`
- Finance: `listTransactions`, `getFinanceMetrics`, `getWeeklyCashFlow`, `getMonthlyCashFlow`, `getCostBreakdown`
- Analytics: `getAnalyticsKpis`, `getMonthlyRevenue`, `getMechanicPerformance`, `getServiceCategories`
- Dashboard: `getDashboardMetrics`, `getStatusDistribution`, `getUpcomingDeliveries`, `getNotifications`

**Conclusion:** All data-access functions and server actions exist and are wired into pages.
The mock-data file is no longer imported by any app page. The work remaining is **empty-state
handling, behavioral gaps, and schema/data mismatches** revealed when real (empty) DB is used.

---

## Feature Landscape

### Table Stakes (Must Work on First DB Wire)

| Feature                               | Why Expected                                                                                                   | Complexity | Notes                                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Empty state for every list screen     | Real DB starts empty; mock had data                                                                            | LOW        | Orders, Customers, Inventory, Appointments, Finance all need "no records" UI that doesn't break layout                        |
| `revalidatePath` completeness         | After CUD actions, stale Server Component cache must bust                                                      | LOW        | Currently `/orders`, `/customers`, `/inventory`, `/appointments` covered; verify `/appointments` revalidates on status change |
| Pagination on Orders list             | `listOrders` returns `pageCount` but page param must flow from URL → page.tsx → client                         | MEDIUM     | `page` searchParam already consumed in `/orders/page.tsx`; client needs prev/next controls wired                              |
| Pagination on Customers list          | Same pattern as Orders                                                                                         | MEDIUM     | `/customers/page.tsx` calls `listCustomers(page)` but pagination UI may not render controls yet                               |
| Order detail panel from list          | `OrderDetailPanel` fetches order by ID — must use `getOrderDetailAction` not mock                              | MEDIUM     | Panel likely still references mock `getMockOrderById`; needs to call server action                                            |
| Customer nextServices section         | Currently hardcoded in mock; no `nextServices` table in schema                                                 | LOW        | `/customers/[id]` page renders `nextServices` from mock — must either remove section or show empty/stub                       |
| Dashboard revenueToday metric         | `getDashboardMetrics` does NOT return `revenueToday` (only `openOrders`, `readyVehicles`, `todayAppointments`) | LOW        | Dashboard page must drop or compute `revenueToday` from `listTransactions` for today                                          |
| `track/[id]` public page              | Already calls `getOrderById`; needs graceful 404 when UUID not found                                           | LOW        | `getOrderById` returns `null`; page must render not-found, not crash                                                          |
| Finance: transaction list empty state | `listTransactions` returns `[]` on empty DB; table must handle                                                 | LOW        | Chart components (recharts) crash on empty arrays if not guarded                                                              |
| Appointments calendar: no-data month  | Calendar renders grid from `initialAppointments` — empty array must show empty calendar, not blank screen      | LOW        | Custom date-fns calendar should handle gracefully; verify                                                                     |

### Differentiators (Behavioral Upgrades vs Mock)

| Feature                               | Value Proposition                                                                                            | Complexity | Notes                                                                                                         |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------- |
| Server-side status filter on Orders   | `listOrders(status)` already accepts filter; URL-driven tab selection → real counts per status               | MEDIUM     | Tab counts currently come from full list length; need per-status `count()` query or filter-aware listOrders   |
| Order search by plate/customer        | `searchCustomers` exists; no `searchOrders` in data-access                                                   | MEDIUM     | Add `searchOrders(query)` filtering on `vehicles.plate` or customer name via join                             |
| Inventory category filter server-side | `listParts(category)` does in-memory filter after fetching all; at scale should push filter to DB            | MEDIUM     | Current code: fetch all then `.filter()` in JS — acceptable for now, flag for later                           |
| Appointment service type stored in DB | `appointments` table has no `serviceType` column; mock had `AppointmentServiceType`                          | MEDIUM     | `NewAppointmentDrawer` collects serviceType; schema missing it — either add migration or drop field from form |
| Appointment duration stored in DB     | Same — `appointments` table has no `duration` column                                                         | LOW        | Mock had `duration: number (minutes)`; schema omits it — drop from form or add column                         |
| Purchase order `confirmed` status     | `purchaseOrders` schema has `draft/sent/received/cancelled` but NOT `confirmed`; mock had `confirmed`        | LOW        | `MockPurchaseOrder` includes `confirmed` status; action schema and DB enum mismatch                           |
| Stock auto-decrement on O.S. close    | When order status → `completed`, parts used in `serviceOrderItems` should decrement `services.stockQuantity` | HIGH       | Not currently implemented; requires transaction in `updateOrderStatusAction`                                  |
| Transaction auto-create on O.S. close | When order → `completed`, insert income transaction for `totalAmount`                                        | HIGH       | Finance data is only real if O.S. completion populates `transactions`; currently no link                      |
| Analytics `nps` and `returnRate`      | `getAnalyticsKpis` returns `-1` for both — no source table                                                   | MEDIUM     | UI must detect `-1` and show "N/D" instead of "−1%"; or remove from KPI display                               |
| Mechanic `avgRating`                  | `getMechanicPerformance` hardcodes `avgRating: 4.5` — no ratings table                                       | LOW        | Show "—" or remove column until ratings feature exists                                                        |

### Anti-Features (Avoid in This Milestone)

| Feature                                        | Why Requested                                  | Why Problematic                                                                                                      | Alternative                                                                                |
| ---------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Real-time order status updates (WebSocket/SSE) | Workshop staff want live updates               | Out of scope for v1.1; adds infra complexity (Vercel streaming limits)                                               | Rely on full-page revalidation + manual refresh; revisit in v2                             |
| Inline transaction creation UI                 | Finance page shows no "add transaction" button | Requires new form, validation, action — scope creep                                                                  | Finance transactions should auto-populate from O.S. completion (differentiator above)      |
| Customer portal / login                        | Customers could track their own orders         | Separate auth role flow; `track/[id]` public page already covers this                                                | Keep `track/[id]` as the customer-facing surface                                           |
| Optimistic UI for status changes               | Faster feel                                    | `useOptimistic` + Server Actions have edge cases with React Compiler active; mock already removed so latency is real | Show loading spinner on status button; revalidation is fast enough                         |
| Paginated finance transaction list             | Large workshops accumulate many transactions   | Adds complexity before any real data exists                                                                          | `listTransactions(50)` limit is fine for v1.1; add pagination in v1.2 when volume is known |

---

## Feature Dependencies

```
[DB-01: Better Auth ↔ DB]
    └──required by──> [DB-02: Orders CRUD] (mechanicId references user.id)
    └──required by──> [DB-03: Customers CRUD] (customerId references user.id)
    └──required by──> [DB-05: Appointments] (customerId, mechanicId reference user.id)

[DB-03: Customers CRUD]
    └──required by──> [DB-02: Orders CRUD] (order wizard step-1 searches customers)
    └──required by──> [DB-05: Appointments] (appointment form selects customer)

[DB-02: Orders CRUD]
    └──enables──> [DB-06: Finance real data] (O.S. close → transaction insert)
    └──enables──> [DB-04: Inventory decrement] (O.S. close → stock update)

[DB-04: Inventory CRUD]
    └──enables──> [DB-02: Order items with serviceId] (parts catalog linked to order items)

[Transaction auto-create on O.S. close]
    └──required by──> [Finance metrics showing real numbers]
    └──required by──> [Analytics KPIs being non-zero]
```

### Dependency Notes

- **DB-01 must be first:** `user` table is referenced as FK by every other table. Better Auth sessions + the `role` field (`admin`, `mechanic`, `customer`) are the foundation.
- **O.S. close → transaction is the critical link:** Without auto-inserting a `transactions` row when a service order closes, the Finance and Analytics pages will always show zeroes even with real order data.
- **Appointment schema gaps block full appointments wiring:** `serviceType` and `duration` exist in mock but not in DB schema. The `NewAppointmentDrawer` form collects these fields. Either a migration adds them or the form must be simplified before wiring.

---

## MVP Definition (for v1.1)

### Launch With (must work on first real-DB deployment)

- [x] All pages render without crashing on empty DB (empty states everywhere)
- [x] Orders: create, list with pagination, detail panel, status change, budget approval, print
- [x] Customers: create, list with pagination, detail page with vehicle list and order history
- [x] Inventory: add part, list with category tabs, low-stock alerts, purchase orders CRUD
- [x] Appointments: create appointment, calendar renders real data, status update
- [x] Finance: metrics derived from real transactions, weekly cash flow chart, transaction list
- [x] Analytics: KPIs from real data (with `-1` fields showing "N/D"), monthly revenue chart, mechanic performance table
- [x] Dashboard: open orders count, today's appointments count, upcoming deliveries list, notifications from real stock/orders
- [ ] O.S. close auto-creates income transaction (required for Finance/Analytics to show non-zero)
- [ ] `OrderDetailPanel` calls real action (not mock `getMockOrderById`)
- [ ] Customer page `nextServices` section removed or shows empty (no DB source)
- [ ] Appointment schema migration: add `serviceType` + `duration` columns OR remove from form
- [ ] Purchase order `confirmed` status: add to DB enum OR remove from status flow

### Add After Validation (v1.x post-launch)

- [ ] Stock auto-decrement when O.S. closes (requires `updateOrderStatusAction` transaction wrapping parts consumption)
- [ ] Server-side order search by plate/customer name
- [ ] Per-status order counts on tab headers (currently shows total filtered client-side)
- [ ] Finance transaction manual entry (for expenses not tied to O.S.)
- [ ] Analytics NPS / return rate (requires separate data collection mechanism)

### Future Consideration (v2+)

- [ ] Real-time dashboard updates
- [ ] Customer ratings / NPS collection flow
- [ ] Multi-shop support
- [ ] Mechanic mobile app for status updates

---

## Feature Prioritization Matrix

| Feature                               | User Value | Implementation Cost | Priority |
| ------------------------------------- | ---------- | ------------------- | -------- |
| Empty states on all list pages        | HIGH       | LOW                 | P1       |
| O.S. close → transaction auto-insert  | HIGH       | MEDIUM              | P1       |
| OrderDetailPanel real wiring          | HIGH       | LOW                 | P1       |
| Appointment schema gaps fix           | HIGH       | LOW                 | P1       |
| Purchase order `confirmed` status fix | MEDIUM     | LOW                 | P1       |
| Customer nextServices stub/removal    | LOW        | LOW                 | P1       |
| Dashboard `revenueToday` fix          | MEDIUM     | LOW                 | P1       |
| Analytics `-1` fields show "N/D"      | MEDIUM     | LOW                 | P1       |
| Mechanic `avgRating` "—" display      | LOW        | LOW                 | P1       |
| Order search by plate/customer        | MEDIUM     | MEDIUM              | P2       |
| Stock auto-decrement on O.S. close    | HIGH       | HIGH                | P2       |
| Finance pagination                    | LOW        | MEDIUM              | P3       |

---

## Per-Module Behavior Changes: Mock → Real

### Dashboard (`/`)

- **Mock:** Static counts, hardcoded `revenueToday: 12450`, fixed upcoming deliveries list
- **Real:** `getDashboardMetrics()` returns live counts; `revenueToday` not in query — must add SQL sum for today's paid income transactions or drop the metric; `getUpcomingDeliveries()` pulls real orders with `dueAt`; `getNotifications()` shows real critical stock + recent completions
- **New behaviors:** Empty metric cards (0 open orders is valid); upcoming deliveries empty when no orders have `dueAt` set

### Orders (`/orders`, `/orders/new`, `/orders/[id]/budget`, `/orders/[id]/print`)

- **Mock:** Static 5-row list; `getMockOrderById` for detail panel
- **Real:** Paginated list with URL `?page=N`; `OrderDetailPanel` must call `getOrderDetailAction` (UUID-based, not "OSC-5521" strings); `createOrderAction` inserts vehicle with `make: "Não informado"` — wizard step lacks make/year fields
- **New behaviors:** Empty list state; panel shows spinner while action resolves; order IDs are UUIDs not "OSC-XXXX" — any display of ID must use `orderNumber` (serial) not `id`

### Customers (`/customers`, `/customers/[id]`)

- **Mock:** Static 5 customers with full history
- **Real:** Paginated; `totalSpent` computed via SQL aggregate; `visits` = count of orders; `nextServices` has no DB source — must stub or remove
- **New behaviors:** New customer has `totalSpent: 0`, `visits: 0`, `lastVisit: null` — all must render gracefully

### Inventory (`/inventory`, `/inventory/alerts`, `/inventory/purchase-orders`)

- **Mock:** 12 parts, computed metrics
- **Real:** `listParts(category)` fetches all then JS-filters by category — fine for v1.1; `getInventoryMetrics()` re-fetches all parts — acceptable; `getLowStockParts()` uses `<=` comparison in SQL
- **New behaviors:** Empty inventory shows zero metrics and empty table; `totalValue` is `0` not a negative; alerts page shows "Nenhuma peça em alerta" when all stock is adequate

### Appointments (`/appointments`)

- **Mock:** 13 appointments with `serviceType`, `duration`, `mechanic` as string name
- **Real:** `appointmentStatus` enum uses `scheduled/confirmed/completed/cancelled` but mock used `confirmed/pending/cancelled/completed` — `pending` maps to `scheduled`; mechanic stored as FK UUID not name string; `serviceType` and `duration` not in schema
- **New behaviors:** Calendar with zero appointments shows empty grid; `NewAppointmentDrawer` must send `mechanicId` (UUID) not mechanic name string; status labels must map `scheduled` → "Agendado" (currently mock has "Pendente" for `pending`)

### Finance (`/finance`, `/finance/reports`)

- **Mock:** Pre-populated transactions with income and expenses
- **Real:** `listTransactions` returns empty until O.S. flow creates transactions; charts (recharts AreaChart, BarChart) crash on `[]` data if `<Area>` or `<Bar>` don't receive non-empty data — guard required
- **New behaviors:** All metrics show 0; cost breakdown pie chart shows nothing; monthly cash flow chart shows no bars

### Analytics (`/analytics`)

- **Mock:** 12 months of revenue, 4 mechanics with ratings, 6 service categories
- **Real:** `nps: -1`, `returnRate: -1`, `avgRating: 4.5` (hardcoded) — all three need UI guard; `getServiceCategories()` filters null `serviceType` — orders created without serviceType won't appear
- **New behaviors:** Empty charts until orders + transactions accumulate; mechanic performance table empty if no orders with `mechanicId` set

---

## Sources

- Direct codebase inspection: `src/_data-access/*.ts`, `src/_actions/*.ts`, `src/_db/schema/*.ts`, `src/app/(dashboard)/*/page.tsx`
- Mock data structure: `src/_helpers/mock-data.ts`
- Project requirements: `.planning/PROJECT.md`

---

_Feature research for: Precision Auto — v1.1 DB Integration_
_Researched: 2026-06-20_
