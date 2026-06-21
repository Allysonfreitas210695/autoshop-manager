# Phase 7: Customers & Vehicles - Context

**Gathered:** 2026-06-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Conectar o CRUD completo de clientes e veículos ao banco de dados real. As telas de listagem, detalhe e formulários já existem — o foco é corrigir gaps: guard de email duplicado, busca server-side, e CRUD completo de veículos (adicionar, editar, excluir) na página de detalhe do cliente.

</domain>

<decisions>
## Implementation Decisions

### Guard de Email Duplicado (CLI-03)

- **D-01:** Antes de `db.insert(user)` em `createCustomerAction`, fazer um `SELECT` para verificar se o email já existe (`eq(user.email, parsedInput.email)`). Se encontrado, retornar erro com a mensagem: `"E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente."`
- **D-02:** Aplicar o mesmo pre-check em `updateCustomerAction` para evitar colisão ao editar o email de um cliente existente.

### Busca de Clientes (CLI-01)

- **D-03:** Substituir a busca client-side atual por busca server-side. Usar `searchCustomers()` já existente em `src/_data-access/customers.ts` (ILIKE por nome, email, CPF, placa).
- **D-04:** Acionar com debounce de 300ms enquanto o usuário digita. Quando o campo de busca tem texto, exibir os resultados da busca (sem paginação). Quando o campo fica vazio, voltar à lista paginada normal.

### Gerenciamento de Veículos (CLI-02)

- **D-05:** Operador pode realizar todas as operações: adicionar novo veículo ao cliente, editar um veículo existente, e excluir um veículo. Criar `updateVehicleAction` e `deleteVehicleAction` em `src/_actions/customers.ts`.
- **D-06:** Editar e excluir são acionados por ícones inline nos cards de veículos da seção "Frota de Veículos" na página `/customers/[id]`. Sem drawer separado — edição in-place com um modal ou inline.
- **D-07:** Ao tentar excluir um veículo que possui O.S. vinculadas: pré-checar com SELECT antes de deletar. Se houver O.S., bloquear e exibir: `"Este veículo possui ordens de serviço e não pode ser excluído."` Não usar ON DELETE CASCADE/SET NULL.

### Claude's Discretion

- Forma exata de edição inline (modal pequeno vs. campos expandíveis no card) — Claude escolhe o padrão mais próximo do existente no codebase.
- Campos exibidos no card de veículo (atualmente: make, model, plate, year, color, mileage).
- Comportamento de `revalidatePath` após operações de veículo.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

No external specs — requirements fully captured in decisions above.

### Arquivos de data-access existentes

- `src/_data-access/customers.ts` — listCustomers, getCustomerById, searchCustomers — lógica de query existente a ser reutilizada
- `src/_actions/customers.ts` — createCustomerAction, createVehicleAction, updateCustomerAction — padrão de server actions a seguir

### Página de detalhe do cliente

- `src/app/(dashboard)/customers/[id]/page.tsx` — onde a seção de veículos vive
- `src/app/(dashboard)/customers/customers-client.tsx` — lógica de busca client-side atual a ser migrada

### Requisitos do Roadmap

- `.planning/REQUIREMENTS.md` — CLI-01, CLI-02, CLI-03

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `authActionClient` + `next-safe-action/hooks`: padrão para todos os server actions — reutilizar em `updateVehicleAction` e `deleteVehicleAction`
- `searchCustomers()` em `src/_data-access/customers.ts`: query ILIKE já implementada, só precisa ser chamada server-side
- `NewCustomerDrawer` / `EditCustomerDrawer`: padrão Sheet para formulários de cliente — referência para drawer de veículos

### Established Patterns

- Toast errors: `toast.error(error.serverError ?? "Erro ao ...")` — padrão consistente no projeto
- `revalidatePath("/customers")` e `revalidatePath(\`/customers/\${id}\`)` após mutações
- `authActionClient.schema(z.object({...})).action(async ({ parsedInput }) => {...})` — estrutura de todos os server actions

### Integration Points

- `src/app/(dashboard)/customers/customers-client.tsx`: migrar busca de client-side para server-side (provavelmente via `router.push` com query param ou Server Action direta)
- `src/app/(dashboard)/customers/[id]/page.tsx`: adicionar botões de editar/excluir nos cards de veículos

</code_context>

<specifics>
## Specific Ideas

- Busca server-side deve suportar: nome, email, CPF e placa (já suportado por `searchCustomers`)
- Mensagem específica para email duplicado: `"E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente."`
- Mensagem específica para veículo com O.S.: `"Este veículo possui ordens de serviço e não pode ser excluído."`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

_Phase: 7-Customers & Vehicles_
_Context gathered: 2026-06-21_
