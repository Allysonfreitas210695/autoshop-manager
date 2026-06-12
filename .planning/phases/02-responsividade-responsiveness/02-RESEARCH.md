# Phase 2: Responsividade (Responsiveness) - Research

**Researched:** 2026-06-12
**Domain:** Tailwind CSS v4 responsive utilities, Base UI Sheet/Dialog, DataTable column hiding, touch target sizing
**Confidence:** HIGH — all findings verified directly from codebase source files

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Mobile sidebar drawer already implemented via `Sheet` in `Header` (`lg:hidden` trigger, `SidebarContent` as content). No new infrastructure needed — verify behavior and adjust sizing only.
- **D-02:** Drawer width on mobile: `w-[85vw] max-w-xs`. Replace the current fixed `w-64` on SheetContent in header.tsx.
- **D-03:** `DataTable` already has `overflow-x-auto` at component level. Audit each page that wraps `DataTable` in a Card or container and ensure no parent element clips the overflow (no `overflow-hidden` on ancestor cards without explicit intent).
- **D-04:** Column priority rule — always visible: primary identifier + status/critical indicator. Hidden at `sm`: secondary details (CPF, plate, price, mechanic). Hidden at `md`: tertiary info (phone, category). Apply consistently across all tables not yet responsive.
- **D-05:** Orders table essential columns (always visible): O.S.# + Cliente/Veículo + Status. Placa, mecânico, preço ficam ocultos em `sm`.
- **D-06:** Inventory table essential columns (always visible): Nome do item + Quantidade + Status de estoque. Preço unitário e categoria ficam ocultos em `sm`.
- **D-07:** Order wizard step indicator: scroll horizontal nos steps em mobile — todos os steps visíveis com `overflow-x-auto`, step ativo destacado.
- **D-08:** Wizard form fields: coluna única + scroll vertical em mobile. Botões fixos no rodapé com `pb-safe` / `pb-4`. Grid de 2 colunas em `md+`.
- **D-09:** Finance reports charts: scroll horizontal nos gráficos — `overflow-x-auto` no wrapper do chart, largura mínima (ex: `min-w-[320px]`).
- **D-10:** Minimum touch target: 44px height. Nav items com `py-2.5` (~40px) — ajustar para `py-3` (48px).
- **D-11:** Icon-only buttons (Bell, Menu, Search no Header) usam `size="icon"` — verificar que resulta em ao menos 44×44px.
- **D-12:** Verificação sistemática em todas as rotas: 375px (mobile), 768px (tablet), 1024px (desktop).

### Claude's Discretion

- Exata classe de largura mínima dos gráficos em scroll horizontal (`min-w-[300px]` ou `min-w-[400px]`).
- Ordem de ocultação de colunas em tabelas não especificadas (finance, agendamentos) — seguir padrão D-04.
- Se `overflow-x-auto` do DataTable é suficiente ou se wrapper `-mx-4 px-4` adicional é necessário.

### Deferred Ideas (OUT OF SCOPE)

- Nenhuma ideia fora de escopo surgiu durante a discussão.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID      | Description                                                                                       | Research Support                                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| RESP-01 | Sidebar collapses into a mobile-friendly drawer on small screens                                  | Sheet already wired in header.tsx; only width class and close-button sizing need adjustment                                                  |
| RESP-02 | DataTable instances scroll horizontally without breaking layout on small screens                  | DataTable has `overflow-x-auto`; parent containers use `overflow-hidden` on rounded borders which can clip — must audit each call site       |
| RESP-03 | Dashboard, order wizard steps, and detail screens use adaptive layouts that reflow at breakpoints | Dashboard already uses `sm:grid-cols-2 lg:grid-cols-4`; wizard step-indicator needs horizontal scroll wrapper; chart wrappers need min-width |
| RESP-04 | Interactive controls meet touch-friendly target sizing on mobile                                  | Button `size="icon"` = 32px (size-8) — below 44px Apple HIG minimum; nav items use `py-2.5` (~40px) — both need adjustment                   |
| RESP-05 | Breakpoints are verified across all existing routes (no horizontal overflow or clipped content)   | Requires systematic pass at 375/768/1024px across all 15+ routes                                                                             |

</phase_requirements>

---

## Summary

Phase 2 is a targeted polish pass — the structural responsive infrastructure already exists in the codebase. The Sheet-based mobile sidebar is wired in `header.tsx`, DataTable has `overflow-x-auto`, and most page headers already use `flex-col sm:flex-row` patterns. What is missing or broken falls into four discrete problem classes.

**Problem class 1 — Width/sizing corrections:** The SheetContent in `header.tsx` uses hardcoded `w-64` instead of the decided `w-[85vw] max-w-xs`. The Button `size="icon"` variant is `size-8` (32px), below the 44px touch target minimum. Nav link `py-2.5` yields ~40px height, below minimum.

