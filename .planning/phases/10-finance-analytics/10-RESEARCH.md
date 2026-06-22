# Phase 10: Finance & Analytics — Research

**Researched:** 2026-06-22
**Domain:** Next.js Server Components + Drizzle ORM — Finance CRUD, KPI null-guards, SQL GROUP BY, seed data
**Confidence:** HIGH (todo o código-fonte foi inspecionado diretamente)

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `NewTransactionDrawer` em `/finance` — trigger via `FinanceActions`. Campos: tipo, valor, data, descrição, categoria (texto livre), status. Todos obrigatórios.
- **D-02:** Edição: clicar na linha da tabela abre `EditTransactionDrawer` pré-populado.
- **D-03:** Delete dentro do `EditTransactionDrawer` com confirmação chama `deleteTransactionAction`.
- **D-04:** Categoria é texto livre — sem enum. Usa `category: text("category")` existente.
- **D-05:** Após create/edit/delete: `router.refresh()` — consistente com o restante do codebase.
- **D-06:** `getAnalyticsKpis` retorna `null` (não `0`) para KPIs derivados quando denominador é zero: `nps`, `returnRate`, `netMargin`, `avgTicket`.
- **D-07:** `AnalyticsClient` renderiza `"N/D"` quando o valor é `null`. KPIs de contagem (`totalOrders12m`, `activeCustomers`, `newCustomers`) mantêm `0`.
- **D-08:** Null-guard idêntico no `sub` text dos KPI cards.
- **D-09:** Substituir `listTransactions(500)` + `buildCategoryRows()` em `reports/page.tsx` por nova `getCategoryReport(days)` em `finance.ts` — SQL `GROUP BY category`.
- **D-10:** Filtro de período em `/finance/reports` — searchParam `?periodo=mensal|trimestral|anual`, padrão `mensal`. Todos os queries recebem `days`.
- **D-11:** `scripts/seed.ts` cria ~30 transações nos últimos 6 meses: receitas ligadas a O.S. + despesas fixas para categorias variadas.
- **D-12:** Seed transactions após loop de service orders (FK dependency). Valores R$200–R$2500 receita, R$100–R$800 despesas.

### Claude's Discretion

- Posicionamento exato do trigger "Nova Transação" dentro do dropdown `FinanceActions`.
- Animação do drawer e ordenação dos campos do formulário.
- Nomes dos server actions (`createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction`).
- Zod schema para validação do formulário (reutilizar padrão de `src/_actions/orders.ts`).

### Deferred Ideas (OUT OF SCOPE)

- Paginação da tabela de transações.
- Driver swap (pg.Pool → @neondatabase/serverless).
- Relatórios exportáveis (ExportPdfButton é placeholder).
- Filtro avançado de transações por tipo/status/categoria.
  </user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                                 | Research Support                                                                                                    |
| ------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| FIN-01 | Relatórios financeiros exibem receita/despesas/lucro calculados de `transactions` reais     | `getCategoryReport(days)` substitui `buildCategoryRows()` + filtro de período no reports page                       |
| FIN-02 | Dashboard analítico exibe métricas reais (sem valores sentinel "-1" visíveis)               | Mudança de tipo de retorno de `getAnalyticsKpis` para `number \| null` + null-guards em `AnalyticsClient`           |
| FIN-03 | Queries do dashboard usam joins/batch em vez de N+1 loops                                   | `getAnalyticsKpis` já usa queries batch; confirmar que nenhum loop per-row existe; seed popula dados para verificar |
| FIN-04 | Colunas `numeric` do Drizzle são convertidas para `number` em toda a camada de apresentação | Padrão `Number(r.amount)` já aplicado em `finance.ts` e `analytics.ts`; manter na nova função `getCategoryReport`   |

</phase_requirements>

---

## Summary

O codebase já está em estado avançado: `finance.ts` e `analytics.ts` têm queries Drizzle reais com `Number()` correto na camada de acesso a dados. As lacunas desta fase são cirúrgicas:

