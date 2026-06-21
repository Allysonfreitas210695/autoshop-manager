# Phase 7: Customers & Vehicles — Research

**Researched:** 2026-06-21
**Domain:** Next.js Server Actions / Drizzle ORM — customer & vehicle CRUD com guard de email e busca server-side
**Confidence:** HIGH

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** `createCustomerAction` — SELECT pré-check de email antes do insert. Mensagem: `"E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente."`
- **D-02:** `updateCustomerAction` — mesmo pré-check de email (excluindo o próprio `id`).
- **D-03:** Busca server-side usando `searchCustomers()` já existente (ILIKE por nome, email, CPF, placa).
- **D-04:** Debounce 300ms. Com texto → resultados sem paginação. Sem texto → lista paginada normal.
- **D-05:** Criar `updateVehicleAction` e `deleteVehicleAction` em `src/_actions/customers.ts`.
- **D-06:** Editar/excluir via ícones inline nos cards de veículos em `/customers/[id]`. Sem drawer separado — edição in-place (modal pequeno ou inline).
- **D-07:** Delete de veículo com O.S. vinculadas: pré-checar SELECT, bloquear com: `"Este veículo possui ordens de serviço e não pode ser excluído."` Sem ON DELETE CASCADE/SET NULL.

### Claude's Discretion

- Forma exata de edição inline (modal pequeno vs. campos expandíveis no card).
- Campos exibidos no card de veículo.
- Comportamento de `revalidatePath` após operações de veículo.

### Deferred Ideas (OUT OF SCOPE)

Nenhum.
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID     | Description                                                                        | Research Support                                                                                                                                                             |
| ------ | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CLI-01 | Operador pode criar, listar, editar e buscar clientes do banco                     | Busca server-side via `searchCustomers()` + debounce; `createCustomerAction`/`updateCustomerAction` já existem e funcionam                                                   |
| CLI-02 | Operador pode ver e gerenciar veículos vinculados a clientes com histórico de O.S. | `updateVehicleAction` + `deleteVehicleAction` a criar; schema `vehicles` já tem todos os campos; `serviceOrders.vehicleId` tem `onDelete: "restrict"` — pré-check necessário |
| CLI-03 | Sistema rejeita criação de cliente com email já existente (sem crash PG)           | Adicionar SELECT guard em `createCustomerAction` e `updateCustomerAction` antes do insert/update                                                                             |

</phase_requirements>

---

## Summary

Phase 7 conecta os últimos gaps do módulo de clientes/veículos ao banco real. As telas já existem e funcionam com dados reais em read; o foco é: (1) proteger unicidade de email de forma explícita antes que o PG lance exceção; (2) migrar a busca client-side em `customers-client.tsx` para chamadas server-side usando `searchCustomers()` já implementada; (3) adicionar `updateVehicleAction` + `deleteVehicleAction` com guard de O.S., expondo edição/exclusão inline nos cards de veículo.

O codebase já tem o padrão completo definido: `authActionClient` + `ActionError` + `toast.error(error.serverError)`. Não há nada para instalar — apenas código novo seguindo padrões existentes.

**Primary recommendation:** Seguir rigorosamente o padrão de `orders.test.ts` (static source-assertion via `readFileSync`) para os testes de Phase 7 — sem mock de DB, apenas verificação estrutural das guards no source.

---

## Architectural Responsibility Map

| Capability                              | Primary Tier                      | Secondary Tier               | Rationale                                                                                     |
| --------------------------------------- | --------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------- |
| Guard de email duplicado                | API / Server Action               | —                            | Lógica de negócio — pertence ao action, não ao cliente                                        |
| Busca de clientes                       | API / Backend (`searchCustomers`) | Frontend (debounce + estado) | Query ILIKE no DB; UI só gerencia timing e estado local                                       |
| CRUD de veículos (add/edit/delete)      | API / Server Action               | Frontend (modal/inline UI)   | Mutações sempre server-side; UI renderiza estado resultante                                   |
| Constraint de O.S. em delete de veículo | API / Server Action               | —                            | `serviceOrders.vehicleId` tem `onDelete: "restrict"` — verificar antes para mensagem amigável |
| Revalidação de cache                    | API / Server Action               | —                            | `revalidatePath` chamado no action após cada mutação                                          |

