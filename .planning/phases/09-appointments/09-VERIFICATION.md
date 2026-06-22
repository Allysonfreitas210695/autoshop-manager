---
phase: 09-appointments
verified: 2026-06-22T12:15:00-03:00
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Criar agendamento via formulário e recarregar a página"
    expected: "Agendamento aparece no calendário com serviceType e duration persistidos (não NaN)"
    why_human: "Requer browser com DB live — não verificável por grep/tsc"
  - test: "Cancelar um agendamento, recarregar a página"
    expected: "Status permanece 'Cancelado' no DB (não reverte)"
    why_human: "Requer interação UI + verificação de persistência no Neon DB"
  - test: "Clicar Editar em um card, verificar drawer pré-populado"
    expected: "Todos os campos (cliente, veículo, mecânico, data, hora, tipo de serviço, duração, notas) pré-populados sem query extra"
    why_human: "Requer verificação visual — campos pré-populados não são verificáveis por grep"
  - test: "Alterar duração no EditAppointmentDrawer, salvar e recarregar"
    expected: "Nova duração persiste no DB e aparece no card"
    why_human: "Requer round-trip DB real para confirmar persistência"
---

# Phase 9: Appointments — Verification Report

**Phase Goal**: Appointments are persisted to and loaded from the real database, with the schema matching the form fields
**Verified**: 2026-06-22T12:15:00-03:00
**Status**: human_needed
**Re-verification**: No — initial verification

## Goal Achievement

### Observable Truths

| #   | Truth                                                                              | Status     | Evidence                                                                                                                                                                                                           |
| --- | ---------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Colunas service_type e duration existem na tabela appointments do Neon DB          | ✓ VERIFIED | `0004_appointments_service_type_duration.sql` contém `ADD COLUMN "service_type"` e `ADD COLUMN "duration"`; migration aplicada (SUMMARY 01 commit 52f729c)                                                         |
| 2   | Cancelar agendamento mantém status correto na UI (sem reversão por closure)        | ✓ VERIFIED | `appointments.ts:86`: `return { id: parsedInput.id, status: parsedInput.status }`; `appointments-client.tsx:88`: `prev.map((a) => (a.id === data.id ? { ...a, status: data.status } : a))` — closure bug eliminado |
| 3   | duration submetido no formulário de criação persiste como inteiro (não NaN)        | ✓ VERIFIED | `NewAppointmentDrawer.tsx:202`: `{...register("duration", { valueAsNumber: true })}`                                                                                                                               |
| 4   | AppointmentRow expõe customerId, vehicleId, mechanicId como UUIDs brutos           | ✓ VERIFIED | `appointments.ts:11-13`: campos tipados como `string \| null`; `select` linhas 49-51; `map` linhas 73-75                                                                                                           |
| 5   | Seed popula serviceType e duration em todas as 8 linhas de agendamento             | ✓ VERIFIED | `seed.ts:551-573`: arrays `apptServiceTypes`/`apptDurations` com 8 entradas cada, indexados no loop                                                                                                                |
| 6   | updateAppointmentAction aceita e persiste todos os campos do agendamento           | ✓ VERIFIED | `appointments.ts:41`: `export const updateAppointmentAction`; schema inclui serviceType, duration, status, FKs; `db.update(appointments).set(...)` + `revalidatePath("/appointments")`                             |
| 7   | useAppointmentForm suporta mode edit com initialValues e appointmentId             | ✓ VERIFIED | `use-appointment-form.ts:35-37`: `mode`, `initialValues`, `appointmentId` em Params; `109-110`: branch `mode === "edit"` chama `executeUpdate({ id: appointmentId, ...payload })`                                  |
| 8   | EditAppointmentDrawer pré-popula campos a partir de AppointmentRow sem query extra | ✓ VERIFIED | `EditAppointmentDrawer.tsx:45-46`: `format(new Date(appt.scheduledAt), "yyyy-MM-dd/HH:mm")`; `mode: "edit"` na linha 64; `valueAsNumber: true` na linha 224                                                        |

**Score**: 8/8 truths verified

### Roadmap Success Criteria

| #   | Success Criterion                                                                                  | Status        | Evidence                                                                         |
| --- | -------------------------------------------------------------------------------------------------- | ------------- | -------------------------------------------------------------------------------- |
| 1   | Operator can create an appointment and it appears on the calendar after page reload (DB-persisted) | ? NEEDS HUMAN | Server action + DB wiring verified; UI flow requires human                       |
| 2   | Operator can cancel an appointment and the change persists in the DB                               | ? NEEDS HUMAN | Code path verified (closure fix + return status); DB persistence requires human  |
| 3   | No form data is lost: serviceType and duration stored and retrieved correctly from the DB          | ? NEEDS HUMAN | valueAsNumber fix verified; schema migration verified; round-trip requires human |

### Required Artifacts

