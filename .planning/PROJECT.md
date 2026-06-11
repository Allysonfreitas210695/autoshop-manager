# AutoShop Manager (Precision Auto)

## What This Is

AutoShop Manager (brand "Precision Auto", repo "Oficina-Mecanica") is a management system for an auto mechanic workshop (oficina mecânica). It covers the full day-to-day operation: service orders (O.S.), customers & vehicles, parts inventory, finance, and appointments. The app is already mostly built on Next.js 16 (App Router, Turbopack, React Compiler) and deployed on Vercel; this milestone hardens and polishes the existing screens rather than building new architecture.

## Core Value

A workshop operator can run the full day-to-day flow — intake → service order → budget approval → print/PIX → inventory/finance — on desktop AND mobile, securely, without rough edges.

## Requirements

### Validated

<!-- Shipped and confirmed valuable (existing app — brownfield). -->

- ✓ Operational dashboard (`/`)
- ✓ Service order management: list, 4-step new-O.S. wizard, budget approval, print with PIX QR (`/orders`, `/orders/new`, `/orders/[id]/budget`, `/orders/[id]/print`)
- ✓ Customers & vehicles: list with side panel, detail/history (`/customers`, `/customers/[id]`)
- ✓ Inventory: list with category tabs, add item (`/inventory`, `/inventory/new`)
- ✓ Finance: overview + profitability reports (`/finance`, `/finance/reports`)
- ✓ Auth: login, register, forgot/reset password via Better Auth (`/login`, `/register`, `/forgot-password`, `/reset-password`)

### Active

<!-- This milestone: Hardening & Polish. Building toward these. -->

- [ ] **Security** — auth hardening, server-side Zod validation, route access control, security headers, rate limiting, no client-bundle secret leakage (SEC-01..SEC-06)
- [ ] **Responsiveness** — collapsible mobile sidebar, horizontal-scroll tables, adaptive layouts, touch targets, verified breakpoints (RESP-01..RESP-05)
- [ ] **Usability** — loading/error/empty states, consistent inline validation, toasts/confirmations, optimistic UI (USAB-01..USAB-06)
- [ ] **Screen enhancement** — pending design screens, placeholder route resolution, design-system polish (SCRN-01..SCRN-07)

### Out of Scope

<!-- Explicit boundaries for THIS milestone. -->

- **Drizzle / live DB integration** — schema and migrations exist in `src/_db/`, but the app stays mock-data-first until after MVP validation. This is a separate, deferred milestone, NOT part of Hardening & Polish.
- **Re-architecture of existing screens** — phases improve existing screens; they do not redesign the app's structure or layered folder conventions.
- **New business modules beyond the pending design screens** — only the design screens already specified in the source plan are in scope.

## Context

- Existing Next.js 16 codebase, deployed on Vercel; Better Auth prod env vars configured.
- All screens currently render from mock data (`src/_lib/mock-data.ts`). DB schema/migrations exist but are not wired in.
- `middleware.ts` is deprecated in this Next.js version → access control lives in `src/proxy.ts`.
- UI library is `@base-ui/react` (NOT Radix): `asChild` does not exist, use the `render` prop.
- React Compiler is active: avoid react-hook-form `watch()` directly in JSX; use `Controller` / `useWatch`.
- Recent work: password reset flow, `src/` restructure into `_data-access`/`_helpers`/`_lib`, `_hooks` extraction, `PasswordInput`/`CurrencyInput`/`PlateInput` components, centralized `format.ts`, proxy.ts access control adjustments.
- Project and docs are pt-BR; user-facing roadmap prose may use Portuguese where natural.

## Constraints

- **Tech stack**: Next.js 16 (Turbopack, App Router, React Compiler), `@base-ui/react` + Tailwind, react-hook-form + Zod, Better Auth, deployed on Vercel — fixed, existing app.
- **Base UI**: use `render={<Component />}` prop, never `asChild`; verify each component API in `src/_components/ui/*.tsx` before use.
- **Data**: mock-data-first; do not assume live DB reads/writes this milestone.
- **Process gates**: every phase must pass `npx tsc --noEmit` (zero errors), `npm run lint` (zero errors, imports sorted via simple-import-sort), `npm run build` (success); pre-commit lint-staged + prettier; conventional commits.
- **TypeScript**: no `any`, no `as unknown`; Server Components by default, `"use client"` only when interactivity required.

## Key Decisions

<!-- LOCKED decisions carried from .planning/intel/decisions.md — treat as locked. -->

| Decision                                                                                                                                                                                              | Rationale                                         | Outcome         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------- |
| Design system "Industrial Precision" (color tokens, status chips `font-mono`/uppercase/`rounded-full`, Inter + JetBrains Mono typography)                                                             | Established visual identity already in production | ✓ Good (LOCKED) |
| Reuse base components: `DataTable`, `StatusChip`, `MetricCard`, `ServiceTimeline`, `StatusChart`, `PasswordInput`, `CurrencyInput`, `PlateInput`; formatting in `src/_helpers/format.ts`              | Consistency + avoid duplication                   | ✓ Good (LOCKED) |
| No `any` / no `as unknown`; Server Components by default                                                                                                                                              | Type safety + Next.js 16 perf model               | ✓ Good (LOCKED) |
| Zod schemas in `src/_schemas/`, no `.default()` in form schemas (use RHF `defaultValues`); controlled Select via `<Controller>`                                                                       | Avoid React Compiler pitfalls + RHF correctness   | ✓ Good (LOCKED) |
| Base UI `render` prop, never `asChild`                                                                                                                                                                | `@base-ui/react` API (not Radix)                  | ✓ Good (LOCKED) |
| File structure per module: `page.tsx` (Server) + `[module]-client.tsx` (Client) + `_components/`; private folders `_lib`/`_hooks`/`_schemas`/`_components`/`_db`/`_actions`/`_data-access`/`_helpers` | Established layered convention                    | ✓ Good (LOCKED) |
| Next.js 16 + Turbopack; `proxy.ts` (not `middleware.ts`) for access control; React Compiler active                                                                                                    | Framework/runtime baseline                        | ✓ Good (LOCKED) |
| Better Auth for authentication; Vercel prod env vars configured                                                                                                                                       | Auth provider already integrated                  | ✓ Good (LOCKED) |
| Mock-data-first; Drizzle integration deferred to a later milestone                                                                                                                                    | Validate MVP before wiring DB                     | ✓ Good (LOCKED) |

---

_Last updated: 2026-06-11 after Hardening & Polish milestone bootstrap (ingested from .planning/PLAN.md)_
