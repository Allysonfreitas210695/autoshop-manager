# PLAN.md — AutoShop Manager (Precision Auto)

> Gerado em: 2026-05-27 | Status: Em progresso

---

## Estado atual

| Rota            | Status            | Tela de referência                                  |
| --------------- | ----------------- | --------------------------------------------------- |
| `/`             | ✅ Implementado   | `dashboard_precision_auto`                          |
| `/orders`       | ✅ Implementado   | `gest_o_de_o.s._precision_auto`                     |
| `/login`        | ✅ Implementado   | —                                                   |
| `/register`     | ✅ Implementado   | —                                                   |
| `/orders/new`   | ⚠️ Só redireciona | `nova_ordem_de_servi_o_precision_auto` + passos 2–4 |
| `/customers`    | ⚠️ Placeholder    | `base_de_clientes_precision_auto`                   |
| `/inventory`    | ⚠️ Placeholder    | `controle_de_estoque_precision_auto`                |
| `/finance`      | ⚠️ Placeholder    | `gest_o_financeira_precision_auto`                  |
| `/appointments` | ⚠️ Placeholder    | —                                                   |

---

## Telas de design disponíveis (referência)

Pasta base: `stitch_oficina_mecanica/`

| Pasta                                                    | Descrição                                              |
| -------------------------------------------------------- | ------------------------------------------------------ |
| `dashboard_precision_auto`                               | ✅ Dashboard operacional                               |
| `dashboard_estrat_gico_precision_auto`                   | Dashboard estratégico (métricas avançadas)             |
| `gest_o_de_o.s._precision_auto`                          | ✅ Listagem de O.S.                                    |
| `nova_ordem_de_servi_o_precision_auto`                   | Nova O.S. — Passo 01: Cliente & Veículo                |
| `nova_o.s._passo_02_descri_o_precision_auto`             | Nova O.S. — Passo 02: Descrição e diagnóstico          |
| `nova_o.s._passo_03_pe_as_estoque_precision_auto`        | Nova O.S. — Passo 03: Peças & Estoque + Mão de Obra    |
| `nova_o.s._passo_04_assinatura_precision_auto`           | Nova O.S. — Passo 04: Resumo + Assinatura digital      |
| `nova_ordem_de_servi_o_com_checklist_precision_auto`     | Nova O.S. com checklist de entrada                     |
| `aprova_o_de_or_amento_precision_auto`                   | Aprovação de orçamento pelo cliente                    |
| `impress_o_da_ordem_de_servi_o_precision_auto`           | Impressão / PDF da O.S.                                |
| `impress_o_da_o.s._com_pagamento_pix_precision_auto`     | Impressão da O.S. com QR Code PIX                      |
| `base_de_clientes_precision_auto`                        | Listagem de clientes com painel lateral de detalhes    |
| `perfil_do_cliente_hist_rico_precision_auto`             | Ficha técnica do cliente: veículos + histórico de O.S. |
| `controle_de_estoque_precision_auto`                     | Listagem de peças e insumos (tabs por categoria)       |
| `adicionar_novo_item_ao_estoque_precision_auto`          | Formulário de cadastro de novo item                    |
| `estoque_alerta_de_itens_baixos_precision_auto`          | Alertas de estoque crítico                             |
| `gerar_ordem_de_compra_precision_auto`                   | Geração de ordem de compra                             |
| `ordem_de_compra_com_previs_o_de_entrega_precision_auto` | Ordem de compra com previsão de entrega                |
| `gest_o_financeira_precision_auto`                       | Visão geral financeira: contas, fluxo de caixa         |
| `relat_rios_financeiros_precision_auto`                  | Relatório de lucratividade com gráficos                |
| `industrial_precision`                                   | Design System de referência                            |

---

## Roadmap de fases restantes

---

### FASE 6 — Nova O.S. Multi-Step (Wizard completo)

**Rota:** `/orders/new`
**Prioridade:** Alta — é o fluxo mais crítico do sistema

#### O que implementar

O wizard substitui o simples redirect atual e implementa os 4 passos completos.

**Layout base:**

- Barra de progresso superior (4 passos com indicador visual de step ativo/concluído)
- Footer fixo com botões "← Anterior" | "Salvar Rascunho" | "Próximo Passo →"
- Rodapé com contexto da O.S. (cliente, veículo, data de entrada)
- Status chip "AGUARDANDO DIAGNÓSTICO" no topo direito