---

## Standard Stack

### Core (já instalado, sem instalação adicional)

| Library            | Versão    | Propósito                                | Status               |
| ------------------ | --------- | ---------------------------------------- | -------------------- |
| `next-safe-action` | existente | Server actions type-safe com schema Zod  | [VERIFIED: codebase] |
| `drizzle-orm`      | existente | Queries Drizzle com `eq`, `and`, `count` | [VERIFIED: codebase] |
| `zod`              | existente | Validação de schema nos actions          | [VERIFIED: codebase] |
| `react-hook-form`  | existente | Formulários nos drawers/modais           | [VERIFIED: codebase] |
| `sonner`           | existente | Toast notifications                      | [VERIFIED: codebase] |
| `lucide-react`     | existente | Ícones inline (Pencil, Trash2)           | [VERIFIED: codebase] |

**Nenhum pacote novo a instalar nesta phase.**

---

## Package Legitimacy Audit

> Nenhum pacote novo a instalar nesta phase. Seção não aplicável.

---

## Architecture Patterns

### Diagrama de Fluxo

```
[Input: campo busca]
       |
   [debounce 300ms] (cliente)
       |
   search.trim() === "" ?
       |              |
  [listCustomers()]   [searchCustomers(query)]  ← Server Action / fetch
       |              |
  [paginação normal]  [resultados flat, sem paginação]
       |
  [CustomersClient renderiza DataTable]


[Click editar veículo]
       |
  [EditVehicleModal (state local)]
       |
  [updateVehicleAction] → SELECT email guard (não aplicável) → UPDATE vehicles
       |
  [revalidatePath("/customers/[id]")] → Server re-fetch → UI atualiza


[Click excluir veículo]
       |
  [deleteVehicleAction]
       |
  SELECT count(*) FROM service_orders WHERE vehicle_id = ?
       |              |
  count > 0       count = 0
       |              |
  ActionError     DELETE FROM vehicles WHERE id = ?
  "Este veículo…"     |
                  revalidatePath("/customers/[id]")
```

### Estrutura de arquivos afetados

```
src/
├── _actions/
│   └── customers.ts          # +updateVehicleAction, +deleteVehicleAction, email guards
├── _data-access/
│   └── customers.ts          # searchCustomers() — já existe, sem modificação
├── app/(dashboard)/customers/
│   ├── customers-client.tsx  # migrar busca client→server (debounce + server action ou router.push)
│   └── [id]/
│       ├── page.tsx          # adicionar botões inline nos cards de veículo
│       ├── customer-actions.tsx  # sem mudança
│       └── _components/      # novo: EditVehicleModal.tsx (ou inline state no page)
└── _actions/
    └── customers.test.ts     # novo: static source-assertion para Phase 7
```

### Padrão 1: Email Guard em Server Action

```typescript
// [VERIFIED: codebase pattern — src/_actions/customers.ts]
import { ActionError } from "@/_lib/safe-action";

// Em createCustomerAction:
const existing = await db
  .select({ id: user.id })
  .from(user)
  .where(eq(user.email, parsedInput.email))
  .limit(1);

if (existing.length > 0) {
  throw new ActionError(
    "E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.",
  );
}
```

**Para updateCustomerAction** — excluir o próprio cliente da verificação:

```typescript
// [VERIFIED: codebase pattern]
import { and, ne } from "drizzle-orm";

const existing = await db
  .select({ id: user.id })
  .from(user)
  .where(and(eq(user.email, parsedInput.email), ne(user.id, parsedInput.id)))
  .limit(1);
```

### Padrão 2: Guard de O.S. antes de deletar veículo

