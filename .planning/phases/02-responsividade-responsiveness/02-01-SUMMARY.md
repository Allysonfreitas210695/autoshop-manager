---
phase: 02-responsividade-responsiveness
plan: "01"
subsystem: navigation/ui
tags: [responsive, touch-targets, mobile, sidebar, header, button]
dependency_graph:
  requires: []
  provides:
    [
      icon-touch Button variant,
      touch-compliant navigation,
      adaptive mobile drawer,
    ]
  affects:
    [
      src/_components/ui/button.tsx,
      src/_components/shared/header.tsx,
      src/_components/shared/sidebar.tsx,
    ]
tech_stack:
  added: []
  patterns:
    [
      Tailwind viewport-relative width (vw),
      Apple HIG 44px touch target (size-11),
    ]
key_files:
  created: []
  modified:
    - src/_components/ui/button.tsx
    - src/_components/shared/header.tsx
    - src/_components/shared/sidebar.tsx
decisions:
  - "Added icon-touch (size-11=44px) as new Button size variant; existing icon (size-8) left unchanged to avoid visual regressions on close/table-action buttons"
  - "Mobile drawer uses w-[85vw] max-w-xs instead of fixed w-64 to adapt to 320px screens"
  - "Nav link and support button padding raised from py-2.5 (~40px) to py-3 (~48px) for Apple HIG compliance"
metrics:
  duration: "~2 min"
  completed_date: "2026-06-12"
  tasks_completed: 3
  tasks_total: 3
---

# Phase 02 Plan 01: Touch-Friendly Navigation and Adaptive Mobile Drawer Summary

**One-liner:** Added `icon-touch` (size-11=44px) Button variant, applied to 3 mobile header buttons, widened mobile drawer to `w-[85vw] max-w-xs`, and raised sidebar nav/support padding to `py-3` for Apple HIG touch compliance.

## Tasks Completed

| Task | Name                                                       | Commit  | Files                               |
| ---- | ---------------------------------------------------------- | ------- | ----------------------------------- |
| 1    | Add icon-touch size variant to Button                      | ebcf877 | src/\_components/ui/button.tsx      |
| 2    | Widen mobile drawer and apply icon-touch to header buttons | 0040d4c | src/\_components/shared/header.tsx  |
| 3    | Raise sidebar nav and support button touch height          | 3c02a39 | src/\_components/shared/sidebar.tsx |

## What Was Built

- **New Button size variant `icon-touch`**: Maps to `size-11` (44x44px), satisfying the Apple HIG / Material Design 44px touch minimum (D-11). The original `icon: "size-8"` variant is preserved unchanged.
- **Adaptive mobile drawer**: `SheetContent` className changed from `w-64` (fixed 256px) to `w-[85vw] max-w-xs` (viewport-relative, caps at 320px on larger phones, adapts down to 320px screens per D-02).
- **Touch-compliant header buttons**: Menu trigger, mobile Search, and Bell notification buttons now use `size="icon-touch"`. The "Fechar busca" X button retains `size="icon"` (intentional — it is a secondary close action in a compact bar). ThemeToggle is unchanged.
- **Touch-compliant sidebar items**: Nav link base class and Suporte Técnico button both changed from `py-2.5` (~40px height) to `py-3` (~48px height, per D-10). Zero occurrences of `py-2.5` remain in sidebar.tsx.

## Verification Results

All `<verify>` grep assertions passed:

```
Task 1: grep "icon-touch": "size-11" && grep 'icon: "size-8"' → OK
Task 2: grep w-[85vw] max-w-xs && count(icon-touch)==3 && !grep w-64 → OK
Task 3: count(py-2.5)==0 && count(py-3)>=2 → OK
```

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None. All changes are CSS class string substitutions; no data-dependent rendering is involved.

## Threat Flags

None. This plan changes only Tailwind class strings on existing client components. No new input surfaces, auth/session changes, or server actions introduced.

## Self-Check: PASSED

- src/\_components/ui/button.tsx — modified, contains `"icon-touch": "size-11"`
- src/\_components/shared/header.tsx — modified, contains `w-[85vw] max-w-xs` and 3x `size="icon-touch"`
- src/\_components/shared/sidebar.tsx — modified, zero `py-2.5`, two+ `py-3`
- Commit ebcf877 — exists
- Commit 0040d4c — exists
- Commit 3c02a39 — exists
