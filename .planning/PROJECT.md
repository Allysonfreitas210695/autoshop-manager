# AutoShop Manager (Precision Auto)

## Current Milestone: v1.1 DB Integration & Live Data

**Goal:** Substituir todo o mock data por queries Drizzle ORM reais em todos os módulos, conectando Better Auth ao banco de dados.

**Target features:**

- Better Auth ↔ Drizzle DB (usuários, sessões, conta)
- Ordens de serviço: CRUD real (criar, listar, status, orçamento)
- Clientes & veículos: CRUD real
- Inventário: peças, estoque, alertas de mínimo, ordens de compra
- Agendamentos: salvar e carregar do banco
- Finance & Analytics: relatórios financeiros e dashboard analítico com dados reais

## What This Is

AutoShop Manager (brand "Precision Auto", repo "Oficina-Mecanica") is a management system for an auto mechanic workshop (oficina mecânica). It covers the full day-to-day operation: service orders (O.S.), customers & vehicles, parts inventory, finance, and appointments. The app is built on Next.js 16 (App Router, Turbopack, React Compiler), deployed on Vercel, and uses Better Auth for authentication. v1.0 hardened, polished, and completed all screens — the app is now production-ready on mock data, with the full operator flow working end-to-end on desktop and mobile. v1.1 integrates the real Drizzle ORM database to replace all mock data.

## Core Value