```typescript
// [VERIFIED: schema — src/_db/schema/service-orders.ts]
// serviceOrders.vehicleId tem onDelete: "restrict" — PG lança erro se houver OS
// Mas D-07 exige mensagem amigável, então pré-checar:
const linkedOrders = await db
  .select({ id: serviceOrders.id })
  .from(serviceOrders)
  .where(eq(serviceOrders.vehicleId, parsedInput.id))
  .limit(1);

if (linkedOrders.length > 0) {
  throw new ActionError(
    "Este veículo possui ordens de serviço e não pode ser excluído.",
  );
}

await db.delete(vehicles).where(eq(vehicles.id, parsedInput.id));
revalidatePath(`/customers/${parsedInput.ownerId}`);
revalidatePath("/customers");
```

**Nota:** O schema já tem `onDelete: "restrict"` em `serviceOrders.vehicleId` — se o pré-check falhar por race condition, o PG também bloqueia. O pré-check é para mensagem amigável, não a única barreira.

### Padrão 3: Busca Server-Side com Debounce

A abordagem mais alinhada com o padrão do projeto (evitar router.push para busca simples):

```typescript
// [VERIFIED: codebase pattern — customers-client.tsx usa useRouter/useSearchParams]
// Opção A: router.push com ?q= (SSR re-fetch no page.tsx)
// Opção B: Server Action direta com useState para resultados

// Opção A — mais próxima do padrão existente de paginação:
// page.tsx lê searchParams.q → chama searchCustomers(q) se definido, listCustomers() se não
```

**Recomendação (Discretion):** Opção A via `router.push("?q="+term)` — reutiliza o padrão `goToPage` já existente no `customers-client.tsx`. O `page.tsx` já lê `searchParams`, basta adicionar leitura de `q`.

### Padrão 4: updateVehicleAction

```typescript
// [VERIFIED: codebase pattern — createVehicleAction em src/_actions/customers.ts]
export const updateVehicleAction = authActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
      plate: z.string().min(7),
      make: z.string().min(1),
      model: z.string().min(1),
      year: z.number().int().optional(),
      color: z.string().optional(),
      mileage: z.number().int().optional(),
      ownerId: z.string(), // para revalidatePath
    }),
  )
  .action(async ({ parsedInput }) => {
    await db
      .update(vehicles)
      .set({
        plate: parsedInput.plate.toUpperCase(),
        make: parsedInput.make,
        model: parsedInput.model,
        year: parsedInput.year ?? null,
        color: parsedInput.color ?? null,
        mileage: parsedInput.mileage ?? null,
        updatedAt: new Date(),
      })
      .where(eq(vehicles.id, parsedInput.id));

    revalidatePath(`/customers/${parsedInput.ownerId}`);
    return { id: parsedInput.id };
  });
```

### Anti-Patterns a Evitar

- **Não lançar exceção PG direta:** Sem o email guard, o PG lança erro de UNIQUE constraint — o `handleServerError` em `safe-action.ts` retorna `DEFAULT_SERVER_ERROR_MESSAGE` (genérico), não a mensagem específica.
- **Não usar `onDelete: "cascade"` para veículos com O.S.:** O schema já tem `restrict`; D-07 proíbe mudar isso.
- **Não usar filtro client-side para busca:** O atual `customers-client.tsx` filtra apenas os 20 registros carregados na página. Busca server-side via `searchCustomers()` busca em todo o banco.
- **Não esquecer `updatedAt: new Date()`** em updateVehicleAction — padrão estabelecido em OS-03.

---

## Don't Hand-Roll

