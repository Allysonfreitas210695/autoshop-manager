# Roadmap: AutoShop Manager (Precision Auto)

## Overview

This is a **Hardening & Polish** milestone over the already-shipped AutoShop Manager app — not a greenfield build. The existing screens work on mock data; this milestone makes the full operator flow (intake → service order → budget approval → print/PIX → inventory/finance) secure, responsive, pleasant to use, and visually complete. Work proceeds in four ordered phases — Security first (highest risk), then Responsiveness, Usability, and Screen enhancement — each respecting the LOCKED design-system, TypeScript, Base UI, and mock-data-first decisions, and each closing only after the locked completion checklist (tsc/lint/build + render + responsiveness + design patterns) passes.

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

The four phases are ordered 1→4 by risk/priority. They are largely independent improvements over existing screens; the order is a recommended sequence, not a hard technical dependency chain.

- [ ] **Phase 1: Segurança (Security)** - Harden auth, validate all server actions, lock down route access, add security headers, rate-limit auth, verify no leaked secrets
- [ ] **Phase 2: Responsividade (Responsiveness)** - Collapsible mobile sidebar, horizontal-scroll tables, adaptive layouts, touch targets, verified breakpoints
- [ ] **Phase 3: Usabilidade (Usability)** - Loading/error/empty states, consistent validation feedback, toasts/confirmations, optimistic UI
- [ ] **Phase 4: Aprimoramento de telas (Screen enhancement)** - Implement pending design screens, resolve placeholder routes, apply design-system consistency polish

## Phase Details

### Phase 1: Segurança (Security)

**Goal**: The operator's app is verifiably secure — authentication, server-side input validation, route access control, transport/header protections, and abuse resistance are all enforced, with no secrets reaching the client.
**Depends on**: Nothing (first phase — highest risk)
**Requirements**: SEC-01, SEC-02, SEC-03, SEC-04, SEC-05, SEC-06
**Success Criteria** (what must be TRUE):

1. An unauthenticated user is redirected away from dashboard routes by `src/proxy.ts`; public routes (e.g. `/track/[id]`) stay reachable and authenticated users hitting auth routes are redirected appropriately.
2. Every server action in `src/_actions/` rejects malformed input via a server-side Zod schema (validation does not rely on the client).
3. Auth sessions use secure/HttpOnly cookies and a password policy is enforced (Better Auth configured accordingly).
4. Responses carry security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy), and repeated hits to login/register/forgot/reset are rate-limited.
5. A bundle/env audit confirms no server-only secret is exposed to the client.
6. Locked completion checklist passes: `npx tsc --noEmit` zero errors, `npm run lint` zero errors, `npm run build` succeeds, all touched routes render without crash.
   **Plans**: 5 plans

Plans:

- [ ] 01-01-PLAN.md — SEC-01 password policy (shared passwordSchema, minPasswordLength, prod reset-link guard)
- [ ] 01-02-PLAN.md — SEC-03 proxy route gating (recovery routes + /track public)
- [ ] 01-03-PLAN.md — SEC-04 security headers + report-only CSP + csp-report sink
- [ ] 01-04-PLAN.md — SEC-05 Upstash per-IP rate limiting on auth endpoints (generic 429)
- [ ] 01-05-PLAN.md — SEC-02 server-action validation audit + SEC-06 secret-boundary guard

### Phase 2: Responsividade (Responsiveness)

**Goal**: The full operator flow is usable on mobile and desktop — navigation, tables, forms, and detail screens reflow cleanly at every breakpoint with touch-friendly controls.
**Depends on**: Phase 1 (recommended order; not a hard technical dependency)
**Requirements**: RESP-01, RESP-02, RESP-03, RESP-04, RESP-05
**Success Criteria** (what must be TRUE):

