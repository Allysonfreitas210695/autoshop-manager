---
phase: 02-responsividade-responsiveness
reviewed: 2026-06-12T20:10:00-03:00
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/_components/ui/button.tsx
  - src/_components/shared/header.tsx
  - src/_components/shared/sidebar.tsx
  - src/app/(dashboard)/orders/_components/OrdersClient.tsx
  - src/app/(dashboard)/page.tsx
  - src/app/(dashboard)/orders/new/step-indicator.tsx
  - src/app/(dashboard)/finance/page.tsx
  - src/app/(dashboard)/finance/reports/page.tsx
findings:
  critical: 3
  warning: 7
  info: 4
  total: 14
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-06-12T20:10:00-03:00
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Eight files from the Phase 2 responsiveness implementation were reviewed. The responsive layout work is generally sound — breakpoint-based column hiding, touch-friendly button sizing, and mobile drawer navigation are all correctly applied. However, three blockers were found: a Tailwind v4 arbitrary-variant mis-use that silently disables hover feedback on the default Button variant everywhere in the app, non-functional period-filter buttons rendered in a server component (no state, no effect on data), and a `StepIndicator` progress bar that produces negative or overflowing widths for out-of-range `currentStep` values. Seven warnings cover dead UI (pagination stub, "Quick Actions", "Exportar PDF"), a hard `<a>` navigation instead of Next.js `<Link>`, broken ARIA tab pattern, a missing `type` attribute on a sidebar button, and an import ordering problem that obscures `metadata` declarations. Four informational items are also noted.

---

## Critical Issues

### CR-01: Default Button Variant Has No Hover Effect Outside `<a>` Elements

**File:** `src/_components/ui/button.tsx:11`
**Issue:** The `default` variant class list contains `[a]:hover:bg-primary/80` instead of `hover:bg-primary/80`. In Tailwind v4 the `[a]:` prefix is an arbitrary ancestor variant meaning "apply only when the element is a descendant of an `<a>` tag." A `<Button>` rendered standalone (the common case) will never receive a hover background change, making all default-variant buttons visually inert on hover throughout the entire application.

**Fix:**

```tsx
// button.tsx line 11 — remove the [a]: prefix
default: "bg-primary text-primary-foreground hover:bg-primary/80",
```

---

### CR-02: Period-Filter Buttons in `finance/page.tsx` Are Non-Functional (Server Component)

**File:** `src/app/(dashboard)/finance/page.tsx:139-152`
**Issue:** `FinancePage` is a server component (no `"use client"` directive). The three period-filter buttons ("Mensal", "Trimestral", "Anual") use a hardcoded `p === "Mensal"` comparison for active styling and have no `onClick` handlers. Clicking "Trimestral" or "Anual" produces no visual or data change — the buttons are permanently decorative stubs. Users will believe they can change the reporting period but cannot.

**Fix:** Either extract the filter row into a `"use client"` child component that manages `useState` and triggers a re-fetch/navigation, or convert the filter to URL search params so the server component can respond:

```tsx
// Option A — client component approach
"use client";
import { useRouter, useSearchParams } from "next/navigation";

export function PeriodFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("period") ?? "Mensal";

  return (
    <div className="-mx-4 flex ...">
      {["Mensal", "Trimestral", "Anual"].map((p) => (
        <button
          key={p}
          onClick={() => router.push(`?period=${p}`)}
          className={`... ${p === active ? "border-secondary ..." : "..."}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
```

---

### CR-03: `StepIndicator` Progress Bar Renders Negative or Overflowing Width

**File:** `src/app/(dashboard)/orders/new/step-indicator.tsx:77-85`
**Issue:** The progress bar width is calculated as `((currentStep - 1) / (STEPS.length - 1)) * 100`. When `currentStep` is `0` the result is `-25%`, which produces an invisible but invalid negative width. When `currentStep` is `6` (one past the last step) the result is `125%`, which overflows the container. Although the wrapping div has `overflow-hidden`, the percentage text on line 84 would display `125%` or `-25%` to the user. No validation or clamping is applied. Callers pass `currentStep` from form state that could reach these edge values.

**Fix:**

```tsx
// step-indicator.tsx — clamp before computing
const safeStep = Math.max(1, Math.min(currentStep, STEPS.length));
const progressPct = Math.round(((safeStep - 1) / (STEPS.length - 1)) * 100);

