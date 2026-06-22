---
plan: 09-03
phase: 09-appointments
status: complete
wave: 3
completed: 2026-06-22
---

## Summary

Atualizado `AppointmentCard` para exibir `serviceType` (label formatada via `SERVICE_TYPE_LABELS`) e `duration` (com sufixo " min"), além de botão **Editar** condicional via prop `onEdit`. Integrado `EditAppointmentDrawer` em `appointments-client.tsx` com estado `editDrawerOpen`/`editingAppt` e função `handleEdit`, adicionando `onEdit={handleEdit}` nos dois render sites de `AppointmentCard` (calendar view e list view). Checkpoint humano aprovado.

## Key Files

### Modified

- `src/app/(dashboard)/appointments/_components/AppointmentCard.tsx` — SERVICE_TYPE_LABELS, prop onEdit, display serviceType/duration, botão Editar
- `src/app/(dashboard)/appointments/appointments-client.tsx` — import EditAppointmentDrawer, estado edit, handleEdit, onEdit nos 2 render sites, render condicional do drawer

## Decisions

- Botão Editar renderizado apenas quando `onEdit` está presente (prop opcional) — permite reutilizar o card sem edit em outros contextos
- `serviceType`/`duration` exibidos em bloco separado das metadatas de horário/mecânico — visualmente distinto antes dos botões de ação
- Week view usa `AppointmentBadge` (não `AppointmentCard`) — não alterado conforme Pitfall 4 do plano

## Self-Check: PASSED

- [x] SERVICE_TYPE_LABELS com 7 chaves e labels acentuadas corretas
- [x] prop onEdit?: (id: string) => void em Props
- [x] serviceType/duration exibidos condicionalmente
- [x] botão Editar chama onEdit(appt.id)
- [x] EditAppointmentDrawer importado e integrado
- [x] handleEdit localiza o appt e abre o drawer
- [x] onEdit={handleEdit} em 2 render sites (calendar + list)
- [x] tsc --noEmit limpo
- [x] 67/67 testes passando
- [x] Checkpoint humano aprovado