**Problem class 2 — Column hiding gaps:** Orders and Inventory tables already hide some columns responsively, but do not fully follow D-05/D-06. The dashboard's recent-orders table (page.tsx) hides `plate` at sm and `mechanic` at md — already correct but `totalAmount` is always visible. Finance transactions table hides `date` at sm and `type` at md — already correct. No tables are entirely missing column hiding.

**Problem class 3 — Chart scroll:** Charts (recharts `ResponsiveContainer`) use `width="100%"` which collapses on narrow viewports. The chart wrapper `div.p-4` in `finance/page.tsx` and `finance/reports/page.tsx` needs an `overflow-x-auto` wrapper with a `min-w-[320px]` inner div so charts scroll rather than compress.

**Problem class 4 — Step indicator:** `StepIndicator` in `step-indicator.tsx` uses `flex items-center justify-between` — on narrow viewports with 5 steps the circles compress. The step label text is already `hidden sm:block`. The fix per D-07 is to wrap the step row in `overflow-x-auto` and give each step item a `min-w-[60px]` so they scroll rather than compress.

**Primary recommendation:** Make targeted class changes to 8 files. No new components, no new libraries. Every change is a Tailwind class addition/substitution.

---

## Architectural Responsibility Map

| Capability                | Primary Tier                       | Secondary Tier | Rationale                                                                           |
| ------------------------- | ---------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| Mobile sidebar drawer     | Frontend (Client Component)        | —              | Sheet state managed in header.tsx; SidebarContent is shared render                  |
| Responsive column hiding  | Frontend (Client Component)        | —              | Tailwind `hidden sm:table-cell` on DataTableColumn.className — purely CSS, no logic |
| Touch target sizing       | Frontend (CSS)                     | —              | Button variants and nav link padding — pure Tailwind class adjustments              |
| Chart scroll wrapper      | Frontend (Server/Client Component) | —              | Wrapper div around recharts ResponsiveContainer; no chart logic change              |
| Step indicator scroll     | Frontend (Client Component)        | —              | Wrapper + min-width on step-indicator.tsx                                           |
| Wizard form single-column | Frontend (Client Component)        | —              | Grid class changes on form field wrappers inside each step-XX file                  |
| Breakpoint verification   | Manual QA                          | —              | Browser DevTools or Playwright at 375/768/1024px                                    |

---

## Standard Stack

No new libraries are introduced in this phase. All responsive work uses Tailwind CSS v4 utility classes and the existing Base UI Sheet component already in the project.

### Core (already installed)

| Library        | Version    | Purpose                                          | Why Standard                                    |
| -------------- | ---------- | ------------------------------------------------ | ----------------------------------------------- |
| tailwindcss    | ^4         | Responsive utility classes (`sm:`, `md:`, `lg:`) | Project baseline — CSS-first config             |
| @base-ui/react | ^1.5.0     | Sheet/Dialog drawer, Button                      | Project baseline — `render` prop, not `asChild` |
| recharts       | (existing) | Chart components with `ResponsiveContainer`      | Already in use for all finance charts           |

### No New Packages

This phase requires zero new package installations. All changes are class-level edits to existing components.

---

## Package Legitimacy Audit

No new packages are installed in this phase.

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser (375px / 768px / 1024px viewport)
        │
        ▼
DashboardLayout (layout.tsx)
  ├─ <Sidebar />  ──────── hidden lg:block  (desktop only)
  │    └─ SidebarContent   nav items py-3 (48px touch target)
  │
  ├─ <Header />  ──────── sticky top-0 z-30
  │    ├─ SheetTrigger lg:hidden  →  opens Sheet
  │    └─ SheetContent w-[85vw] max-w-xs
  │         └─ SidebarContent  onNavigate → closes sheet
  │
  └─ <main>  p-4 md:p-6
       │
       ├─ Page (Server Component)  ──  grid gap-4 sm:grid-cols-2 lg:grid-cols-4
       │
       ├─ DataTable wrapper  ──  border + overflow-hidden (rounded corners)
       │    └─ DataTable  ──  overflow-x-auto  [no parent clips it]
       │         └─ columns with className: "hidden sm:table-cell"
       │
       ├─ OrderWizard
       │    ├─ StepIndicator  ──  overflow-x-auto  min-w-[60px] per step
       │    ├─ Step form  ──  grid gap-4 sm:grid-cols-2  (single col mobile)
       │    └─ sticky bottom-0 footer  ──  pb-4 (safe area)
       │
       └─ Finance charts
            └─ overflow-x-auto wrapper
                 └─ min-w-[320px] inner div
                      └─ ResponsiveContainer width="100%" height={220}