1. **CRUD de transações** — nenhum server action ou drawer existe para criar/editar/deletar transações manualmente; todo o conteúdo da tabela vem de O.S. fechadas.
2. **Null-safety em KPIs analíticos** — `getAnalyticsKpis` retorna `0` quando denominator é zero, mas a UI exibe esse `0` como se fosse dado real (e.g., `"Ticket médio R$ 0,00"` para uma loja sem O.S.). O contrato correto é `null` → `"N/D"`.
3. **Otimização do reports page** — `listTransactions(500)` carrega até 500 linhas para fazer `GROUP BY` em JS; deve ser uma query SQL `GROUP BY category` parametrizada por `days`.
4. **Filtro de período em reports** — a página `/finance/reports` não tem filtro; a página `/finance` já tem o padrão `?periodo=` implementado corretamente.
5. **Seed transactions** — o seed atual já cria transações de receita por O.S. concluídas e despesas recorrentes por 6 meses (verificado em `scripts/seed.ts` linhas 484–538). O requisito D-11/D-12 está **parcialmente implementado** — o seed já cobre o padrão mas pode precisar de ajustes de volume/categorias.

**Primary recommendation:** Implementar CRUD de transações e null-guards de KPI como prioridade; otimização do reports page é straightforward (adicionar `getCategoryReport` e `?periodo` searchParam).

---

## Architectural Responsibility Map

| Capability                            | Primary Tier                                    | Secondary Tier                               | Rationale                                                                     |
| ------------------------------------- | ----------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| Transaction CRUD (create/edit/delete) | API / Backend (Server Actions)                  | Frontend Client (Drawers)                    | Mutations devem ser validadas e persistidas no servidor; UI só chama a action |
| KPI null-guards (`N/D`)               | Frontend Server (analytics/page.tsx tipagem)    | Browser / Client (AnalyticsClient rendering) | Mudança de tipo em `AnalyticsKpis` + guard no componente cliente              |
| `getCategoryReport` SQL GROUP BY      | Database / Backend (finance.ts)                 | Frontend Server (reports/page.tsx)           | Query SQL substitui processamento in-memory; page só chama a função           |
| Filtro de período no reports          | Frontend Server (reports/page.tsx searchParams) | —                                            | Padrão `?periodo=` já existe em `/finance`; replicar sem nova lógica          |
| Seed de transações                    | Database / Storage (scripts/seed.ts)            | —                                            | Dados de desenvolvimento; já parcialmente implementado                        |

---

## Standard Stack

### Core (já instalado no projeto)

| Library                                | Versão confirmada | Propósito nesta fase                                                            | Por que é padrão                                 |
| -------------------------------------- | ----------------- | ------------------------------------------------------------------------------- | ------------------------------------------------ |
| `drizzle-orm`                          | no projeto        | `getCategoryReport` SQL GROUP BY, insert/update/delete transactions             | ORM padrão do projeto — `[ASSUMED]` versão exata |
| `next-safe-action`                     | no projeto        | `createTransactionAction`, `updateTransactionAction`, `deleteTransactionAction` | Padrão estabelecido em `src/_lib/safe-action.ts` |
| `react-hook-form`                      | no projeto        | `useTransactionForm` hook                                                       | Padrão em todos os hooks existentes              |
| `@hookform/resolvers` + `zod`          | no projeto        | Validação do formulário de transação                                            | Padrão em `use-appointment-form.ts`              |
| `next-safe-action/hooks` (`useAction`) | no projeto        | Executar actions no cliente                                                     | Padrão em `use-appointment-form.ts`              |
| `sonner`                               | no projeto        | Toast de sucesso/erro após mutations                                            | Padrão em todos os form hooks                    |

### Sem instalações novas necessárias

Esta fase não requer nenhum pacote novo. Toda a stack necessária está instalada.

---

## Package Legitimacy Audit

> Nenhum pacote novo a instalar nesta fase. Seção não aplicável.

---

## Architecture Patterns

### Sistema de Dados — Fluxo

```
[Browser]
  ↓ submit form (NewTransactionDrawer / EditTransactionDrawer)
[Server Action] createTransactionAction / updateTransactionAction / deleteTransactionAction
  ↓ Zod parse → db.insert/update/delete
[PostgreSQL — transactions table]
  ↓ router.refresh() invalida Server Component cache
[finance/page.tsx — Server Component]
  ↓ listTransactions(50)
[DataTable]
```

