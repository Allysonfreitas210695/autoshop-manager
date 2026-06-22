# Phase 10: Finance & Analytics - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 10-finance-analytics
**Areas discussed:** Gestão de Transações, Empty-state N/D vs 0, Otimização de Reports, Seed de Transações

---

## Gestão de Transações

| Opção                 | Descrição                                       | Selecionado |
| --------------------- | ----------------------------------------------- | ----------- |
| Sim — adicionar form  | Drawer com campos completos para criação manual | ✓           |
| Não — somente leitura | Transações só via O.S.                          |             |

**User's choice:** Adicionar form de criação manual

| Opção                                                      | Descrição                    | Selecionado |
| ---------------------------------------------------------- | ---------------------------- | ----------- |
| Mínimo (tipo, valor, data, descrição)                      | Categoria e status opcionais |             |
| Completo (tipo, valor, data, descrição, categoria, status) | Todos os campos obrigatórios | ✓           |

**User's choice:** Form completo com todos os campos

| Opção                      | Descrição                     | Selecionado |
| -------------------------- | ----------------------------- | ----------- |
| Somente criar              | CRUD parcial: create + list   |             |
| Create + Delete (sem edit) | Permitir excluir, sem editar  |             |
| CRUD completo              | Create, edit (drawer), delete | ✓           |

**User's choice:** CRUD completo

| Opção                      | Descrição                      | Selecionado |
| -------------------------- | ------------------------------ | ----------- |
| Fixas — select predefinido | Categorias do COST_COLORS enum |             |
| Livres — texto digitado    | Usuário digita qualquer string | ✓           |

**User's choice:** Categorias livres (text input)

---

## Empty-state: N/D vs 0

| Opção                            | Descrição                   | Selecionado |
| -------------------------------- | --------------------------- | ----------- |
| N/D para todos os KPIs sem fonte | Exibir N/D quando count = 0 | ✓           |
| 0 ou 0% (valor neutro)           | Mostrar 0 / 0% / R$0        |             |

**User's choice:** N/D para KPIs sem fonte de dados

| Opção                                                | Descrição                      | Selecionado |
| ---------------------------------------------------- | ------------------------------ | ----------- |
| Apenas derivados (NPS, taxa retorno, margem, ticket) | Contagens continuam 0          | ✓           |
| Todos os KPIs sem transações                         | N/D em tudo quando banco vazio |             |

**User's choice:** Apenas KPIs derivados (divisão/cálculo) mostram N/D

| Opção                                | Descrição                                          | Selecionado |
| ------------------------------------ | -------------------------------------------------- | ----------- |
| null no type, UI decide 'N/D'        | getAnalyticsKpis retorna null; client exibe string | ✓           |
| String 'N/D' diretamente do servidor | Tipo inclui string \| number                       |             |

**User's choice:** null no type, AnalyticsClient renderiza "N/D"

---

## Otimização de Reports

| Opção                       | Descrição                                 | Selecionado |
| --------------------------- | ----------------------------------------- | ----------- |
| Migrar para GROUP BY no SQL | getCategoryReport() com query Drizzle     | ✓           |
| Manter JS em memória        | listTransactions(500) + buildCategoryRows |             |

**User's choice:** Migrar para SQL GROUP BY

| Opção                       | Descrição                          | Selecionado |
| --------------------------- | ---------------------------------- | ----------- |
| Manter fixo em 6 meses      | Sem filtro de período              |             |
| Adicionar filtro de período | ?periodo=mensal\|trimestral\|anual | ✓           |

**User's choice:** Adicionar filtro de período igual ao /finance

---

## Seed de Transações

| Opção                            | Descrição                          | Selecionado |
| -------------------------------- | ---------------------------------- | ----------- |
| Sim — gerar transações realistas | ~30 transações nos últimos 6 meses | ✓           |
| Não — banco limpo                | Testar com DB vazio                |             |

**User's choice:** Seed com transações realistas

| Opção                                             | Descrição                    | Selecionado |
| ------------------------------------------------- | ---------------------------- | ----------- |
| Sim — receitas vinculadas a O.S. (serviceOrderId) | FK para service_orders       | ✓           |
| Independentes — sem FK para O.S.                  | serviceOrderId: null em tudo |             |

**User's choice:** Receitas vinculadas a O.S. via serviceOrderId; despesas sem FK

---

## Claude's Discretion

- Placement of "Nova Transação" inside FinanceActions dropdown
- Drawer animation and field ordering
- Server action names (createTransactionAction, updateTransactionAction, deleteTransactionAction)
- Zod schema for transaction form validation

## Deferred Ideas

- Paginação server-side da tabela de transações — listado em REQUIREMENTS.md Future Requirements
- Filtro avançado de transações por tipo/status/categoria
- ExportPdfButton — PDF export placeholder, fora do escopo da fase 10
- Driver swap pg.Pool → Neon serverless — explicitamente fora do escopo v1.1