| Artifact                                                                 | Expected                                      | Status     | Details                                               |
| ------------------------------------------------------------------------ | --------------------------------------------- | ---------- | ----------------------------------------------------- |
| `src/_db/migrations/0004_appointments_service_type_duration.sql`         | DDL: ADD COLUMN service_type + duration       | ✓ VERIFIED | File exists, 2 ALTER TABLE statements, applied        |
| `src/_data-access/appointments.ts`                                       | AppointmentRow com FKs brutos                 | ✓ VERIFIED | customerId/vehicleId/mechanicId no type, select e map |
| `src/_actions/appointments.ts`                                           | updateAppointmentAction + status return fix   | ✓ VERIFIED | Exportado linha 41; retorna status linha 86           |
| `src/_hooks/use-appointment-form.ts`                                     | form hook bimodal mode/initialValues          | ✓ VERIFIED | Params estendidos; branch mode==="edit" funcional     |
| `src/app/(dashboard)/appointments/_components/EditAppointmentDrawer.tsx` | Drawer de edição (D-04)                       | ✓ VERIFIED | Exported named; date-fns format; mode "edit"          |
| `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx`       | SERVICE_TYPE_LABELS + onEdit + display        | ✓ VERIFIED | SERVICE_TYPE_LABELS linha 8; onEdit prop linha 37     |
| `src/app/(dashboard)/appointments/appointments-client.tsx`               | Integração EditAppointmentDrawer + handleEdit | ✓ VERIFIED | Import linha 42; handleEdit linha 96; 2 render sites  |

### Key Link Verification

| From                            | To                                             | Via                            | Status  | Details                                                                                    |
| ------------------------------- | ---------------------------------------------- | ------------------------------ | ------- | ------------------------------------------------------------------------------------------ |
| `appointments.ts` (data-access) | `appointments.customerId/vehicleId/mechanicId` | select + map                   | ✓ WIRED | Linhas 49-51 (select) e 73-75 (map)                                                        |
| `appointments-client.tsx`       | `data.status`                                  | onSuccess functional setState  | ✓ WIRED | Linha 88 — `status: data.status` via map                                                   |
| `EditAppointmentDrawer.tsx`     | `useAppointmentForm`                           | `mode: "edit"` + initialValues | ✓ WIRED | Linha 64; appointmentId: appt.id                                                           |
| `use-appointment-form.ts`       | `updateAppointmentAction`                      | useAction edit branch          | ✓ WIRED | Import linha 11; useAction linha 85; branch 109                                            |
| `AppointmentCard.tsx`           | `onEdit` prop                                  | botão Editar onClick           | ✓ WIRED | `onEdit(appt.id)` linha 122                                                                |
| `appointments-client.tsx`       | `EditAppointmentDrawer`                        | editingAppt state + render     | ✓ WIRED | Import 42; state 96; onEdit nos 2 render sites (grep -c = 2); render condicional linha 540 |

### Behavioral Spot-Checks

| Behavior                                        | Command                          | Result             | Status |
| ----------------------------------------------- | -------------------------------- | ------------------ | ------ |
| Test suite completa (67 testes)                 | `npm test -- --run`              | 67/67 pass         | ✓ PASS |
| TypeScript sem erros                            | `npx tsc --noEmit`               | saída vazia (0)    | ✓ PASS |
| audit count 19 (inclui updateAppointmentAction) | grep `toBe(19)` `_audit.test.ts` | linha 62: toBe(19) | ✓ PASS |

### Requirements Coverage

| Requirement | Source Plans        | Description                                                               | Status      | Evidence                                                                                                       |
| ----------- | ------------------- | ------------------------------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------- |
| APPT-01     | 09-01, 09-02, 09-03 | Operador pode criar, listar e cancelar agendamentos com dados persistidos | ✓ SATISFIED | createAppointmentAction + updateAppointmentStatusAction + listAppointments funcionais; closure bug corrigido   |
| APPT-02     | 09-01, 09-02, 09-03 | Schema inclui serviceType e duration (sem perda de dados do formulário)   | ✓ SATISFIED | Migration 0004 aplicada; valueAsNumber fix; seed enriquecido; updateAppointmentAction persiste ambos os campos |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact            |
| ---- | ---- | ------- | -------- | ----------------- |
| —    | —    | —       | —        | Nenhum encontrado |

No `TBD`, `FIXME`, or `XXX` markers in any phase-modified file. No stub implementations. No hardcoded empty returns.

### Human Verification Required

#### 1. Create Appointment Persists to Calendar

**Test**: Rodar `npm run dev`, abrir /appointments, criar agendamento com serviceType e duration definidos
**Expected**: Após recarregar a página, o agendamento aparece no calendário com os valores corretos (serviceType label e duration em min)
**Why human**: Requer browser com DB Neon live — ciclo completo form → action → DB → calendar view

#### 2. Cancel Persists in DB

**Test**: Cancelar um agendamento existente clicando no botão de cancelamento
**Expected**: O chip de status muda para "Cancelado" e permanece após recarregar a página (DB persiste)
**Why human**: Requer verificação de estado pós-reload; não verificável por grep

#### 3. Edit Drawer Pre-population

**Test**: Clicar "Editar" em um AppointmentCard que tenha serviceType e duration
**Expected**: Todos os campos do drawer abrem pré-populados (cliente, veículo, mecânico, data, hora, tipo de serviço, duração, notas)
**Why human**: Renderização visual e pré-population de selects são comportamentos de runtime

#### 4. Edit Persists Duration

**Test**: Alterar a duração no EditAppointmentDrawer de 60 para 90, salvar, recarregar
**Expected**: O card exibe "90 min" após reload
**Why human**: Round-trip DB real necessário para confirmar que updateAppointmentAction persiste a alteração

### Gaps Summary

No automated gaps found. All 8 must-have truths verified. All key links wired. Tests 67/67 pass. tsc clean. Requirements APPT-01 and APPT-02 satisfied by codebase evidence.

Phase status is `human_needed` because ROADMAP success criteria 1-3 all involve live DB + browser verification that cannot be confirmed programmatically. The automated foundation (schema, actions, hooks, components, wiring) is complete.

---

_Verified: 2026-06-22T12:15:00-03:00_
_Verifier: Claude (gsd-verifier)_
