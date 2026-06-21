# Plano: deixar tudo funcional

Auditoria por 4 sub-agentes (Orders, Inventory, Customers+Appointments, Finance/Analytics/Dashboard/Track). Typecheck baseline limpo.

## Fundações (fazer primeiro — destravam o resto)

- **F1. Migração de schema**: colunas faltantes que fazem dados serem descartados silenciosamente:
  - `serviceOrders.description` é gravado? hoje drawer manda para `clientReport`; itens do wizard descartam checklist/assinatura.
  - `parts`: adicionar `category`, `supplier`, `location` (NewPartForm coleta e joga fora).
  - assinatura digital: nova coluna `signatureUrl` (ou tabela) + upload.
  - tabela `settings` (oficina): CNPJ, PIX, endereço, telefone, horário — hoje hardcoded em print/track/finance.
- **F2. Helper de feedback**: padronizar `toast.success/error` via `onError` em todos os `useAction` (hoje vários hooks sem erro visível).
- **F3. Mover `inventoryCategories` de `_helpers/mock-data.ts` para `_helpers/constants.ts`.**

## CRÍTICO (funcionalidades visíveis sem backend)

Orders:

- C1. Drawer de O.S. grava `totalAmount=0` (campo descartado no `execute()`) → passar como item labor ou campo direto.
- C2. `description` do drawer nunca persiste em `serviceOrders.description` (mandado p/ clientReport).
- C3. Conflito `approved`: schema default `true` vs action insere `false` — alinhar intenção.
- C4. Budget: 2 botões "Baixar PDF" sem onClick.
- C5. step-01 "Novo Cadastro Rápido" botão fantasma (sem onClick).

Inventory:

- C6. NewPartForm: `category/supplier/location` coletados e descartados (depende de F1).
- C7. Purchase Orders presas em `draft` para sempre — falta `updatePurchaseOrderStatusAction` + botões.
- C8. Lista de fornecedores hardcoded em NewPurchaseOrderClient (input livre ou tabela).

Customers/Appointments:

- C9. "Editar Cadastro" do cliente sem onClick + falta `updateCustomerAction`.
- C10. AppointmentCard sem nenhuma ação (confirmar/cancelar/status) — falta `updateAppointmentAction`.
- C11. `vehicleId` type mismatch (`string` vs `uuid`) rejeita silenciosamente + sem toast.

Finance/Dashboard:

- C12. Busca do header (desktop+mobile) sem nenhum handler.
- C13. Notificações do header hardcoded (badge sempre aceso) — ligar a estoque crítico + O.S. concluídas reais.
- C14. Finance: "Quick Actions" sem onClick; filtros Mensal/Trimestral/Anual sem estado (dados não recarregam).
- C15. Reports: "Exportar PDF" sem handler.

## MÉDIO

- M1. Wizard "Salvar Rascunho" é toast falso (não persiste).
- M2. Checklist (step-checklist) descartado no submit final.
- M3. Assinatura digital capturada e descartada (depende F1 + upload).
- M4. OrderDetailPanel mostra OrderRow, não OrderDetail (sem diagnóstico/itens/clientReport) → chamar getOrderById.
- M5. Paginação não-funcional: Orders, Customers (botões disabled fixos, sem paginação server-side).
- M6. N+1 queries: listOrders (3/ordem), listCustomers (1/cliente) → JOIN/inArray.
- M7. Customers: botões "Filtros" e "Exportar" sem onClick.
- M8. `?customerId=` ignorado: customer-detail e "Nova O.S." não pré-selecionam cliente no wizard.
- M9. Purchase order detail não carrega itens da ordem (só metadados) — falta getPurchaseOrderItems.
- M10. Reports `avgTicket` divide por nº de categorias, não nº de O.S. (valor errado).
- M11. Analytics hardcoded: `avgRating 4.5`, `nps 72`, `returnRate 68`, `newCustomers = ativos*0.3`.
- M12. Appointments list view só mostra próximos 14 dias (passados invisíveis).

## BAIXO

- B1. print/page: UUID exibido como nº de O.S. → usar `orderNumber`.
- B2. print PIX QR é grid decorativo fake → qrcode.react com chave real (depende F1 settings).
- B3. Dashboard "Próximas Entregas" usa placa como título em vez de `dueAt`.
- B4. formatPlate aplicado a lastPlate null/undefined.
- B5. getMechanicPerformance innerJoin exclui O.S. sem mecânico.
- B6. Inventory: busca só client-side (searchParts nunca chamada), sem debounce/paginação.
- B7. Alerts "Pedir" não pré-seleciona peça na nova ordem (sem partId no href).
- B8. UpdateStockDialog sem feedback visual em valor negativo.
- B9. TrackQrCode fallback window.location.origin (garantir NEXT_PUBLIC_APP_URL no deploy).

## Ordem de execução sugerida (waves)

1. **Wave 0 — Fundações**: F1 (migração) → F2 → F3.
2. **Wave 1 — Persistência crítica**: C1, C2, C3, C6, C11 (dados que se perdem).
3. **Wave 2 — Ações faltantes**: C7, C9, C10, C8 (server actions + botões status/edição).
4. **Wave 3 — UI morta**: C4, C5, C12, C13, C14, C15 (handlers/PDF/busca/notificações).
5. **Wave 4 — Médios**: M1–M12.
6. **Wave 5 — Baixos/polish**: B1–B9.

Cada wave: typecheck + commit atômico por item.
