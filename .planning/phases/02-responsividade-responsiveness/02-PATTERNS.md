# Phase 2: Responsividade (Responsiveness) - Pattern Map

**Mapped:** 2026-06-12
**Files analyzed:** 8 (modified only — no new files created in this phase)
**Analogs found:** 8 / 8

---

## File Classification

| Modified File                                             | Role           | Data Flow        | Closest Analog                                              | Match Quality           |
| --------------------------------------------------------- | -------------- | ---------------- | ----------------------------------------------------------- | ----------------------- |
| `src/_components/shared/header.tsx`                       | component      | request-response | `src/_components/shared/header.tsx` (self)                  | self — targeted edit    |
| `src/_components/shared/sidebar.tsx`                      | component      | request-response | `src/_components/shared/sidebar.tsx` (self)                 | self — targeted edit    |
| `src/_components/ui/button.tsx`                           | utility/config | —                | `src/_components/ui/button.tsx` (self)                      | self — variant addition |
| `src/app/(dashboard)/orders/new/step-indicator.tsx`       | component      | request-response | `src/app/(dashboard)/finance/page.tsx` (scroll row pattern) | role-match              |
| `src/app/(dashboard)/orders/_components/OrdersClient.tsx` | component      | CRUD             | `src/app/(dashboard)/customers/customers-client.tsx`        | exact                   |
| `src/app/(dashboard)/page.tsx`                            | component      | CRUD             | `src/app/(dashboard)/customers/customers-client.tsx`        | exact                   |
| `src/app/(dashboard)/finance/page.tsx`                    | component      | CRUD             | `src/app/(dashboard)/finance/reports/page.tsx`              | exact                   |
| `src/app/(dashboard)/finance/reports/page.tsx`            | component      | CRUD             | `src/app/(dashboard)/finance/page.tsx`                      | exact                   |

---

## Pattern Assignments

### `src/_components/shared/header.tsx` (component, RESP-01 + RESP-04)

**Analog:** Self — targeted class substitution on lines 94–100 and icon buttons.

**Current SheetContent pattern** (lines 94–100) — what exists today:

```tsx
// header.tsx lines 94-100 — CURRENT
<SheetContent
  side="left"
  className="border-outline-variant bg-surface-container w-64 p-0"
>
  <SheetTitle className="sr-only">Navegação</SheetTitle>
  <SidebarContent onNavigate={() => setMenuOpen(false)} />
</SheetContent>
```

**Target pattern** — replace `w-64` with responsive width:

```tsx
// AFTER — D-02 decision
<SheetContent
  side="left"
  className="border-outline-variant bg-surface-container w-[85vw] max-w-xs p-0"
>
  <SheetTitle className="sr-only">Navegação</SheetTitle>
  <SidebarContent onNavigate={() => setMenuOpen(false)} />
</SheetContent>
```

**Current icon button pattern** (lines 82–93, 136–153) — SheetTrigger + Bell button:

```tsx
// header.tsx lines 82-93 — CURRENT (size="icon" = size-8 = 32px, below 44px)
<SheetTrigger
  render={
    <Button
      variant="ghost"
      size="icon"
      className="lg:hidden"
      aria-label="Abrir menu"
    />
  }
>
  <Menu className="size-5" />
</SheetTrigger>

// header.tsx lines 136-143 — CURRENT (same issue)
<Button
  variant="ghost"
  size="icon"
  onClick={() => setSearchOpen(true)}
  aria-label="Pesquisar"
  className="sm:hidden"
>
  <Search className="size-5" />
</Button>

// header.tsx lines 145-153 — CURRENT
<Button
  variant="ghost"
  size="icon"
  aria-label="Notificações"
  className="text-on-surface-variant hover:bg-surface-container relative rounded-full"
>
  <Bell className="size-5" />
  <span className="bg-tertiary absolute top-2 right-2 size-2 rounded-full" />
</Button>
```

**Target pattern** — use new `icon-touch` size on all three header icon buttons (RESP-04 D-11):

```tsx
// AFTER — replace size="icon" with size="icon-touch" on the 3 mobile-critical buttons
// SheetTrigger button, Search mobile button, Bell button:
size = "icon-touch";
// ThemeToggle uses its own internal button — check if it needs the same treatment
```

**Note on Base UI render prop:** SheetTrigger uses `render={<Button ... />}` (not `asChild`). This is the project-wide pattern. Never use `asChild` with Base UI components. See header.tsx lines 83–88 for the canonical form.

---

### `src/_components/shared/sidebar.tsx` (component, RESP-04)

**Analog:** Self — targeted class substitution on lines 61 and 78.

**Current nav link className** (line 61):

