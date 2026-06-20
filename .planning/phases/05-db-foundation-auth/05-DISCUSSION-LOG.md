# Phase 5: DB Foundation & Auth - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-20
**Phase:** 5-DB Foundation & Auth
**Areas discussed:** Seed script, Migration gap, Pool serverless-safe

---

## Seed Script

| Option                | Description                                                | Selected |
| --------------------- | ---------------------------------------------------------- | -------- |
| Limpar tudo + reseed  | DELETE FROM todas as tabelas na ordem certa, depois insere | ✓        |
| Skip se dados existem | Verificar se já há dados antes de inserir                  |          |
| Fresh DB apenas       | Script assume DB vazio                                     |          |

**User's choice:** Limpar tudo + reseed
**Notes:** —

| Option                   | Description                                           | Selected |
| ------------------------ | ----------------------------------------------------- | -------- |
| Via Better Auth API      | Garante hash de senha correto via auth.api.createUser | ✓        |
| Insert direto no Drizzle | Mais rápido mas requer bcrypt manual                  |          |

**User's choice:** Via Better Auth API
**Notes:** Padrão já existente no scripts/seed.ts com função createUser()

---

## Migration Gap

| Option                 | Description                            | Selected |
| ---------------------- | -------------------------------------- | -------- |
| Gerar em Phase 5 agora | Adicionar 'confirmed' ao enum já       | ✓        |
| Defer para Phase 8     | Phase 8 gera quando implementar INV-02 |          |

**User's choice:** Gerar em Phase 5 agora
**Notes:** —

| Option                                  | Description                    | Selected |
| --------------------------------------- | ------------------------------ | -------- |
| Não, só o 'confirmed' do purchase_order | As 3 migrations cobrem o resto | ✓        |
| Sim, tenho outros gaps                  | —                              |          |

**User's choice:** Não, só o 'confirmed' do purchase_order
**Notes:** —

---

## Pool Serverless-Safe

| Option                            | Description                  | Selected |
| --------------------------------- | ---------------------------- | -------- |
| max: 3 fixo no código             | Hardcodar max=3 diretamente  | ✓        |
| max via env var DATABASE_POOL_MAX | Permite ajustar por ambiente |          |

**User's choice:** max: 3 fixo no código
**Notes:** REQUIREMENTS já validou esse valor

| Option                                                    | Description       | Selected |
| --------------------------------------------------------- | ----------------- | -------- |
| Sim — idleTimeoutMillis: 30s, connectionTimeoutMillis: 2s | Padrão serverless | ✓        |
| Não — apenas max: 3                                       | Mais simples      |          |

**User's choice:** Sim — idleTimeoutMillis: 30s, connectionTimeoutMillis: 2s
**Notes:** —

---

## Claude's Discretion

- Ordem de limpeza do seed (inversa às FK constraints)
- Sintaxe exata do ALTER TYPE para adicionar enum value

## Deferred Ideas

- Driver swap para @neondatabase/serverless — milestone futuro
- Paginação server-side — milestone futuro
- Integração de email provider para reset de senha