// Then use safeStep/progressPct in JSX:
style={{ width: `${progressPct}%` }}
// ...
Preenchimento: {progressPct}%
```

---

## Warnings

### WR-01: Pagination in `OrdersClient` Is a Permanent Stub with No State

**File:** `src/app/(dashboard)/orders/_components/OrdersClient.tsx:169-186`
**Issue:** Both "← Ant." and "Próx. →" pagination buttons are unconditionally `disabled`. No `currentPage` state, no `totalPages` calculation, and no slice/offset logic exist. The component always renders all filtered orders in a single page. The UI implies pagination is available but it never functions regardless of row count. This misleads users with large datasets.

**Fix:** Either implement pagination state and slice the `filtered` array accordingly, or remove the pagination controls entirely until the feature is ready:

```tsx
// Remove the stub until pagination is implemented:
// Delete lines 165-186 and replace with a simple count line if needed.
```

---

### WR-02: "Quick Actions" Button in `finance/page.tsx` Is a Dead No-Op

**File:** `src/app/(dashboard)/finance/page.tsx:132-134`
**Issue:** The "Quick Actions" button has no `onClick` handler, no `disabled` attribute, and no associated action. It is rendered in a server component so it cannot be wired to client state. It is also the only English-language UI string in an otherwise Portuguese interface. Clicking it does nothing, but it appears as a primary call-to-action.

**Fix:** Add `disabled` and a tooltip until the feature is defined, or remove the button:

```tsx
<button
  disabled
  className="disabled:cursor-not-allowed disabled:opacity-40 ..."
  title="Em breve"
>
  Ações Rápidas
</button>
```

---

### WR-03: "Exportar PDF" Button in `finance/reports/page.tsx` Is a Dead No-Op

**File:** `src/app/(dashboard)/finance/reports/page.tsx:173-176`
**Issue:** The "Exportar PDF" button has no `onClick` handler and no `disabled` attribute. In a server component it cannot trigger any client-side behavior. Clicking it silently does nothing. Presenting a non-functional export button on a reports page creates a false expectation of functionality.

**Fix:** Mark as disabled or extract to a `"use client"` component with real export logic:

```tsx
<button
  disabled
  className="disabled:cursor-not-allowed disabled:opacity-40 ..."
  title="Funcionalidade em desenvolvimento"
>
  <Download className="size-4" />
  Exportar PDF
</button>
```

---

### WR-04: Dashboard "Ver todas" Uses Hard `<a>` Instead of Next.js `<Link>`

**File:** `src/app/(dashboard)/page.tsx:155-160`
**Issue:** The "Ver todas" anchor navigates to `/orders` using a plain `<a href="/orders">` element. In a Next.js app this triggers a full page reload instead of a client-side navigation, discarding the React component tree, resetting scroll position, and causing a visible flash. All other navigation in the codebase correctly uses `<Link>` from `next/link`.

**Fix:**

```tsx
// Replace:
<a href="/orders" className="text-label-sm text-secondary font-mono hover:underline">
  Ver todas
</a>

// With:
<Link href="/orders" className="text-label-sm text-secondary font-mono hover:underline">
  Ver todas
</Link>
// (Link is already imported in this file)
```

---

### WR-05: Broken ARIA Tab Pattern — No `tabpanel` Role in `OrdersClient`

**File:** `src/app/(dashboard)/orders/_components/OrdersClient.tsx:118-154`
**Issue:** The filter container uses `role="tablist"` and each button uses `role="tab"` with `aria-selected`. The WAI-ARIA tab pattern requires each tab to control a corresponding element with `role="tabpanel"` that is linked via `aria-controls` (on the tab) and `aria-labelledby` (on the panel). No such panel element exists. Screen readers following the tab pattern will announce controls but find no associated content region, breaking keyboard navigation expectations for assistive technology users.

**Fix:** Either add the `tabpanel` role to the DataTable wrapper and link with IDs, or drop the `role="tablist"` / `role="tab"` attributes and use a simpler `role="group"` / `aria-label` approach that does not require the full tab pattern:

```tsx
// Simpler approach: remove role=tablist/tab, use aria-pressed
<div role="group" aria-label="Filtrar por status" className="...">
  {STATUS_FILTER_TABS.map((tab) => (
    <button
      key={tab.value}
      aria-pressed={isActive}
      onClick={() => setActiveFilter(tab.value)}
      className={...}
    >
      ...
    </button>
  ))}