A workshop operator can run the full day-to-day flow — intake → service order → budget approval → print/PIX → inventory/finance — on desktop AND mobile, securely, without rough edges.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Operational dashboard (`/`) — v1.0
- ✓ Service order management: list, 4-step new-O.S. wizard with intake checklist, budget approval, print with PIX QR (`/orders`, `/orders/new`, `/orders/[id]/budget`, `/orders/[id]/print`) — v1.0
- ✓ Customers & vehicles: list with side panel, detail/history, NewCustomerDrawer wired to createCustomerAction (`/customers`, `/customers/[id]`) — v1.0
- ✓ Inventory: list with category tabs, add item, low-stock alerts, purchase orders with delivery forecast (`/inventory`, `/inventory/new`, `/inventory/alerts`, `/inventory/purchase-orders`) — v1.0
- ✓ Finance: overview + profitability reports (`/finance`, `/finance/reports`) — v1.0
- ✓ Auth: login, register, forgot/reset password via Better Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`) — v1.0
- ✓ Appointments: calendar with month + week + list views (`/appointments`) — v1.0
- ✓ Public tracking: `/track/[id]` with real QR code (qrcode.react) — v1.0
- ✓ Strategic analytics dashboard (`/analytics`) — v1.0
- ✓ **Security** — auth hardening, server-side Zod validation, route access control, security headers, rate limiting, no client-bundle secret leakage (SEC-01..SEC-06) — v1.0
- ✓ **Responsiveness** — collapsible mobile sidebar, horizontal-scroll tables, adaptive layouts, touch targets, verified breakpoints (RESP-01..RESP-05) — v1.0
- ✓ **Usability** — loading/error/empty states, consistent inline validation, toasts/confirmations, optimistic UI (USAB-01..USAB-06) — v1.0
- ✓ **Screen enhancement** — pending design screens, placeholder route resolution, design-system polish (SCRN-01..SCRN-07) — v1.0

### Active

<!-- Current milestone: v1.1 — DB integration and live data. -->

- [ ] **DB-01** — Better Auth ↔ Drizzle DB (usuários, sessões, conta)
- [ ] **DB-02** — Ordens de serviço: CRUD real (criar, listar, status, orçamento)
- [ ] **DB-03** — Clientes & veículos: CRUD real
- [ ] **DB-04** — Inventário: peças, estoque, alertas de mínimo, ordens de compra
- [ ] **DB-05** — Agendamentos: salvar e carregar do banco
- [ ] **DB-06** — Finance & Analytics: relatórios financeiros e dashboard analítico com dados reais

### Out of Scope

<!-- Explicit boundaries. -->

- **Re-architecture of existing screens** — screens are complete; next work is data layer, not structure.

## Context

- Next.js 16 codebase, deployed on Vercel; Better Auth prod env vars configured.
- All screens currently render from mock data (`src/_helpers/mock-data.ts`). DB schema/migrations exist in `src/_db/` but are not wired in.
- `middleware.ts` is deprecated in this Next.js version → access control lives in `src/proxy.ts`.
- UI library is `@base-ui/react` (NOT Radix): `asChild` does not exist, use the `render` prop.
- React Compiler is active: avoid react-hook-form `watch()` directly in JSX; use `Controller` / `useWatch`.
- v1.0 shipped: full operator flow working on desktop and mobile, all screens implemented, design-system applied globally.
- ~17.6k LOC TypeScript/TSX. Tech stack: Next.js 16 + Turbopack, @base-ui/react + Tailwind, react-hook-form + Zod, Better Auth, Drizzle ORM (schema only).

## Constraints

- **Tech stack**: Next.js 16 (Turbopack, App Router, React Compiler), `@base-ui/react` + Tailwind, react-hook-form + Zod, Better Auth, deployed on Vercel — fixed.
- **Base UI**: use `render={<Component />}` prop, never `asChild`; verify each component API in `src/_components/ui/*.tsx` before use.
- **Process gates**: every phase must pass `npx tsc --noEmit` (zero errors), `npm run lint` (zero errors, imports sorted via simple-import-sort), `npm run build` (success); pre-commit lint-staged + prettier; conventional commits.
- **TypeScript**: no `any`, no `as unknown`; Server Components by default, `"use client"` only when interactivity required.

## Key Decisions

| Decision                                                                                                                                                                                              | Rationale                                             | Outcome            |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ |
| Design system "Industrial Precision" (color tokens, status chips `font-mono`/uppercase/`rounded-full`, Inter + JetBrains Mono typography)                                                             | Established visual identity already in production     | ✓ Good (LOCKED)    |
| Reuse base components: `DataTable`, `StatusChip`, `MetricCard`, `ServiceTimeline`, `StatusChart`, `PasswordInput`, `CurrencyInput`, `PlateInput`; formatting in `src/_helpers/format.ts`              | Consistency + avoid duplication                       | ✓ Good (LOCKED)    |
| No `any` / no `as unknown`; Server Components by default                                                                                                                                              | Type safety + Next.js 16 perf model                   | ✓ Good (LOCKED)    |
| Zod schemas in `src/_schemas/`, no `.default()` in form schemas (use RHF `defaultValues`); controlled Select via `<Controller>`                                                                       | Avoid React Compiler pitfalls + RHF correctness       | ✓ Good (LOCKED)    |
| Base UI `render` prop, never `asChild`                                                                                                                                                                | `@base-ui/react` API (not Radix)                      | ✓ Good (LOCKED)    |
| File structure per module: `page.tsx` (Server) + `[module]-client.tsx` (Client) + `_components/`; private folders `_lib`/`_hooks`/`_schemas`/`_components`/`_db`/`_actions`/`_data-access`/`_helpers` | Established layered convention                        | ✓ Good (LOCKED)    |
| Next.js 16 + Turbopack; `proxy.ts` (not `middleware.ts`) for access control; React Compiler active                                                                                                    | Framework/runtime baseline                            | ✓ Good (LOCKED)    |
| Better Auth for authentication; Vercel prod env vars configured                                                                                                                                       | Auth provider already integrated                      | ✓ Good (LOCKED)    |
| Mock-data-first; Drizzle integration deferred to v1.1 milestone                                                                                                                                       | Validate UI/UX before wiring DB                       | ✓ Good — v1.1 next |
| `createOrderAction` rewritten to accept plate/customerName/vehicleModel with inline vehicle insert; wizard wired via `useAction`                                                                      | Unblock order creation flow                           | ✓ Good             |
| Appointments calendar: custom date-fns implementation (no react-big-calendar) — month + week + list views                                                                                             | Avoid heavy dependency, consistent with design system | ✓ Good             |

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-06-20 — Milestone v1.1 DB Integration started_