```

### Recommended Project Structure (no changes to structure)

Files to edit are already in place. No new files needed except possibly none.

### Pattern 1: Responsive Column Hiding in DataTable

**What:** Pass `className` on `DataTableColumn` definition. The DataTable component propagates `column.className` to both `TableHead` and `TableCell`. [VERIFIED: codebase — data-table.tsx line 48 and 82]

**When to use:** Any column that is secondary/tertiary information per D-04.

```typescript
// Source: src/_components/ui/data-table.tsx (verified)
// Column definition pattern — already used in customers-client.tsx
const columns: DataTableColumn<OrderRow>[] = [
  {
    id: "plate",
    header: "Placa",
    className: "hidden sm:table-cell",  // hide below sm (640px)
    cell: (row) => <span>{row.plate}</span>,
  },
  {
    id: "mechanic",
    header: "Mecânico",
    className: "hidden md:table-cell",  // hide below md (768px)
    cell: (row) => <span>{row.mechanic ?? "—"}</span>,
  },
];
```

### Pattern 2: Sheet Drawer Width — Base UI render prop

**What:** SheetContent width override via className. The Base UI Dialog.Popup gets `data-[side=left]:w-3/4` from the base class in sheet.tsx; the passed `className` is merged via `cn()`. [VERIFIED: codebase — sheet.tsx line 56]

**When to use:** Overriding the default `w-3/4` with the decided `w-[85vw] max-w-xs`.

```typescript
// Source: src/_components/ui/sheet.tsx + header.tsx (verified)
<SheetContent
  side="left"
  className="border-outline-variant bg-surface-container w-[85vw] max-w-xs p-0"
>
  <SheetTitle className="sr-only">Navegação</SheetTitle>
  <SidebarContent onNavigate={() => setMenuOpen(false)} />
</SheetContent>
```

Note: The current code has `w-64` (256px fixed). The base sheet class sets `data-[side=left]:w-3/4`. Passing `w-[85vw] max-w-xs` in className will override via Tailwind's specificity cascade (same layer, later wins). Verify the `cn()` merge order — className is appended last in sheet.tsx so it takes precedence. [VERIFIED: codebase — sheet.tsx line 54-59]

### Pattern 3: Chart Scroll Wrapper

**What:** Wrap the chart `div.p-4` container in an `overflow-x-auto` div, and wrap the `ResponsiveContainer` itself in a min-width div. [ASSUMED — standard pattern for recharts on mobile, not official recharts docs verified in this session]

**When to use:** Any recharts component that uses `width="100%"` inside a fluid container.

```tsx
// Pattern for finance-charts.tsx wrappers in page files
<div className="overflow-x-auto">
  <div className="min-w-[320px]">
    <MonthlyLineChart data={monthlyCashFlow} />
  </div>
</div>
```

### Pattern 4: Step Indicator Horizontal Scroll

**What:** Replace the fixed `flex items-center justify-between` with `flex items-center overflow-x-auto` and add `min-w-[60px] shrink-0` on each step item. [VERIFIED: codebase — step-indicator.tsx line 25-26]

**When to use:** Any step/tab row with 4+ items that must remain visible on 320px screens.

```tsx
// Source: step-indicator.tsx (verified current structure)
// Change: outer div from "flex items-center justify-between" to:
<div className="flex items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
  {STEPS.map((step, index) => (
    <div key={step.number} className="flex min-w-[60px] shrink-0 items-center">
      {/* step circle + label unchanged */}
    </div>
  ))}
</div>
```

### Pattern 5: Touch Target — Nav Items

**What:** Increase padding on nav links in SidebarContent from `py-2.5` to `py-3`. At 16px base font, `py-3` = 24px top + 24px bottom + ~20px content = ~48px total. [VERIFIED: codebase — sidebar.tsx line 61]

```tsx
// Source: sidebar.tsx (verified)
// Current: py-2.5  (~40px)  →  target: py-3  (~48px ≥ 44px)
className={cn(
  "text-label-md flex items-center gap-3 rounded-lg px-4 py-3 font-mono transition-colors",
  // ...
)}
```

### Pattern 6: Touch Target — Icon Buttons

**What:** Button `size="icon"` = `size-8` = 32px. Below 44px minimum. Must use `size-10` (40px) or override with explicit `min-h-[44px] min-w-[44px]` for the header icon buttons (Bell, Menu, Search, ThemeToggle). [VERIFIED: codebase — button.tsx line 28]

**Decision path:** The safest approach is to add `className="min-h-[44px] min-w-[44px]"` to icon buttons in header.tsx while keeping `size="icon"` for visual sizing. Alternatively, define a new `size="icon-touch"` variant in button.tsx = `size-11` (44px). The second approach is cleaner and reusable.

```tsx
// Option A — per-button override (minimal change):
<Button variant="ghost" size="icon" className="lg:hidden min-h-[44px] min-w-[44px]" aria-label="Abrir menu" />

