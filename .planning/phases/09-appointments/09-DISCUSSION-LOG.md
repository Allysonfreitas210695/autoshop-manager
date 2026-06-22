# Phase 9: Appointments - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-22
**Phase:** 9-appointments
**Areas discussed:** Seed de agendamentos, Bug de cancel optimista, Edição de agendamentos, Exibição de serviceType no calendário

---

## Seed de agendamentos

| Option                    | Description                                                                     | Selected |
| ------------------------- | ------------------------------------------------------------------------------- | -------- |
| Adicionar valores ao seed | Preencher serviceType e duration nas 8 entradas — calendário rico imediatamente | ✓        |
| Deixar NULL por ora       | Colunas opcionais, novos agendamentos criados via formulário já terão os campos |          |

**User's choice:** Adicionar valores ao seed
**Notes:** Seed deve cobrir variedade de tipos (preventiva, corretiva, revisao, etc.) e durações (60, 90 min)

---

## Bug de cancel optimista

| Option                                             | Description                                                          | Selected |
| -------------------------------------------------- | -------------------------------------------------------------------- | -------- |
| Retornar novo status da action + usar no onSuccess | Mudar action para retornar { id, status }; onSuccess usa data.status | ✓        |
| Remover setAppointments do onSuccess               | Deixar apenas update optimista em handleStatusChange                 |          |
| Acionar revalidatePath no action                   | Next.js recarrega dados do servidor substituindo estado local        |          |

**User's choice:** Retornar novo status da action + usar no onSuccess
**Notes:** Abordagem clean sem revalidar toda a página. Action deve retornar { id, status } para confirmar o estado optimista.

---

## Edição de agendamentos

| Option                                 | Description                                           | Selected |
| -------------------------------------- | ----------------------------------------------------- | -------- |
| Não — criar + listar + cancelar apenas | APPT-01 define exatamente esse escopo                 |          |
| Sim — adicionar drawer de edição       | Criar updateAppointmentAction + EditAppointmentDrawer | ✓        |

**User's choice:** Sim — adicionar drawer de edição

### Escopo do edit

| Option                        | Description                                                         | Selected |
| ----------------------------- | ------------------------------------------------------------------- | -------- |
| Todos os campos do formulário | Data/hora, cliente, veículo, mecânico, serviceType, duration, notas | ✓        |
| Apenas data/hora + notas      | Edição mínima: reprogramar horário e notas                          |          |

**User's choice:** Todos os campos do formulário
**Notes:** Reutilizar estrutura do NewAppointmentDrawer

### Trigger do edit

| Option                            | Description                           | Selected |
| --------------------------------- | ------------------------------------- | -------- |
| Botão "Editar" no AppointmentCard | Ao lado de Confirmar/Cancelar no card | ✓        |
| Click no card inteiro             | Qualquer click abre o drawer          |          |

**User's choice:** Botão "Editar" no AppointmentCard

---

## Exibição de serviceType no calendário

| Option                        | Description                                                         | Selected |
| ----------------------------- | ------------------------------------------------------------------- | -------- |
| Sim — exibir no card          | AppointmentCard mostra tipo de serviço e duração quando preenchidos | ✓        |
| Não — manter cards como estão | Dados persistidos mas não exibidos nos cards                        |          |

**User's choice:** Sim — exibir no card
**Notes:** AppointmentBadge permanece compact. Formato: "Preventiva · 60 min"

---

## Claude's Discretion

- Layout exato do serviceType/duration no AppointmentCard (posição, ícone)
- Estrutura interna do `useAppointmentForm` para suportar modo edit (prop `mode` vs `initialValues`)

## Deferred Ideas

- Appointment search/filtering por serviceType, mecânico, intervalo de datas — Future requirement
- Agendamentos recorrentes — Future requirement
- Confirmações por SMS/email — Future requirement
