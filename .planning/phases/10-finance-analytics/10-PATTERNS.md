# Phase 10: Finance & Analytics - Mapa de Padrões

**Mapeado:** 2026-06-22
**Arquivos analisados:** 10 (novos/modificados)
**Análogos encontrados:** 10 / 10

---

## Classificação de Arquivos

| Arquivo Novo/Modificado                                         | Papel                   | Fluxo de Dados          | Análogo Mais Próximo                                                        | Qualidade              |
| --------------------------------------------------------------- | ----------------------- | ----------------------- | --------------------------------------------------------------------------- | ---------------------- |
| `src/_actions/finance.ts`                                       | server-action           | request-response (CRUD) | `src/_actions/orders.ts`                                                    | exato                  |
| `src/_hooks/use-transaction-form.ts`                            | hook                    | request-response        | `src/_hooks/use-appointment-form.ts`                                        | exato                  |
| `src/app/(dashboard)/finance/NewTransactionDrawer.tsx`          | component               | request-response        | `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`     | exato                  |
| `src/app/(dashboard)/finance/EditTransactionDrawer.tsx`         | component               | request-response        | `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`     | role-match (edit mode) |
| `src/app/(dashboard)/finance/finance-actions.tsx`               | component               | event-driven            | `src/app/(dashboard)/finance/finance-actions.tsx` (modificar)               | exato                  |
| `src/app/(dashboard)/finance/page.tsx`                          | page (Server Component) | request-response        | `src/app/(dashboard)/finance/page.tsx` (modificar)                          | exato                  |
| `src/app/(dashboard)/finance/reports/page.tsx`                  | page (Server Component) | CRUD + batch            | `src/app/(dashboard)/finance/reports/page.tsx` (modificar)                  | exato                  |
| `src/_data-access/finance.ts`                                   | data-access             | batch / SQL             | `src/_data-access/finance.ts` (modificar)                                   | exato                  |
| `src/_data-access/analytics.ts`                                 | data-access             | batch / SQL             | `src/_data-access/analytics.ts` (modificar)                                 | exato                  |
| `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` | component (Client)      | request-response        | `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` (modificar) | exato                  |

---

## Atribuições de Padrão

---

### `src/_actions/finance.ts` (server-action, CRUD)

**Análogo:** `src/_actions/orders.ts`

**Padrão de imports** (linhas 1–16):

```typescript
"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/_db";
import { transactions } from "@/_db/schema";
import { authActionClient } from "@/_lib/safe-action";
```

**Padrão de action — create** (baseado em `orders.ts` linhas 17–51):

```typescript
export const createTransactionAction = authActionClient
  .schema(
    z.object({
      type: z.enum(["income", "expense"]),
      amount: z.coerce.number().positive(),
      date: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      status: z.enum(["paid", "pending", "overdue"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db.insert(transactions).values({
      type: parsedInput.type,
      amount: String(parsedInput.amount), // CRÍTICO: numeric(12,2) requer string
      date: new Date(parsedInput.date),
      description: parsedInput.description,
      category: parsedInput.category,
      status: parsedInput.status,
    });
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
```

**Padrão de action — update** (baseado em `orders.ts` linhas 134–172, `updateOrderStatusAction`):

```typescript
export const updateTransactionAction = authActionClient
  .schema(
    z.object({
      id: z.uuid(),
      type: z.enum(["income", "expense"]),
      amount: z.coerce.number().positive(),
      date: z.string().min(1),
      description: z.string().min(1),
      category: z.string().min(1),
      status: z.enum(["paid", "pending", "overdue"]),
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(transactions)
      .set({
        type: parsedInput.type,
        amount: String(parsedInput.amount),
        date: new Date(parsedInput.date),
        description: parsedInput.description,
        category: parsedInput.category,
        status: parsedInput.status,
        updatedAt: new Date(),
      })
      .where(eq(transactions.id, parsedInput.id));
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
```