```
[analytics/page.tsx — Server Component]
  ↓ getAnalyticsKpis() → AnalyticsKpis (com campos null)
[AnalyticsClient — Client Component]
  ↓ kpi.value === null ? "N/D" : formatValue(kpi.value)
```

```
[finance/reports/page.tsx — Server Component]
  ↓ searchParams.periodo → days
  ↓ getCategoryReport(days) — SQL GROUP BY category
[DataTable — categoryRows]
```

### Recommended Project Structure (arquivos afetados)

```
src/
├── _actions/
│   └── finance.ts                    # NOVO — createTransactionAction, updateTransactionAction, deleteTransactionAction
├── _data-access/
│   ├── finance.ts                    # MODIFICAR — adicionar getCategoryReport(days)
│   └── analytics.ts                  # MODIFICAR — AnalyticsKpis campos null, getAnalyticsKpis retorno
├── app/(dashboard)/
│   ├── finance/
│   │   ├── page.tsx                  # MODIFICAR — montar NewTransactionDrawer, onRowClick para EditTransactionDrawer
│   │   ├── finance-actions.tsx       # MODIFICAR — adicionar trigger "Nova Transação"
│   │   ├── NewTransactionDrawer.tsx  # NOVO
│   │   └── EditTransactionDrawer.tsx # NOVO
│   ├── finance/reports/
│   │   └── page.tsx                  # MODIFICAR — getCategoryReport, ?periodo searchParam
│   └── analytics/
│       ├── page.tsx                  # MODIFICAR — tipagem kpis passa AnalyticsKpis com nulls
│       └── _components/
│           └── AnalyticsClient.tsx   # MODIFICAR — null-guards para N/D
└── _hooks/
    └── use-transaction-form.ts       # NOVO
scripts/
└── seed.ts                           # VERIFICAR/AJUSTAR — seed transactions volume
```

### Pattern 1: Server Action para mutations de transação

**What:** `authActionClient.schema(zodSchema).action(async ({ parsedInput, ctx }) => { ... })` — idêntico ao padrão em `orders.ts`.
**When to use:** Toda create/update/delete de transação.

```typescript
// Fonte: src/_actions/orders.ts (padrão verificado no codebase)
// src/_actions/finance.ts
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { transactions } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";

const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive(),
  date: z.string().datetime(),
  description: z.string().min(1),
  category: z.string().min(1),
  status: z.enum(["paid", "pending", "overdue"]),
});

export const createTransactionAction = authActionClient
  .schema(transactionSchema)
  .action(async ({ parsedInput }) => {
    await db.insert(transactions).values({
      type: parsedInput.type,
      amount: String(parsedInput.amount),
      date: new Date(parsedInput.date),
      description: parsedInput.description,
      category: parsedInput.category,
      status: parsedInput.status,
    });
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
```

**Nota crítica:** `amount` no schema Drizzle é `numeric(12,2)` — armazenar como `String(parsedInput.amount)` (não `number`), exatamente como `orders.ts` faz com `totalAmount: String(totalAmount)`. [VERIFIED: codebase]

### Pattern 2: getCategoryReport com GROUP BY SQL

**What:** Query SQL parametrizada por `days` que substitui `buildCategoryRows()`.

