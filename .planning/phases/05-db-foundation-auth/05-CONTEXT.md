# Phase 5: DB Foundation & Auth - Context

**Gathered:** 2026-06-20
**Status:** Ready for planning

<domain>
## Phase Boundary

O banco de dados é colocado em produção: migrations aplicadas (incluindo o enum `confirmed` do purchase_order_status), Better Auth autentica contra tabelas Drizzle reais, seed script opera de forma idempotente, e a conexão é serverless-safe para Vercel Lambda.

O que esta fase NÃO faz: substituir mock data nas telas (Phases 6-10), trocar driver para Neon/serverless (deferido), implementar CRUD de ordens/clientes/inventário.

</domain>

<decisions>
## Implementation Decisions

### Pool Serverless-Safe

- **D-01:** Configurar `pg.Pool` com `max: 3` fixo no código (não via env var).
- **D-02:** Adicionar `idleTimeoutMillis: 30000` e `connectionTimeoutMillis: 2000` ao pool para evitar conexões presas em Vercel Lambda.
- **D-03:** Manter o padrão global singleton já existente em `src/_db/index.ts` (`globalForDb`).

### Migration Gap

- **D-04:** Gerar migration `0003` em Phase 5 para adicionar `'confirmed'` ao enum `purchase_order_status`. Fazer `ALTER TYPE ... ADD VALUE 'confirmed'` antes das Phases 6-10 chegarem no banco.
- **D-05:** Atualizar `src/_db/schema/purchase-orders.ts` para incluir `'confirmed'` no `pgEnum` antes de gerar a migration.
- **D-06:** Nenhum outro gap de schema identificado — as 3 migrations existentes cobrem o resto.

### Seed Script

- **D-07:** `scripts/seed.ts` deve ser idempotente: limpar todas as tabelas na ordem correta (respeitando FK constraints) e reinserir os dados.
- **D-08:** Usuários devem ser criados via Better Auth API (`auth.api.createUser` / `createUser` helper) para garantir hash correto de senha — não insert direto no Drizzle.
- **D-09:** Cobrir todos os 12 relacionamentos: user, session, account, verification, vehicles, services, serviceOrders, serviceOrderItems, transactions, appointments, purchaseOrders, purchaseOrderItems.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Migrations

- `src/_db/schema/index.ts` — re-exporta todos os schemas (ponto de entrada)
- `src/_db/schema/auth.ts` — tabelas user, session, account, verification
- `src/_db/schema/purchase-orders.ts` — enum `purchaseOrderStatus` que precisa do valor `'confirmed'`
- `src/_db/migrations/` — 3 migrations existentes; agent deve gerar `0003` para o enum
- `drizzle.config.ts` — configuração do drizzle-kit (dialect, schema path, out dir)

### Auth

- `src/_lib/auth.ts` — configuração Better Auth com drizzleAdapter; NÃO alterar a configuração existente
- `src/_lib/auth-client.ts` — client-side auth helpers

### DB Connection

- `src/_db/index.ts` — onde aplicar as mudanças de pool (max, idleTimeoutMillis, connectionTimeoutMillis)

### Seed

- `scripts/seed.ts` — seed existente; adicionar lógica de limpeza e garantir cobertura dos 12 relacionamentos

### Projeto

- `.planning/REQUIREMENTS.md` §Foundation & Auth — FOUND-01, FOUND-02, FOUND-03
- `.planning/ROADMAP.md` §Phase 5 — success criteria (4 critérios)

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/_db/index.ts`: pool singleton pattern com `globalForDb` já existe — apenas adicionar `max`, `idleTimeoutMillis`, `connectionTimeoutMillis` ao `new Pool({...})`.
- `scripts/seed.ts`: seed completo existe; adicionar bloco de limpeza no início usando `db.delete()` em ordem inversa às FK.

### Established Patterns

- Drizzle usa `drizzle(pool, { schema })` — manter exatamente esse padrão.
- Better Auth `drizzleAdapter` já configurado com `provider: "pg"` e schema explícito — não alterar.
- `npm run db:migrate` → `drizzle-kit migrate`; `npm run db:seed` → `tsx scripts/seed.ts` — scripts já existem.

### Integration Points

- `src/_lib/auth.ts` importa `{ db }` de `@/_db` — mudanças no pool são transparentes para o auth.
- Seed chama `auth` de `@/_lib/auth` para criar usuários com senha hash correta.

</code_context>

<specifics>
## Specific Ideas

- `pg.Pool` com exatamente: `{ connectionString: process.env.DATABASE_URL, max: 3, idleTimeoutMillis: 30000, connectionTimeoutMillis: 2000 }`
- Migration 0003 deve usar `ALTER TYPE "public"."purchase_order_status" ADD VALUE 'confirmed'` (Postgres não permite remover valores de enum — só adicionar).
- Seed: ordem de limpeza reversa às FK: `purchaseOrderItems → purchaseOrders → serviceOrderItems → serviceOrders → transactions → appointments → vehicles → account → session → verification → user → services`

</specifics>

<deferred>
## Deferred Ideas

- Driver swap para `@neondatabase/serverless` — deferido para milestone futuro (REQUIREMENTS.md §Future Requirements)
- Paginação server-side para listas grandes — deferido para milestone futuro
- Integração de email provider para reset de senha (TODO já existente em `src/_lib/auth.ts`) — fora do escopo de Phase 5

</deferred>

---

_Phase: 5-DB Foundation & Auth_
_Context gathered: 2026-06-20_
