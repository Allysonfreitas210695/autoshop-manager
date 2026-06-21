---
phase: 06-orders-transactions
verified: 2026-06-21T14:50:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Criar O.S. no sistema, aprovar itens de orçamento e verificar atualização do totalAmount"
    expected: "Total do pedido reflete apenas itens aprovados; campo atualiza ao aprovar/rejeitar itens"
    why_human: "Comportamento de UI/UX e persistência real no banco não são verificáveis via grep"
  - test: "Fechar uma O.S. (status → completed) e verificar registro em transactions no banco"
    expected: "Exatamente uma linha inserida em transactions com type=income, status=paid, amount=totalAmount da O.S., description='O.S. #<n>', serviceOrderId correto"
    why_human: "Requer conexão real ao banco de dados PostgreSQL e inspeção de tabela"
  - test: "Navegar para /finance após fechar uma O.S. e verificar que a transação aparece"
    expected: "Página /finance exibe a receita recém-criada sem necessidade de reload manual"
    why_human: "Revalidação de cache Next.js e renderização de dados em tela requer verificação visual"
  - test: "Verificar que fechar a mesma O.S. duas vezes (completed → outro status → completed) insere segunda row"
    expected: "Comportamento documentado como limitação conhecida (T-06-03 accepted) — confirmar que não causa crash"
    why_human: "Requer manipulação de estado real no banco; comportamento de status toggle"
---

# Fase 06: Orders & Transactions — Relatório de Verificação

**Meta da Fase:** Service orders com CRUD completo no banco real; fechar O.S. cria registro em transactions; aprovar/rejeitar itens de orçamento recalcula totalAmount da ordem.
**Verificado em:** 2026-06-21T14:50:00Z
**Status:** human_needed
**Re-verificação:** Não — verificação inicial

---

## Alcance da Meta

### Verdades Observáveis

| #   | Verdade                                                                                                                        | Status     | Evidência                                                                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Fechar O.S. (status → completed) insere exatamente uma linha em transactions com total e orderNumber na descrição (D-01, D-02) | VERIFICADO | `orders.ts:135-144`: guard `if (parsedInput.status === "completed")` + `db.insert(transactions).values({ description: \`O.S. #${order.orderNumber}\`, ... })`                                          |
| 2   | Linha em transactions inserida SOMENTE quando status === completed, nunca em outras mudanças de status (D-01)                  | VERIFICADO | `orders.ts:135`: guard explícito `if (parsedInput.status === "completed")` antes do insert                                                                                                             |
| 3   | Aprovar ou rejeitar item de orçamento recalcula serviceOrders.totalAmount como soma dos itens aprovados apenas (D-03, D-04)    | VERIFICADO | `orders.ts:184-202`: re-query com `and(eq(...serviceOrderId...), eq(...approved, true))` + `.reduce(` + `Number(i.unitPrice)` + `db.update(serviceOrders).set({ totalAmount: String(newTotal), ... })` |
| 4   | Todo db.update em serviceOrders define updatedAt: new Date() (OS-03)                                                           | VERIFICADO | `orders.ts:126`: `updatedAt: new Date()` em updateOrderStatusAction; `orders.ts:201`: `updatedAt: new Date()` em approveOrderItemAction                                                                |
| 5   | updateOrderStatusAction revalida /orders, /orders/[id], /finance, /analytics (D-05)                                            | VERIFICADO | `orders.ts:147-150`: quatro chamadas `revalidatePath` presentes — `/orders`, `/orders/${parsedInput.id}`, `/finance`, `/analytics`                                                                     |
| 6   | approveOrderItemAction revalida /orders/[id]/budget e /orders/[id] (D-06)                                                      | VERIFICADO | `orders.ts:204-205`: `revalidatePath(\`/orders/${parsedInput.orderId}/budget\`)` e `revalidatePath(\`/orders/${parsedInput.orderId}\`)`                                                                |

**Score:** 6/6 verdades verificadas

---

### Artefatos Obrigatórios

| Artefato                      | Esperado                                                                                                      | Status     | Detalhes                                                                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------- |
| `src/_actions/orders.ts`      | updateOrderStatusAction com insert atômico em transactions + approveOrderItemAction com recalc de totalAmount | VERIFICADO | Arquivo existe, 207 linhas, contém `db.insert(transactions)` e lógica de recalc completa |
| `src/_actions/orders.test.ts` | Testes de asserção estática D-01..D-06                                                                        | VERIFICADO | Arquivo existe, 174 linhas, 8 testes — todos passando (saída: `8 passed (8)`)            |

---

### Verificação de Links-Chave

| De                        | Para                        | Via                                                           | Status    | Detalhes                                                                                                               |
| ------------------------- | --------------------------- | ------------------------------------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------- |
| `updateOrderStatusAction` | tabela `transactions`       | `db.insert(transactions)` guardado por `status === completed` | CONECTADO | Linha 136: `await db.insert(transactions).values({...})` dentro do bloco `if (parsedInput.status === "completed")`     |
| `approveOrderItemAction`  | `serviceOrders.totalAmount` | re-query de itens aprovados + `db.update(serviceOrders)`      | CONECTADO | Linhas 184-202: re-query com `and(...)`, `.reduce(`, `db.update(serviceOrders).set({ totalAmount: String(newTotal) })` |