**Padrão de action — delete** (baseado em `orders.ts` linhas 174–205, `deleteOrderAction`):

```typescript
export const deleteTransactionAction = authActionClient
  .schema(z.object({ id: z.uuid() }))
  .action(async ({ parsedInput }) => {
    await db.delete(transactions).where(eq(transactions.id, parsedInput.id));
    revalidatePath("/finance");
    revalidatePath("/analytics");
  });
```

**Regra crítica de tipos** (`orders.ts` linha 92, 106):

```typescript
// SEMPRE converter amount para string ao persistir — coluna numeric(12,2)
totalAmount: String(totalAmount);
unitPrice: String(i.unitPrice);
// Para transações:
amount: String(parsedInput.amount);
```

---

### `src/_hooks/use-transaction-form.ts` (hook, request-response)

**Análogo:** `src/_hooks/use-appointment-form.ts`

**Padrão de imports** (linhas 1–12):

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createTransactionAction,
  updateTransactionAction,
  deleteTransactionAction,
} from "@/_actions/finance";
```

**Padrão do schema Zod** (baseado em `use-appointment-form.ts` linhas 19–28 — **sem `.default()`**):

```typescript
export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().positive("Valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  status: z.enum(["paid", "pending", "overdue"]),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;
```

**Padrão de useForm + zodResolver** (linhas 56–64 de `use-appointment-form.ts`):

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
resolver: zodResolver(transactionSchema) as any,
defaultValues: initialValues ?? {
  type: "income",
  amount: 0,
  date: "",
  description: "",
  category: "",
  status: "paid",
},
```

**Padrão de useAction com onSuccess/onError** (linhas 69–82):

```typescript
const { execute: executeCreate, status: createStatus } = useAction(
  createTransactionAction,
  {
    onSuccess: () => {
      toast.success("Transação criada com sucesso.");
      reset();
      router.refresh(); // D-05: router.refresh() após mutação
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao criar transação.");
    },
  },
);
```

**Padrão de mode create/edit** (linhas 116–117):

```typescript
const status = mode === "edit" ? updateStatus : createStatus;
```

---

### `src/app/(dashboard)/finance/NewTransactionDrawer.tsx` (component, request-response)

**Análogo:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`

**Padrão de imports** (linhas 1–23):

```typescript
"use client";

import { Controller } from "react-hook-form";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
import { useTransactionForm } from "@/_hooks/use-transaction-form";
```

**Padrão de Props + estrutura Sheet** (linhas 24–56):

```typescript
type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewTransactionDrawer({ open, onClose }: Props) {
  const { control, register, handleSubmit, errors, status, result } =
    useTransactionForm({ onClose });

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="bg-surface w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-outline-variant/30 border-b pb-4">
          <SheetTitle className="text-on-surface flex items-center gap-2">
            Nova Transação
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Preencha os dados da transação
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-5 px-4 py-5">
          {/* campos */}
        </form>
        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose render={<Button variant="outline" onClick={onClose}>Cancelar</Button>} />
          <Button onClick={handleSubmit} disabled={status === "executing"}>
            {status === "executing" ? "Salvando..." : "Salvar Transação"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

**Padrão de Controller para selects** (linhas 76–95 — obrigatório para campos select):

```typescript
<Controller
  name="type"
  control={control}
  render={({ field }) => (
    <select
      {...field}
      id="type"
      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
    >
      <option value="income">Receita</option>
      <option value="expense">Despesa</option>
    </select>
  )}
/>
```

**Padrão de Input com register** (linhas 207–218):

```typescript
<Input
  id="amount"
  type="number"
  step="0.01"
  min="0"
  aria-invalid={!!errors.amount}
  {...register("amount", { valueAsNumber: true })}
/>
{errors.amount && (
  <p className="text-label-xs text-error">{errors.amount.message}</p>
)}
```

**Padrão de error display** (linhas 249–253):

```typescript
{result.serverError && (
  <p className="text-label-sm text-error">
    Erro ao salvar. Tente novamente.
  </p>
)}
```

---

### `src/app/(dashboard)/finance/EditTransactionDrawer.tsx` (component, request-response)

**Análogo:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` (modo edit)

Mesmos padrões de Sheet/Controller/Input que `NewTransactionDrawer`, com:

**Diferença 1 — Props recebe transaction pré-populada:**

```typescript
import type { Transaction } from "@/_data-access/finance";

type Props = {
  open: boolean;
  onClose: () => void;
  transaction: Transaction | null;
};
```

**Diferença 2 — hook inicializado com `mode="edit"` e `initialValues`:**

```typescript
const form = useTransactionForm({
  onClose,
  mode: "edit",
  transactionId: transaction?.id,
  initialValues: transaction
    ? {
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date.toISOString().split("T")[0],
        description: transaction.description,
        category: transaction.category,
        status: transaction.status,
      }
    : undefined,
});
```

**Diferença 3 — botão de delete com confirmação (padrão do projeto: window.confirm ou AlertDialog):**

```typescript
// Padrão mínimo — verificar se o projeto usa AlertDialog ou confirm nativo
<Button
  variant="outline"
  className="text-error border-error/30"
  onClick={() => {
    if (confirm("Excluir esta transação?")) {
      executeDelete({ id: transaction!.id });
    }
  }}
>
  Excluir
</Button>
```

---

### `src/app/(dashboard)/finance/finance-actions.tsx` (component, event-driven) — MODIFICAR

**Análogo:** arquivo atual (`finance-actions.tsx`)

**Estado atual** (linhas 7–48):

```typescript
export function FinanceActions() {
  const [open, setOpen] = useState(false);
  // dropdown com 2 itens: "Ver Relatórios" e "Nova Ordem de Serviço"
}
```

**Modificação necessária — adicionar trigger "Nova Transação":**

Dado que `finance/page.tsx` é Server Component, o estado do drawer deve ser gerenciado em um Client Component wrapper. Duas abordagens:

_Opção A (recomendada):_ Refatorar `FinanceActions` para aceitar `onNewTransaction?: () => void`:

```typescript
type Props = { onNewTransaction?: () => void };

export function FinanceActions({ onNewTransaction }: Props) {
  const [open, setOpen] = useState(false);
  // ...
  // Adicionar item no dropdown:
  <button
    onClick={() => { setOpen(false); onNewTransaction?.(); }}
    className="text-body-sm text-on-surface hover:bg-surface-container-highest flex items-center gap-2.5 px-4 py-3 font-mono transition-colors w-full text-left"
  >
    <PlusCircle className="text-secondary size-4 shrink-0" />
    Nova Transação
  </button>
}
```

_Opção B:_ Criar `FinanceActionsWithDrawer` Client Component que encapsula `FinanceActions` + `NewTransactionDrawer` com estado `open` local — usado na `finance/page.tsx` no lugar de `<FinanceActions />`.

---

### `src/app/(dashboard)/finance/page.tsx` (page Server Component) — MODIFICAR

**Análogo:** arquivo atual + padrão de `EditTransactionDrawer` via `onRowClick`

**DataTable já suporta `onRowClick`** (`data-table.tsx` linha 23):

```typescript
// DataTable aceita onRowClick — CONFIRMADO (não é assumption)
onRowClick?: (row: T) => void;
// Linha 73: onClick={onRowClick ? () => onRowClick(row) : undefined}
// Linha 75: onRowClick && "cursor-pointer"
```

**Problema:** `finance/page.tsx` é Server Component; `EditTransactionDrawer` precisa de estado client-side. Solução: extrair a seção da tabela para um Client Component wrapper `TransactionsTableWithDrawer`:

```typescript
// finance/page.tsx (Server Component) — passa transactions como prop
<TransactionsTableWithDrawer transactions={transactions} columns={columns} />

// TransactionsTableWithDrawer.tsx ("use client")
export function TransactionsTableWithDrawer({ transactions, columns }) {
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  return (
    <>
      <DataTable
        columns={columns}
        data={transactions}
        getRowId={(row) => row.id}
        onRowClick={(row) => setEditTarget(row)}
        emptyMessage="Nenhuma transação encontrada."
      />
      <EditTransactionDrawer
        open={editTarget !== null}
        onClose={() => setEditTarget(null)}
        transaction={editTarget}
      />
    </>
  );
}
```

**Padrão de período já implementado** (linhas 107–121 — copiar verbatim para reports/page.tsx):

```typescript
type Period = "mensal" | "trimestral" | "anual";

function getPeriodDays(period: Period): number {
  if (period === "trimestral") return 90;
  if (period === "anual") return 365;
  return 30;
}

type Props = { searchParams: Promise<{ periodo?: string }> };

export default async function FinancePage({ searchParams }: Props) {
  const { periodo } = await searchParams;
  const activePeriod: Period =
    periodo === "trimestral" || periodo === "anual" ? periodo : "mensal";
  const days = getPeriodDays(activePeriod);
```

**Padrão de filtro de período (links)** (linhas 129–173 — copiar para reports/page.tsx):

```typescript
const PERIODS: { key: Period; label: string }[] = [
  { key: "mensal", label: "Mensal" },
  { key: "trimestral", label: "Trimestral" },
  { key: "anual", label: "Anual" },
];
// ...
{PERIODS.map(({ key, label }) => (
  <Link
    key={key}
    href={`/finance/reports?periodo=${key}`}  // ajustar path para reports
    className={`text-label-sm shrink-0 rounded-full border px-4 py-1.5 font-mono transition-colors ${
      activePeriod === key
        ? "border-secondary bg-secondary/10 text-secondary"
        : "border-outline-variant text-on-surface-variant hover:bg-surface-container"
    }`}
  >
    {label}
  </Link>
))}
```

---

### `src/app/(dashboard)/finance/reports/page.tsx` (page Server Component) — MODIFICAR

**Análogo:** arquivo atual + padrão de período de `finance/page.tsx`

**Substituição de `buildCategoryRows` + `listTransactions(500)`** (linhas 129–138):

```typescript
// ANTES (remover):
listTransactions(500),          // linha 134
// buildCategoryRows(allTransactions);   // linha 138

// DEPOIS:
getCategoryReport(days),        // nova função em finance.ts
```

**Promise.all atualizado:**

```typescript
const [monthlyCashFlow, costBreakdown, metrics, categoryRows, orderCount] =
  await Promise.all([
    getMonthlyCashFlow(6),
    getCostBreakdown(),
    getFinanceMetrics(days), // passa days do período
    getCategoryReport(days), // substitui listTransactions(500)
    getReportOrderCount(6),
  ]);
// Remover: buildCategoryRows(allTransactions)
// categoryRows já vem tipado e agrupado do SQL
```

**Adicionar `id` sintético para DataTable** (necessário pois `getCategoryReport` não retorna `id`):

```typescript
// No mapeamento ou dentro de getCategoryReport:
const categoryRowsWithId = categoryRows.map((r, i) => ({
  ...r,
  id: String(i),
}));
```

**Tipo `CategoryRow` deve incluir `id`** (linha 35–42 do reports/page.tsx atual):

```typescript
// Manter o tipo existente — getCategoryReport retorna sem id, adicionar no mapeamento
```

---

### `src/_data-access/finance.ts` (data-access) — MODIFICAR

**Análogo:** arquivo atual — padrões `sql.raw(String(days))` e `Number(r.amount)`

**Padrão `sql.raw` para intervalo dinâmico** (linha 71):

```typescript
sql`${transactions.date} >= current_date - interval '${sql.raw(String(days))} days'`;
```

**Padrão `Number()` na camada de retorno** (linhas 44–52):

```typescript
return rows.map((r) => ({
  // ...
  amount: Number(r.amount), // SEMPRE Number() em campos numeric
}));
```

**Nova função `getCategoryReport`** (baseada em `getCostBreakdown` linhas 193–211 e `getFinanceMetrics` linhas 68–87):

```typescript
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

---

### `src/_data-access/analytics.ts` (data-access) — MODIFICAR

**Análogo:** arquivo atual

**Mudança de tipo `AnalyticsKpis`** (linhas 45–54):

```typescript
// ANTES:
export type AnalyticsKpis = {
  totalRevenue12m: number;
  totalOrders12m: number;
  avgTicket: number;
  netMargin: number;
  nps: number;
  returnRate: number;
  activeCustomers: number;
  newCustomers: number;
};

// DEPOIS (D-06):
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

**Mudança no retorno de `getAnalyticsKpis`** (linhas 256–266):

```typescript
// ANTES:
avgTicket: totalOrders > 0 ? revenue / totalOrders : 0,
netMargin: revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0,
nps: totalFb > 0 ? Math.round(((promoters - detractors) / totalFb) * 100) : 0,
returnRate: totalReturningBase > 0 ? Math.round((returningCount / totalReturningBase) * 100) : 0,

// DEPOIS (D-06 — null em vez de 0):
avgTicket: totalOrders > 0 ? revenue / totalOrders : null,
netMargin: revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : null,
nps: totalFb > 0 ? Math.round(((promoters - detractors) / totalFb) * 100) : null,
returnRate: totalReturningBase > 0 ? Math.round((returningCount / totalReturningBase) * 100) : null,
```

---

### `src/app/(dashboard)/analytics/_components/AnalyticsClient.tsx` (component Client) — MODIFICAR

**Análogo:** arquivo atual

**Locais de null-guard necessários** (linhas 49–78):

```typescript
// linha 50 — avgTicket (ANTES):
sub: `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`,
// DEPOIS (D-07/D-08):
sub: analyticsKpis.avgTicket !== null
  ? `Ticket médio ${formatCurrency(analyticsKpis.avgTicket)}`
  : "Ticket médio N/D",

// linha 57 — netMargin (ANTES):
value: `${analyticsKpis.netMargin}%`,
// DEPOIS:
value: analyticsKpis.netMargin !== null ? `${analyticsKpis.netMargin}%` : "N/D",

// linha 64 — nps (ANTES):
value: analyticsKpis.nps.toString(),
// DEPOIS:
value: analyticsKpis.nps !== null ? analyticsKpis.nps.toString() : "N/D",

// linha 65 — returnRate (ANTES):
sub: `${analyticsKpis.returnRate}% taxa de retorno`,
// DEPOIS:
sub: analyticsKpis.returnRate !== null
  ? `${analyticsKpis.returnRate}% taxa de retorno`
  : "Taxa de retorno N/D",
```

**Atualização do tipo Props** (linha 26):

```typescript
// A mudança de tipo em AnalyticsKpis propagará automaticamente via import
// TypeScript apontará todos os locais que precisam de guard
import type { AnalyticsKpis, ... } from "@/_data-access/analytics";
// Props.kpis: AnalyticsKpis — tipo já correto, campos passam a ser number | null
```

---

## Padrões Compartilhados

### Autenticação em Server Actions

**Fonte:** `src/_lib/safe-action.ts` (linhas 22–37)
**Aplicar em:** `src/_actions/finance.ts` — todas as actions

```typescript
// authActionClient já valida sessão via middleware
// usar authActionClient (não actionClient) para todas as mutations de transação
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new ActionError("Não autenticado.");
  return next({ ctx: { user: session.user, session: session.session } });
});
```

### router.refresh() após mutação (D-05)

**Fonte:** padrão estabelecido em appointments/orders
**Aplicar em:** `use-transaction-form.ts` — callbacks `onSuccess` de create, update e delete

```typescript
import { useRouter } from "next/navigation";
const router = useRouter();

onSuccess: () => {
  toast.success("...");
  router.refresh();   // invalida cache do Server Component pai
  onClose();
},
```

### Conversão numeric → number na camada de dados

**Fonte:** `src/_data-access/finance.ts` linha 49, `analytics.ts` linha 145
**Aplicar em:** `getCategoryReport` (nova função) — todos os campos `sql<number>`

```typescript
// SEMPRE: Number(r.fieldName) no mapeamento de retorno
// NUNCA: retornar string diretamente de campo numeric
grossRevenue: Number(r.grossRevenue),
totalExpenses: Number(r.totalExpenses),
```

### sql.raw para intervalo dinâmico

**Fonte:** `src/_data-access/finance.ts` linhas 71–74
**Aplicar em:** `getCategoryReport(days)` — cláusula WHERE

```typescript
// APENAS para valores derivados de getPeriodDays() (30 | 90 | 365) — nunca de user input direto
sql`${transactions.date} >= current_date - interval '${sql.raw(String(days))} days'`;
```

### amount como String para Drizzle insert/update

**Fonte:** `src/_actions/orders.ts` linhas 91–92, 105–106
**Aplicar em:** `createTransactionAction` e `updateTransactionAction`

```typescript
// Coluna numeric(12,2) exige string — Zod coerce.number() produz JS number
amount: String(parsedInput.amount);
```

### Zod schema sem `.default()`

**Fonte:** regra do projeto (documentada em RESEARCH.md anti-patterns)
**Aplicar em:** `transactionSchema` em `use-transaction-form.ts`

```typescript
// NUNCA: z.string().default("foo")
// SEMPRE: defaultValues no useForm
defaultValues: { type: "income", status: "paid", ... }
```

### Server Component por padrão + "use client" apenas onde necessário

**Fonte:** padrão estabelecido em todo o codebase
**Aplicar em:**

- `finance/page.tsx` — Server Component (sem "use client")
- `finance/reports/page.tsx` — Server Component (sem "use client")
- `NewTransactionDrawer.tsx` — "use client" (interativo)
- `EditTransactionDrawer.tsx` — "use client" (interativo)
- `use-transaction-form.ts` — "use client" (usa hooks)
- Wrapper `TransactionsTableWithDrawer` — "use client" (estado do drawer)

---

## Sem Análogo Encontrado

Nenhum arquivo nesta fase está sem análogo. Todos têm correspondência direta no codebase existente.

---

## Observações de Implementação

### DataTable já suporta onRowClick

Confirmado em `src/_components/ui/data-table.tsx` linhas 23, 73–75 — nenhuma modificação no componente necessária. A prop `onRowClick?: (row: T) => void` já existe e aplica `cursor-pointer` automaticamente.

### Seed de transações parcialmente implementado

`scripts/seed.ts` já cria ~120 transações (90 receitas + 30 despesas) cobrindo 6 meses. D-11/D-12 deve ser tratado como "verificar volume e categorias" em vez de "criar do zero".

### FinanceActions requer refactoring mínimo

`finance-actions.tsx` é Client Component com `useState` local. Para montar o drawer de nova transação, a abordagem mais limpa é adicionar `onNewTransaction?: () => void` como prop (Opção A) e criar um wrapper Client Component na `finance/page.tsx` que gerencie o estado `open` do drawer.

---

## Metadados

**Escopo de busca:** `src/_actions/`, `src/_hooks/`, `src/_data-access/`, `src/app/(dashboard)/finance/`, `src/app/(dashboard)/analytics/`, `src/_components/ui/`
**Arquivos lidos:** 12
**Data de mapeamento:** 2026-06-22