// Option B — new variant in button.tsx (recommended for consistency):
// Add to buttonVariants size:
"icon-touch": "size-11",  // 44px × 44px
```

### Anti-Patterns to Avoid

- **Putting `overflow-hidden` on a DataTable parent card without intent:** The `rounded-lg border overflow-hidden` pattern on table wrappers (e.g., `OrdersClient.tsx` line 155, `inventory-client.tsx` line 228) is intentional for border-radius clipping of the table corners. It does NOT clip horizontal scroll because `overflow-x-auto` is on the inner `div` inside `DataTable`. This is safe. [VERIFIED: codebase — data-table.tsx line 41]
- **Using `asChild` on Base UI components:** `@base-ui/react` does not support `asChild`. Always use `render={<Component />}` prop. [VERIFIED: codebase — header.tsx line 83-88, sheet.tsx line 63-70]
- **Removing `justify-between` from step indicator without adding min-width:** Without `min-w-[60px] shrink-0` on each step item, the connector lines collapse to zero width.
- **Setting chart `ResponsiveContainer` to a fixed pixel width:** This breaks desktop layout. The correct approach is the outer `overflow-x-auto` + inner `min-w-[320px]` wrapper, keeping `width="100%"` on `ResponsiveContainer`.

---

## Don't Hand-Roll

| Problem                      | Don't Build                                | Use Instead                                                                              | Why                                                                        |
| ---------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Responsive column visibility | Custom JS show/hide logic                  | Tailwind `hidden sm:table-cell` on `DataTableColumn.className`                           | Already supported by DataTable component; CSS-only, zero JS                |
| Drawer open/close            | Custom overlay + portal                    | Existing `Sheet` (`@base-ui/react` Dialog)                                               | Already wired in header.tsx; handles focus trap, backdrop, keyboard escape |
| Touch target expansion       | Invisible `::after` pseudo-element overlay | `min-h-[44px] min-w-[44px]` Tailwind classes or a new `size="icon-touch"` Button variant | Simpler, auditable, consistent with existing button variant system         |
| Breakpoint detection         | `useWindowSize` hook                       | Tailwind responsive classes                                                              | CSS-only approach avoids hydration mismatch in Next.js App Router          |
| Chart responsiveness         | Custom resize observer                     | `overflow-x-auto` wrapper + `min-w-[320px]`                                              | Keeps recharts `ResponsiveContainer` intact; no chart API changes          |

**Key insight:** Every responsive problem in this phase can be solved with Tailwind utility classes. Zero JavaScript runtime logic is required for any of the RESP requirements.

---

## Common Pitfalls

### Pitfall 1: SheetContent className does not override base side-width class

**What goes wrong:** `data-[side=left]:w-3/4` in the base `SheetContent` class string may win over `w-[85vw]` in the passed `className` if they are compiled at the same CSS layer.
**Why it happens:** Tailwind v4 uses cascade layers; within the same layer, specificity rules apply. Both are single-class utilities at the same specificity, so source order determines winner. `cn()` appends `className` after the base string, so `w-[85vw]` should win — but verify visually.
**How to avoid:** Test at 320px. If `w-64` or `w-3/4` still appears, use `!w-[85vw]` (Tailwind v4 `!` important modifier) as a fallback.
**Warning signs:** Drawer wider than 85vw on a 320px screen, or not narrower than 256px.

### Pitfall 2: `overflow-x-auto` on DataTable wrapper does not scroll if a parent has `overflow-hidden`

**What goes wrong:** If any ancestor between the `DataTable` and the viewport has `overflow: hidden` on BOTH axes, the inner `overflow-x-auto` cannot scroll.
**Why it happens:** `overflow-hidden` sets both `overflow-x` and `overflow-y` to hidden, which blocks child overflow contexts.
**How to avoid:** The table wrappers in this codebase use `overflow-hidden rounded-lg border` for corner clipping — this is safe because `overflow-hidden` on the outer div does not block the inner `overflow-x-auto` div since the outer div also establishes a scroll container... Actually: `overflow-hidden` on a non-scroll container does clip child `overflow-x-auto`. [ASSUMED — needs visual verification at 375px]
**Correct approach:** Replace `overflow-hidden` on table card wrappers with `overflow-clip` (CSS `overflow: clip` — clips visually but does not suppress child scroll containers) or just `rounded-lg border` without any overflow modifier, relying on `overflow-x-auto` inside `DataTable`. Check each table wrapper.
**Warning signs:** Table row content truncated / no horizontal scroll even though DataTable has `overflow-x-auto`.

### Pitfall 3: Step indicator scroll hides active step off-screen

**What goes wrong:** If the user is on step 4 of 5, the active circle may be off-screen to the right when the container scrolls to start position.
**Why it happens:** `overflow-x-auto` starts at scroll position 0.
**How to avoid:** After `setCurrentStep`, use a `useEffect` + `ref.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })` on the active step element. OR, since there are only 5 steps, `min-w-[60px]` × 5 = 300px total minimum — which fits in a 320px viewport with minimal overflow, so auto-scroll is unlikely needed.
**Warning signs:** Step circle not visible after advancing on a 320px screen.

### Pitfall 4: Button size="icon" touch target — existing usages throughout codebase

**What goes wrong:** Changing `size-8` to `size-11` in the `icon` variant of `buttonVariants` affects ALL icon buttons site-wide, including the close button in sheet.tsx (`size="icon-sm"`) and other small icon buttons.
**Why it happens:** Shared variant definition.
**How to avoid:** Add a NEW variant `"icon-touch": "size-11"` and use it specifically on the header navigation buttons. Do not change the existing `icon` = `size-8` definition.
**Warning signs:** Visual regression on close buttons, filter buttons, or table action buttons that are `size="icon"`.

### Pitfall 5: `pb-safe` CSS variable may not be defined

**What goes wrong:** Using `pb-safe` (CSS env safe area inset) may produce no-op or error if not configured.
**Why it happens:** `padding-bottom: env(safe-area-inset-bottom)` requires CSS variable setup or Tailwind plugin.
**How to avoid:** Use `pb-4` as the baseline (D-08 decision already specifies `pb-safe / pb-4`). For iOS notch safety, add `style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}` inline on the sticky footer, or use `pb-[max(1rem,env(safe-area-inset-bottom))]` Tailwind arbitrary value. The `pb-4` alone is sufficient for this phase. [ASSUMED — safe-area-inset not verified as configured]

---

## Code Examples

Verified patterns from codebase inspection:

### Current SheetContent (header.tsx) — what to change

```tsx
// CURRENT (header.tsx line 94-101) — [VERIFIED: codebase]
<SheetContent
  side="left"
  className="border-outline-variant bg-surface-container w-64 p-0"
