# Retrospective

## Milestone: v1.0 — Hardening & Polish

**Shipped:** 2026-06-20
**Phases:** 4 | **Plans:** 19 | **Duration:** 24 dias

### What Was Built

- Auth hardening completa (Better Auth, Zod server-side, proxy.ts gating, security headers, rate limiting)
- Responsividade total: mobile sidebar, DataTable scroll, adaptive layouts em todas as 11 rotas
- Usabilidade: loading skeletons, error boundaries, toasts em CRUD, optimistic UI, validação inline
- Todas as telas de design pendentes implementadas: calendário (mês+semana+lista), tracking com QR code, dashboard analítico, alertas de estoque, ordens de compra, checklist de intake
- Design-system polish aplicado globalmente (font-mono, StatusChip, paleta Industrial Precision)

### What Worked

- Mock-data-first strategy: permitiu focar 100% em UX/UI sem bloquear no DB antes de validar
- Ordem security→responsiveness→usability→screens: correta — nenhuma fase criou retrabalho na seguinte
- Reutilização agressiva de `DataTable`, `StatusChip`, `StatusChart` — consistência sem esforço extra
- `useAction` + `useOptimisticAction` do next-safe-action: pattern limpo para todos os server actions

### What Was Inefficient

- SUMMARY.md files para fases 02-05 da fase 03 e 01-01 da fase 04 não foram criados na hora — acumulou dívida de doc que precisou ser retroativamente escrita no fechamento
- REQUIREMENTS.md traceability table ficou desatualizada ao longo do milestone — seria melhor atualizar após cada fase completa
- UAT humano (human-needed checks) ficou como dívida — as funcionalidades foram verificadas por tsc/lint/build/render mas não por testes manuais formais

### Patterns Established

- `proxy.ts` como único ponto de controle de acesso (não middleware.ts)
- `_helpers/mock-data.ts` centralizado — todas as telas lêem daqui, troca para DB é cirúrgica
- `loading.tsx` + `error.tsx` por segmento de rota — padrão Next.js 16 App Router adotado globalmente
- Error boundaries com `unstable_retry` para UX de retry sem navegação

### Key Lessons

1. Documentar summaries na hora da execução — não deixar para depois
2. Marcar requirements na traceability table assim que a fase termina
3. UAT humano deve ser feito por fase, não acumulado para o final
4. Mock-data-first é uma estratégia válida para MVP — próximo milestone (v1.1) faz a troca para DB

---

## Cross-Milestone Trends

| Milestone               | Phases | Plans | Duration | Deferred Items   |
| ----------------------- | ------ | ----- | -------- | ---------------- |
| v1.0 Hardening & Polish | 4      | 19    | 24 dias  | 4 (UAT + verify) |