```tsx
// sidebar.tsx line 61 — CURRENT (py-2.5 ≈ 40px touch target)
className={cn(
  "text-label-md flex items-center gap-3 rounded-lg px-4 py-2.5 font-mono transition-colors",
  active
    ? "bg-secondary-container text-on-secondary-container"
    : "text-on-surface-variant hover:bg-surface-container-highest",
)}
```

**Target pattern** — `py-2.5` → `py-3` (48px, ≥ 44px Apple HIG):

```tsx
// AFTER — D-10 decision
"text-label-md flex items-center gap-3 rounded-lg px-4 py-3 font-mono transition-colors";
```

**Current support button** (line 78):

```tsx
// sidebar.tsx line 78 — CURRENT (same py-2.5 issue)
<button className="bg-surface-container-highest text-label-md text-on-surface hover:bg-outline-variant flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-mono transition-colors">
  <Headset className="size-4" />
  Suporte Técnico
</button>
```

**Target pattern** — same `py-2.5` → `py-3` substitution:

```tsx
// AFTER
<button className="bg-surface-container-highest text-label-md text-on-surface hover:bg-outline-variant flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-mono transition-colors">
```

---

### `src/_components/ui/button.tsx` (utility/config, RESP-04)

**Analog:** Self — add one new entry to the `size` variants object.

**Current size variants** (lines 22–34):

```tsx
// button.tsx lines 22-34 — CURRENT size map
size: {
  default: "h-8 gap-1.5 px-2.5 ...",
  xs:      "h-6 gap-1 rounded-[min(var(--radius-md),10px)] ...",
  sm:      "h-7 gap-1 rounded-[min(var(--radius-md),12px)] ...",
  lg:      "h-9 gap-1.5 px-2.5 ...",
  icon:    "size-8",           // 32px — below 44px minimum
  "icon-xs":  "size-6 ...",
  "icon-sm":  "size-7 ...",
  "icon-lg":  "size-9",
},
```

**Target pattern** — add `"icon-touch"` after `"icon-lg"` (D-11, Pitfall 4: do NOT change existing `icon: "size-8"`):

```tsx
// AFTER — insert one line only
"icon-lg":    "size-9",
"icon-touch": "size-11",   // 44px × 44px — Apple HIG / Material minimum
```

**Critical constraint:** The existing `icon: "size-8"` definition must NOT be changed. It is used by close buttons, table action buttons, and other small icon buttons throughout the codebase. Only the three header navigation buttons should use `icon-touch`.

---

### `src/app/(dashboard)/orders/new/step-indicator.tsx` (component, RESP-03)

**Analog:** `src/app/(dashboard)/finance/page.tsx` lines 139–152 — existing horizontal scroll row pattern (filter tabs already use `overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`).

**Reference scroll row pattern from finance/page.tsx** (lines 139–152):

```tsx
// finance/page.tsx lines 139-152 — established horizontal scroll row pattern
<div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
  {["Mensal", "Trimestral", "Anual"].map((p) => (
    <button key={p} className="shrink-0 ... ...">
      {p}
    </button>
  ))}
</div>
```

**Current step indicator outer div** (step-indicator.tsx line 25):

```tsx
// step-indicator.tsx line 25 — CURRENT (compresses on 320px with 5 steps)
<div className="flex items-center justify-between">
```

**Current step item div** (step-indicator.tsx line 31):

```tsx
// step-indicator.tsx line 31 — CURRENT
<div key={step.number} className="flex flex-1 items-center">
```

**Target pattern** — horizontal scroll container + min-width per step item (D-07):

```tsx
// AFTER — outer wrapper: remove justify-between, add overflow-x-auto + scrollbar hide
<div className="flex items-center overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">

// AFTER — each step item: replace flex-1 with min-w + shrink-0
<div key={step.number} className="flex min-w-[56px] shrink-0 items-center">
```

**Note on connector lines:** The connector `<div className="mx-2 h-px flex-1 ..." />` at step-indicator.tsx lines 57–62 remains `flex-1` — it stretches between the fixed-width step items. This is correct and must not change.

**Note on progress bar:** The progress bar (`div.bg-surface-container mt-4 h-1`) at lines 71–76 is below the scroll container and is full-width — it is unaffected by the scroll wrapper change.

---

### `src/app/(dashboard)/orders/_components/OrdersClient.tsx` (component, RESP-02/RESP-03)

**Analog:** `src/app/(dashboard)/customers/customers-client.tsx` — canonical column hiding reference.

**Reference column hiding pattern from customers-client.tsx** (lines 33–50):