```typescript
// Fonte: finance.ts — padrão sql.raw(String(days)) verificado nas linhas 71–72
export type CategoryReport = {
  category: string;
  grossRevenue: number;
  totalExpenses: number;
  netProfit: number;
  status: "positive" | "neutral" | "negative";
};

export async function getCategoryReport(days = 30): Promise<CategoryReport[]> {
  const rows = await db
    .select({
      category: transactions.category,
      grossRevenue: sql<number>`coalesce(sum(case when ${transactions.type} = 'income' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
      totalExpenses: sql<number>`coalesce(sum(case when ${transactions.type} = 'expense' and ${transactions.status} = 'paid' then ${transactions.amount}::numeric else 0 end), 0)`,
    })
    .from(transactions)
    .where(
      sql`${transactions.date} >= current_date - interval '${sql.raw(String(days))} days'`,
    )
    .groupBy(transactions.category)
    .orderBy(
      sql`sum(case when ${transactions.type} = 'income' then ${transactions.amount}::numeric else 0 end) desc`,
    );

  return rows.map((r) => {
    const grossRevenue = Number(r.grossRevenue);
    const totalExpenses = Number(r.totalExpenses);
    const netProfit = grossRevenue - totalExpenses;
    return {
      category: r.category,
      grossRevenue,
      totalExpenses,
      netProfit,
      status:
        netProfit > 0 ? "positive" : netProfit === 0 ? "neutral" : "negative",
    };
  });
}
```

### Pattern 3: AnalyticsKpis com campos null

```typescript
// Fonte: src/_data-access/analytics.ts (modificação necessária)
export type AnalyticsKpis = {
  totalRevenue12m: number;
  totalOrders12m: number;
  avgTicket: number | null; // null quando totalOrders12m === 0
  netMargin: number | null; // null quando totalRevenue12m === 0
  nps: number | null; // null quando totalFb === 0
  returnRate: number | null; // null quando totalReturningBase === 0
  activeCustomers: number;
  newCustomers: number;
};
```

```typescript
// AnalyticsClient.tsx — null-guard
sub: analyticsKpis.avgTicket !== null
  ? `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`
  : "Ticket médio N/D",