>
  <SheetTitle className="sr-only">Navegação</SheetTitle>
  <SidebarContent onNavigate={() => setMenuOpen(false)} />
</SheetContent>

// AFTER — replace w-64 with w-[85vw] max-w-xs
<SheetContent
  side="left"
  className="border-outline-variant bg-surface-container w-[85vw] max-w-xs p-0"
>
  <SheetTitle className="sr-only">Navegação</SheetTitle>
  <SidebarContent onNavigate={() => setMenuOpen(false)} />
</SheetContent>
```

### Current nav item padding (sidebar.tsx) — what to change

```tsx
// CURRENT (sidebar.tsx line 61) — py-2.5 ≈ 40px — [VERIFIED: codebase]
"text-label-md flex items-center gap-3 rounded-lg px-4 py-2.5 font-mono transition-colors";

// AFTER — py-3 ≈ 48px (≥ 44px)
"text-label-md flex items-center gap-3 rounded-lg px-4 py-3 font-mono transition-colors";
```

### Also: Support button at bottom of SidebarContent (sidebar.tsx line 78)

```tsx
// CURRENT — py-2.5 on the Suporte Técnico button
className = "... px-4 py-2.5 ...";

// AFTER — py-3
className = "... px-4 py-3 ...";
```

### Current step indicator (step-indicator.tsx) — what to change

```tsx
// CURRENT (step-indicator.tsx line 26) — [VERIFIED: codebase]
<div className="flex items-center justify-between">

// AFTER — horizontal scroll, steps don't compress
<div className="flex items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

// Each step item wrapper (currently "flex flex-1 items-center"):
// AFTER — shrink-0 + min-width to prevent compression
<div key={step.number} className="flex min-w-[56px] shrink-0 items-center">
```

### Orders table — column hiding status (OrdersClient.tsx)

```tsx
// CURRENT state (all verified from codebase):
// orderNumber — no className (always visible) ✓
// plate — className: "hidden sm:table-cell" ✓  (already correct per D-05)
// customer — no className (always visible) ✓
// mechanic — className: "hidden md:table-cell" ✓
// status — no className (always visible) ✓
// totalAmount — no className (always visible) — per D-05 "preço oculto em sm"
// updatedAt — className: "hidden md:table-cell" ✓

// CHANGE NEEDED: totalAmount should be hidden at sm per D-05
{
  id: "totalAmount",
  header: "Total",
  align: "right",
  className: "hidden sm:table-cell",   // ADD THIS
  cell: ...
}
```

### Inventory table — column hiding status (inventory-client.tsx)

```tsx
// CURRENT state (all verified):
// name — no className (always visible) ✓
// category — className: "hidden sm:table-cell" ✓
// stock — no className (always visible) ✓
// unitPrice — className: "hidden md:table-cell" ✓
// totalValue — no className (always visible) ✓

