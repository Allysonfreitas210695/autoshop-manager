# PLAN.md — AutoShop Manager (Precision Auto)

> Atualizado em: 2026-05-28 | Status: Fases 6–10 concluídas

---

## Estado atual

| Rota                  | Status          | Tela de referência                                   |
| --------------------- | --------------- | ---------------------------------------------------- |
| `/`                   | ✅ Implementado | `dashboard_precision_auto`                           |
| `/orders`             | ✅ Implementado | `gest_o_de_o.s._precision_auto`                      |
| `/orders/new`         | ✅ Implementado | `nova_ordem_de_servi_o_precision_auto` + passos 2–4  |
| `/orders/[id]/budget` | ✅ Implementado | `aprova_o_de_or_amento_precision_auto`               |
| `/orders/[id]/print`  | ✅ Implementado | `impress_o_da_o.s._com_pagamento_pix_precision_auto` |
| `/customers`          | ✅ Implementado | `base_de_clientes_precision_auto`                    |
| `/customers/[id]`     | ✅ Implementado | `perfil_do_cliente_hist_rico_precision_auto`         |
| `/inventory`          | ✅ Implementado | `controle_de_estoque_precision_auto`                 |
| `/inventory/new`      | ✅ Implementado | `adicionar_novo_item_ao_estoque_precision_auto`      |
| `/finance`            | ✅ Implementado | `gest_o_financeira_precision_auto`                   |
| `/finance/reports`    | ✅ Implementado | `relat_rios_financeiros_precision_auto`              |
| `/login`              | ✅ Implementado | —                                                    |
| `/register`           | ✅ Implementado | —                                                    |
| `/appointments`       | ⚠️ Placeholder  | —                                                    |
| `/track/[id]`         | ⚠️ Placeholder  | —                                                    |

---

## Telas de design disponíveis (referência)

Pasta base: `stitch_oficina_mecanica/`

| Pasta                                                    | Descrição                                              | Status          |
| -------------------------------------------------------- | ------------------------------------------------------ | --------------- |
| `dashboard_precision_auto`                               | Dashboard operacional                                  | ✅ Implementado |
| `dashboard_estrat_gico_precision_auto`                   | Dashboard estratégico (métricas avançadas)             | ⏳ Pendente     |
| `gest_o_de_o.s._precision_auto`                          | Listagem de O.S.                                       | ✅ Implementado |
| `nova_ordem_de_servi_o_precision_auto`                   | Nova O.S. — Passo 01: Cliente & Veículo                | ✅ Implementado |
| `nova_o.s._passo_02_descri_o_precision_auto`             | Nova O.S. — Passo 02: Descrição e diagnóstico          | ✅ Implementado |
| `nova_o.s._passo_03_pe_as_estoque_precision_auto`        | Nova O.S. — Passo 03: Peças & Estoque + Mão de Obra    | ✅ Implementado |
| `nova_o.s._passo_04_assinatura_precision_auto`           | Nova O.S. — Passo 04: Resumo + Assinatura digital      | ✅ Implementado |
| `nova_ordem_de_servi_o_com_checklist_precision_auto`     | Nova O.S. com checklist de entrada                     | ⏳ Pendente     |
| `aprova_o_de_or_amento_precision_auto`                   | Aprovação de orçamento pelo cliente                    | ✅ Implementado |
| `impress_o_da_ordem_de_servi_o_precision_auto`           | Impressão / PDF da O.S.                                | ✅ Implementado |
| `impress_o_da_o.s._com_pagamento_pix_precision_auto`     | Impressão da O.S. com QR Code PIX                      | ✅ Implementado |
| `base_de_clientes_precision_auto`                        | Listagem de clientes com painel lateral de detalhes    | ✅ Implementado |
| `perfil_do_cliente_hist_rico_precision_auto`             | Ficha técnica do cliente: veículos + histórico de O.S. | ✅ Implementado |
| `controle_de_estoque_precision_auto`                     | Listagem de peças e insumos (tabs por categoria)       | ✅ Implementado |
| `adicionar_novo_item_ao_estoque_precision_auto`          | Formulário de cadastro de novo item                    | ✅ Implementado |
| `estoque_alerta_de_itens_baixos_precision_auto`          | Alertas de estoque crítico                             | ⏳ Pendente     |
| `gerar_ordem_de_compra_precision_auto`                   | Geração de ordem de compra                             | ⏳ Pendente     |
| `ordem_de_compra_com_previs_o_de_entrega_precision_auto` | Ordem de compra com previsão de entrega                | ⏳ Pendente     |
| `gest_o_financeira_precision_auto`                       | Visão geral financeira: contas, fluxo de caixa         | ✅ Implementado |
| `relat_rios_financeiros_precision_auto`                  | Relatório de lucratividade com gráficos                | ✅ Implementado |
| `industrial_precision`                                   | Design System de referência                            | ✅ Aplicado     |

