# Ingest Synthesis — AutoShop Manager

**Mode:** new (bootstrap)
**Source docs:** 1 — `.planning/PLAN.md` (custom planning/roadmap doc, classified as DOC/PRD-hybrid)
**Conflicts:** none (single source document)

## Summary

The existing `.planning/PLAN.md` documents a mostly-built Next.js 16 auto-shop management app ("Precision Auto") plus a locked design system, TypeScript conventions, and remaining build work (DB integration, appointments, public tracking).

This ingest bootstraps the GSD structure and opens a **hardening & polish milestone** with four phases approved by the user:

1. **Security** — auth hardening, server-side Zod validation, `proxy.ts` access control, security headers, rate limiting
2. **Responsiveness** — collapsible sidebar, horizontal-scroll tables, adaptive layouts
3. **Usability** — loading/error/empty states, validation feedback, toasts, optimistic UI
4. **Screen enhancement** — pending design screens (strategic dashboard, low-stock alerts, purchase orders, intake checklist), visual/design-system polish, resolve `/appointments` & `/track/[id]` placeholders

## Intel files

- `decisions.md` — locked design system, component library, TS rules, file structure, framework decisions
- `requirements.md` — the 4 improvement areas as requirements + cross-cutting completion checklist
- `constraints.md` — tech stack, Base UI gotchas, process gates
- `context.md` — what the app is, current routes, recent work

## Roadmap guidance for gsd-roadmapper

- This is a **new milestone over an existing codebase**, not a greenfield build.
- Phases = the 4 areas above, in that order (Security first — highest risk).
- Each phase's success criteria should fold in the locked per-phase completion checklist (tsc/lint/build pass, responsiveness tested, design patterns applied).
- Respect all locked decisions in `decisions.md` — phases improve the existing app, they do not re-architect it.
- Keep mock-data-first; do not assume the Drizzle integration has landed.
