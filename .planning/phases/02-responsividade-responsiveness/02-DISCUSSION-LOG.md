# Phase 2: Responsividade (Responsiveness) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-12
**Phase:** 2-Responsividade (Responsiveness)
**Areas discussed:** Wizard de O.S. em mobile, Colunas ocultas em tabelas, Finance reports em mobile, Touch targets e sidebar mobile

---

## Wizard de O.S. em mobile

| Option                                    | Description                                                                             | Selected |
| ----------------------------------------- | --------------------------------------------------------------------------------------- | -------- |
| Compacto — só número + nome do step ativo | Mostra "Passo 2 de 4 — Serviços". Ocupa menos espaço.                                   |          |
| Scroll horizontal nos steps               | Todos os 4 steps visíveis com scroll horizontal. Permite ver posição no fluxo completo. | ✓        |
| Você decide                               | Claude escolhe.                                                                         |          |

**User's choice:** Scroll horizontal nos steps
**Notes:** Usuário quer preservar visibilidade do fluxo completo no wizard.

---

| Option                                            | Description                                   | Selected |
| ------------------------------------------------- | --------------------------------------------- | -------- |
| Coluna única + scroll vertical                    | Cada campo empilhado. Botões fixos no rodapé. | ✓        |
| Manter layout de 2 colunas em md+, 1 coluna em sm | Grid de 2 colunas em tablet.                  |          |

**User's choice:** Coluna única + scroll vertical
**Notes:** Padrão mobile-first. Botões de avançar/voltar sticky no bottom.

---

## Colunas ocultas em tabelas

| Option                           | Description                                               | Selected |
| -------------------------------- | --------------------------------------------------------- | -------- |
| O.S.# + Cliente/Veículo + Status | 3 infos essenciais. Placa/mecânico/preço ocultados em sm. | ✓        |
| O.S.# + Placa + Status           | Foca no identificador do veículo.                         |          |

**User's choice:** O.S.# + Cliente/Veículo + Status
**Notes:** Operador consulta mais por nome do que por placa em mobile.

---

| Option                                             | Description                                                      | Selected |
| -------------------------------------------------- | ---------------------------------------------------------------- | -------- |
| Nome do item + Quantidade + Status (baixo estoque) | Essencial para gestão de estoque. Preço/categoria ocultos em sm. | ✓        |
| Nome + Preço + Quantidade                          | Foca no valor financeiro.                                        |          |

**User's choice:** Nome do item + Quantidade + Status de estoque

---

## Finance reports em mobile

| Option                                           | Description                                                       | Selected |
| ------------------------------------------------ | ----------------------------------------------------------------- | -------- |
| Empilhar em coluna única, altura fixa responsiva | Scroll vertical. Padrão mobile-first simples.                     |          |
| Scroll horizontal nos gráficos                   | Gráficos mantêm tamanho desktop, usuário scrolla horizontalmente. | ✓        |

**User's choice:** Scroll horizontal nos gráficos
**Notes:** Usuário prefere preservar densidade de dados nos gráficos.

---

## Touch targets e sidebar mobile

| Option                             | Description                       | Selected |
| ---------------------------------- | --------------------------------- | -------- |
| Manter w-64 fixo                   | Mesmo tamanho do desktop.         |          |
| Largura dinâmica w-[85vw] max-w-xs | Adapta a telas estreitas (320px). | ✓        |

**User's choice:** w-[85vw] max-w-xs

---

| Option                                     | Description                       | Selected |
| ------------------------------------------ | --------------------------------- | -------- |
| 44px altura mínima (padrão Apple/Material) | Verificar e ajustar nav items.    | ✓        |
| 48px (Material Design 3)                   | Mais generoso para dedos grandes. |          |

**User's choice:** 44px mínimo (Apple HIG)

---

## Claude's Discretion

- Largura mínima exata dos gráficos em scroll horizontal.
- Colunas de tabelas não especificadas (finance, agendamentos) seguem regra D-04.
- Se `overflow-x-auto` do DataTable é suficiente ou precisa de negative margin bleed.

## Deferred Ideas

Nenhuma ideia fora de escopo surgiu durante a discussão.
