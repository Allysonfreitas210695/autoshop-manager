# Requirements — v1.1 DB Integration & Live Data

> Milestone goal: Substituir todo o mock data por queries Drizzle ORM reais em todos os módulos, conectando Better Auth ao banco de dados.

## v1.1 Requirements

### Foundation & Auth

- [ ] **FOUND-01**: Operador pode rodar migrations e ter o banco de produção com schema atualizado
- [ ] **FOUND-02**: Sistema autentica usuários contra o banco Drizzle (login, sessão, logout verificados)
- [ ] **FOUND-03**: Desenvolvedor pode popular banco com seed script de dados representativos

### Ordens de Serviço

- [ ] **OS-01**: Operador pode criar, listar e atualizar status de O.S. com dados persistidos no banco
- [ ] **OS-02**: Ao fechar/aprovar uma O.S., sistema cria automaticamente registro em `transactions`
- [ ] **OS-03**: Todas as ações de update incluem `updatedAt: new Date()` (dados de auditoria corretos)

### Clientes & Veículos

- [ ] **CLI-01**: Operador pode criar, listar, editar e buscar clientes do banco
- [ ] **CLI-02**: Operador pode ver e gerenciar veículos vinculados a clientes com histórico de O.S.
- [ ] **CLI-03**: Sistema rejeita criação de cliente com email já existente (sem crash PG)

### Inventário

- [ ] **INV-01**: Operador pode listar peças, ver alertas de estoque mínimo real e atualizar quantidades
- [ ] **INV-02**: Operador pode criar e listar ordens de compra com todos os status válidos (incluindo "confirmed")
- [ ] **INV-03**: Ao adicionar peça a uma O.S., sistema decrementa `quantity` no banco automaticamente

### Agendamentos

- [ ] **APPT-01**: Operador pode criar, listar e cancelar agendamentos com dados persistidos no banco
- [ ] **APPT-02**: Schema de agendamentos inclui `serviceType` e `duration` (sem perda de dados do formulário)

### Finance & Analytics

- [ ] **FIN-01**: Relatórios financeiros exibem receita/despesas/lucro calculados de `transactions` reais
- [ ] **FIN-02**: Dashboard analítico exibe métricas reais (sem valores sentinel "-1" visíveis ao usuário)
- [ ] **FIN-03**: Queries do dashboard usam joins/batch em vez de N+1 loops
- [ ] **FIN-04**: Colunas `numeric` do Drizzle são convertidas para `number` em toda a camada de apresentação

## Future Requirements

- Driver swap: substituir pg.Pool por @neondatabase/serverless ou similar (connection pooling serverless-nativo)
- Seção `nextServices` em /customers/[id] com fonte de dados real
- Paginação server-side para listas grandes (O.S., clientes, inventário)

## Out of Scope

- Re-arquitetura de telas existentes — UI validada em v1.0, apenas camada de dados muda
- Driver swap para Neon/serverless (deferido — pg.Pool com max=3 é suficiente para v1.1)
- Remoção da seção `nextServices` (comportamento atual mantido)
- Novas features de produto (relatórios extras, notificações, etc.)

## Traceability

| REQ-ID   | Phase    | Status  |
| -------- | -------- | ------- |
| FOUND-01 | Phase 5  | Pending |
| FOUND-02 | Phase 5  | Pending |
| FOUND-03 | Phase 5  | Pending |
| OS-01    | Phase 6  | Pending |
| OS-02    | Phase 6  | Pending |
| OS-03    | Phase 6  | Pending |
| CLI-01   | Phase 7  | Pending |
| CLI-02   | Phase 7  | Pending |
| CLI-03   | Phase 7  | Pending |
| INV-01   | Phase 8  | Pending |
| INV-02   | Phase 8  | Pending |
| INV-03   | Phase 8  | Pending |
| APPT-01  | Phase 9  | Pending |
| APPT-02  | Phase 9  | Pending |
| FIN-01   | Phase 10 | Pending |
| FIN-02   | Phase 10 | Pending |
| FIN-03   | Phase 10 | Pending |
| FIN-04   | Phase 10 | Pending |
