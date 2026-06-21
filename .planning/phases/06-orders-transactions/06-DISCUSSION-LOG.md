# Phase 6: Orders & Transactions - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 6-orders-transactions
**Areas discussed:** Transaction trigger, Transaction valores, totalAmount recálculo, revalidatePath escopo

---

## Transaction Trigger

| Option                     | Description                                                                                                                   | Selected |
| -------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------- |
| Status → "completed"       | Dentro de updateOrderStatusAction, ao mudar status para 'completed', inserir transactions automaticamente. Simples e atômico. | ✓        |
| Ação separada de aprovação | Criar 'approveOrderBudgetAction' que muda status + insere transação. Mais explícito, mas adiciona complexidade.               |          |

**User's choice:** Status → "completed" (Recomendado)
**Notes:** Inserção atômica dentro da action existente, sem nova action.

---

## Transaction Valores

| Option                                                      | Description                                                                           | Selected |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------- |
| description: 'O.S. #N', category: 'Serviço', status: 'paid' | Ordem fechada = serviço concluído = pago. type: 'income', amount: totalAmount da O.S. | ✓        |
| status: 'pending'                                           | Inserir como pendente — operador confirma pagamento depois na tela de finanças.       |          |

**User's choice:** status: 'paid' (Recomendado)
**Notes:** Fechar a O.S. implica serviço concluído e pago.

---

## totalAmount Recálculo

| Option                       | Description                                                                                   | Selected |
| ---------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| Sim — recalcular totalAmount | Somar apenas itens com approved=true. Mantém totalAmount consistente com o que será faturado. | ✓        |
| Não — manter da criação      | totalAmount foi definido na criação e não muda. Itens reprovados são só visual.               |          |

**User's choice:** Sim — recalcular totalAmount (Recomendado)
**Notes:** approveOrderItemAction deve recalcular totalAmount após aprovar/reprovar item.

---

## revalidatePath Escopo

| Option                                      | Description                                                                                   | Selected |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- | -------- |
| /orders, /orders/[id], /finance, /analytics | Finance e analytics mostram dados de transações — devem refletir novo registro imediatamente. | ✓        |
| Apenas /orders e /orders/[id]               | Revalidar só as páginas de O.S. Finance/analytics atualizam no próximo acesso.                |          |

**User's choice:** /orders, /orders/[id], /finance, /analytics (Recomendado)
**Notes:** Revalidação ampla garante consistência imediata nos dashboards financeiros.

---

## Claude's Discretion

- Estratégia de query para recalcular totalAmount (subquery SQL vs .select() + .reduce() em JS)
- Ordem de operações dentro de updateOrderStatusAction

## Deferred Ideas

- Paginação server-side de O.S. — deferida para milestone futuro
- Filtro por mecânico ou data nas listagens
- Notificação/webhook ao fechar O.S.