**Passo 01 — Cliente & Veículo** (`nova_ordem_de_servi_o_precision_auto`)

- Campo de busca de cliente (por CPF ou nome)
- Bloco "Nenhum cliente selecionado" com link "Novo Cadastro Rápido"
- Campos do veículo: Placa, KM Atual, Modelo/Versão

**Passo 02 — Descrição** (`nova_o.s._passo_02_descri_o_precision_auto`)

- Textarea "Relato do Cliente" (o que o cliente descreveu)
- Textarea "Diagnóstico Inicial" (observações técnicas, códigos OBD-II)
- Seletor de tipo de serviço: Preventiva | Corretiva | Garantia | Estética (radio cards com ícone)
- Select de Prioridade: Normal | Alta | Urgente

**Passo 03 — Peças & Estoque** (`nova_o.s._passo_03_pe_as_estoque_precision_auto`)

- Campo de busca de peças do estoque
- Tabela de "Itens Adicionados": peça, categoria, qtd, valor unit., subtotal, ações
- Linha especial "Adicionar Mão de Obra Personalizada"
- Painel lateral "Resumo do Pedido": subtotal peças, mão de obra, descontos, total
- Badge "Disponibilidade: X itens em estoque" | "Baixo Estoque: Y itens"

**Passo 04 — Mão de Obra & Assinatura** (`nova_o.s._passo_04_assinatura_precision_auto`)

- Seção "Resumo Financeiro": total peças, total mão de obra, valor total
- Canvas de assinatura digital (captura por mouse/touch) — lib `react-signature-canvas` ou `signature_pad`
- Checkbox de declaração de concordância com orçamento
- Botão "Gerar O.S." (primary, orange) em vez de "Próximo Passo"
- Barra de progresso: "Preenchimento: 100%"

**Arquivos a criar:**

```
src/app/(dashboard)/orders/new/
├── page.tsx                    # Server component wrapper + layout do wizard
├── order-wizard.tsx            # Client component: estado global dos 4 passos
├── step-indicator.tsx          # Barra de progresso visual dos passos
├── steps/
│   ├── step-01-client.tsx      # Busca de cliente + dados do veículo
│   ├── step-02-description.tsx # Relato + diagnóstico + tipo + prioridade
│   ├── step-03-parts.tsx       # Busca de peças + tabela + resumo
│   └── step-04-signature.tsx   # Resumo financeiro + canvas de assinatura
└── order-wizard-schema.ts      # Zod schema multi-step (objeto por passo)
```

**Padrões de código:**

- `"use client"` apenas nos `step-*.tsx` e `order-wizard.tsx`
- `page.tsx` é Server Component
- Estado do wizard via `useReducer` ou `useState` objeto com campos dos 4 passos
- Validação Zod por passo (não valida tudo de uma vez)
- `useForm` do react-hook-form por passo com `zodResolver` por step schema

---

### FASE 7 — Módulo de Clientes

**Rotas:** `/customers`, `/customers/[id]`
**Prioridade:** Alta

#### O que implementar

**`/customers` — Lista de Clientes** (`base_de_clientes_precision_auto`)

- Header: "Gestão de Clientes" + botão "Cadastrar Novo Cliente" (primary)
- Barra de busca global (por nome, placa ou CPF)
- Botões "Filtros" e "Exportar"
- `DataTable` com colunas: Nome do Cliente | CPF/CNPJ | Telefone | Veículo Principal | Última Visita | Ações (menu de 3 pontos)
- Painel lateral deslizante (Sheet) ao clicar no cliente:
  - Cabeçalho: Nome, CPF, dados de contato
  - Cards: "Total Gasto" e "Visitas" com valores animados
  - "Histórico de Manutenções": lista de O.S. com status chip e valor
  - Botão "Abrir Nova O.S. para este Cliente"

**`/customers/[id]` — Ficha Técnica** (`perfil_do_cliente_hist_rico_precision_auto`)

- Breadcrumb: "← Voltar para Clientes"
- Título: "Ficha Técnica do Cliente" + botões "Editar Cadastro" e "Nova Ordem de Serviço"
- Card do cliente: avatar, nome, CPF, e-mail, telefone, endereço
- Seção "Frota de Veículos": cards horizontais por veículo (modelo, placa, ano, km)
- Seção "Histórico de Ordens de Serviço": `DataTable` com O.S., data, serviço realizado, total, status
- Seção "Próximas Manutenções Programadas": `ServiceTimeline` horizontal com alertas preditivos

