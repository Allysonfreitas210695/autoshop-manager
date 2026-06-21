# Roadmap: AutoShop Manager (Precision Auto)

## Milestones

- ✅ **v1.0 Hardening & Polish** — Phases 1-4 (shipped 2026-06-20)
- 🔄 **v1.1 DB Integration & Live Data** — Phases 5-10 (in progress)

## Phases

<details>
<summary>✅ v1.0 Hardening & Polish (Phases 1-4) — SHIPPED 2026-06-20</summary>

- [x] Phase 1: Segurança (Security) — 5/5 plans — completed 2026-06-15
- [x] Phase 2: Responsividade (Responsiveness) — 4/4 plans — completed 2026-06-12
- [x] Phase 3: Usabilidade (Usability) — 5/5 plans — completed 2026-06-14
- [x] Phase 4: Aprimoramento de telas (Screen enhancement) — 5/5 plans — completed 2026-06-15

See: `.planning/milestones/v1.0-ROADMAP.md` for full phase details.

</details>

### v1.1 DB Integration & Live Data

- [ ] **Phase 5: DB Foundation & Auth** — Migrations applied, Better Auth wired to Drizzle, seed script operational, connection safe for Vercel serverless
- [ ] **Phase 6: Orders & Transactions** — O.S. CRUD on real DB, budget approval, auto-transaction insert on O.S. close, updatedAt audit
- [ ] **Phase 7: Customers & Vehicles** — Customer/vehicle CRUD real, vehicle history, email uniqueness guard
- [ ] **Phase 8: Inventory** — Parts list, low-stock alerts, purchase orders CRUD with correct enum, stock auto-decrement
- [ ] **Phase 9: Appointments** — Appointment CRUD on real DB, schema migration for serviceType + duration
- [ ] **Phase 10: Finance & Analytics** — Finance metrics from real transactions, analytics sentinel fix, N+1 dashboard refactor

---

## Phase Details

### Phase 5: DB Foundation & Auth