| Problema                   | Não construir                | Usar                                                         | Por quê                                                |
| -------------------------- | ---------------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| UNIQUE constraint amigável | try/catch em erro PG         | SELECT pré-check + `ActionError`                             | Padrão D-01/D-02; mensagem específica necessária       |
| Auth check em actions      | Verificação manual de sessão | `authActionClient` (já existe)                               | Middleware de sessão já configurado                    |
| Debounce de input          | setTimeout manual            | `useCallback` + `useRef` com clearTimeout (ou lib existente) | Evitar re-implementar — 3 linhas simples               |
| Constraint de FK           | Confiar só no PG restrict    | SELECT pré-check + `ActionError`                             | PG lança erro genérico; D-07 exige mensagem específica |

---

## Common Pitfalls

### Pitfall 1: Email guard no update não exclui o próprio registro

**O que dá errado:** `updateCustomerAction` com pré-check `WHERE email = ?` bloqueia edição de um cliente com o próprio email atual.
**Por quê acontece:** A query retorna o próprio registro.
**Como evitar:** `AND id != parsedInput.id` na query de verificação (usar `ne()` do drizzle-orm).
**Sinal de alerta:** Formulário de edição retorna erro mesmo sem mudar o email.

### Pitfall 2: `searchCustomers()` tem campo ILIKE apenas em `name` e `email`

**O que dá errado:** O CONTEXT.md menciona busca por CPF e placa, mas `searchCustomers()` em `src/_data-access/customers.ts` linha 188 só faz ILIKE em `user.name` e `user.email`. CPF e placa não estão incluídos.
**Por quê acontece:** A query SQL usa `lower(${user.name}) like ${lq} or lower(${user.email}) like ${lq}` — sem CPF, sem placa.
**Como evitar:** Ampliar a query `searchCustomers()` para incluir `lower(${user.cpf}) like ${lq}` e um join com `vehicles` para ILIKE em `plate`.
**Impacto em CLI-01:** Sem essa correção, busca por CPF/placa não funciona (mas busca por nome/email sim).

### Pitfall 3: revalidatePath insuficiente após operações de veículo

**O que dá errado:** Após `updateVehicleAction`, a lista em `/customers` mostra `lastVehicle` desatualizado.
**Por quê acontece:** `listCustomers()` inclui `lastVehicle` no resultado; sem revalidar `/customers`, a página fica stale.
**Como evitar:** Chamar ambos: `revalidatePath(\`/customers/${ownerId}\`)`e`revalidatePath("/customers")`.

### Pitfall 4: Edição inline sem ownerId no schema de deleteVehicleAction

**O que dá errado:** `deleteVehicleAction` recebe apenas `vehicleId` mas precisa do `ownerId` para chamar `revalidatePath(\`/customers/${ownerId}\`)`.
**Como evitar:** Incluir `ownerId`no schema Zod do action (como`createVehicleAction` já faz).

### Pitfall 5: `plate` UNIQUE — colisão ao editar

**O que dá errado:** `updateVehicleAction` sem pré-check pode colidir com a constraint UNIQUE em `vehicles.plate` se outra placa já existir (schema: `plate: text("plate").notNull().unique()`).
**Como evitar:** Verificar `WHERE plate = ? AND id != ?` antes do update. Mensagem amigável: `"Essa placa já está cadastrada para outro veículo."`.

---

## Code Examples

### Debounce simples (sem biblioteca extra)

```typescript
// [ASSUMED — padrão React hooks padrão]
const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

function handleSearchChange(value: string) {
  setSearch(value);
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    // router.push(`?q=${encodeURIComponent(value)}`) para Opção A
  }, 300);
}
```

### EditVehicleModal — estrutura mínima

A decisão D-06 delega a forma exata à discretion de Claude. O padrão mais próximo ao existente é um `Sheet` (já usado em `NewCustomerDrawer` e `EditCustomerDrawer`). Para operação inline rápida, um pequeno `Dialog` ou `Sheet` com os campos do veículo é adequado.

Campos a expor (alinhados com `CustomerVehicle` type em `_data-access/customers.ts`):

- `make`, `model`, `plate`, `year`, `color`, `mileage`
- `vin` — opcional (existe no schema mas não em `CustomerVehicle` — manter omitido)

---

## State of the Art