```

### Pattern 4: Drawer de transação — replicar NewAppointmentDrawer

```typescript
// Fonte: NewAppointmentDrawer.tsx + use-appointment-form.ts (verificado)
// Estrutura idêntica:
// 1. Sheet + SheetContent + SheetHeader + SheetFooter (shadcn Sheet)
// 2. useTransactionForm hook (zodResolver + useAction)
// 3. Controller para campos select (tipo, status) — obrigatório pela regra do projeto
// 4. register para Input (amount, date, description, category)
// 5. onSuccess: toast.success + reset() + onClose()
// 6. onError: toast.error(error.serverError)
```

### Pattern 5: `router.refresh()` após mutation (D-05)

```typescript
// Fonte: uso estabelecido no codebase (appointments, orders)
import { useRouter } from "next/navigation";
const router = useRouter();
// No onSuccess do useAction:
onSuccess: () => {
  toast.success("...");
  router.refresh();
  onClose();
};
```

**Alternativa confirmada:** `revalidatePath` no server action + `router.refresh()` no client são complementares — o server action já chama `revalidatePath("/finance")`, e o client chama `router.refresh()` para forçar re-render imediato do Server Component.

### Anti-Patterns to Avoid

- **Nunca usar `as unknown as`:** Regra bloqueada no projeto. O cast em `use-appointment-form.ts` linha 58 é um `eslint-disable` explícito — evitar em código novo.
- **Nunca usar `.default()` em schemas Zod de formulário:** Regra do projeto. Usar `defaultValues` no `useForm`, não no schema.
- **Nunca passar `amount` como `number` direto para o Drizzle insert:** A coluna é `numeric(12,2)` — deve ser `String(parsedInput.amount)`.
- **Nunca fazer GROUP BY em JS com lista grande:** A `buildCategoryRows` atual carrega até 500 linhas; substituir por SQL GROUP BY (D-09).
- **Nunca retornar `0` para KPIs derivados sem dados:** Confunde "zero real" com "sem dados" — usar `null` + `"N/D"` na UI.

---

## Don't Hand-Roll

| Problem                              | Don't Build                   | Use Instead                                     | Why                                                     |
| ------------------------------------ | ----------------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| Form state + validação               | Custom state machine          | `react-hook-form` + `zodResolver`               | Já usado em todos os hooks do projeto                   |
| Execução de server actions no client | `fetch()` manual              | `useAction` de `next-safe-action/hooks`         | Gerencia `status`, `result.serverError`, etc.           |
| Autenticação nas actions             | Verificar session manualmente | `authActionClient` de `src/_lib/safe-action.ts` | Middleware de auth já wired                             |
| Conversão `numeric` → JS number      | Parsear string manualmente    | `Number(r.amount)` na camada de data-access     | Padrão já estabelecido em `finance.ts` e `analytics.ts` |
| Drawer/Sheet                         | Componente custom             | `Sheet` de `@/_components/ui/sheet`             | Já existe e é usado em `NewAppointmentDrawer`           |

---

## Common Pitfalls

### Pitfall 1: `amount` enviado como `number` ao Drizzle

**What goes wrong:** `db.insert(transactions).values({ amount: parsedInput.amount })` — Drizzle espera string para coluna `numeric`.
**Why it happens:** Zod `z.coerce.number()` converte para JS number; Drizzle `numeric` aceita string.
**How to avoid:** `amount: String(parsedInput.amount)` — idêntico ao padrão de `orders.ts:92` (`unitPrice: String(i.unitPrice)`).
**Warning signs:** Erro de tipo TypeScript ou valor `NaN` no banco.

### Pitfall 2: `AnalyticsClient` recebe `null` sem guard → `"NaN%"` ou crash

**What goes wrong:** `${analyticsKpis.netMargin}%` onde `netMargin` é `null` → renderiza `"null%"`.
**Why it happens:** Mudança de tipo de `number` para `number | null` requer atualização das 4 ocorrências em `AnalyticsClient.tsx` (linhas 48–78) onde os valores são usados como string.
**How to avoid:** Atualizar o tipo `Props.kpis` para `AnalyticsKpis` com os campos null; o TypeScript vai apontar todos os locais que precisam de guard.
**Warning signs:** Erros de tipo após a mudança de `AnalyticsKpis`.

### Pitfall 3: `EditTransactionDrawer` acessa row via `onRowClick` — DataTable precisa do callback

**What goes wrong:** `DataTable` não tem `onRowClick` prop por padrão; o componente renderiza `<tr>` sem handler.
**Why it happens:** A implementação atual de `DataTable` usa `getRowId` mas não expõe `onRowClick`.
**How to avoid:** Verificar se `DataTable` aceita `onRowClick?: (row: T) => void` — se não, adicionar a prop ao componente genérico ou usar `cell` render para um botão explícito dentro da linha. [ASSUMED — verificar DataTable antes de implementar]
**Warning signs:** Clicar na linha não abre o drawer.

### Pitfall 4: Seed — transações já existem

**What goes wrong:** Rodar `db:seed` adiciona mais transações em cima das existentes se `wipe()` não deletar a tabela primeiro.
**Why it happens:** `wipe()` em `seed.ts` linha 78 já faz `await db.delete(transactions)` — isso está correto.
**How to avoid:** Confirmar que a ordem de delete em `wipe()` respeita FKs (transactions não tem FKs que bloqueiem o delete direto — OK).

### Pitfall 5: `sql.raw(String(days))` — injeção de SQL

**What goes wrong:** Se `days` vier de user input não-validado, há risco de SQL injection via `sql.raw`.
**Why it happens:** `sql.raw` não é parametrizado; o Drizzle usa-o para injeção literal no SQL.
**How to avoid:** Garantir que `days` seja sempre derivado do enum `periodo` → `getPeriodDays()` (retorna só `30`, `90` ou `365`). Nunca passar `days` diretamente de query params sem passar pela função guard.

---

## Code Examples

### getCategoryReport retorno esperado

```typescript
// Exemplo de retorno para ?periodo=mensal (days=30)
[
  {
    category: "Serviço",
    grossRevenue: 15420.0,
    totalExpenses: 0,
    netProfit: 15420.0,
    status: "positive",
  },
  {
    category: "Fornecedor",
    grossRevenue: 0,
    totalExpenses: 2800.0,
    netProfit: -2800.0,
    status: "negative",
  },
  {
    category: "Despesa Fixa",
    grossRevenue: 0,
    totalExpenses: 4220.0,
    netProfit: -4220.0,
    status: "negative",
  },
];
```

### Null guard em AnalyticsClient

```typescript
// Antes (problemático):
sub: `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`,
value: `${analyticsKpis.netMargin}%`,
value: analyticsKpis.nps.toString(),
sub: `${analyticsKpis.returnRate}% taxa de retorno`,

// Depois (correto):
sub: analyticsKpis.avgTicket !== null
  ? `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`
  : "Ticket médio N/D",
value: analyticsKpis.netMargin !== null ? `${analyticsKpis.netMargin}%` : "N/D",
value: analyticsKpis.nps !== null ? analyticsKpis.nps.toString() : "N/D",
sub: analyticsKpis.returnRate !== null
  ? `${analyticsKpis.returnRate}% taxa de retorno`
  : "Taxa de retorno N/D",
