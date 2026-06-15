---
plan: 04-02
status: complete
---

## O que foi feito

- Estendeu o tipo `View` de `"calendar" | "list"` para `"calendar" | "week" | "list"`
- Adicionou estado `currentWeek` inicializado com `startOfWeek(today, { weekStartsOn: 0 })`
- Adicionou handlers `prevWeek` / `nextWeek` usando `addDays(currentWeek, ±7)`
- Importou `CalendarRange` de lucide-react para o ícone do botão Semana
- Inseriu botão "Semana" no switcher entre Calendário e Lista com estilo idêntico aos demais
- Adicionou branch `view === "week"` com grade de 7 colunas navegável (prev/next semana)
- Grade semanal exibe cabeçalho dom-sáb com número do dia destacado quando hoje
- Agendamentos por dia ordenados por `byTime`, com `AppointmentBadge` e overflow `+N mais`

## Verificação

- `npx tsc --noEmit` — zero erros
- `grep '"calendar" | "week" | "list"'` — 1 ocorrência
- `grep 'Semana'` — 2 ocorrências (botão + label)
- `grep 'view === "week"'` — 2 ocorrências
- `grep 'endOfWeek(currentWeek'` — 2 ocorrências
- `grep 'react-big-calendar'` — 0 ocorrências (D-10 respeitado)