| Abordagem Atual                                  | Abordagem Correta                                           | Impacto                                                    |
| ------------------------------------------------ | ----------------------------------------------------------- | ---------------------------------------------------------- |
| Busca filtra 20 registros carregados client-side | Busca via `searchCustomers()` no DB inteiro                 | CLI-01: busca em todos os clientes, não só na página atual |
| `createCustomerAction` sem email guard           | Pre-check SELECT + `ActionError`                            | CLI-03: mensagem amigável ao invés de crash PG             |
| `updateCustomerAction` sem email guard           | Pre-check SELECT com `ne(id)`                               | CLI-03: edição segura sem colisão                          |
| Seção de veículos sem edit/delete                | Ícones inline + `updateVehicleAction`/`deleteVehicleAction` | CLI-02: CRUD completo de veículos                          |

---

## Assumptions Log

| #   | Claim                                                                 | Section               | Risco se errado                                                                    |
| --- | --------------------------------------------------------------------- | --------------------- | ---------------------------------------------------------------------------------- |
| A1  | Debounce implementado com `setTimeout` + `useRef` sem lib extra       | Architecture Patterns | Nenhum — implementação trivial independente da escolha                             |
| A2  | Opção A (router.push ?q=) é a melhor abordagem para busca server-side | Architecture Patterns | Opção B (Server Action direta com useState) também funciona; planner pode escolher |

---

## Open Questions

1. **`searchCustomers()` cobre CPF e placa?**
   - O que sabemos: query atual cobre apenas `name` e `email` (verificado no source).
   - O que está incerto: CONTEXT.md diz "ILIKE por nome, email, CPF, placa" — mas o código não implementa CPF/placa.
   - Recomendação: Ampliar `searchCustomers()` para incluir CPF (`user.cpf`) e placa (via join com `vehicles`). Planner deve incluir essa tarefa.

2. **Placa UNIQUE em `updateVehicleAction` — guard necessário?**
   - O que sabemos: `vehicles.plate` tem constraint `.unique()` no schema.
   - O que está incerto: CONTEXT.md não menciona esse guard para update.
   - Recomendação: Adicionar guard de placa em `updateVehicleAction` similar ao email guard, para mensagem amigável.

---

## Environment Availability

Step 2.6: SKIPPED — phase é puramente código/config, sem dependências externas além das já instaladas.

---

## Validation Architecture

### Test Framework

| Propriedade | Valor                                           |
| ----------- | ----------------------------------------------- |
| Framework   | Vitest (existente)                              |
| Config file | `vitest.config.ts`                              |
| Quick run   | `npx vitest run src/_actions/customers.test.ts` |
| Full suite  | `npm run test:run`                              |

### Phase Requirements → Test Map

| Req ID | Behavior                                                                                         | Test Type               | Automated Command                               | Arquivo existe? |
| ------ | ------------------------------------------------------------------------------------------------ | ----------------------- | ----------------------------------------------- | --------------- |
| CLI-03 | `createCustomerAction` contém SELECT guard antes do insert                                       | static source-assertion | `npx vitest run src/_actions/customers.test.ts` | ❌ Wave 0       |
| CLI-03 | `updateCustomerAction` contém SELECT guard com `ne(id)` antes do update                          | static source-assertion | `npx vitest run src/_actions/customers.test.ts` | ❌ Wave 0       |
| CLI-02 | `deleteVehicleAction` contém SELECT guard de O.S. antes do delete                                | static source-assertion | `npx vitest run src/_actions/customers.test.ts` | ❌ Wave 0       |
| CLI-02 | `updateVehicleAction` exportado e contém `.update(vehicles)`                                     | static source-assertion | `npx vitest run src/_actions/customers.test.ts` | ❌ Wave 0       |
| CLI-01 | Busca server-side: `page.tsx` ou `customers-client.tsx` não usa filtro local quando `q` presente | static source-assertion | `npx vitest run src/_actions/customers.test.ts` | ❌ Wave 0       |