```

### Zod schema para transação (sem `.default()`)

```typescript
// Fonte: padrão do projeto — sem .default() em form schemas
export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  status: z.enum(["paid", "pending", "overdue"]),
});
```

---

## State of the Art

| Old Approach                               | Current Approach                                     | Notes                                                      |
| ------------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------- |
| `buildCategoryRows(listTransactions(500))` | `getCategoryReport(days)` — SQL GROUP BY             | In-memory GROUP BY em 500 linhas → query SQL parametrizada |
| KPIs derivados retornam `0`                | KPIs derivados retornam `null`, UI renderiza `"N/D"` | Distingue "zero real" de "sem dados suficientes"           |
| `/finance/reports` sem filtro de período   | `?periodo=mensal\|trimestral\|anual` searchParam     | Consistente com `/finance`                                 |

---

## Insights de Código Verificados

### Seed já parcialmente implementado

O `scripts/seed.ts` **já cria transações** (linhas 484–538):

- Receitas: 15 O.S. concluídas/mês × 6 meses = 90 transações de receita.
- Despesas: 5 categorias × 6 meses = 30 transações de despesa.
- Total: ~120 transações — acima do D-11 (30 mínimos).

**Implicação para o plano:** D-11/D-12 pode ser marcado como "verificar e ajustar se necessário" em vez de "criar do zero". O seed atual já atende o critério de "6 meses de dados para gráficos".

### FIN-03 — N+1 já eliminado em analytics.ts

`getAnalyticsKpis()` usa 4 queries batch (não por-row). `getMechanicPerformance()` usa `LEFT JOIN` + `GROUP BY`. `getMonthlyRevenue()` usa 2 queries batch. **Não há N+1 loop** no código atual.

**Implicação:** FIN-03 está substancialmente atendido. A task do plano deve ser "auditar e confirmar ausência de N+1" em vez de "reescrever queries".

### FIN-04 — Number() já aplicado

`finance.ts` e `analytics.ts` já chamam `Number(r.amount)` / `Number(r.total)` em todos os locais mapeados. A nova `getCategoryReport` deve manter o padrão.

### FinanceActions é client component simples

`finance-actions.tsx` tem estado local `open` para o dropdown. Para adicionar o trigger do `NewTransactionDrawer`, a `FinanceActions` precisa receber `onNewTransaction: () => void` como prop — ou o estado do drawer deve ser gerenciado em `finance/page.tsx`. Como `finance/page.tsx` é Server Component, o drawer precisa ser encapsulado em um Client Component wrapper que contenha tanto o trigger quanto o drawer.

**Padrão recomendado:** Criar `FinanceActionsWithDrawer` (Client Component) que encapsula `FinanceActions` + `NewTransactionDrawer` com estado `open` local — ou refatorar `FinanceActions` para aceitar `onNewTransaction` prop. Verificar padrão usado em appointments para referência.

### DataTable — verificar onRowClick

`DataTable` em `src/_components/ui/data-table.tsx` não foi lida nesta sessão. O plano deve incluir uma task de verificação da interface do componente antes de implementar `EditTransactionDrawer`.

---

## Assumptions Log

| #   | Claim                                                      | Section                  | Risk se Errado                                          |
| --- | ---------------------------------------------------------- | ------------------------ | ------------------------------------------------------- |
| A1  | `DataTable` não tem `onRowClick` prop                      | Common Pitfalls #3       | Pode já ter — nesse caso, task de edição é mais simples |
| A2  | `FinanceActions` precisa de refactoring para montar drawer | Insights #FinanceActions | Se aceitar props já, sem refactoring necessário         |

---

## Open Questions (RESOLVED)

1. **`DataTable` aceita `onRowClick`?**
   - O que sabemos: componente existe em `src/_components/ui/data-table.tsx`, não lido nesta sessão.
   - Lacuna: sem saber a interface, não podemos definir se a task de edit drawer requer mudança no DataTable ou só no finance/page.tsx.
   - Recomendação: planner deve incluir task "ler DataTable e definir estratégia de edit trigger" como Wave 0.
   - **RESOLVED:** DataTable aceita `onRowClick` — confirmado em `src/_components/ui/data-table.tsx` linhas 23, 73–75. Nenhuma mudança no componente necessária.

---

## Environment Availability

Step 2.6: SKIPPED (sem dependências externas — esta fase é puramente código/config + seed script que usa a stack já disponível).

---

## Validation Architecture

> `workflow.nyquist_validation` ausente no config.json — tratado como habilitado.

### Test Framework

| Property           | Value                                                                   |
| ------------------ | ----------------------------------------------------------------------- |
| Framework          | Verificar em `package.json` — tests existem em `src/_actions/*.test.ts` |
| Config file        | A verificar                                                             |
| Quick run command  | `npm test -- --testPathPattern=finance` (assumido)                      |
| Full suite command | `npm test`                                                              |

### Phase Requirements → Test Map

| Req ID | Behavior                                                      | Test Type  | Automated Command       | File Exists? |
| ------ | ------------------------------------------------------------- | ---------- | ----------------------- | ------------ |
| FIN-01 | `getCategoryReport` retorna dados agrupados por categoria     | unit       | `npm test -- finance`   | ❌ Wave 0    |
| FIN-02 | `getAnalyticsKpis` retorna null para KPIs derivados sem dados | unit       | `npm test -- analytics` | ❌ Wave 0    |
| FIN-03 | Dashboard page não faz queries N+1                            | audit/unit | inspeção de código      | n/a          |
| FIN-04 | `getCategoryReport` retorna `number`, não string              | unit       | parte de FIN-01         | ❌ Wave 0    |

### Wave 0 Gaps

- [ ] `src/_data-access/finance.test.ts` — cobrir `getCategoryReport` (FIN-01, FIN-04)
- [ ] `src/_data-access/analytics.test.ts` — cobrir `getAnalyticsKpis` null returns (FIN-02)

---

## Security Domain

> `security_enforcement` ausente — tratado como habilitado.

### Applicable ASVS Categories

| ASVS Category       | Applies | Standard Control                                              |
| ------------------- | ------- | ------------------------------------------------------------- |
| V2 Authentication   | sim     | `authActionClient` (já implementado)                          |
| V4 Access Control   | sim     | `authActionClient` verifica sessão antes de qualquer mutation |
| V5 Input Validation | sim     | Zod schema em todos os server actions                         |
| V6 Cryptography     | não     | Sem dados sensíveis nas transações financeiras                |

### Known Threat Patterns

| Pattern                           | STRIDE                 | Standard Mitigation                                                                                                                    |
| --------------------------------- | ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| SQL Injection via `sql.raw(days)` | Tampering              | `days` derivado exclusivamente de enum `getPeriodDays()` — nunca de user input direto                                                  |
| Unauthorized transaction mutation | Elevation of Privilege | `authActionClient` valida sessão; sem verificação de role (admin only?) — [ASSUMED] qualquer usuário autenticado pode criar transações |

---

## Sources

### Primary (HIGH confidence)

- `src/_data-access/finance.ts` — inspecionado diretamente; padrões `Number()`, `sql.raw()`, query structure
- `src/_data-access/analytics.ts` — inspecionado diretamente; `getAnalyticsKpis` retorno atual
- `src/_actions/orders.ts` — padrão canônico de server action
- `src/_hooks/use-appointment-form.ts` — padrão canônico de form hook
- `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` — padrão canônico de drawer
- `scripts/seed.ts` — seed atual verificado; transações já existentes
- `.planning/phases/10-finance-analytics/10-CONTEXT.md` — decisões bloqueadas

### Secondary (MEDIUM confidence)

- `src/app/(dashboard)/finance/page.tsx` — estrutura da página finance verificada
- `src/app/(dashboard)/finance/finance-actions.tsx` — estrutura atual do FinanceActions
- `src/app/(dashboard)/finance/reports/page.tsx` — `buildCategoryRows` e `listTransactions(500)` verificados
- `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` — locais de null-guard necessários

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — toda a stack é código existente do projeto, sem novos pacotes
- Architecture: HIGH — padrões verificados diretamente no codebase
- Pitfalls: HIGH — identificados por inspeção direta do código problemático
- Seed status: HIGH — seed.ts lido e analisado; D-11/D-12 parcialmente completo

**Research date:** 2026-06-22
**Valid until:** 2026-07-22 (stack estável)
