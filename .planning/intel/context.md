# Project Context (from ingest)

## What it is

**AutoShop Manager** (brand: "Precision Auto") — a management system for an auto mechanic workshop (oficina mecânica). Manages service orders (O.S.), customers & vehicles, parts inventory, finance, and appointments.

## Current state (implemented routes)

- `/` dashboard (operational)
- `/orders`, `/orders/new` (4-step wizard), `/orders/[id]/budget`, `/orders/[id]/print` (with PIX QR)
- `/customers`, `/customers/[id]` (profile + history)
- `/inventory`, `/inventory/new`, `/inventory/alerts`, `/inventory/purchase-orders`, `/inventory/purchase-orders/new`
- `/finance`, `/finance/reports`
- `/analytics`
- `/login`, `/register`, `/forgot-password`, `/reset-password` (Better Auth)
- `/api/auth/[...all]`

## Placeholder / pending

- `/appointments` (calendar — react-big-calendar planned)
- `/track/[id]` (public O.S. tracking — qrcode.react planned)
- Pending design screens: strategic dashboard, low-stock alerts, purchase-order generation, new O.S. with intake checklist

## Recent work (git history)

- Password reset auth flow (forgot/reset, show/hide toggles, confirm password)
- src/ restructure into layered `_data-access` / `_helpers` / `_lib`
- useForm+Zod logic extracted into dedicated `_hooks` layer
- `PasswordInput` component extracted
- Centralized formatting helpers (`format.ts`), `CurrencyInput`, `PlateInput`
- proxy.ts access control adjustments
- lint-staged config moved to `.lintstagedrc.json`

## This milestone

A hardening & polish cycle (NOT new build). Four phases: Security → Responsiveness → Usability → Screen enhancement. Source doc: `.planning/PLAN.md` (custom planning doc, dated 2026-05-28).
