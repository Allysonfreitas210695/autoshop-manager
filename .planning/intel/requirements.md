# Requirements (from ingest + improvement milestone scope)

This milestone is a **hardening & polish** cycle over the already-built AutoShop Manager app. Four focus areas, approved by the user as the roadmap phases.

## Area 1 — Security (Segurança)

- Harden authentication (Better Auth): session handling, secure cookies, password policy
- Server-side input validation: enforce Zod schemas on all server actions (`src/_actions/`)
- Access control: review & strengthen `src/proxy.ts` route protection (dashboard vs public vs auth groups)
- Security headers (CSP, HSTS, X-Frame-Options, etc.)
- Rate limiting on auth endpoints (login, register, forgot/reset password)
- No secrets in client bundles; verify env var boundaries

## Area 2 — Responsiveness (Responsividade)

- Collapsible sidebar on mobile
- Tables (`DataTable`) with horizontal scroll on small screens
- Adaptive layouts for dashboard, forms (order wizard steps), and detail screens
- Touch-friendly targets; verify breakpoints across all routes
- Responsiveness validated per the existing per-phase completion checklist

## Area 3 — Usability (Usabilidade)

- Loading states (skeletons/spinners) on data-fetching screens
- Error states + user-friendly error messages
- Form validation feedback (inline, consistent across forms)
- Empty states for lists/tables with no data
- Toasts / confirmation feedback for actions (create, update, delete)
- Optimistic UI where appropriate

## Area 4 — Screen enhancement (Aprimoramento de telas)

- Implement pending design screens:
  - `dashboard_estrat_gico_precision_auto` (strategic dashboard / advanced metrics)
  - `estoque_alerta_de_itens_baixos` (low-stock alerts) — route `/inventory/alerts` exists
  - `gerar_ordem_de_compra` + `ordem_de_compra_com_previs_o_de_entrega` (purchase orders) — routes under `/inventory/purchase-orders` exist
  - `nova_ordem_de_servi_o_com_checklist` (new O.S. with intake checklist)
- Visual polish & design-system consistency (font-mono labels, status chips, system colors) across all screens
- Resolve placeholder routes: `/appointments`, `/track/[id]`

## Cross-cutting acceptance (per-phase completion checklist — locked)

- `npx tsc --noEmit` → zero errors
- `npm run lint` → zero errors
- `npm run build` → success
- All phase routes render without crash
- Responsiveness tested (mobile: collapsible sidebar, horizontal-scroll tables)
- Design patterns applied (font-mono labels, status chips, system colors)