1. On a phone-width viewport the sidebar collapses into a drawer that opens/closes (Base UI `render` prop, not `asChild`).
2. Every `DataTable` scrolls horizontally on small screens without breaking page layout or clipping content.
3. Dashboard, the order wizard steps, and detail screens reflow to single-column / stacked layouts at mobile breakpoints.
4. Interactive controls meet touch-friendly target sizing on mobile.
5. A breakpoint pass across all existing routes shows no horizontal overflow or clipped content.
6. Locked completion checklist passes: `npx tsc --noEmit` zero errors, `npm run lint` zero errors, `npm run build` succeeds, all routes render without crash, responsiveness tested (mobile sidebar + horizontal-scroll tables), design patterns applied.
   **Plans**: 4 plans
   **UI hint**: yes
   Plans:
   **Wave 1**

- [x] 02-01-PLAN.md — RESP-01/RESP-04 navigation: icon-touch Button variant, w-[85vw] mobile drawer, py-3 touch targets
- [x] 02-02-PLAN.md — RESP-02/RESP-03 responsive column hiding on orders + dashboard tables (totalAmount hidden at sm)
- [ ] 02-03-PLAN.md — RESP-03 adaptive layouts: horizontal-scroll step indicator + finance chart scroll wrappers

**Wave 2** _(blocked on Wave 1 completion)_

- [ ] 02-04-PLAN.md — RESP-05 breakpoint verification pass + locked completion gate (tsc/lint/build)

### Phase 3: Usabilidade (Usability)

**Goal**: Every interaction gives clear feedback — screens communicate loading, error, and empty states, forms validate consistently, and create/update/delete actions confirm what happened.
**Depends on**: Phase 2 (recommended order; not a hard technical dependency)
**Requirements**: USAB-01, USAB-02, USAB-03, USAB-04, USAB-05, USAB-06
**Success Criteria** (what must be TRUE):

1. Data-fetching screens show a skeleton/spinner while loading instead of a blank flash.
2. Error conditions render a friendly message (no raw stack/blank screen) and lists/tables with no data show an empty state.
3. Forms show consistent inline validation feedback across the app (driven by the existing Zod + react-hook-form pattern).
4. Create, update, and delete actions surface a toast/confirmation, with optimistic UI applied where appropriate.
5. Locked completion checklist passes: `npx tsc --noEmit` zero errors, `npm run lint` zero errors, `npm run build` succeeds, all routes render without crash, responsiveness still holds, design patterns applied.
   **Plans**: TBD
   **UI hint**: yes

### Phase 4: Aprimoramento de telas (Screen enhancement)

**Goal**: The remaining pending design screens are built, placeholder routes become real features, and design-system consistency is applied everywhere — the app is visually complete.
**Depends on**: Phase 3 (recommended order; not a hard technical dependency)
**Requirements**: SCRN-01, SCRN-02, SCRN-03, SCRN-04, SCRN-05, SCRN-06, SCRN-07
**Success Criteria** (what must be TRUE):

1. The strategic dashboard renders advanced metrics (per `dashboard_estrat_gico_precision_auto`) at `/analytics` or a dashboard tab.
2. `/inventory/alerts` shows low-stock items with CRÍTICO/ATENÇÃO highlighting, and `/inventory/purchase-orders` supports generating a purchase order including a delivery forecast.
3. The new-O.S. flow includes a vehicle intake checklist (per `nova_ordem_de_servi_o_com_checklist`).
4. `/appointments` renders a working calendar (react-big-calendar + date-fns) and `/track/[id]` renders public O.S. tracking with a QR code (qrcode.react) — both no longer placeholders.
5. Design-system polish (font-mono labels, status chips, system colors) is applied consistently across all screens.
6. Locked completion checklist passes: `npx tsc --noEmit` zero errors, `npm run lint` zero errors, `npm run build` succeeds, all new/updated routes render without crash, responsiveness tested, design patterns applied.
   **Plans**: TBD
   **UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase                                          | Plans Complete | Status      | Completed |
| ---------------------------------------------- | -------------- | ----------- | --------- |
| 1. Segurança (Security)                        | 0/5            | Not started | -         |
| 2. Responsividade (Responsiveness)             | 2/4            | In Progress |           |
| 3. Usabilidade (Usability)                     | 0/TBD          | Not started | -         |
| 4. Aprimoramento de telas (Screen enhancement) | 0/TBD          | Not started | -         |
