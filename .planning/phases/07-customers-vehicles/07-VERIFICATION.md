---
phase: 07-customers-vehicles
verified: 2026-06-21T16:17:30Z
status: human_needed
score: 3/3 must-haves verified
overrides_applied: 0
gaps: []
human_verification:
  - test: "Criar cliente com email duplicado via UI"
    expected: "Mensagem 'E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.' exibida no formulário, sem crash"
    why_human: "Fluxo UI — server action retorna serverError; não verificável por grep"
  - test: "Editar cliente mantendo o próprio email"
    expected: "Atualização salva com sucesso (sem erro de duplicidade)"
    why_human: "Dependente de comportamento do banco em runtime — o ne() guard foi substituído por constraint catch; correto apenas se PG não lança 23505 ao atualizar para o mesmo valor"
  - test: "Buscar cliente por placa via campo de busca"
    expected: "Cliente com veículo de placa correspondente aparece nos resultados"
    why_human: "Comportamento de busca em produção com dados reais"
  - test: "CLI-02: Gerenciar veículos vinculados a clientes com histórico de O.S."
    expected: "Página /customers/[id] exibe veículos e histórico de ordens de serviço reais"
    why_human: "CLI-02 está mapeada para Phase 7 em REQUIREMENTS.md mas não foi coberta por nenhum plano desta phase — requer validação humana do que existe"
---

# Phase 7: Customers Vehicles Verification Report

**Phase Goal:** Implement customer management with real database — CRUD completo de clientes e veículos com dados reais do banco.
**Verified:** 2026-06-21T16:17:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                                                    | Status     | Evidence                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Criar cliente com email já existente retorna mensagem amigável (sem crash PG)                            | ✓ VERIFIED | `isUniqueConstraintError(e, "user_email_unique")` + `throw new ActionError("E-mail já cadastrado...")` em `customers.ts` L44-49                               |
| 2   | Editar cliente para email de outro cliente retorna mensagem amigável; manter o próprio email é permitido | ✓ VERIFIED | `updateCustomerAction` usa constraint catch com `isUniqueConstraintError` L130-133; PG não emite 23505 ao atualizar para o mesmo valor (comportamento padrão) |
| 3   | Busca de clientes encontra registros por nome, email, CPF e placa em todo o banco                        | ✓ VERIFIED | `ilike(user.cpf, pattern)` L199 + `ilike(vehicles.plate, pattern)` L200 + `leftJoin(vehicles...)` L192 + `groupBy(user.id)` L204                              |

**Score:** 3/3 truths verified

### Desvio de Implementacao — Mecanismo de Guard (NAO e um gap, mas requer registro)

O plano especificou `eq(user.email` pre-check SELECT antes de INSERT/UPDATE + `ne(user.id)` para update. A implementacao real usa `try/catch` em constraint PG `23505`. O resultado funcional e identico, mas o mecanismo difere.

**Impacto:** Nenhum bloqueio funcional. O PG nao emite 23505 ao atualizar uma linha para seu proprio valor de email (nenhuma violacao de unicidade ocorre). A ausencia de `ne()` nao e um bug — e simplesmente desnecessaria nesta abordagem.

**Teste D-02 adaptado:** O test scaffold foi reescrito para asserir `isUniqueConstraintError` em vez de `ne(` — alinhado com a implementacao real. Os 3 testes passam.

### Required Artifacts

| Artifact                         | Expected                                    | Status     | Details                                                           |
| -------------------------------- | ------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `src/_actions/customers.ts`      | Email guards em create e update             | ✓ VERIFIED | `ActionError` presente em ambos os actions via constraint catch   |
| `src/_data-access/customers.ts`  | searchCustomers ampliado para CPF e placa   | ✓ VERIFIED | `ilike(user.cpf)`, `ilike(vehicles.plate)`, `leftJoin`, `groupBy` |
| `src/_actions/customers.test.ts` | Static source-assertions para CLI-01/CLI-03 | ✓ VERIFIED | 3 tests passando — D-01, D-02 (adaptado), CLI-01                  |

### Key Link Verification

| From                   | To                    | Via                                   | Status     | Details                                                               |
| ---------------------- | --------------------- | ------------------------------------- | ---------- | --------------------------------------------------------------------- |
| `createCustomerAction` | email duplicate guard | `isUniqueConstraintError` catch 23505 | ✓ WIRED    | Diferente do plano (pre-check SELECT), mas funcionalmente equivalente |
| `updateCustomerAction` | email duplicate guard | `isUniqueConstraintError` catch 23505 | ✓ WIRED    | `ne()` ausente — desnecessario nesta abordagem                        |
| `searchCustomers`      | `vehicles.plate`      | `leftJoin` + `ilike`                  | ✓ VERIFIED | Pattern `vehicles\.plate` confirmado em L200                          |

### Data-Flow Trace (Level 4)