---

## Fases concluídas

### ✅ FASE 6 — Nova O.S. Multi-Step (Wizard completo)

**Rota:** `/orders/new`
**Commit:** parte do commit `104debf`

**Arquivos implementados:**

```
src/app/(dashboard)/orders/new/
├── page.tsx                    ✅ Server Component wrapper
├── order-wizard.tsx            ✅ Client component: estado global dos 4 passos
├── step-indicator.tsx          ✅ Barra de progresso visual
└── steps/
    ├── step-01-client.tsx      ✅ Busca de cliente + dados do veículo
    ├── step-02-description.tsx ✅ Relato + diagnóstico + tipo + prioridade
    ├── step-03-parts.tsx       ✅ Busca de peças + tabela + resumo
    └── step-04-signature.tsx   ✅ Resumo financeiro + canvas de assinatura
```

---

### ✅ FASE 7 — Módulo de Clientes

**Rotas:** `/customers`, `/customers/[id]`
**Commit:** parte do commit `104debf`

**Arquivos implementados:**

```
src/app/(dashboard)/customers/
├── page.tsx                    ✅ Lista de clientes (Server Component)
├── customers-client.tsx        ✅ Client: busca, filtro, painel lateral
├── customer-detail-panel.tsx   ✅ Sheet lateral com histórico
└── [id]/
    └── page.tsx                ✅ Ficha técnica (Server Component com mock data)
```

---

### ✅ FASE 8 — Módulo de Estoque

**Rotas:** `/inventory`, `/inventory/new`
**Commit:** parte do commit `104debf`

**Arquivos implementados:**

```
src/app/(dashboard)/inventory/
├── page.tsx                    ✅ Listagem com tabs de categoria
├── inventory-client.tsx        ✅ Client component com filtros e tabs
└── new/
    ├── page.tsx                ✅ Server Component wrapper
    └── _components/
        └── NewPartForm.tsx     ✅ Formulário react-hook-form + Zod
```

---

### ✅ FASE 9 — Módulo Financeiro

**Rotas:** `/finance`, `/finance/reports`
**Commit:** `240b01e`

**Arquivos implementados:**

```
src/app/(dashboard)/finance/
├── page.tsx                    ✅ Visão geral financeira (KPIs + fluxo de caixa + transações)
├── reports/
│   └── page.tsx                ✅ Relatório de lucratividade com gráficos
└── finance-charts.tsx          ✅ Client component com Recharts (BarChart + LineChart)
```

---

### ✅ FASE 10 — Aprovação de Orçamento e Impressão de O.S.

**Rotas:** `/orders/[id]/budget`, `/orders/[id]/print`
**Commit:** `a7bdec8`

**Arquivos implementados:**

```
src/app/(dashboard)/orders/[id]/
├── budget/
│   └── page.tsx                ✅ Aprovação de orçamento com checklist por item
└── print/
    └── page.tsx                ✅ Layout de impressão com QR Code PIX
```

---

### ✅ REFATORAÇÃO — Extração de Client Components

**Commit:** `8500953`

Seguindo o padrão Next.js 16 (Server Component por padrão, `"use client"` só quando necessário):

```
src/app/(auth)/login/_components/LoginForm.tsx       ✅ Extraído de page.tsx
src/app/(auth)/register/_components/RegisterForm.tsx ✅ Extraído de page.tsx
src/app/(dashboard)/orders/_components/OrdersClient.tsx ✅ Extraído de page.tsx
src/app/(dashboard)/inventory/new/_components/NewPartForm.tsx ✅ Extraído de page.tsx
```

---

## Estrutura atual do projeto

```
src/
├── _actions/          # Server actions (Next.js 16 private folder)
├── _components/       # Componentes globais reutilizáveis
│   ├── dashboard/     # Componentes específicos do dashboard
│   ├── shared/        # Componentes compartilhados entre módulos
│   └── ui/            # Design system (DataTable, StatusChip, MetricCard, etc.)
├── _db/               # Drizzle ORM: schema e migrations
│   ├── schema/
│   └── migrations/
├── _hooks/            # Custom React hooks
├── _lib/              # Utilitários, mock-data, helpers
├── _schemas/          # Schemas Zod globais
├── _styles/           # Estilos globais
└── app/
    ├── (auth)/        # Login e Register
    ├── (dashboard)/   # Módulos principais (protegidos)
    └── (public)/      # Rotas públicas (track de O.S.)
```