</div>
```

---

### WR-06: Sidebar "Suporte Técnico" Button Missing `type="button"`

**File:** `src/_components/shared/sidebar.tsx:78`
**Issue:** The support button has no explicit `type` attribute. HTML defaults `<button>` to `type="submit"`. If `SidebarContent` is ever rendered inside a `<form>` element (e.g., a search form or a page-level form in a future refactor), clicking "Suporte Técnico" will inadvertently submit the nearest form. The `onNavigate` callback wired to nav links implies this component may appear in various render contexts.

**Fix:**

```tsx
<button type="button" className="bg-surface-container-highest ...">
  <Headset className="size-4" />
  Suporte Técnico
</button>
```

---

### WR-07: `buildCategoryRows` Uses Array Index as Row ID

**File:** `src/app/(dashboard)/finance/reports/page.tsx:108-123`
**Issue:** Each `CategoryRow` is assigned `id: String(i)` where `i` is the `.map()` index. The `DataTable` uses this as a React key via `getRowId={(row) => row.id}`. If the underlying transaction data changes between renders and categories are added, removed, or reordered, keys will be reassigned to different rows — causing React to reuse DOM nodes incorrectly and potentially showing stale content. The natural stable key is the category name itself.

**Fix:**

```tsx
// In buildCategoryRows map():
return {
  id: cat,   // use category name as stable ID
  category: cat,
  grossRevenue: income,
  ...
};
```

---

## Info

### IN-01: Import Ordering Places `metadata` Export Between Import Statements

**File:** `src/app/(dashboard)/finance/page.tsx:1-2`, `src/app/(dashboard)/finance/reports/page.tsx:1-2`, `src/app/(dashboard)/page.tsx:1-2`
**Issue:** All three server page files place the `export const metadata` declaration on line 2, sandwiched between the first import on line 1 and subsequent imports on lines 3+. While technically valid JavaScript, this violates standard ESLint `import/order` expectations and will be flagged as an error if lint rules are tightened. The conventional placement is after all imports.

**Fix:** Move `metadata` declarations after all import statements:

```tsx
import { formatCurrency } from "@/_helpers/format";
import { ... } from "lucide-react";
// ... all other imports

export const metadata = { title: "Financeiro — Precision Auto" };
```

---

### IN-02: `StepIndicator` Step Labels Are Hidden on Mobile (`hidden sm:block`)

**File:** `src/app/(dashboard)/orders/new/step-indicator.tsx:52-55`
**Issue:** Step labels ("Cliente & Veículo", "Checklist", etc.) are hidden below the `sm` breakpoint with `hidden sm:block`. On mobile screens, only the numbered circles are visible with no labels. The progress percentage below compensates somewhat, but users on small screens cannot tell what step 3 ("Diagnóstico") represents without text. This is a usability gap for the primary mobile audience this phase targets.

**Fix:** Consider showing a single "active step" label below the circles on mobile instead of hiding all labels:

```tsx
{
  /* Show active step label on mobile */
}
<p className="text-label-sm text-secondary mt-2 text-center font-mono sm:hidden">
  {STEPS.find((s) => s.number === currentStep)?.label}
</p>;
```

---

### IN-03: "Quick Actions" Button Uses English Text in Portuguese UI

**File:** `src/app/(dashboard)/finance/page.tsx:133`
**Issue:** The button label "Quick Actions" is the only English-language string in an interface that is consistently in Portuguese. This is inconsistent with the rest of the application's language.

**Fix:** Replace with Portuguese:

```tsx
Ações Rápidas
```

---

### IN-04: `header.tsx` Search Inputs Have No `onChange` Handler or State

**File:** `src/_components/shared/header.tsx:61-66`, `src/_components/shared/header.tsx:127-132`
**Issue:** Both the mobile and desktop search `<Input>` elements are uncontrolled and have no `onChange`, `onSubmit`, or `onKeyDown` handlers. Users can type in the search box but nothing happens. There is no routing to a search results page, no filter state, and no debounce logic. This is a known incomplete feature, but it is worth tracking as it creates a non-functional affordance.

**Fix:** Until search is implemented, add `readOnly` or `disabled` with a placeholder indicating the feature is unavailable, or wire up a `router.push(`/orders?q=${query}`)` handler.

---

_Reviewed: 2026-06-12T20:10:00-03:00_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
