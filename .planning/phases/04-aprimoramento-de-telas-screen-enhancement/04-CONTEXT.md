# Phase 4: Aprimoramento de telas (Screen enhancement) - Context

**Gathered:** 2026-06-14
**Status:** Ready for planning

<domain>
## Phase Boundary

Completar as telas pendentes, resolver rotas placeholder, e aplicar polish de consistência de design-system em todo o app — tornando a experiência visualmente completa.

**Descoberta importante:** A maioria das telas SCRN-01..SCRN-06 já foi implementada em iterações anteriores e usa Drizzle/banco real (não mock-data). O app está além do estado mock-data-first documentado em PROJECT.md. Covers requirements SCRN-01 … SCRN-07.

**O que resta:**

1. QR code real em `/track/[id]` (atualmente simulação CSS)
2. View semanal no calendário de agendamentos
3. Auditoria e correção de completude em cada tela (SCRN-01..05)
4. Design-system polish pass completo em todas as telas do dashboard

</domain>

<decisions>
## Implementation Decisions

### QR Code real — `/track/[id]` (SCRN-06)

- **D-01:** Instalar `qrcode.react` e substituir a simulação CSS atual por um QR code real.
- **D-02:** O QR code deve codificar a **URL completa de rastreamento**: `${NEXT_PUBLIC_APP_URL}/track/${id}` — o cliente escaneia e abre diretamente a página de status da O.S. no celular.
- **D-03:** Estratégia de URL base: env var `NEXT_PUBLIC_APP_URL`. Criar como variável de ambiente pública no projeto Vercel.
- **D-04:** Fallback: se `NEXT_PUBLIC_APP_URL` não estiver definida, usar `window.location.origin` no componente client-side de QR.

### Completude das telas existentes (SCRN-01..SCRN-05)

- **D-05:** O planner/executor audita cada tela existente contra os critérios de sucesso dos requisitos SCRN-01..05 e corrige gaps específicos identificados.
- **D-06:** Nenhum problema pré-identificado pelo usuário — auditoria autônoma. O agente lê o código atual e os critérios do ROADMAP.md e decide o que falta.

### Design-system polish (SCRN-07)

- **D-07:** Scope: **pass completo em TODAS as telas do dashboard** (não só as novas).
- **D-08:** Checklist de auditoria por tela:
  - `font-mono` nos labels de status, rótulos de dados, números e códigos
  - Status chips usando `StatusChip` component (`rounded-full`, `uppercase`, `tracking-wider`) — não badges inline com estilos custom
  - Cores do sistema via tokens CSS (ex: `text-on-surface`, `bg-surface-container`) — não valores hardcoded
  - Tipografia consistente: Inter para body/headings, JetBrains Mono para códigos/labels técnicos
  - Heading hierarchy: `text-headline-md` para títulos de página, `text-title-md` para seções
- **D-09:** Nenhuma inconsistência pré-identificada pelo usuário — auditoria autônoma.

### Calendário de Agendamentos (SCRN-06)

- **D-10:** **Manter implementação custom** com date-fns — NÃO migrar para react-big-calendar. O calendário atual segue o design system "Industrial Precision" e está integrado.
- **D-11:** **Adicionar view semanal** nesta fase. Implementar no `appointments-client.tsx` seguindo o mesmo padrão do calendário existente (mês + lista já prontos).
- **D-12:** A view semanal deve exibir a grade dos 7 dias da semana com os agendamentos alocados por hora/slot, consistent com o design system.

### Claude's Discretion

- Tamanho exato do QR code em pixels (ex: 160x160 ou 200x200) dentro do card existente
- Se o QR code é renderizado no servidor ou client-side (provavelmente `"use client"` para acessar `window.location`)
- Nível de detalhe da view semanal (por hora ou por slot de 30min)
- Quais telas exatamente recebem o maior volume de correções no polish pass

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projeto — decisões bloqueadas

- `.planning/PROJECT.md` — design system "Industrial Precision", regras TS, Base UI render-prop, convenções de arquivo
- `.planning/REQUIREMENTS.md` — SCRN-01 … SCRN-07 requirement text com critérios de sucesso
- `.planning/ROADMAP.md` — Phase 4 goal, success criteria, plans TBD

### Arquivos-alvo desta fase

