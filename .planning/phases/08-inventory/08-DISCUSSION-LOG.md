# Phase 8: Inventory - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 8-inventory
**Areas discussed:** Momento do decremento de estoque, Guard de estoque insuficiente, Restore ao deletar O.S., Dados seed de inventário

---

## Momento do decremento de estoque

| Option                                | Description                                                                                                     | Selected |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------- |
| Ao criar a O.S. (wizard step 3)       | Stock cai imediatamente quando a O.S. é criada. Peças ficam 'reservadas'. Evita vender a mesma peça duas vezes. | ✓        |
| Ao fechar a O.S. (status → completed) | Stock só cai quando concluído. Mais simples (sem rollback se deletar).                                          |          |

**User's choice:** Ao criar a O.S. — decremento imediato na criação

---

| Option                            | Description                                                 | Selected |
| --------------------------------- | ----------------------------------------------------------- | -------- |
| Mesma transação (db.transaction)  | Atomicidade total — se insert falhar, estoque não cai.      | ✓        |
| Queries separadas (sem transação) | Mais simples, mas inconsistência possível em caso de falha. |          |

**User's choice:** db.transaction — decremento atômico

---

| Option                                                         | Description                                                      | Selected |
| -------------------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Só peças com serviceId (itemType = 'part' + serviceId != null) | Peças avulsas sem vínculo ao catálogo não têm o que decrementar. | ✓        |
| Todos os itens itemType = 'part', independente de serviceId    | Não faz sentido — não há registro na tabela services.            |          |

**User's choice:** Apenas itens com serviceId != null

---

## Guard de estoque insuficiente

| Option                                 | Description                                                                                                  | Selected |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------- |
| Permitir (sem bloqueio)                | Estoque pode ficar negativo. Comportamento pragmático — alertas de mínimo já avisam. INV-03 não exige guard. | ✓        |
| Bloquear criação com erro de validação | Mais rígido, exige mensagem clara no wizard.                                                                 |          |

**User's choice:** Sem bloqueio — estoque negativo tolerado

---

## Restore ao deletar O.S.

| Option                              | Description                                                                                               | Selected |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| Sim, restaurar o estoque ao deletar | Consistente com decremento ao criar. Se O.S. não aconteceu, peças voltam. Mesmo db.transaction do delete. | ✓        |
| Não restaurar                       | Mais simples, mas gera inconsistência. Operador ajustaria manualmente.                                    |          |

**User's choice:** Restaurar estoque ao deletar, dentro de db.transaction

---

## Dados seed de inventário

| Option                             | Description                                                                             | Selected |
| ---------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Sim, adicionar peças ao seed       | Sem seed, /inventory fica vazio e testes de INV-01, INV-03 e alertas ficam impossíveis. | ✓        |
| Não, operador cadastra manualmente | Seed mais simples mas sem dados para validação imediata.                                |          |

**User's choice:** Adicionar peças ao seed

---

| Option                                         | Description                                                                                | Selected |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------ | -------- |
| Filtros, Óleo, Freios, Elétrico (4 categorias) | Cobre os tabs existentes no inventory-client. Incluir 1 peça com estoque abaixo do mínimo. | ✓        |
| Uma peça por categoria (simplificado)          | Mínimo necessário, menos realista.                                                         |          |

**User's choice:** 4 categorias, ~6–8 peças, pelo menos 1 com stockQuantity < minStock

---

## Claude's Discretion

- Nenhuma área delegada ao Claude — todas as decisões foram explicitamente tomadas pelo usuário.

## Deferred Ideas

- CLI-02 (`/customers/[id]` com veículos + histórico de O.S.) — pertence ao escopo da Phase 7 ou a uma tarefa de fix, não Phase 8
- Seed de ordens de compra — deferido; criação manual via UI é suficiente para UAT da v1.1
- Paginação server-side para listas grandes — Future requirement