---

## Roadmap de fases pendentes

---

### FASE 11 — Agendamentos

**Rota:** `/appointments`
**Prioridade:** Alta

#### O que implementar

- Calendário mensal/semanal de agendamentos
- Criação de novo agendamento (cliente, veículo, serviço, data/hora, mecânico)
- Integração com lista de O.S. (converter agendamento em O.S. aberta)
- Status de agendamento: Confirmado | Pendente | Cancelado | Concluído

**Arquivos a criar:**

```
src/app/(dashboard)/appointments/
├── page.tsx                    # Server Component wrapper
├── appointments-client.tsx     # Client: calendário interativo
├── appointment-form.tsx        # Form de novo agendamento
└── appointment-card.tsx        # Card de agendamento no calendário
```

---

### FASE 12 — Alertas de Estoque e Ordens de Compra

**Rotas:** `/inventory/alerts`, `/inventory/purchase-orders`
**Prioridade:** Média-Alta

#### O que implementar

**`/inventory/alerts`** (`estoque_alerta_de_itens_baixos_precision_auto`)

- Lista de itens com estoque < mínimo
- Destaque visual: CRÍTICO (vermelho) | ATENÇÃO (laranja)
- Botão "PEDIR" com modal de ordem de compra rápida

**`/inventory/purchase-orders/new`** (`gerar_ordem_de_compra_precision_auto`)

- Formulário de geração de ordem de compra
- Seleção de fornecedor e itens
- Previsão de entrega (`ordem_de_compra_com_previs_o_de_entrega_precision_auto`)

**Arquivos a criar:**

```
src/app/(dashboard)/inventory/
├── alerts/
│   └── page.tsx                # Alertas de estoque baixo
└── purchase-orders/
    ├── page.tsx                # Lista de ordens de compra
    └── new/
        └── page.tsx            # Formulário de nova ordem de compra
```

---

### FASE 13 — Dashboard Estratégico

**Rota:** `/` (tab alternativa) ou `/analytics`
**Prioridade:** Média

#### O que implementar

**Dashboard Estratégico** (`dashboard_estrat_gico_precision_auto`)

- Métricas avançadas: NPS de clientes, taxa de retorno, lifetime value
- Gráficos de tendência histórica (12 meses)
- Top mecânicos por performance
- Alertas preditivos de manutenção preventiva
- Integração com módulo financeiro

---

### FASE 14 — Rastreamento Público de O.S.

**Rota:** `/track/[id]`
**Prioridade:** Média-Baixa

#### O que implementar

- Página pública (sem autenticação) para cliente rastrear status da O.S.
- Exibe: status atual, etapas concluídas, previsão de entrega, mecânico responsável
- QR Code gerado na impressão da O.S. aponta para esta rota
- Possibilidade de aprovação de orçamento inline (integrar com `/orders/[id]/budget`)

**Arquivos a criar:**

```
src/app/(public)/track/
└── [id]/
    └── page.tsx                # Página pública de rastreamento
```

---

### FASE 15 — O.S. com Checklist de Entrada

**Rota:** `/orders/new` (extensão do wizard)
**Prioridade:** Baixa

#### O que implementar

**Checklist de entrada veicular** (`nova_ordem_de_servi_o_com_checklist_precision_auto`)

- Passo adicional (Passo 1.5 ou passo separado) após dados do veículo
- Checklist visual: lataria, pneus, faróis, espelhos, combustível, etc.
- Observações por item (campo de texto rápido)
- Assinatura ou confirmação do cliente no check-in

---

### FASE 16 — Integração com Banco de Dados (Drizzle ORM + Supabase)

**Prioridade:** Alta (quando MVP for validado)

#### O que implementar

- Substituir todos os mock data por queries Drizzle reais
- Schema do banco já existe em `src/_db/schema/`
- Migrations já configuradas em `src/_db/migrations/`
- Server Actions em `src/_actions/` para cada módulo
- Conectar autenticação (Better Auth / Supabase Auth) ao banco
- Implementar CRUD completo para: Clientes, Veículos, O.S., Peças, Transações

**Sequência recomendada:**

1. Clientes e Veículos (`/customers`)
2. Ordens de Serviço (`/orders`)
3. Estoque (`/inventory`)
4. Financeiro (`/finance`)
5. Agendamentos (`/appointments`)

---

## Padrões obrigatórios a seguir em todas as fases

### Design System "Industrial Precision"

