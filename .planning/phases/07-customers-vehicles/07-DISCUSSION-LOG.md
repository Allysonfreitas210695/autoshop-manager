# Phase 7: Customers & Vehicles - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-21
**Phase:** 07-customers-vehicles
**Areas discussed:** Guard de email duplicado, Busca de clientes, Gerenciamento de veículos

---

## Guard de email duplicado

| Option                | Description                                                     | Selected |
| --------------------- | --------------------------------------------------------------- | -------- |
| Pre-check SELECT      | Antes do INSERT, fazer SELECT para verificar se email já existe | ✓        |
| Catch código PG 23505 | Tentar INSERT e converter erro unique_violation                 |          |
| Desativar campo email | Remover constraint ou tornar opcional                           |          |

**User's choice:** Pre-check SELECT

---

| Option                                                                     | Description                             | Selected |
| -------------------------------------------------------------------------- | --------------------------------------- | -------- |
| "E-mail já cadastrado."                                                    | Mensagem simples e direta               |          |
| "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente." | Orienta o operador ao cliente existente | ✓        |
| Eu decido                                                                  | Claude escolhe a mensagem               |          |

**User's choice:** Mensagem que orienta ao perfil do cliente existente

---

## Busca de clientes

| Option                | Description                                                    | Selected |
| --------------------- | -------------------------------------------------------------- | -------- |
| Server-side           | Digitar dispara query no banco com ILIKE via searchCustomers() | ✓        |
| Client-side expandida | Carregar todos de uma vez e filtrar localmente                 |          |
| Manter como está      | Filtrar apenas a página atual                                  |          |

**User's choice:** Server-side

---

| Option                          | Description                              | Selected |
| ------------------------------- | ---------------------------------------- | -------- |
| Debounce automático (300ms)     | Busca dispara automaticamente após pausa | ✓        |
| Pressionar Enter / botão Buscar | Busca só dispara ao pressionar Enter     |          |

**User's choice:** Debounce automático (300ms)

---

| Option                  | Description                                                           | Selected |
| ----------------------- | --------------------------------------------------------------------- | -------- |
| Substituir paginação    | Resultados da busca sem paginação; campo vazio volta à lista paginada | ✓        |
| Coexistir com paginação | Filtrar dentro da página atual paginada                               |          |

**User's choice:** Substituir paginação quando buscando

---

## Gerenciamento de veículos

| Option                       | Description                                            | Selected |
| ---------------------------- | ------------------------------------------------------ | -------- |
| Adicionar veículo ao cliente | Registrar novo veículo (createVehicleAction já existe) | ✓        |
| Editar veículo               | Alterar campos de veículo existente                    | ✓        |
| Remover veículo              | Excluir veículo do cadastro                            | ✓        |

**User's choice:** Todas as três operações

---

| Option                         | Description                                    | Selected |
| ------------------------------ | ---------------------------------------------- | -------- |
| Menu inline no card do veículo | Ícones de editar e excluir diretamente no card | ✓        |
| Drawer dedicado de veículo     | Clicar no veículo abre drawer completo         |          |

**User's choice:** Ícones inline no card

---

| Option                           | Description                                         | Selected |
| -------------------------------- | --------------------------------------------------- | -------- |
| Bloquear exclusão                | Pre-check: se tem O.S., exibir mensagem de bloqueio | ✓        |
| Permitir exclusão mesmo com O.S. | ON DELETE SET NULL nas service_orders               |          |

**User's choice:** Bloquear exclusão com mensagem amigável

---

## Claude's Discretion

- Forma exata de edição inline dos veículos (modal pequeno vs. campos expandíveis no card)
- Campos exibidos no card de veículo
- Comportamento de `revalidatePath` após operações de veículo

## Deferred Ideas

None — discussion stayed within phase scope.
