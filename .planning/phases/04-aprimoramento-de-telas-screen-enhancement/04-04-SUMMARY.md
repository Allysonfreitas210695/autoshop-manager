---
plan: 04-04
status: complete
changes_made: true
files_changed: 1
---

## Resultado do Polish SCRN-07 — 4 Telas

### Decisão global: StatusChip não utilizado nestas telas

O `StatusChip` aceita apenas `pending | in_progress | completed | delayed`.
Nenhum dos domínios de status destas telas mapeia para esse conjunto:

- Agendamentos: `scheduled | confirmed | cancelled | completed`
- Ordens de Compra: `draft | sent | received | cancelled`
- Alertas: severidade `critical | low` (não é status de ordem)

Aplicada a regra de desvio justificado: badges inline normalizados para o contrato visual do StatusChip (`rounded-full font-mono uppercase tracking-wider font-bold`) com tokens de sistema — sem alargamento do StatusChip (alteração de componente compartilhado está fora de escopo).

---

### appointments-client.tsx — CONFORME, sem alterações

- `h1 text-headline-md` ✓
- AppointmentCard badge: `rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase` ✓ (contrato visual)
- AppointmentBadge: `font-mono text-[10px]` ✓
- statusColor usa apenas tokens (`status-completed`, `status-pending`, `error`, `secondary`) ✓
- Nenhum hex em className ✓

### PurchaseOrdersClient.tsx — CONFORME, sem alterações

- `h1 text-headline-md` ✓
- Badge status: `rounded-full border px-2 py-1 font-mono text-[10px] font-bold tracking-wider uppercase` ✓
- statusColor: tokens apenas (`status-pending`, `secondary`, `status-completed`, `error`) ✓
- Código OC: `font-mono font-bold` ✓ | Valor Total: `font-mono` ✓ | Prev. Entrega: `font-mono` ✓
- Cabeçalhos da tabela: `font-mono tracking-wider uppercase` ✓
- Nenhum hex em className ✓

### AlertsClient.tsx — CONFORME, sem alterações

- `h1 text-headline-md` ✓ | `h2` seções com `text-title-sm` ✓
- Badges de severidade: `rounded-full border px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase` ✓
- Cores: tokens `error` e `tertiary` ✓ | Contagens: `font-mono font-bold` ✓
- Nenhum hex em className ✓
- Justificativa StatusChip: severidade de inventário não mapeia para o conjunto de status de ordens

### AnalyticsClient.tsx — 1 alteração (comentário)

**Único gap:** array `colors` de paleta de gráfico não tinha comentário identificando-o como dado de visualização.

**Correção aplicada:** adicionado comentário `// chart-data palette — hex allowed here, not UI chrome` acima do array (linha 255).

- KPI values: `font-mono` já aplicado ✓
- `h1 text-headline-md` ✓ | `h2` seções com `text-title-sm`/`text-title-md` ✓
- MetricCard não utilizado — KPIs analíticos têm props distintos (sem ícone padronizado); redesign fora de escopo
- Nenhum hex em className ✓ (hex apenas em `style={{ backgroundColor }}` — paleta de dados, não chrome)

---

## Verificação

- `npx tsc --noEmit` — zero erros
- Hex em className: 0 em todos os 4 arquivos
- `tracking-wider` em PurchaseOrdersClient: 2 ocorrências
- `tracking-wider` em AlertsClient: 6 ocorrências
- Comentário chart-data em AnalyticsClient: presente