**Goal**: The database is live, auth works against real Drizzle tables, and the project can be safely deployed to Vercel without connection exhaustion
**Depends on**: Nothing (foundation phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03
**Success Criteria** (what must be TRUE):

1. `npx drizzle-kit migrate` runs successfully against the production DB with all 12 tables created
2. Operator can log in and log out and the session persists across page navigations (Better Auth reads/writes Drizzle)
3. `scripts/seed.ts` populates all 12 tables with representative relational data without errors
4. DB connection pattern is serverless-safe (no `pg.Pool` exhaustion under Vercel Lambda invocations)

**Plans**: 2 plans
Plans:
**Wave 1**

- [ ] 05-01-PLAN.md — Harden pg.Pool (max:3 + timeouts), add 'confirmed' enum, generate+apply migration 0003

**Wave 2** _(blocked on Wave 1 completion)_

- [ ] 05-02-PLAN.md — Fix seed idempotency (add verification to wipe), validate seed runs twice cleanly

**UI hint**: no

### Phase 6: Orders & Transactions

**Goal**: Service orders are fully CRUD on the real database, and closing an O.S. automatically creates a transaction record
**Depends on**: Phase 5
**Requirements**: OS-01, OS-02, OS-03
**Success Criteria** (what must be TRUE):

1. Operator can create a new O.S. via the 4-step wizard and it persists in the DB (survives page refresh)
2. Operator can list all O.S., change status, and see status reflected immediately after revalidation
3. Approving/closing an O.S. automatically creates a row in `transactions` with the correct amount
4. All update actions (status change, budget approval) include `updatedAt: new Date()` and the field is correct in the DB
   **Plans**: TBD
   **UI hint**: no

### Phase 7: Customers & Vehicles

**Goal**: Customer and vehicle data is fully managed from the real database with proper constraint handling
**Depends on**: Phase 5
**Requirements**: CLI-01, CLI-02, CLI-03
**Success Criteria** (what must be TRUE):

1. Operator can create, list, edit, and search customers and data persists in the DB
2. Customer detail page shows real linked vehicles and real O.S. history from DB
3. Attempting to create a customer with a duplicate email shows a user-friendly error (no generic crash or PG exception surfaces)
   **Plans**: TBD
   **UI hint**: no

### Phase 8: Inventory

**Goal**: Parts inventory, low-stock alerts, and purchase orders all operate against the real database with correct enum values and stock auto-decrement
**Depends on**: Phase 5
**Requirements**: INV-01, INV-02, INV-03
**Success Criteria** (what must be TRUE):

1. Operator can list all parts and real low-stock alerts appear for items below minimum quantity
2. Operator can create a purchase order with all valid statuses (including "confirmed") without DB errors
3. Adding a part to an O.S. decrements the `quantity` field in the DB for that part
   **Plans**: TBD
   **UI hint**: no

### Phase 9: Appointments

**Goal**: Appointments are persisted to and loaded from the real database, with the schema matching the form fields
**Depends on**: Phase 5, Phase 7
**Requirements**: APPT-01, APPT-02
**Success Criteria** (what must be TRUE):

1. Operator can create an appointment via the form and it appears on the calendar after page reload (DB-persisted)
2. Operator can cancel an appointment and the change persists in the DB
3. No form data is lost: `serviceType` and `duration` submitted in the form are stored and retrieved correctly from the DB
   **Plans**: TBD
   **UI hint**: yes

### Phase 10: Finance & Analytics

**Goal**: Finance reports and analytics dashboard display real metrics calculated from live transaction data, with no sentinel values or N+1 query performance issues
**Depends on**: Phase 6
**Requirements**: FIN-01, FIN-02, FIN-03, FIN-04
**Success Criteria** (what must be TRUE):

1. Finance overview and reports pages show revenue, expenses, and profit calculated from real `transactions` rows (not zero or mock data)
2. Analytics dashboard displays all KPIs with real values; fields without a data source show "N/D" (not "-1%" or "-1")
3. Dashboard page loads without N+1 query patterns; batch/JOIN queries replace per-row loops in `getUpcomingDeliveries` and similar functions
4. All numeric values from `numeric(12,2)` Drizzle columns are converted to JS `number` before reaching UI components (no "R$ NaN" rendered anywhere)
   **Plans**: TBD
   **UI hint**: no

---

## Progress

| Phase                                          | Milestone | Plans Complete | Status      | Completed  |
| ---------------------------------------------- | --------- | -------------- | ----------- | ---------- |
| 1. Segurança (Security)                        | v1.0      | 5/5            | Complete    | 2026-06-15 |
| 2. Responsividade (Responsiveness)             | v1.0      | 4/4            | Complete    | 2026-06-12 |
| 3. Usabilidade (Usability)                     | v1.0      | 5/5            | Complete    | 2026-06-14 |
| 4. Aprimoramento de telas (Screen enhancement) | v1.0      | 5/5            | Complete    | 2026-06-15 |
| 5. DB Foundation & Auth                        | v1.1      | 0/2            | Planned     | -          |
| 6. Orders & Transactions                       | v1.1      | 0/?            | Not started | -          |
| 7. Customers & Vehicles                        | v1.1      | 0/?            | Not started | -          |
| 8. Inventory                                   | v1.1      | 0/?            | Not started | -          |
| 9. Appointments                                | v1.1      | 0/?            | Not started | -          |
| 10. Finance & Analytics                        | v1.1      | 0/?            | Not started | -          |

---

## Coverage — v1.1

| REQ-ID   | Phase    | Status  |
| -------- | -------- | ------- |
| FOUND-01 | Phase 5  | Pending |
| FOUND-02 | Phase 5  | Pending |
| FOUND-03 | Phase 5  | Pending |
| OS-01    | Phase 6  | Pending |
| OS-02    | Phase 6  | Pending |
| OS-03    | Phase 6  | Pending |
| CLI-01   | Phase 7  | Pending |
| CLI-02   | Phase 7  | Pending |
| CLI-03   | Phase 7  | Pending |
| INV-01   | Phase 8  | Pending |
| INV-02   | Phase 8  | Pending |
| INV-03   | Phase 8  | Pending |
| APPT-01  | Phase 9  | Pending |
| APPT-02  | Phase 9  | Pending |
| FIN-01   | Phase 10 | Pending |
| FIN-02   | Phase 10 | Pending |
| FIN-03   | Phase 10 | Pending |
| FIN-04   | Phase 10 | Pending |

**18/18 requirements mapped. No orphans.**

---

_v1.0 shipped: 2026-06-20 — v1.1 roadmap created: 2026-06-20_