---

### Rastreamento de Data-Flow (Nível 4)

| Artefato                  | Variável            | Fonte                                                                    | Produz Dados Reais                                         | Status  |
| ------------------------- | ------------------- | ------------------------------------------------------------------------ | ---------------------------------------------------------- | ------- |
| `updateOrderStatusAction` | `order.totalAmount` | `.returning({ totalAmount: serviceOrders.totalAmount })` no update do DB | Sim — capturado diretamente da row atualizada              | FLUINDO |
| `approveOrderItemAction`  | `newTotal`          | `db.select().from(serviceOrderItems).where(and(...approved true...))`    | Sim — query real ao banco com filtro por `approved = true` | FLUINDO |

---

### Verificações Comportamentais (Spot-Checks)

| Comportamento                      | Comando                                           | Resultado    | Status |
| ---------------------------------- | ------------------------------------------------- | ------------ | ------ |
| Testes D-01..D-06 verdes           | `npm run test:run -- src/_actions/orders.test.ts` | 8 passed (8) | PASSOU |
| Testes \_audit.test.ts preservados | `npm run test:run -- src/_actions/_audit.test.ts` | 5 passed (5) | PASSOU |
| TypeScript sem erros               | `npx tsc --noEmit`                                | exit code 0  | PASSOU |

---

### Cobertura de Requisitos

| Requisito | Plano | Descrição                                                                              | Status     | Evidência                                                                                                |
| --------- | ----- | -------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| OS-01     | 06-01 | Operador pode criar, listar e atualizar status de O.S. com dados persistidos no banco  | SATISFEITO | `updateOrderStatusAction` persiste no banco e revalida `/orders`; createOrderAction preexistente mantido |
| OS-02     | 06-01 | Ao fechar/aprovar uma O.S., sistema cria automaticamente registro em `transactions`    | SATISFEITO | `db.insert(transactions)` em `orders.ts:136` guardado por `status === "completed"`                       |
| OS-03     | 06-01 | Todas as ações de update incluem `updatedAt: new Date()` (dados de auditoria corretos) | SATISFEITO | Linhas 126 e 201 — ambas as ações de update definem `updatedAt: new Date()`                              |

Nenhum requisito órfão. OS-01, OS-02, OS-03 todos declarados no plano e verificados no código.

---

### Anti-Padrões Encontrados

| Arquivo | Linha | Padrão            | Severidade | Impacto |
| ------- | ----- | ----------------- | ---------- | ------- |
| —       | —     | Nenhum encontrado | —          | —       |

Nenhum marcador TBD/FIXME/XXX, sem implementações stub, sem props hardcoded com valores vazios nos arquivos modificados.

**Nota:** T-06-03 (inserção duplicada de transaction ao fechar a mesma O.S. duas vezes) é aceito como limitação conhecida documentada em PLAN frontmatter threat model. Não é um blocker para v1.1.

---

### Verificação Humana Necessária

#### 1. Atualização do totalAmount via UI

**Teste:** Criar O.S., adicionar itens, aprovar/rejeitar individualmente na tela de orçamento
**Esperado:** Campo totalAmount atualiza na página de detalhe da O.S. após cada ação
**Por que humano:** Revalidação do cache Next.js e renderização em tela não são verificáveis via grep

#### 2. Inserção de transaction no banco ao fechar O.S.

**Teste:** Fechar uma O.S. via UI (status → completed) e inspecionar tabela `transactions` no banco
**Esperado:** Exatamente uma linha com `type=income`, `status=paid`, `amount=totalAmount`, `description='O.S. #<n>'`, `serviceOrderId` correto
**Por que humano:** Requer conexão real ao PostgreSQL e consulta manual

#### 3. /finance exibe a transação após fechamento de O.S.

**Teste:** Após fechar O.S., navegar para /finance
**Esperado:** A receita recém-criada aparece na página sem reload manual
**Por que humano:** Renderização de dados e revalidação de cache requerem verificação visual em browser

#### 4. Comportamento de status toggle (limitação T-06-03)

**Teste:** Fechar O.S. (completed), reabrir para outro status, fechar novamente
**Esperado:** Segunda transaction inserida (limitação conhecida) — sem crash ou comportamento inesperado
**Por que humano:** Requer manipulação de estado real no banco

---

### Resumo

Todos os 6 must-haves verificados no código. Os dois artefatos obrigatórios existem, são substantivos e estão conectados. Links-chave wired e data-flow confirmado até o DB. Testes passando (8/8 D-01..D-06, 5/5 audit). TypeScript limpo.

Status `human_needed` porque 4 comportamentos requerem verificação em browser/banco que não são verificáveis via análise estática.

---

_Verificado em: 2026-06-21T14:50:00Z_
_Verificador: Claude (gsd-verifier)_
