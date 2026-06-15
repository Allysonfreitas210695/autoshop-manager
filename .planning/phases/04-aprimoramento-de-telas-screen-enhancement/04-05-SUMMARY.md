---
plan: 04-05
status: complete
---

## Task 1 — Home dashboard, inventory, customers, orders

### page.tsx (home dashboard)

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- StatusChip já aplicado no status das O.S. (2 referências) — sem mudança
- O.S. codes, placas, totais: `font-mono` já presente ✓
- Nenhum hex em className ✓

### OrdersClient.tsx

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- StatusChip em `OrderStatusCell` (2 referências) — sem mudança
- Codes, placas, totais, datas: `font-mono` ✓
- Nenhum hex em className ✓

### inventory-client.tsx

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- `StockBadge` usa severidade de estoque (`critical/low`) — não mapeia para StatusChip. Desvio justificado: indicadores `text-error`/`text-warning` com `font-mono font-bold` (contrato visual aplicado sem `rounded-full`, pois não é um badge de linha mas um indicador de valor com ícone)
- SKU, preços, quantidades: `font-mono` ✓
- Nenhum hex em className ✓

### customers-client.tsx

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- Sem badges de status nesta tela
- CPF, telefone, placa, datas, totais: `font-mono` ✓
- Nenhum hex em className ✓

---

## Task 2 — Finance e finance/reports

### finance/page.tsx

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- Badge de transação (`paid/pending/overdue`): não mapeia para StatusChip (domínio financeiro). Gap corrigido: adicionado `font-bold` para completar o contrato visual (`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase`) ✓
- Currency values: `font-mono` ✓ | Nenhum hex em className ✓

### finance/reports/page.tsx

- `h1` normalizado: `text-headline-lg` → `text-headline-md` ✓
- Badge de categoria (`positive/neutral/negative`): não mapeia para StatusChip. Gap corrigido: adicionado `font-bold` ao contrato visual ✓
- Currency, margens: `font-mono` ✓ | Nenhum hex em className ✓

### finance-charts.tsx

- Hex Recharts (`#adc6ff`, `#ffb690`, `#22c55e`) em `fill`/`stroke`/`dot` props — NOT em className, portanto não são "hex UI chrome"
- Adicionado comentário: `// chart-data colors — Recharts requires literal strings, not CSS tokens` ✓
- Gráficos preservados intactos

---

## Gate de Completude — Fase 4

| Gate          | Resultado                                                    |
| ------------- | ------------------------------------------------------------ |
| tsc --noEmit  | ✓ zero erros                                                 |
| npm run lint  | ✓ zero erros (2 warnings pré-existentes em order-wizard.tsx) |
| npm run build | ✓ build Next.js completo, todas as rotas compiladas          |

---

## Decisão global StatusChip — resumo por tela

| Tela                 | StatusChip usado? | Justificativa de desvio                                            |
| -------------------- | ----------------- | ------------------------------------------------------------------ |
| Home dashboard       | ✓ sim             | status de O.S. mapeia para pending/in_progress/completed/delayed   |
| Orders               | ✓ sim             | idem                                                               |
| Inventory            | ✗ não             | StockBadge é indicador numérico de severidade, não status de ordem |
| Customers            | n/a               | sem badges de status                                               |
| Finance transactions | ✗ não             | paid/pending/overdue não mapeiam para o conjunto do StatusChip     |
| Finance reports      | ✗ não             | positive/neutral/negative não mapeiam                              |
