---
status: partial
phase: 07-customers-vehicles
source: [07-VERIFICATION.md]
started: 2026-06-21T16:18:00Z
updated: 2026-06-21T16:18:00Z
---

## Current Test

[aguardando testes humanos]

## Tests

### 1. Criar cliente com email duplicado via UI

expected: Mensagem 'E-mail já cadastrado. Use outro ou acesse o perfil do cliente existente.' exibida no formulário, sem crash
result: [pending]

### 2. Editar cliente mantendo o próprio email

expected: Atualização salva com sucesso (sem erro de duplicidade)
result: [pending]

### 3. Buscar cliente por placa via campo de busca

expected: Cliente com veículo de placa correspondente aparece nos resultados
result: [pending]

### 4. CLI-02: Gerenciar veículos vinculados a clientes com histórico de O.S.

expected: Página /customers/[id] exibe veículos e histórico de ordens de serviço reais
result: [pending]

## Summary

total: 4
passed: 0
issues: 0
pending: 4
skipped: 0
blocked: 0

## Gaps
