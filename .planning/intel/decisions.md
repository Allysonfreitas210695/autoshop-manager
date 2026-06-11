# Locked Decisions (from .planning/PLAN.md ingest)

These are LOCKED — existing architecture/design decisions already in production. New improvement work MUST respect them.

## Design System — "Industrial Precision"

- Color tokens (CSS vars):
  - Background `#051424` → `var(--surface)`
  - Surface `#122131` → `var(--surface-container)`
  - Primary `#c8c6c5` (cinza aço)
  - Secondary `#adc6ff` (azul segurança — ativo, links, chips selecionados)
  - Tertiary `#ffb690` (laranja alerta)
  - Error `#ffb4ab`
- Status chips: always `font-mono`, uppercase, `rounded-full`
  - `pending` → `bg-status-pending` (#475569)
  - `in_progress` → `bg-status-progress` (#adc6ff)
  - `completed` → `bg-status-completed` (#22C55E)
  - `delayed` → `bg-status-delayed` (#ffb690)
- Typography: Display/Body = Inter (700/600/400); Labels/Código = JetBrains Mono (500, tracking 0.05em); Table headers = font-mono uppercase tracking-wider text-on-surface-variant/60

## Reusable base components (always reuse)

- `<DataTable columns data getRowId />` — all tables
- `<StatusChip status />` — O.S. status chips
- `<MetricCard label value icon accent />` — animated KPI cards (accepts ReactNode icons)
- `<ServiceTimeline nodes />` — horizontal/vertical timelines
- `<StatusChart data />` — status pie chart
- `<PasswordInput />` — auth password field with built-in show/hide toggle
- `<CurrencyInput />`, `<PlateInput />` — BRL currency + vehicle plate inputs
- Formatting helpers centralized in `src/_helpers/format.ts` (formatCurrency, formatDate, formatDateTime, formatLongDate, etc.)

## TypeScript rules (locked)

- No `any`, no `as unknown`
- Server Components by default; `"use client"` only when interactivity required
- Mock data in `src/_lib/mock-data.ts` with exported types
- Zod schemas in `src/_schemas/` — no `.default()` in form schemas (use react-hook-form `defaultValues`)
- Controlled Select → always `<Controller>` from react-hook-form (never `watch()` in JSX)
- Base UI components (`@base-ui/react`) → use `render` prop, NOT `asChild`

## File structure per module (locked)

```
src/app/(dashboard)/[module]/
├── page.tsx              # Server Component (data/redirect logic)
├── [module]-client.tsx   # Client Component (state, interactivity)
└── _components/          # module-specific sub-components
```

- Private folders convention: `_lib`, `_hooks`, `_schemas`, `_components`, `_db`, `_actions`, `_data-access`, `_helpers`
- useForm/Zod boilerplate extracted into dedicated `_hooks` layer

## Framework / runtime decisions (locked)

- Next.js 16 with Turbopack
- `middleware.ts` is deprecated → renamed to `proxy.ts` (handles access control)
- React Compiler (babel plugin) — avoid `watch()` from react-hook-form directly in JSX; use `Controller` or `useWatch`
- ESLint: imports always sorted (eslint-plugin-simple-import-sort); `npm run lint` must pass before task is done
- Auth: Better Auth (forgot/reset password flow implemented; Vercel prod env vars configured)
- lint-staged + prettier configured as pre-commit hooks (.lintstagedrc.json)

## Data strategy (locked, with planned transition)

- Mock-data-first: all screens currently use `src/_lib/mock-data.ts`
- Drizzle ORM integration planned AFTER MVP validation — schema exists in `src/_db/schema/`, migrations in `src/_db/migrations/`, server actions in `src/_actions/`