### Sampling Rate

- **Por task commit:** `npx vitest run src/_actions/customers.test.ts`
- **Por wave merge:** `npm run test:run`
- **Phase gate:** Full suite green antes do `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/_actions/customers.test.ts` — cobre CLI-01 (busca), CLI-02 (vehicle CRUD guards), CLI-03 (email guards)

_(Padrão: copiar estrutura de `src/_actions/orders.test.ts` — `readFileSync` + `exportBlocks` + assertions string-based)_

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category       | Applies | Standard Control                                                       |
| ------------------- | ------- | ---------------------------------------------------------------------- |
| V2 Authentication   | sim     | `authActionClient` — todos os actions da phase requerem sessão         |
| V4 Access Control   | sim     | `authActionClient` middleware — sem acesso a dados de cliente sem auth |
| V5 Input Validation | sim     | Zod schema em cada action                                              |
| V6 Cryptography     | não     | —                                                                      |

### Known Threat Patterns

| Pattern                                                   | STRIDE                 | Mitigação                                                                                           |
| --------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------- |
| IDOR em vehicle delete (deletar veículo de outro cliente) | Elevation of Privilege | `authActionClient` valida sessão; adicionar verificação `ownerId === parsedInput.ownerId` no action |
| Email enumeration via error message                       | Information Disclosure | Mensagem atual é informativa por design (D-01) — aceitável no contexto de oficina interna           |

**Nota sobre IDOR:** `deleteVehicleAction` deve verificar que o veículo pertence ao `ownerId` fornecido antes de deletar — ou pelo menos que o usuário autenticado tem permissão de operador. O `authActionClient` garante autenticação, mas não ownership do veículo.

---

## Project Constraints (from CLAUDE.md)

- Ler `node_modules/next/dist/docs/` antes de escrever código Next.js (AGENTS.md).
- Sem `any` / `as unknown`.
- Server Components por default; Client Components apenas quando necessário (`"use client"`).
- Zod em `src/_schemas/` sem `.default()` em form schemas.
- `@base-ui/react` usa `render` prop, nunca `asChild`.
- Sem re-arquitetura de telas (v1.1 scope: apenas camada de dados).
- `Base UI` Sheet usa `render` prop — visível em `NewCustomerDrawer.tsx` linha 172-174.

---

## Sources

### Primary (HIGH confidence)

- `src/_actions/customers.ts` — padrão exato de todos os server actions da phase
- `src/_data-access/customers.ts` — `searchCustomers()`, `listCustomers()`, tipos `CustomerVehicle`
- `src/_db/schema/vehicles.ts` — campos, constraint UNIQUE em plate, `onDelete: "set null"` em ownerId
- `src/_db/schema/service-orders.ts` — `vehicleId` com `onDelete: "restrict"` — confirma que PG bloquearia delete sem pré-check
- `src/app/(dashboard)/customers/customers-client.tsx` — filtro client-side atual a ser removido
- `src/app/(dashboard)/customers/[id]/page.tsx` — estrutura dos cards de veículo a modificar
- `src/_lib/safe-action.ts` — `authActionClient`, `ActionError`
- `src/_actions/orders.test.ts` — padrão de teste static source-assertion a replicar

### Secondary (MEDIUM confidence)

- `.planning/phases/07-customers-vehicles/07-CONTEXT.md` — decisões locked D-01..D-07
- `.planning/REQUIREMENTS.md` — CLI-01, CLI-02, CLI-03

---

## Metadata

**Confidence breakdown:**

- Standard Stack: HIGH — tudo verificado diretamente no codebase
- Architecture: HIGH — padrões copiados de código existente, sem inferência
- Pitfalls: HIGH — identificados via leitura direta do schema e código
- Open Questions: MEDIUM — Q1 (CPF/placa em searchCustomers) requer decisão do planner

**Research date:** 2026-06-21
**Valid until:** 2026-07-21 (codebase estável)