// STATUS: Already matches D-06 — no changes needed for column hiding.
// However: "hidden sm:table-cell" on category hides at sm, while D-06 says
// "categoria oculta em sm" — this matches. ✓
```

### Dashboard page orders table — column hiding status (page.tsx)

```tsx
// CURRENT state (verified):
// id (O.S.) — no className ✓
// plate — className: "hidden sm:table-cell" ✓
// customer — no className ✓
// mechanic — className: "hidden md:table-cell" ✓
// status — no className ✓
// totalAmount — no className — should follow same rule as orders table (D-05 applies here too)

// CHANGE NEEDED: add className: "hidden sm:table-cell" to totalAmount column
```

### Finance page transactions table — column hiding status (finance/page.tsx)

```tsx
// CURRENT state (verified):
// date — className: "hidden sm:table-cell" ✓
// description — no className ✓ (primary)
// type — className: "hidden md:table-cell" ✓
// status — no className ✓ (critical indicator)
// amount — no className ✓ (primary value)

// STATUS: Already correct per D-04. No changes needed.
```

### Finance reports category table — column hiding status (finance/reports/page.tsx)

```tsx
// CURRENT state (verified):
// category — no className ✓
// grossRevenue — className: "hidden sm:table-cell" ✓
// totalExpenses — className: "hidden md:table-cell" ✓
// netProfit — no className ✓
// status — no className ✓

// STATUS: Already correct per D-04. No changes needed.
```

---

## File-by-File Change Map

This is the complete set of files requiring edits for RESP-01 through RESP-05.

| File                                                      | Requirement      | Change Summary                                                                                                                                 |
| --------------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/_components/shared/header.tsx`                       | RESP-01, RESP-04 | SheetContent: `w-64` → `w-[85vw] max-w-xs`; header icon buttons: add `min-h-[44px] min-w-[44px]` or use new `icon-touch` size                  |
| `src/_components/shared/sidebar.tsx`                      | RESP-04          | Nav links: `py-2.5` → `py-3`; Suporte button: `py-2.5` → `py-3`                                                                                |
| `src/_components/ui/button.tsx`                           | RESP-04          | Add `"icon-touch": "size-11"` to size variants (optional — only if option B chosen)                                                            |
| `src/app/(dashboard)/orders/new/step-indicator.tsx`       | RESP-03          | Outer flex div: add `overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`; each step item: `flex-1` → `min-w-[56px] shrink-0` |
| `src/app/(dashboard)/orders/_components/OrdersClient.tsx` | RESP-02, RESP-03 | Add `className: "hidden sm:table-cell"` to `totalAmount` column                                                                                |
| `src/app/(dashboard)/page.tsx`                            | RESP-02, RESP-03 | Add `className: "hidden sm:table-cell"` to `totalAmount` column in `orderColumns`                                                              |
| `src/app/(dashboard)/finance/page.tsx`                    | RESP-03          | Wrap `<CashFlowBarChart>` in `overflow-x-auto` + `min-w-[320px]` div                                                                           |
| `src/app/(dashboard)/finance/reports/page.tsx`            | RESP-03          | Wrap `<MonthlyLineChart>` and `<CostDonutChart>` containers in `overflow-x-auto` + `min-w-[320px]`                                             |

**Files already correct (no changes needed):**

- `src/_components/ui/data-table.tsx` — `overflow-x-auto` already present [VERIFIED]
- `src/app/(dashboard)/inventory/inventory-client.tsx` — column hiding already follows D-06 [VERIFIED]
- `src/app/(dashboard)/finance/page.tsx` transactions table — already correct column hiding [VERIFIED]
- `src/app/(dashboard)/finance/reports/page.tsx` category table — already correct column hiding [VERIFIED]
- `src/app/(dashboard)/layout.tsx` — `lg:ml-64` and `p-4 md:p-6` already present [VERIFIED]
- `src/app/(dashboard)/page.tsx` dashboard grid — `sm:grid-cols-2 lg:grid-cols-4` already present [VERIFIED]

**RESP-05 (breakpoint verification pass) target routes:**

| Route              | Key thing to verify                             |
| ------------------ | ----------------------------------------------- |
| `/` (dashboard)    | Metric grid reflow, orders table scroll         |
| `/orders`          | Filter tab scroll, table horizontal scroll      |
| `/orders/new`      | Step indicator scroll, single-col form          |
| `/customers`       | Table column hiding, header stacks              |
| `/customers/[id]`  | Detail panel (Sheet)                            |
| `/inventory`       | Table column hiding, metric cards grid          |
| `/inventory/new`   | Form single-col on mobile                       |
| `/finance`         | Chart scroll, KPI grid                          |
| `/finance/reports` | Chart scroll, table                             |
| `/appointments`    | Calendar (Phase 4 concern — check for overflow) |
| `/analytics`       | Grid + charts                                   |

