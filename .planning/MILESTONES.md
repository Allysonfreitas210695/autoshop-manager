# Milestones

## v1.0 Hardening & Polish (Shipped: 2026-06-20)

**Phases completed:** 4 phases, 19 plans
**Timeline:** 2026-05-27 → 2026-06-20 (24 dias)
**Codebase:** ~17.6k LOC TypeScript/TSX

**Key accomplishments:**

1. **Segurança**: Auth hardened (Better Auth, password policy, secure sessions), Zod validation em todos os `_actions/`, route gating em `proxy.ts`, security headers (CSP/HSTS/X-Frame), rate limiting em auth, zero secret leakage
2. **Responsividade**: Mobile sidebar colapsável, DataTable com scroll horizontal, layouts adaptativos, 11 rotas verificadas sem overflow em 375/768/1024px
3. **Usabilidade**: Loading skeletons + error boundaries em todos os segmentos, validação inline consistente, toasts em CRUD, optimistic UI no status de O.S., server actions wired (ordens, clientes, inventário, orçamento)
4. **Aprimoramento de telas**: Calendário funcional (mês + semana + lista), QR code real no tracking, dashboard analítico, alertas de estoque, ordens de compra, checklist de intake, design-system polish global

**Known deferred items at close:** 4 (see STATE.md Deferred Items)

---
