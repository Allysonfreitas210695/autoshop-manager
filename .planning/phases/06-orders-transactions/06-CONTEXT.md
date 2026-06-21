# Phase 6: Orders & Transactions - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Ordens de serviço (O.S.) ficam totalmente persistidas no banco real: criar, listar, detalhar, alterar status, aprovar itens de orçamento. Ao fechar uma O.S. (status → "completed"), uma linha é inserida automaticamente em `transactions`. O `totalAmount` da O.S. é recalculado toda vez que um item é aprovado ou reprovado.

O que esta fase NÃO faz: CRUD de clientes/veículos (Phase 7), inventário (Phase 8), agendamentos (Phase 9), finance/analytics (Phase 10). A UI das ordens já está construída — foco é o comportamento de dados.

</domain>

<decisions>
## Implementation Decisions

### Transaction — Trigger

- **D-01:** O evento que cria a linha em `transactions` é `status → "completed"` dentro de `updateOrderStatusAction`. A inserção deve ocorrer na mesma chamada (atomicamente, sem action separada).

### Transaction — Campos da linha inserida

- **D-02:** Ao fechar a O.S., inserir em `transactions`:
  - `date`: `new Date()`
  - `description`: `"O.S. #${order.orderNumber}"`
  - `category`: `"Serviço"`
  - `type`: `"income"`
  - `amount`: `totalAmount` da O.S. (como string `numeric`)
  - `status`: `"paid"`
  - `serviceOrderId`: ID da O.S.

### totalAmount — Recálculo ao aprovar/reprovar itens

- **D-03:** `approveOrderItemAction` deve, após atualizar `approved`, recalcular e atualizar `totalAmount` na O.S.: somar apenas os itens com `approved = true` (quantity × unitPrice).
- **D-04:** O recálculo usa uma subquery Drizzle ou query separada para buscar todos os itens ativos da O.S. e somar o total antes de fazer `db.update(serviceOrders).set({ totalAmount, updatedAt })`.

### revalidatePath — Escopo completo

- **D-05:** `updateOrderStatusAction` deve revalidar: `/orders`, `/orders/${id}`, `/finance`, `/analytics`. Finance e analytics exibem dados de transações — devem refletir a nova linha imediatamente.
- **D-06:** `approveOrderItemAction` deve revalidar: `/orders/${orderId}/budget` (já faz) e também `/orders/${orderId}` (detalhe pode mostrar total atualizado).

### Claude's Discretion

- Estratégia de query para recalcular totalAmount: pode usar `db.select` + `.reduce()` em JS, ou uma `sql` expression — o executor escolhe o padrão mais limpo conforme os padrões existentes.
- Ordem de operações dentro de `updateOrderStatusAction` (update status → query orderNumber → insert transaction): executor decide a sequência mais legível.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema

- `src/_db/schema/service-orders.ts` — tabelas `serviceOrders`, `serviceOrderItems`, enum `serviceOrderStatus`
- `src/_db/schema/transactions.ts` — tabela `transactions`, enums `transactionType`, `transactionStatus`
- `src/_db/schema/index.ts` — ponto de entrada do schema (re-exports)

### Actions e Data-Access

- `src/_actions/orders.ts` — actions existentes: `createOrderAction`, `updateOrderStatusAction`, `approveOrderItemAction` etc. — modificar aqui
- `src/_data-access/orders.ts` — queries existentes: `listOrders`, `getOrderById` — referência de padrão

### Projeto e Requisitos

- `.planning/REQUIREMENTS.md` §Orders & Service — OS-01, OS-02, OS-03
- `.planning/ROADMAP.md` §Phase 6 — success criteria (4 critérios)
- `.planning/phases/05-db-foundation-auth/05-CONTEXT.md` — decisões de pool, numeric→Number(), updatedAt

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/_actions/orders.ts`: `updateOrderStatusAction` já faz `db.update(serviceOrders).set({ status, closedAt, updatedAt })` — apenas adicionar insert em `transactions` e revalidatePath expandido
- `src/_actions/orders.ts`: `approveOrderItemAction` já faz `db.update(serviceOrderItems)` — apenas adicionar recálculo de `totalAmount` + `db.update(serviceOrders)`
- `authActionClient` de `@/_lib/safe-action` — padrão de action autenticada, manter em todas as modificações

### Established Patterns

- `numeric(12,2)` colunas retornam string JS — converter com `Number()` antes de operações aritméticas; armazenar de volta como `String(result)` no Drizzle
- `updatedAt: new Date()` obrigatório em todo `db.update()` que modifica dados de negócio
- `revalidatePath` chamado ao final da action, após todas as operações de banco
- Drizzle ORM com `eq`, `and`, `desc` de `drizzle-orm` — padrão de import já estabelecido

### Integration Points

- `transactions.serviceOrderId` FK para `serviceOrders.id` — ligar corretamente ao inserir
- `serviceOrders.orderNumber` necessário para `description` da transaction — buscar via `.returning({ orderNumber: serviceOrders.orderNumber })` no update ou query separada
- Finance page (`src/app/(dashboard)/finance/`) e analytics leem de `transactions` — revalidatePath `/finance` e `/analytics` garantem dados frescos

</code_context>

<specifics>
## Specific Ideas

- `transactions` inserida ao fechar: `{ date: new Date(), description: \`O.S. #${order.orderNumber}\`, category: "Serviço", type: "income", amount: order.totalAmount, status: "paid", serviceOrderId: order.id }`
- Para obter `orderNumber` no `updateOrderStatusAction`: usar `.returning({ id: serviceOrders.id, orderNumber: serviceOrders.orderNumber, totalAmount: serviceOrders.totalAmount })` no `db.update()`.
- Recálculo de total: `SELECT SUM(quantity * unit_price) FROM service_order_items WHERE service_order_id = ? AND approved = true` — pode ser expresso como Drizzle select com `sql\`\``ou iteração JS sobre resultado de`.select()`.

</specifics>

<deferred>
## Deferred Ideas

- Paginação server-side de O.S. — deferida para milestone futuro (lista já funciona com pageSize=20)
- Filtro por mecânico ou data nas listagens — fora do escopo desta fase
- Notificação/webhook ao fechar O.S. — fora do escopo

</deferred>

---

_Phase: 6-orders-transactions_
_Context gathered: 2026-06-21_