```tsx
// customers-client.tsx lines 33-50 — CANONICAL column hiding pattern
{
  id: "cpf",
  header: "CPF / CNPJ",
  className: "hidden sm:table-cell",   // hide below sm (640px)
  cell: (row) => (...),
},
{
  id: "phone",
  header: "Telefone",
  className: "hidden md:table-cell",   // hide below md (768px)
  cell: (row) => (...),
},
```

**Current OrdersClient column definitions** (OrdersClient.tsx lines 22–90):

```
orderNumber — no className (always visible) ✓
plate       — className: "hidden sm:table-cell" ✓
customer    — no className (always visible) ✓
mechanic    — className: "hidden md:table-cell" ✓
status      — no className (always visible) ✓
totalAmount — no className  ← MISSING per D-05
updatedAt   — className: "hidden md:table-cell" ✓
```

**Target pattern** — add `className` to `totalAmount` only (lines 69–78):

```tsx
// OrdersClient.tsx — CURRENT (line 70-78)
{
  id: "totalAmount",
  header: "Total",
  align: "right",
  cell: (row) => (
    <span className="text-label-md text-on-surface font-mono font-semibold">
      {formatCurrency(Number(row.totalAmount))}
    </span>
  ),
},

// AFTER — add className per D-05
{
  id: "totalAmount",
  header: "Total",
  align: "right",
  className: "hidden sm:table-cell",  // ADD — preço oculto em sm per D-05
  cell: (row) => (
    <span className="text-label-md text-on-surface font-mono font-semibold">
      {formatCurrency(Number(row.totalAmount))}
    </span>
  ),
},
```

---

### `src/app/(dashboard)/page.tsx` (component, RESP-02/RESP-03)

**Analog:** `src/app/(dashboard)/customers/customers-client.tsx` — same column hiding pattern.

**Current dashboard orderColumns** (page.tsx lines 19–74):

```
id (O.S.)   — no className (always visible) ✓
plate       — className: "hidden sm:table-cell" ✓
customer    — no className (always visible) ✓
mechanic    — className: "hidden md:table-cell" ✓
status      — no className (always visible) ✓
totalAmount — no className  ← MISSING per D-05
```

**Target pattern** — add `className` to `totalAmount` (lines 65–73):

```tsx
// page.tsx lines 65-73 — CURRENT
{
  id: "totalAmount",
  header: "Total",
  align: "right",
  cell: (row) => (
    <span className="text-label-md text-on-surface font-mono">
      {formatCurrency(Number(row.totalAmount))}
    </span>
  ),
},

// AFTER — add className per D-05
{
  id: "totalAmount",
  header: "Total",
  align: "right",
  className: "hidden sm:table-cell",  // ADD
  cell: (row) => (
    <span className="text-label-md text-on-surface font-mono">
      {formatCurrency(Number(row.totalAmount))}
    </span>
  ),
},
```

---

### `src/app/(dashboard)/finance/page.tsx` (component, RESP-03 — chart scroll)

**Analog:** `src/app/(dashboard)/finance/reports/page.tsx` — sister file, same chart component usage.

**Current CashFlowBarChart wrapper** (finance/page.tsx lines 237–239):

```tsx
// finance/page.tsx lines 237-239 — CURRENT (no scroll wrapper)
<div className="p-4">
  <CashFlowBarChart data={cashFlow} />
</div>
```

**Target pattern** — wrap with `overflow-x-auto` + min-width inner div (D-09):

```tsx
// AFTER — bar chart: fewer data points (~6 bars) so min-w-[300px] is sufficient
<div className="overflow-x-auto p-4">
  <div className="min-w-[300px]">
    <CashFlowBarChart data={cashFlow} />
  </div>
</div>
```

**Note:** The existing filter tabs row at lines 139–152 already uses the correct horizontal scroll pattern (`-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 pb-1 ...`). This row does NOT need changes — it is already correct.

---

### `src/app/(dashboard)/finance/reports/page.tsx` (component, RESP-03 — chart scroll)

**Analog:** `src/app/(dashboard)/finance/page.tsx` — sister file.

**Current MonthlyLineChart wrapper** (finance/reports/page.tsx lines 215–217):

```tsx
// finance/reports/page.tsx lines 215-217 — CURRENT (no scroll wrapper)
<div className="p-4">
  <MonthlyLineChart data={monthlyCashFlow} />
</div>
```

**Current CostDonutChart usage** (finance/reports/page.tsx line 224):

```tsx
// finance/reports/page.tsx line 224 — CURRENT (no wrapper, inside Card p-4)
<CostDonutChart data={costBreakdown} />
```

**Target pattern for MonthlyLineChart** — 6-month line chart with 3 data series, needs wider minimum:

```tsx
// AFTER — line chart: 6 months × 3 series, more data density → min-w-[360px]
<div className="overflow-x-auto p-4">
  <div className="min-w-[360px]">
    <MonthlyLineChart data={monthlyCashFlow} />
  </div>
</div>
```

**Target pattern for CostDonutChart** — donut chart is radial, not linear; it scales down gracefully. Apply `min-w-[280px]` as a conservative floor:

```tsx
// AFTER — donut chart: radial, lower minimum needed
<div className="overflow-x-auto">
  <div className="min-w-[280px]">
    <CostDonutChart data={costBreakdown} />
  </div>
</div>
```

---

## Shared Patterns

### Horizontal Scroll Row (no scrollbar visible)

**Source:** `src/app/(dashboard)/finance/page.tsx` lines 139–152 (already implemented for filter tabs)
**Apply to:** `step-indicator.tsx` outer wrapper

```tsx
// Canonical hidden-scrollbar horizontal scroll
className =
  "flex overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";
// Items inside must have shrink-0 to prevent compression
```

### Column Hiding in DataTable

**Source:** `src/app/(dashboard)/customers/customers-client.tsx` lines 33–85 (canonical reference per CONTEXT.md)
**Apply to:** `OrdersClient.tsx` and `page.tsx` (totalAmount column only in each)

```tsx
// Secondary info — hidden below 640px
className: "hidden sm:table-cell";

// Tertiary info — hidden below 768px
className: "hidden md:table-cell";

// Quaternary info — hidden below 1024px
className: "hidden lg:table-cell";
```

### Chart Scroll Wrapper

**Source:** Pattern derived from RESEARCH.md Pattern 3 (no existing codebase example yet — this phase introduces it)
**Apply to:** `finance/page.tsx` (CashFlowBarChart) and `finance/reports/page.tsx` (MonthlyLineChart, CostDonutChart)

```tsx
// Outer: enables horizontal scroll
<div className="overflow-x-auto p-4">
  // Inner: prevents chart compression — width varies by chart type:
  //   Bar chart (~6 bars):   min-w-[300px]
  //   Line chart (6mo×3):    min-w-[360px]
  //   Donut chart (radial):  min-w-[280px]
  <div className="min-w-[Npx]">
    <ChartComponent ... />
  </div>
</div>
```

### Base UI Render Prop (not asChild)

**Source:** `src/_components/shared/header.tsx` lines 83–91 and 157–163
**Apply to:** Any new Base UI interactive element — SheetTrigger, DropdownMenuTrigger, etc.

```tsx
// CORRECT — Base UI render prop pattern
<SheetTrigger render={<Button variant="ghost" size="icon-touch" className="lg:hidden" aria-label="Abrir menu" />}>
  <Menu className="size-5" />
</SheetTrigger>

// WRONG — never use asChild with @base-ui/react
<SheetTrigger asChild>  // ← does not exist in Base UI
```

### Tailwind `cn()` for Conditional Classes

**Source:** `src/_components/shared/sidebar.tsx` lines 60–65
**Apply to:** All className edits that involve conditional logic

```tsx
import { cn } from "@/_lib/utils";

className={cn(
  "text-label-md flex items-center gap-3 rounded-lg px-4 py-3 font-mono transition-colors",
  active
    ? "bg-secondary-container text-on-secondary-container"
    : "text-on-surface-variant hover:bg-surface-container-highest",
)}
```

---

## No Analog Found

All 8 files have close analogs. No files in this phase require fallback to RESEARCH.md patterns exclusively — though the chart scroll wrapper pattern (Pattern 3 in RESEARCH.md) has no pre-existing codebase example yet and the first implementation in `finance/page.tsx` becomes the analog for `finance/reports/page.tsx`.

---

## Files Already Correct — No Changes Needed

Per RESEARCH.md verification:

| File                                                          | Status                                          |
| ------------------------------------------------------------- | ----------------------------------------------- |
| `src/_components/ui/data-table.tsx`                           | `overflow-x-auto` already present               |
| `src/app/(dashboard)/inventory/inventory-client.tsx`          | Column hiding already matches D-06              |
| `src/app/(dashboard)/finance/page.tsx` transactions table     | Column hiding already correct per D-04          |
| `src/app/(dashboard)/finance/reports/page.tsx` category table | Column hiding already correct per D-04          |
| `src/app/(dashboard)/layout.tsx`                              | `lg:ml-64` and `p-4 md:p-6` already present     |
| `src/app/(dashboard)/page.tsx` dashboard grid                 | `sm:grid-cols-2 lg:grid-cols-4` already present |

---

## Metadata

**Analog search scope:** `src/_components/`, `src/app/(dashboard)/`
**Files read:** 10 source files
**Pattern extraction date:** 2026-06-12