- `src/app/(public)/track/[id]/page.tsx` — rastreamento público, alvo do QR code real (D-01..D-04)
- `src/app/(dashboard)/appointments/appointments-client.tsx` — calendário custom, alvo da view semanal (D-10..D-12)
- `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` — dashboard estratégico, auditar vs SCRN-01
- `src/app/(dashboard)/analytics/_components/AnalyticsCharts.tsx` — charts Recharts (Recharts já instalado)
- `src/app/(dashboard)/inventory/alerts/_components/AlertsClient.tsx` — alertas de estoque, auditar vs SCRN-02
- `src/app/(dashboard)/inventory/purchase-orders/_components/PurchaseOrdersClient.tsx` — auditar vs SCRN-03
- `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` — auditar previsão de entrega vs SCRN-04
- `src/app/(dashboard)/orders/new/steps/step-checklist.tsx` — checklist integrado, auditar vs SCRN-05
- `src/_components/ui/status-chip.tsx` — componente de status chip padrão (usar este, não badges inline)
- `src/_helpers/nav.ts` — navegação já inclui todos os links das novas telas

### Componentes reutilizáveis chave

- `src/_components/ui/data-table.tsx` — tabela com scroll horizontal já configurado
- `src/_components/dashboard/metric-card.tsx` — MetricCard reutilizável
- `src/_components/dashboard/status-chart.tsx` — StatusChart reutilizável
- `src/_helpers/format.ts` — formatação centralizada (formatCurrency, formatDate, etc.)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `StatusChip` (`src/_components/ui/status-chip.tsx`): componente padrão para status — usar em vez de badges inline custom
- `MetricCard` (`src/_components/dashboard/metric-card.tsx`): card de KPI reutilizável
- `DataTable` (`src/_components/ui/data-table.tsx`): tabela com overflow-x-auto já configurado
- `formatCurrency`, `formatDate`, `formatLongDate` (`src/_helpers/format.ts`): formatação centralizada

### Established Patterns

- Páginas do dashboard: `page.tsx` (Server Component, busca dados) + `*-client.tsx` (Client Component, interatividade)
- Data-access: `src/_data-access/*.ts` — todos usam Drizzle/banco real (não mock-data!)
- Base UI: `render={<Component />}` prop, nunca `asChild`
- Zod schemas em `src/_schemas/` sem `.default()` (usar `defaultValues` no RHF)
- Calendário custom usa `date-fns` + `ptBR` locale (não react-big-calendar)
- Gráficos usam Recharts (`recharts`) — já instalado e usado em `AnalyticsCharts.tsx` e `finance-charts.tsx`

### Integration Points

- `src/_helpers/nav.ts`: navegação já tem todos os links (analytics, alertas, ordens de compra)
- `src/app/(public)/track/[id]/page.tsx`: rota pública separada da rota de dashboard
- `src/app/(dashboard)/appointments/appointments-client.tsx`: adicionar terceiro botão "Semana" no switcher de view

### Descobertas de Codebase

- O app usa banco Drizzle real — `src/_data-access/*.ts` importam `db` de `@/_db`
- A tela de analytics usa KPIs: Receita 12 meses, Total O.S., Margem Líquida, NPS, Clientes Ativos
- A tela de alertas já tem cards CRÍTICO/ATENÇÃO com cores corretas do sistema
- O checklist de intake (`step-checklist.tsx`) está integrado no `order-wizard.tsx`
- O QR code em `/track/[id]` é uma simulação CSS com grade 5x5 hardcoded

</code_context>

<specifics>
## Specific Ideas

- QR code: gerar URL `${process.env.NEXT_PUBLIC_APP_URL}/track/${orderId}` — cliente escaneia e abre a página de status no celular
- View semanal no calendário: adicionar como terceira opção no switcher "Mês | Semana | Lista" — seguir mesmo padrão visual do view de mês existente
- Design-system polish: foco especial em `font-mono` para labels de status, preços e códigos em todos os formulários e tabelas

</specifics>

<deferred>
## Deferred Ideas

- **react-big-calendar**: O usuário confirmou manter o calendário custom. react-big-calendar não será instalado nesta fase.
- **Drizzle mock-data migration**: O app já usa banco real — a transição de mock-data-first já ocorreu. Sem ação necessária.

</deferred>

---

_Phase: 4-Aprimoramento de telas (Screen enhancement)_
_Context gathered: 2026-06-14_
