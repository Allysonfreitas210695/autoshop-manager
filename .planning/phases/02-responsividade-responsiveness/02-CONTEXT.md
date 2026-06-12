# Phase 2: Responsividade (Responsiveness) - Context

**Gathered:** 2026-06-12
**Status:** Ready for planning

<domain>
## Phase Boundary

Make the full operator flow usable on mobile and desktop — navigation, tables, forms, and detail screens reflow cleanly at every breakpoint with touch-friendly controls.

This phase ADJUSTS existing screens — it does not redesign the app structure or introduce new features. The sidebar drawer (Sheet via Header) and DataTable `overflow-x-auto` already exist; this phase ensures coverage is complete, consistent, and verified across all routes.

Covers requirements RESP-01 … RESP-05.
</domain>

<decisions>
## Implementation Decisions

### Sidebar mobile (RESP-01)

- **D-01:** The mobile sidebar drawer is **already implemented** via `Sheet` in `Header` (`lg:hidden` trigger, `SidebarContent` as content). No new infrastructure needed — verify behavior and adjust sizing only.
- **D-02:** Drawer width on mobile: **`w-[85vw] max-w-xs`** (dynamic — adapts to narrow screens like 320px). Replace the current fixed `w-64` on the SheetContent in header.tsx for the mobile menu.

### DataTable horizontal scroll (RESP-02)

- **D-03:** `DataTable` already has `overflow-x-auto` at component level. Audit each page that wraps `DataTable` in a Card or container and ensure no parent element clips the overflow (no `overflow-hidden` on ancestor cards without explicit intent).

### Column visibility in tables (RESP-02 / RESP-03)

- **D-04:** Column priority rule — **always visible**: primary identifier + status/critical indicator. **Hidden at sm**: secondary details (CPF, plate, price, mechanic). **Hidden at md**: tertiary info (phone, category). Apply this rule consistently across all tables that do not yet have responsive column hiding.
- **D-05:** Orders table essential columns (always visible): **O.S.# + Cliente/Veículo + Status**. Placa, mecânico, preço ficam ocultos em `sm`.
- **D-06:** Inventory table essential columns (always visible): **Nome do item + Quantidade + Status de estoque** (badge baixo/crítico). Preço unitário e categoria ficam ocultos em `sm`.

### Adaptive layouts (RESP-03)

- **D-07:** Order wizard step indicator: **scroll horizontal** nos steps em mobile — todos os 4 steps visíveis com `overflow-x-auto`, step ativo destacado. Permite visualizar posição no fluxo completo.
- **D-08:** Wizard form fields: **coluna única + scroll vertical** em mobile. Botões de avançar/voltar fixos no rodapé com `pb-safe` / `pb-4` para não sobrepor conteúdo. Grid de 2 colunas em `md+`.
- **D-09:** Finance reports charts: **scroll horizontal nos gráficos** — `overflow-x-auto` no wrapper do chart para preservar densidade de dados. Gráficos mantêm tamanho com largura mínima (ex: `min-w-[320px]`).

### Touch targets (RESP-04)

- **D-10:** Minimum touch target: **44px height** (Apple HIG / Material baseline). Nav items, botões, links de ação devem ter `min-h-[44px]` ou padding equivalente. Os nav items com `py-2.5` no sidebar chegam a ~40px — ajustar para `py-3` (48px) para folga.
- **D-11:** Icon-only buttons (Bell, Menu, Search no Header) já usam `size="icon"` — verificar que `size-icon` resulta em ao menos 44×44px. Ajustar se necessário.

### Breakpoint verification (RESP-05)

- **D-12:** Verificação sistemática em todas as rotas existentes: nenhum overflow horizontal, nenhum conteúdo cortado. Breakpoints alvo: 375px (mobile), 768px (tablet), 1024px (desktop).

### Claude's Discretion

- Exata classe de largura mínima dos gráficos em scroll horizontal (ex: `min-w-[300px]` ou `min-w-[400px]` dependendo do gráfico).
- Ordem de ocultação de colunas em tabelas não especificadas (finance, agendamentos) — seguir o padrão D-04.
- Se o `overflow-x-auto` do DataTable for suficiente ou se um wrapper adicional de `-mx-4 px-4` for necessário para "negative margin bleed" em mobile.

</decisions>

<canonical_refs>

## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Projeto — decisões bloqueadas