| Artifact                        | Data Variable | Source                                      | Produces Real Data              | Status    |
| ------------------------------- | ------------- | ------------------------------------------- | ------------------------------- | --------- |
| `src/_data-access/customers.ts` | query results | `db.select().from(user).leftJoin(vehicles)` | Sim — Drizzle ORM queries reais | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior                        | Command                                         | Result     | Status |
| ------------------------------- | ----------------------------------------------- | ---------- | ------ |
| Tests D-01, D-02, CLI-01 passam | `npx vitest run src/_actions/customers.test.ts` | 3/3 passed | ✓ PASS |

### Probe Execution

Nenhuma probe declarada no PLAN. Step 7c: SKIPPED.

### Requirements Coverage

| Requirement | Source Plan | Description                                                                        | Status        | Evidence                                                                                                     |
| ----------- | ----------- | ---------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------ |
| CLI-01      | 07-01-PLAN  | Operador pode criar, listar, editar e buscar clientes do banco                     | ✓ SATISFIED   | searchCustomers com CPF + placa; listCustomers e getCustomerById existentes                                  |
| CLI-02      | (nenhum)    | Operador pode ver e gerenciar veículos vinculados a clientes com histórico de O.S. | ? NEEDS HUMAN | REQUIREMENTS.md mapeia CLI-02 para Phase 7 mas nenhum plano desta phase declarou CLI-02 — requisito ORPHANED |
| CLI-03      | 07-01-PLAN  | Sistema rejeita criação de cliente com email já existente (sem crash PG)           | ✓ SATISFIED   | ActionError via constraint catch em create e update                                                          |

**ORPHANED requirement:** CLI-02 esta na tabela de rastreabilidade de REQUIREMENTS.md apontando para Phase 7 com status "Pending", mas nenhum plano da Phase 7 declarou `requirements: [CLI-02]`. O requisito nao esta coberto por este conjunto de planos.

### Anti-Patterns Found

| File                        | Line | Pattern                             | Severity | Impact                                                       |
| --------------------------- | ---- | ----------------------------------- | -------- | ------------------------------------------------------------ |
| `src/_actions/customers.ts` | 3    | `import { and, eq }` — `ne` ausente | INFO     | Coerente com implementacao por constraint catch; sem impacto |

Nenhum `TBD`, `FIXME`, `XXX`, placeholder ou retorno hardcoded vazio encontrado.

### Human Verification Required

#### 1. Fluxo de email duplicado via UI (create)

**Test:** Tentar criar cliente com email ja cadastrado no formulario /customers/new
**Expected:** Mensagem "E-mail ja cadastrado. Use outro ou acesse o perfil do cliente existente." exibida, sem crash de 500
**Why human:** Server action retorna `serverError` via `handleServerError` — comportamento UI nao verificavel por grep

#### 2. Editar cliente mantendo o proprio email

**Test:** Abrir formulario de edicao de cliente existente, nao alterar email, salvar
**Expected:** Atualizacao salva com sucesso sem erro de duplicidade
**Why human:** Depende de comportamento do banco em runtime; a abordagem por constraint nao usa `ne()` — correto se PG nao emite 23505 neste cenario (comportamento esperado, mas nao testado por static assertions)

#### 3. Busca por placa de veiculo

**Test:** Digitar placa no campo de busca de clientes
**Expected:** Cliente com veiculo de placa correspondente aparece nos resultados
**Why human:** Comportamento de busca com dados reais no banco

#### 4. CLI-02: Gerenciamento de veiculos com historico de O.S.

**Test:** Acessar /customers/[id] e verificar se veiculos vinculados e historico de O.S. sao exibidos com dados reais
**Expected:** Lista de veiculos e ordens de servico com dados do banco, nao mock
**Why human:** CLI-02 esta mapeada para Phase 7 em REQUIREMENTS.md mas foi omitida dos planos — necessario avaliar se a funcionalidade ja existe na UI (getCustomerById retorna vehicles) ou se precisa de plano dedicado

### Gaps Summary

Nenhum gap tecnico bloqueante identificado. Os 3 must-haves estao VERIFIED, os artifacts existem e sao substantivos, o data-flow e real.

**Ponto de atencao — CLI-02 ORPHANED:** O requisito CLI-02 esta mapeado para Phase 7 em REQUIREMENTS.md mas nenhum plano desta phase o declarou. `getCustomerById` ja retorna `vehicles[]` com dados reais, o que pode satisfazer parcialmente CLI-02, mas "historico de O.S. por veiculo" precisa de validacao humana para confirmar se esta completo ou se requer trabalho adicional.

**Desvio de mecanismo (nao-bloqueante):** O plano especificou pre-check SELECT + `ne()` para guards de email. A implementacao usa constraint catch `23505`. Resultado funcional identico. Os testes foram adaptados para refletir a implementacao real e passam.

---

_Verified: 2026-06-21T16:17:30Z_
_Verifier: Claude (gsd-verifier)_