```
Background:   #051424  → var(--surface)
Surface:      #122131  → var(--surface-container)
Primary:      #c8c6c5  → cinza aço
Secondary:    #adc6ff  → azul segurança (ativo, links, chips selecionados)
Tertiary:     #ffb690  → laranja alerta
Error:        #ffb4ab

Status chips (always font-mono, uppercase, rounded-full):
  pending:    bg-status-pending    (#475569)
  in_progress: bg-status-progress  (#adc6ff)
  completed:  bg-status-completed  (#22C55E)
  delayed:    bg-status-delayed    (#ffb690)
```

### Tipografia

```
Display/Body:        Inter (700/600/400)
Labels/Código:       JetBrains Mono (500, tracking: 0.05em)
Headers de tabela:   font-mono uppercase tracking-wider text-on-surface-variant/60
```

### Componentes base (reutilizar sempre)

| Componente                               | Uso                             |
| ---------------------------------------- | ------------------------------- |
| `<DataTable columns data getRowId />`    | Todas as tabelas                |
| `<StatusChip status />`                  | Chips de status de O.S.         |
| `<MetricCard label value icon accent />` | Cards de KPI animados           |
| `<ServiceTimeline nodes />`              | Timelines horizontais/verticais |
| `<StatusChart data />`                   | Gráfico de pizza de status      |

### Regras TypeScript

- Sem `any`, sem `as unknown`
- Server Components por padrão — `"use client"` só quando interatividade necessária
- Mock data em `src/_lib/mock-data.ts` com tipos exportados
- Schemas Zod em `src/_schemas/` — sem `.default()` quando for form (usar `defaultValues` do react-hook-form)
- Para Select controlado: sempre usar `<Controller>` do react-hook-form (não `watch()`)
- Para Base UI components (`@base-ui/react`): usar `render` prop em vez de `asChild`

### Estrutura de arquivo por módulo

```
src/app/(dashboard)/[module]/
├── page.tsx              # Server Component (lógica de dados/redirect)
├── [module]-client.tsx   # Client Component (estado, interatividade)
└── _components/          # Sub-componentes específicos do módulo
    └── [ComponentName].tsx
```

### ESLint

- Imports: sempre ordenados (eslint-plugin-simple-import-sort)
- `useEffect(() => setState(x), [])` → usar `useEffect(() => { setState(x); }, [])`
- Verificar com `npm run lint` antes de considerar a tarefa concluída

---

## Checklist de conclusão por fase

Para cada fase, antes de marcar como concluída:

- [ ] `npx tsc --noEmit` — zero erros
- [ ] `npm run lint` — zero erros
- [ ] `npm run build` — build bem-sucedido
- [ ] Todas as rotas da fase renderizam sem crash
- [ ] Componentes `DataTable` com dados mock funcionando
- [ ] Responsividade testada (mobile: sidebar collapsível, tabelas com scroll horizontal)
- [ ] Padrões de design (font-mono nos labels, status chips, cores do sistema) aplicados

---

## Dependências adicionais necessárias

| Pacote               | Fase    | Uso                                       |
| -------------------- | ------- | ----------------------------------------- |
| `react-big-calendar` | Fase 11 | Calendário de agendamentos                |
| `date-fns`           | Fase 11 | Formatação de datas no calendário         |
| `qrcode.react`       | Fase 14 | QR Code para rastreamento público de O.S. |

---

## Notas de arquitetura

1. **Mock data first:** Todas as fases usam dados mock em `src/_lib/mock-data.ts`. A integração com Drizzle ORM vem na Fase 16, após validação do MVP.

2. **Base UI vs Radix UI:** Este projeto usa `@base-ui/react` (não Radix). Diferenças críticas:
   - `asChild` **não existe** → usar `render={<Component />}` prop
   - `SheetTrigger render={<Button />}` em vez de `<SheetTrigger asChild><Button>`
   - Verificar API de cada componente em `src/_components/ui/*.tsx` antes de usar

3. **Next.js 16 (Turbopack):** Convenção de pastas privadas (`_lib`, `_hooks`, `_schemas`, `_components`, `_db`, `_actions`). O arquivo `middleware.ts` está deprecado — foi renomeado para `proxy.ts`.

4. **React Compiler:** O projeto usa React Compiler (babel plugin). Evitar `watch()` do react-hook-form diretamente em JSX — usar `Controller` ou `useWatch`.

5. **Padrão de extração de componentes:** `page.tsx` é sempre Server Component. Lógica interativa vai em `[module]-client.tsx` ou em `_components/[ComponentName].tsx` com `"use client"`.
