# Phase 1: Segurança (Security) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-11
**Phase:** 1-Segurança (Security)
**Areas discussed:** Security headers / CSP, Route access control + roles, Rate limiting, Password policy

---

## Security headers / CSP (SEC-04)

| Option                             | Description                                                                                                   | Selected |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | -------- |
| Headers estritos + CSP report-only | Strict baseline headers now; CSP in report-only first to avoid breaking Next.js/React Compiler, tighten later | ✓        |
| CSP estrito com nonce desde já     | Nonce-based blocking CSP from the start                                                                       |          |
| Só headers básicos, CSP depois     | Basic headers only, defer CSP                                                                                 |          |

**User's choice:** Headers estritos + CSP report-only
**Notes:** next.config.ts is currently empty — headers are greenfield.

---

## Route access control + roles (SEC-03)

| Option                                            | Description                                                                                 | Selected |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| Corrigir rotas públicas + manter logado/deslogado | Fix /forgot-password, /reset-password, /track routing; keep simple auth gating; defer roles | ✓        |
| Corrigir + adicionar gating por role agora        | Also enforce admin-only routes via the existing role field                                  |          |
| Você decide                                       | Claude discretion                                                                           |          |

**User's choice:** Corrigir rotas públicas + manter logado/deslogado
**Notes:** Found real bugs in proxy.ts — recovery routes and /track/[id] redirect logged-out users to login. Role-based gating deferred (no admin areas defined yet).

---

## Rate limiting (SEC-05)

| Option                                | Description                               | Selected        |
| ------------------------------------- | ----------------------------------------- | --------------- |
| 5/min login, 3/h forgot+reset, por IP | Concrete thresholds, generic 429 on limit | (interpreted ✓) |
| Mais frouxo (10/min login)            | Looser limits                             |                 |
| Você decide os números                | Claude picks sensible thresholds          |                 |

**User's choice:** Free-text "upsplash" — interpreted as confirmation of the **Upstash** infra (already in deps). Adopted the recommended thresholds as the agreed default, with exact numbers left to planning discretion.
**Notes:** Upstash (`@upstash/ratelimit` + `@upstash/redis`) already installed. Generic 429 to prevent account enumeration.

---

## Password policy (SEC-01)

| Option                             | Description                                                      | Selected |
| ---------------------------------- | ---------------------------------------------------------------- | -------- |
| Reforçar: mín. 8, letra + número   | Min 8 with at least one letter and one number, Zod client+server | ✓        |
| Forte: mín. 12 + complexidade      | Min 12 with full complexity                                      |          |
| Manter padrão Better Auth (mín. 8) | No extra hardening                                               |          |

**User's choice:** Reforçar — mín. 8, letra + número
**Notes:** Validated on both client and server; applies to register and reset flows.

## Claude's Discretion

- Exact rate-limit numbers within the agreed ranges.
- CSP report-only directive list + report endpoint.
- Permissions-Policy allowlist beyond deny-by-default.
- Optional server-side session-validity helper.

## Deferred Ideas

- Role-based authorization (admin vs customer) — defer until admin areas are defined.
- Enforced nonce-based CSP — tighten from report-only later.
- Reset-password email provider — ⚠️ FLAGGED: reset link currently goes to console.log (TODO). Real gap; likely its own task unless planner judges it small.