**Arquivos a criar:**

```
src/app/(dashboard)/customers/
├── page.tsx                    # Lista de clientes (Server Component)
├── customers-client.tsx        # Client: busca, filtro, painel lateral
├── customer-detail-panel.tsx   # Sheet lateral com histórico
└── [id]/
    └── page.tsx                # Ficha técnica (Server Component com mock data)
```

**Mock data a adicionar em `src/lib/mock-data.ts`:**

```ts
MockCustomer: {
  (id,
    name,
    cpf,
    phone,
    email,
    address,
    lastVisit,
    totalSpent,
    visits,
    vehicles);
}
MockCustomerOrder: {
  (id, vehicle, date, service, total, status);
}
```

---

### FASE 8 — Módulo de Estoque

**Rotas:** `/inventory`, `/inventory/new`
**Prioridade:** Média-Alta

#### O que implementar

**`/inventory` — Controle de Estoque** (`controle_de_estoque_precision_auto`)

- Header: "Controle de Estoque" + botões "Entrada (+)" e "Adicionar Item"
- Cards de métricas: Total de Itens | Unidades em Alerta | Valor Total em Estoque
- Tabs de categoria: Todos | Motor | Freios | Filtros | Suspensão | Ignição
- `DataTable` com colunas: Código SKU | Peça/Descrição | Categoria | Fornecedor | Qtd. Atual | Estoque Mínimo | Preço de Custo | Valor Total | Ações
- Status chips de estoque: "CRÍTICO" (red), "ATENÇÃO" (orange), (normal sem chip)
- Paginação

**`/inventory/new` — Adicionar Item** (`adicionar_novo_item_ao_estoque_precision_auto`)

- Título: "Ficha Técnica do Item" + botões "Cancelar" e "Salvar Item"
- Seção "Informações Gerais": Nome do Item, SKU/Código de Referência, Categoria (select), Fabricante/Marca, Fornecedor Principal
- Seção "Controle de Estoque": Unidade de Medida (select), Qtd. Atual, Estoque Mínimo (input com borda vermelha se 0), Localização no Depósito
- Textarea: Notas Técnicas / Descrição
- Painel lateral direito "Financeiro": Preço de Custo, Preço de Venda, Markup Automático (%)
- Upload de foto do produto

**Alertas de Estoque** (widget no dashboard e página dedicada):

- Lista de itens com estoque < mínimo
- Botão "PEDIR" para cada item (abre modal de ordem de compra rápida)

**Arquivos a criar:**

```
src/app/(dashboard)/inventory/
├── page.tsx                    # Listagem (pode ser Client Component para tabs)
├── new/
│   └── page.tsx                # Formulário de cadastro
└── inventory-form.tsx          # Form react-hook-form + zod para o item
```

**Schema Zod a criar em `src/schemas/inventory.ts`:**

```ts
inventoryItemSchema: {
  (name,
    sku,
    category,
    brand,
    supplier,
    unit,
    quantity,
    minQuantity,
    location,
    costPrice,
    sellPrice,
    notes);
}
```

---

### FASE 9 — Módulo Financeiro

**Rotas:** `/finance`, `/finance/reports`
**Prioridade:** Média

#### O que implementar

**`/finance` — Visão Geral** (`gest_o_financeira_precision_auto`)

- Header: "Financeiro" + barra de busca de transações + botão "Quick Actions"
- Filtros de período: Mensal | Trimestral | Anual | data custom
- Cards de métricas (verticais, com ícone e cor):
  - "Contas a Receber" (verde ↑) — valor total pendente
  - "Faturamento Mensal" (azul ↑) — total faturado no mês
  - "Despesas Pendentes" (laranja !) — total de despesas em aberto
- Gráfico "Fluxo de Caixa" (BarChart com Recharts): Receitas vs Despesas por semana/mês
- Tabela "Transações Recentes": data | descrição | categoria | tipo (Serviço/Estoque) | valor | status chip

**`/finance/reports` — Relatório de Lucratividade** (`relat_rios_financeiros_precision_auto`)