---

## State of the Art

| Old Approach                                             | Current Approach                                             | When Changed     | Impact                                                                                                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------ | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tailwind v3 `tailwind.config.js` with explicit `content` | Tailwind v4 CSS-first `@import "tailwindcss"` in globals.css | v4 release       | No config file; breakpoints are standard `sm:640px md:768px lg:1024px` unless overridden in CSS — not overridden in this project [VERIFIED: globals.css] |
| `asChild` (Radix UI)                                     | `render` prop (Base UI)                                      | Base UI adoption | `SheetTrigger render={<Button />}` pattern — already used in header.tsx [VERIFIED]                                                                       |

**Deprecated/outdated:**

- `middleware.ts` for access control: superseded by `proxy.ts` in this Next.js 16 project [VERIFIED: PROJECT.md]
- `useWindowSize` for responsive logic: superseded by Tailwind CSS utilities — no JS needed for display toggling

---

## Assumptions Log

| #   | Claim                                                                                                                   | Section                  | Risk if Wrong                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| A1  | `overflow-hidden` on DataTable card wrapper clips child `overflow-x-auto` scroll                                        | Pitfall 2, File Map      | If wrong: DataTable already scrolls fine and no wrapper change is needed. Verify at 375px.                            |
| A2  | Chart scroll wrapper pattern: `overflow-x-auto` outer + `min-w-[320px]` inner works with recharts `ResponsiveContainer` | Pattern 3, Code Examples | If wrong: chart may still compress or overflow. Alternative: set fixed `width={320}` on ResponsiveContainer directly. |
| A3  | `pb-safe` is not configured; `pb-4` is sufficient for wizard footer                                                     | Pitfall 5                | If wrong: footer may overlap iOS notch. Use `pb-[max(1rem,env(safe-area-inset-bottom))]` arbitrary value.             |
| A4  | `w-[85vw] max-w-xs` in SheetContent className wins over base `data-[side=left]:w-3/4` via cn() source order             | Pattern 2, Pitfall 1     | If wrong: use `!w-[85vw]` important modifier, or move width into the base class in sheet.tsx                          |

---

## Open Questions

1. **Does `overflow-hidden` on `.border-outline-variant.overflow-hidden.rounded-lg.border` table wrappers actually clip `DataTable`'s inner `overflow-x-auto`?**
   - What we know: DataTable has `overflow-x-auto` on its root div. Card wrappers use `overflow-hidden` for border-radius corner clipping.
   - What's unclear: Whether the `overflow-hidden` on the wrapper fully suppresses the child scroll context.
   - Recommendation: Test at 375px in the first plan task. If table does not scroll, remove `overflow-hidden` from card wrappers and use `[&>*:first-child]:rounded-t-lg [&>*:last-child]:rounded-b-lg` or equivalent to preserve corner rounding.

2. **`finance/page.tsx` chart — is `CashFlowBarChart` chart data dense enough to need `min-w-[320px]` or `min-w-[400px]`?**
   - What we know: Weekly bar chart with ~4-6 data points; `ResponsiveContainer width="100%" height={220}`.
   - What's unclear: Whether 320px is sufficient for bar chart readability.
   - Recommendation: Use `min-w-[300px]` for the bar chart (fewer data points) and `min-w-[360px]` for the 6-month line chart (more points).

---

## Environment Availability

| Dependency       | Required By                     | Available | Version   | Fallback                      |
| ---------------- | ------------------------------- | --------- | --------- | ----------------------------- |
| Node.js          | npm scripts                     | ✓         | v22.22.2  | —                             |
| TypeScript       | npx tsc --noEmit gate           | ✓         | 5.9.3     | —                             |
| npm              | Package management              | ✓         | 10.9.7    | —                             |
| Browser DevTools | RESP-05 breakpoint verification | ✓         | (browser) | Playwright at specific widths |

**Missing dependencies with no fallback:** none.

---

## Validation Architecture

`workflow.nyquist_validation` is not set in `.planning/config.json` — treating as enabled.

### Test Framework

| Property           | Value                                                                         |
| ------------------ | ----------------------------------------------------------------------------- |
| Framework          | TypeScript compiler + ESLint (no unit test framework detected in phase scope) |
| Config file        | `tsconfig.json` / `.eslintrc` (existing)                                      |
| Quick run command  | `npx tsc --noEmit && npm run lint`                                            |
| Full suite command | `npx tsc --noEmit && npm run lint && npm run build`                           |

