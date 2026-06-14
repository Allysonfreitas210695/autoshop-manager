# Phase 4: Aprimoramento de telas (Screen enhancement) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-14
**Phase:** 4-aprimoramento-de-telas-screen-enhancement
**Areas discussed:** QR Code real (/track/[id]), Completude das telas existentes, Design-system polish (SCRN-07), Calendário de Agendamentos

---

## QR Code real (/track/[id])

| Option                        | Description                                                                                            | Selected |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| URL da página de rastreamento | QR aponta para https://dominio.com/track/{id} — cliente escaneia e abre a página de status diretamente | ✓        |
| Só o ID da O.S.               | QR contém apenas o código da O.S. (ex: OS-0042)                                                        |          |

**User's choice:** URL da página de rastreamento (Recomendado)
**Notes:** QR deve usar `NEXT_PUBLIC_APP_URL` como base da URL. Biblioteca: `qrcode.react`.

---

| Option                               | Description                                                                              | Selected |
| ------------------------------------ | ---------------------------------------------------------------------------------------- | -------- |
| NEXT_PUBLIC_APP_URL                  | Criar env var pública. Componente usa `process.env.NEXT_PUBLIC_APP_URL + '/track/' + id` | ✓        |
| window.location.origin (client-side) | Detectar URL no browser. Funciona sem env var, requer `'use client'`                     |          |

**User's choice:** NEXT_PUBLIC_APP_URL (Recomendado)
**Notes:** Necessário criar a env var no Vercel.

---

## Completude das telas existentes

| Option                              | Description                                                | Selected |
| ----------------------------------- | ---------------------------------------------------------- | -------- |
| Verificar e ajustar onde necessário | Planner audita cada tela contra SCRN-01..05 e corrige gaps | ✓        |
| Aceitar como estão                  | Telas passam no build — avançar direto para polish e QR    |          |
| Auditoria detalhada primeiro        | Ler designs originais e mapear gaps antes de planejar      |          |

**User's choice:** Verificar e ajustar onde necessário (Recomendado)

---

| Option                                    | Description                                    | Selected |
| ----------------------------------------- | ---------------------------------------------- | -------- |
| Não, deixa o planner auditar              | Sem conhecimento prévio de problemas           | ✓        |
| Analytics precisa de mais métricas        | Pode estar faltando KPIs do design estratégico |          |
| Previsão de entrega na O.C. está faltando | SCRN-04 pode estar incompleto                  |          |

**User's choice:** Não, deixa o planner auditar
**Notes:** Auditoria autônoma pelo agente de planejamento.

---

## Design-system polish (SCRN-07)

| Option                              | Description                                                              | Selected |
| ----------------------------------- | ------------------------------------------------------------------------ | -------- |
| Pass completo em todas as telas     | Auditar font-mono, status chips, cores, tipografia em todos os segmentos | ✓        |
| Só telas novas da Fase 4            | Aplicar polish apenas nas telas criadas/modificadas nesta fase           |          |
| Só o que estiver nitidamente errado | Corrigir apenas inconsistências óbvias                                   |          |

**User's choice:** Pass completo em todas as telas (Recomendado)

---

| Option                       | Description                                               | Selected |
| ---------------------------- | --------------------------------------------------------- | -------- |
| Não, deixa o agente auditar  | Sem feedback visual prévio                                | ✓        |
| Status chips inconsistentes  | Algumas telas usam badges diferentes do StatusChip padrão |          |
| Fontes e tamanhos misturados | Alguns headings não seguem o sistema tipográfico          |          |

**User's choice:** Não, deixa o agente auditar
**Notes:** Auditoria autônoma.

---

## Calendário de Agendamentos

| Option                         | Description                                                      | Selected |
| ------------------------------ | ---------------------------------------------------------------- | -------- |
| Manter implementação custom    | Calendário atual segue design system, tem mês + lista, já pronto | ✓        |
| Migrar para react-big-calendar | Oferece views de semana e agenda, requer customização pesada     |          |

**User's choice:** Manter implementação custom (Recomendado)
**Notes:** NÃO instalar react-big-calendar.

---

| Option                    | Description                                               | Selected |
| ------------------------- | --------------------------------------------------------- | -------- |
| Está completo como está   | Mês e lista suficientes para o operador                   |          |
| View de semana seria útil | Adicionar view semanal para visualizar carga do dia a dia | ✓        |

**User's choice:** View de semana seria útil

---

| Option                        | Description                                          | Selected |
| ----------------------------- | ---------------------------------------------------- | -------- |
| Adicionar nesta fase (Fase 4) | Implementar view semanal no appointments-client.tsx  | ✓        |
| Deferir para próxima fase     | View de mês + lista já cobre o caso de uso principal |          |

**User's choice:** Adicionar nesta fase (Fase 4)

---

## Claude's Discretion

- Tamanho do QR code em pixels
- Renderização do QR no server ou client-side
- Nível de detalhe da view semanal (por hora ou por slot de 30min)
- Quais telas recebem o maior volume de correções no polish pass

## Deferred Ideas

- **react-big-calendar**: Confirmado não usar nesta fase — manter implementação custom.
- **Mock-data → Drizzle migration**: Já concluída em iterações anteriores, não requer ação.