- Período header: "Relatório de Lucratividade — Outubro 2023" + filtros + "Exportar PDF"
- Cards horizontais de KPIs: Ticket Médio O.S. | Margem Líquida % | Volume O.S. | Lucro Líquido
- Gráfico "Fluxo de Caixa Mensal" (LineChart: Receitas vs Despesas)
- Gráfico "Custos Fixos vs Variáveis" (pizza/donut)
- Tabela "Detalhamento de Fluxo": categoria | faturamento bruto | custo peças | mão de obra | lucro líquido | status
- Cards de resumo: "Alocação de Tempo vs Receita" e "Alertas Financeiros"

**Arquivos a criar:**

```
src/app/(dashboard)/finance/
├── page.tsx                    # Visão geral financeira
├── reports/
│   └── page.tsx                # Relatório de lucratividade
└── finance-charts.tsx          # Client component com Recharts (BarChart + LineChart)
```

**Mock data a adicionar:**

```ts
MockTransaction: {
  (id, date, description, category, type, amount, status);
}
MockFinancialReport: {
  (period, kpis, cashFlow, costBreakdown, serviceDetails);
}
```

---

### FASE 10 — Aprovação de Orçamento e Impressão de O.S.

**Rotas:** `/orders/[id]/budget`, `/orders/[id]/print`
**Prioridade:** Média-Baixa

#### O que implementar

**Aprovação de Orçamento** (`aprova_o_de_or_amento_precision_auto`)

- Tela full-page (sem sidebar, pode ser rota pública `(public)/`)
- Cabeçalho com logo, número da O.S. e dados do cliente
- Card do veículo: foto, placa, km, mecânico responsável
- Tabela "Itens do Orçamento": serviço/peça | valor | aprovação (checkbox por item)
- Painel direito "Resumo Financeiro": subtotal aprovado, taxas/impostos, total
- Nota técnica do mecânico
- Botões: "Confirmar Aprovação" (primary) | "Baixar PDF do Orçamento"
- Data de previsão de entrega

**Impressão / PDF** (`impress_o_da_ordem_de_servi_o_precision_auto`)

- Layout otimizado para impressão (`@media print`)
- Cabeçalho da oficina + número da O.S.
- Todos os dados do veículo e cliente
- Tabela de serviços e peças
- Assinatura do cliente (se houver)
- Versão com QR Code PIX para pagamento (`impress_o_da_o.s._com_pagamento_pix_precision_auto`)

**Arquivos a criar:**

```
src/app/(dashboard)/orders/[id]/
├── budget/
│   └── page.tsx                # Aprovação de orçamento
└── print/
    └── page.tsx                # Layout de impressão da O.S.
```

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
- Mock data em `src/lib/mock-data.ts` com tipos exportados
- Schemas Zod em `src/schemas/` — sem `.default()` quando for form (usar `defaultValues` do react-hook-form)
- Para Select controlado: sempre usar `<Controller>` do react-hook-form (não `watch()`)
- Para Base UI components (`@base-ui/react`): usar `render` prop em vez de `asChild`

### Estrutura de arquivo por módulo

```
src/app/(dashboard)/[module]/
├── page.tsx           # Server Component (lógica de dados/redirect)
├── [module]-client.tsx # Client Component (estado, interatividade)
└── [module]-schema.ts  # Zod schema específico (se houver form)
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

| Pacote                   | Fase   | Uso                                              |
| ------------------------ | ------ | ------------------------------------------------ |
| `signature_pad`          | Fase 6 | Canvas de assinatura digital no Passo 04 da O.S. |
| `react-signature-canvas` | Fase 6 | Alternativa React-friendly ao signature_pad      |
| Recharts (já instalado)  | Fase 9 | BarChart e LineChart para Finance                |

---

## Notas de arquitetura

1. **Mock data first:** Todas as fases usam dados mock em `src/lib/mock-data.ts`. Não conectar ao banco ainda — a integração com Drizzle ORM vem em fase posterior.

2. **Base UI vs Radix UI:** Este projeto usa `@base-ui/react` (não Radix). Diferenças críticas:
   - `asChild` **não existe** → usar `render={<Component />}` prop
   - `SheetTrigger render={<Button />}` em vez de `<SheetTrigger asChild><Button>`
   - Verificar API de cada componente em `src/components/ui/*.tsx` antes de usar

3. **Next.js 16:** Este projeto roda Next.js 16 (Turbopack). O arquivo `middleware.ts` está deprecado — renomear para `proxy.ts` em atualização futura.

4. **React Compiler:** O projeto usa React Compiler (babel plugin). Evitar `watch()` do react-hook-form diretamente em JSX — usar `Controller` ou `useWatch`.