- `.planning/PROJECT.md` — design system, regras TS, Base UI render-prop, mock-data-first.
- `.planning/REQUIREMENTS.md` — RESP-01 … RESP-05 requirement text.
- `.planning/STATE.md` — estado atual do projeto.

### Arquivos-alvo desta fase (ler antes de modificar)

- `src/_components/shared/sidebar.tsx` — `Sidebar` (desktop, `hidden lg:block`) e `SidebarContent` (compartilhado com mobile drawer). Alvo de D-01/D-02.
- `src/_components/shared/header.tsx` — mobile Sheet trigger + `SidebarContent`. Alvo de D-02.
- `src/app/(dashboard)/layout.tsx` — estrutura `lg:ml-64`, `<Header>`, `<Sidebar>`. Alvo de D-02.
- `src/_components/ui/data-table.tsx` — `overflow-x-auto` já presente. Alvo de D-03.
- `src/_components/ui/sheet.tsx` — Sheet/Drawer base (Base UI Dialog). Usado pelo sidebar mobile e customer detail panel.
- `src/app/(dashboard)/orders/new/order-wizard.tsx` — step wizard. Alvo de D-07/D-08.
- `src/app/(dashboard)/orders/new/step-indicator.tsx` — step indicator. Alvo de D-07.
- `src/app/(dashboard)/orders/_components/OrdersClient.tsx` — tabela de O.S. Alvo de D-05.
- `src/app/(dashboard)/inventory/inventory-client.tsx` — tabela de inventário. Alvo de D-06.
- `src/app/(dashboard)/finance/reports/page.tsx` — gráficos e tabelas. Alvo de D-09.
- `src/app/(dashboard)/page.tsx` — dashboard principal (já tem `sm:grid-cols-2 lg:grid-cols-4`).

### Padrão de referência (colunas responsivas já funcionando)

- `src/app/(dashboard)/customers/customers-client.tsx` — usa `hidden sm:table-cell` e `hidden md:table-cell`. Modelo a replicar.

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `Sheet` / `SheetContent` (`src/_components/ui/sheet.tsx`): Base UI Dialog-based drawer. Já usado no mobile sidebar e no CustomerDetailPanel. Padrão para qualquer painel que precise de comportamento de drawer.
- `SidebarContent` (`src/_components/shared/sidebar.tsx`): componente separado que aceita `onNavigate` prop — já projetado para ser usado tanto no Sidebar desktop quanto no Sheet mobile. Reutilizar sem duplicação.
- `DataTable` (`src/_components/ui/data-table.tsx`): já tem `overflow-x-auto`, suporte a `className` por coluna (para `hidden sm:table-cell`). Apenas adicionar as classes de hide nas colunas.
- `cn()` utility em `src/_lib/utils.ts`: para condicional de classes Tailwind.

### Established Patterns

- Column hiding: `className: "hidden sm:table-cell"` na definição de coluna do DataTable — ver `customers-client.tsx` como referência.
- Sheet drawer: `Sheet > SheetContent side="left" > SidebarContent onNavigate={() => setMenuOpen(false)}` — padrão já no header.tsx.
- Responsive grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4` — já usado no dashboard. Replicar para outras telas de cards.
- Sticky bottom nav: não usado ainda — para botões de wizard use `sticky bottom-0 bg-surface` com padding seguro.

### Integration Points

- `src/app/(dashboard)/layout.tsx` — ponto de integração do sidebar mobile; `<Header>` já recebe o trigger.
- Cada `*-client.tsx` que usa `DataTable` — adicionar column classes para hide responsivo.
- `order-wizard.tsx` + `step-indicator.tsx` — refluxo dos steps e dos formulários.

</code_context>

<specifics>
## Specific Ideas

- Sidebar drawer mobile: `w-[85vw] max-w-xs` (usuário especificou — adapta a 320px).
- Wizard: scroll horizontal nos steps (usuário especificou — preserva visibilidade do fluxo completo).
- Finance charts: scroll horizontal (usuário especificou — preserva densidade de dados).
- Touch target: 44px mínimo (padrão Apple HIG).
- Nav items no sidebar: ajustar para `py-3` para garantir ≥44px.

</specifics>

<deferred>
## Deferred Ideas

- Nenhuma ideia fora de escopo surgiu durante a discussão.

</deferred>

---

_Phase: 2-Responsividade (Responsiveness)_
_Context gathered: 2026-06-12_