This phase is purely CSS/Tailwind class changes. There are no behavioral changes that require unit tests. Validation is:

1. `npx tsc --noEmit` — zero TypeScript errors (class strings are not type-checked, so this mainly guards against accidental prop regressions)
2. `npm run lint` — zero ESLint errors (import sort, no-unused-vars)
3. `npm run build` — successful Next.js build
4. Manual/visual breakpoint pass at 375px, 768px, 1024px per D-12

### Phase Requirements → Test Map

| Req ID  | Behavior                                             | Test Type                        | Automated Command  | File Exists? |
| ------- | ---------------------------------------------------- | -------------------------------- | ------------------ | ------------ |
| RESP-01 | Sidebar drawer opens/closes on mobile                | Manual visual                    | —                  | N/A          |
| RESP-01 | Drawer width = 85vw on 320px screen                  | Manual visual                    | —                  | N/A          |
| RESP-02 | DataTable scrolls horizontally at 375px              | Manual visual                    | —                  | N/A          |
| RESP-03 | Dashboard reflows to single column at 375px          | Manual visual                    | —                  | N/A          |
| RESP-03 | Step indicator scrolls horizontally on 5-step wizard | Manual visual                    | —                  | N/A          |
| RESP-03 | Finance charts scroll at 375px                       | Manual visual                    | —                  | N/A          |
| RESP-04 | Nav items ≥ 44px touch target                        | Manual visual + DevTools inspect | —                  | N/A          |
| RESP-04 | Icon buttons ≥ 44px touch target                     | Manual visual + DevTools inspect | —                  | N/A          |
| RESP-05 | No horizontal overflow on any route at 375px         | Manual visual                    | —                  | N/A          |
| Gate    | TypeScript clean                                     | automated                        | `npx tsc --noEmit` | ✓            |
| Gate    | Lint clean                                           | automated                        | `npm run lint`     | ✓            |
| Gate    | Build success                                        | automated                        | `npm run build`    | ✓            |

### Wave 0 Gaps

None — no new test files needed. All validation for this phase is manual visual + automated gate commands already available.

---

## Security Domain

This phase makes no security-relevant changes. All edits are Tailwind class modifications to existing components. No new input surfaces, no auth changes, no server actions modified.

ASVS not applicable for a CSS-only responsive polish phase.

---

## Sources

### Primary (HIGH confidence)

- Codebase direct inspection — `src/_components/shared/sidebar.tsx`, `header.tsx`, `layout.tsx`, `data-table.tsx`, `sheet.tsx`, `button.tsx` — component APIs, class names, and prop signatures verified
- Codebase direct inspection — `customers-client.tsx` as reference for column hiding pattern (already uses `hidden sm:table-cell` / `hidden md:table-cell` / `hidden lg:table-cell`)
- Codebase direct inspection — `OrdersClient.tsx`, `inventory-client.tsx`, `finance/page.tsx`, `finance/reports/page.tsx` — current column hiding state verified
- Codebase direct inspection — `order-wizard.tsx`, `step-indicator.tsx` — current step indicator structure verified
- Codebase direct inspection — `finance/finance-charts.tsx` — recharts usage with `ResponsiveContainer width="100%"` verified
- `.planning/PROJECT.md` — locked decisions (Base UI render prop, no asChild, Tailwind v4, React Compiler)
- `package.json` — confirmed: Next.js 16.2.6, @base-ui/react ^1.5.0, tailwindcss ^4, TypeScript ^5

### Secondary (MEDIUM confidence)

- `globals.css` — confirmed Tailwind v4 CSS-first import, no custom breakpoint overrides (standard sm:640px md:768px lg:1024px apply)

### Tertiary (LOW confidence / ASSUMED)

- recharts `overflow-x-auto` wrapper pattern — [ASSUMED] standard community practice, not verified via recharts official docs in this session
- `overflow-hidden` interaction with child `overflow-x-auto` — [ASSUMED] based on CSS spec understanding; verify at 375px

---

## Metadata

**Confidence breakdown:**

- File change map: HIGH — all target files read and current state verified
- Column hiding gaps: HIGH — all DataTable column definitions read and compared to D-04/D-05/D-06
- Sheet width fix: HIGH — exact class location verified (header.tsx line 96)
- Touch target gap: HIGH — Button `size="icon"` = `size-8` = 32px verified in button.tsx
- Nav item padding gap: HIGH — `py-2.5` verified in sidebar.tsx line 61
- Chart scroll pattern: MEDIUM — recharts behavior assumed, pattern not verified via official docs
- `overflow-hidden` pitfall: MEDIUM — CSS spec reasoning, needs visual verification

**Research date:** 2026-06-12
**Valid until:** 2026-07-12 (stable Tailwind v4 + Base UI APIs; no fast-moving dependencies)
