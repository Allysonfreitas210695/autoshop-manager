# Phase 3: Usabilidade (Usability) — Pattern Map

**Mapped:** 2026-06-13
**Files analyzed:** 17 (novos e modificados)
**Analogs found:** 14 / 17

---

## File Classification

| Arquivo novo/modificado                                               | Role           | Data Flow        | Analog mais próximo                                                                        | Qualidade  |
| --------------------------------------------------------------------- | -------------- | ---------------- | ------------------------------------------------------------------------------------------ | ---------- |
| `src/_hooks/use-new-part-form.ts`                                     | hook           | request-response | `src/_hooks/use-appointment-form.ts`                                                       | exact      |
| `src/app/(dashboard)/orders/new/order-wizard.tsx`                     | component      | request-response | `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` | role-match |
| `src/_actions/orders.ts` (schema fix)                                 | action         | CRUD             | `src/_actions/inventory.ts` (`createPartAction`)                                           | exact      |
| `src/app/(dashboard)/customers/_components/NewCustomerDrawer.tsx`     | component      | request-response | `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx`                    | exact      |
| `src/app/(dashboard)/customers/customers-client.tsx` (fix route)      | component      | event-driven     | `src/app/(dashboard)/appointments/appointments-client.tsx`                                 | role-match |
| `src/app/(dashboard)/orders/[id]/budget/_components/BudgetClient.tsx` | component      | request-response | `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` | role-match |
| `src/app/(dashboard)/orders/[id]/budget/page.tsx` (split)             | component      | CRUD             | `src/app/(dashboard)/orders/[id]/budget/page.tsx` (atual)                                  | self       |
| `src/app/(dashboard)/loading.tsx`                                     | loading        | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/orders/loading.tsx`                              | loading        | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/customers/loading.tsx`                           | loading        | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/inventory/loading.tsx`                           | loading        | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/appointments/loading.tsx`                        | loading        | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/error.tsx`                                       | error-boundary | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/orders/error.tsx`                                | error-boundary | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/customers/error.tsx`                             | error-boundary | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/inventory/error.tsx`                             | error-boundary | —                | nenhum existente                                                                           | no-analog  |
| `src/app/(dashboard)/appointments/error.tsx`                          | error-boundary | —                | nenhum existente                                                                           | no-analog  |

---

## Pattern Assignments

### `src/_hooks/use-new-part-form.ts` (hook, request-response)

**Analog:** `src/_hooks/use-appointment-form.ts`
**Problema atual:** usa `console.log` + `setTimeout` em vez de `execute()`.

**Imports pattern** (linhas 1–8 do analog):

```typescript
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { createPartAction } from "@/_actions/inventory";
```

**Core useAction pattern** (linhas 46–51 do analog):

```typescript
const { execute, status, result } = useAction(createPartAction, {
  onSuccess: () => {
    reset();
    onClose(); // ou router.push("/inventory")
  },
  // onError omitido no analog — adicionar para useNewPartForm:
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Erro ao cadastrar peça.");
  },
});
```

**onSubmit com mapeamento de campos** (padrão a replicar — campos renomeados):

```typescript
// use-new-part-form.ts — formulário tem unitPrice/stock; action espera price/stockQuantity
function onSubmit(data: NewPartValues) {
  execute({
    name: data.name,
    sku: data.sku,
    price: data.unitPrice, // RENOMEAR: unitPrice → price
    stockQuantity: data.stock, // RENOMEAR: stock → stockQuantity
    minStock: data.minStock,
    // category, supplier, location: NÃO enviar — createPartAction não aceita
  });
}
```

**Substituição de isSubmitting por status** (linhas 37, 67 do arquivo atual):

```typescript
// REMOVER: const { ..., isSubmitting } = useForm(...)
// REMOVER: submitted state e setTimeout
// USAR: status === "executing" para disabled do botão
// <Button disabled={status === "executing"} type="submit">
```

**Retorno do hook corrigido:**

```typescript
return {
  register,
  handleSubmit,
  control,
  errors,
  status, // de useAction (substitui isSubmitting)
  result, // para exibir serverError se necessário
  stockValue,
  unitPriceValue,
  nameValue,
  categoryValue,
  totalValue,
  onSubmit,
  goToInventory: () => router.push("/inventory"),
};
```

---

### `src/app/(dashboard)/orders/new/order-wizard.tsx` (component, request-response)

**Analog:** `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx`
**Problema atual:** `handleFinalSubmit` (linhas 74–86) usa `setTimeout` + `console.log`.

**Imports a adicionar** (topo do arquivo, após os existentes):

```typescript
import { useAction } from "next-safe-action/hooks";
import { createOrderAction } from "@/_actions/orders";
import { toast } from "sonner"; // já importado na linha 6
```

**useAction setup** (adicionar após `useState(INITIAL_STATE)`):

```typescript
const { execute, status } = useAction(createOrderAction, {
  onSuccess: ({ data }) => {
    toast.success(`O.S. #${data?.orderNumber} criada com sucesso.`);
    router.push("/orders");
  },
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Erro ao criar O.S.");
  },
});
```

**handleFinalSubmit corrigido** (substitui linhas 74–86):

```typescript
function handleFinalSubmit(data: Step4Values, signatureDataUrl: string | null) {
  const parts = ((wizardData.step3.parts as PartItem[]) ?? []).map((p) => ({
    description: p.name,
    itemType: "part" as const,
    quantity: p.quantity,
    unitPrice: p.unitPrice,
  }));
  const labor = ((wizardData.step3.laborItems as LaborItem[]) ?? []).map(
    (l) => ({
      description: l.description,
      itemType: "labor" as const,
      quantity: 1,
      unitPrice: l.price,
    }),
  );

  execute({
    plate: wizardData.step1.plate ?? "",
    customerName: wizardData.step1.customerName ?? "",
    vehicleModel: wizardData.step1.vehicleModel ?? "",
    clientReport: wizardData.step2.customerReport,
    diagnosis: wizardData.step2.initialDiagnosis,
    serviceType: wizardData.step2.serviceType,
    priority: wizardData.step2.priority ?? "normal",
    items: [...parts, ...labor],
  });
}
```

**Botão "Gerar O.S." desabilitado durante execução** (linha 208–215 atual):

```typescript
<Button
  type="submit"
  form="wizard-step-form"
  disabled={isFinalStep && status === "executing"}
  className={isFinalStep ? "bg-tertiary text-surface hover:bg-tertiary/90" : ""}
>
  {isFinalStep
    ? status === "executing" ? "Gerando O.S...." : "Gerar O.S."
    : "Próximo Passo →"}
</Button>
```

---

### `src/_actions/orders.ts` — schema fix de `createOrderAction`

**Analog para estrutura de schema:** `src/_actions/inventory.ts` linhas 11–38 (`createPartAction`)
**Problema:** `vehicleId: z.uuid()` (linha 14) não pode ser fornecido pelo wizard.
**DB constraint:** `vehicleId` é `NOT NULL` com FK para `vehicles` — precisa criar um vehicle inline.

**Schema corrigido** (substitui linhas 13–33):

```typescript
z.object({
  plate: z.string().min(6).max(8),
  customerName: z.string().min(2),
  vehicleModel: z.string().min(2),
  customerId: z.string().optional(),
  mechanicId: z.string().optional(),
  clientReport: z.string().optional(),
  diagnosis: z.string().optional(),
  serviceType: z.string().optional(),
  priority: z.string(),
  dueAt: z.string().datetime().optional(),
  items: z.array(
    z.object({
      description: z.string(),
      itemType: z.enum(["part", "labor"]),
      quantity: z.number().int().min(1),
      unitPrice: z.number().min(0),
    }),
  ),
});
```

**Lógica do .action() — criar vehicle inline** (substitui linhas 35–74):

```typescript
.action(async ({ parsedInput }) => {
  // 1. Criar vehicle inline (mock-data-first: sem lookup por placa)
  const [vehicle] = await db
    .insert(vehicles)
    .values({
      plate: parsedInput.plate.toUpperCase(),
      make: "Não informado",
      model: parsedInput.vehicleModel,
    })
    .returning({ id: vehicles.id });

  const totalAmount = parsedInput.items.reduce(
    (s, i) => s + i.quantity * i.unitPrice,
    0,
  );

  const [order] = await db
    .insert(serviceOrders)
    .values({
      vehicleId: vehicle.id,
      customerId: parsedInput.customerId ?? null,
      mechanicId: parsedInput.mechanicId ?? null,
      clientReport: parsedInput.clientReport ?? null,
      diagnosis: parsedInput.diagnosis ?? null,
      serviceType: parsedInput.serviceType ?? null,
      priority: parsedInput.priority,
      dueAt: parsedInput.dueAt ? new Date(parsedInput.dueAt) : null,
      totalAmount: String(totalAmount),
    })
    .returning({ id: serviceOrders.id, orderNumber: serviceOrders.orderNumber });

  if (parsedInput.items.length > 0) {
    await db.insert(serviceOrderItems).values(
      parsedInput.items.map((i) => ({
        serviceOrderId: order.id,
        description: i.description,
        itemType: i.itemType,
        quantity: i.quantity,
        unitPrice: String(i.unitPrice),
        approved: false,
      })),
    );
  }

  revalidatePath("/orders");
  return { id: order.id, orderNumber: order.orderNumber };
});
```

**Import adicional necessário:**

```typescript
import { vehicles } from "@/_db/schema"; // já importado via @/_db/schema
```

---

### `src/app/(dashboard)/customers/_components/NewCustomerDrawer.tsx` (component, request-response) — NOVO

**Analog:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` (cópia direta da estrutura)

**Imports pattern** (linhas 1–22 do analog):

```typescript
"use client";

import { User } from "lucide-react";
import { Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import { createCustomerAction } from "@/_actions/customers";
import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/_components/ui/sheet";
```

**Estrutura Sheet/Drawer** (linhas 48–222 do analog — copiar estrutura exata):

```typescript
type Props = {
  open: boolean;
  onClose: () => void;
};

export function NewCustomerDrawer({ open, onClose }: Props) {
  // schema local (sem .default() em campos Zod — usar defaultValues no useForm)
  const customerSchema = z.object({
    name: z.string().min(2, "Nome deve ter ao menos 2 caracteres."),
    email: z.string().email("E-mail inválido."),
    phone: z.string().optional(),
    cpf: z.string().optional(),
    address: z.string().optional(),
  });
  type CustomerFormData = z.infer<typeof customerSchema>;

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<CustomerFormData>({
      resolver: zodResolver(customerSchema),
      defaultValues: { name: "", email: "", phone: "", cpf: "", address: "" },
    });

  const { execute, status, result } = useAction(createCustomerAction, {
    onSuccess: () => {
      toast.success("Cliente cadastrado com sucesso.");
      reset();
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Erro ao cadastrar cliente.");
    },
  });

  function onSubmit(data: CustomerFormData) {
    execute({
      name: data.name,
      email: data.email,
      phone: data.phone || undefined,
      cpf: data.cpf || undefined,
      address: data.address || undefined,
    });
  }

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="right" className="bg-surface w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-outline-variant/30 border-b pb-4">
          <SheetTitle className="text-on-surface flex items-center gap-2">
            <User className="text-secondary size-5" />
            Novo Cliente
          </SheetTitle>
          <SheetDescription className="text-on-surface-variant text-label-sm">
            Preencha os dados para cadastrar o cliente
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-1 py-5">
          {/* campos com register() */}
          {result.serverError && (
            <p className="text-label-sm text-error">
              Erro ao cadastrar cliente. Tente novamente.
            </p>
          )}
        </form>

        <SheetFooter className="border-outline-variant/30 gap-2 border-t pt-4">
          <SheetClose render={<Button variant="outline" onClick={onClose}>Cancelar</Button>} />
          <Button onClick={handleSubmit(onSubmit)} disabled={status === "executing"}>
            {status === "executing" ? "Salvando..." : "Cadastrar Cliente"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
```

**Nota SheetClose:** usar `render={<Button>...</Button>}` (Base UI pattern, linha 206–208 do analog) — NUNCA `asChild`.

---

### `src/app/(dashboard)/customers/customers-client.tsx` — fix rota errada

**Problema:** linha 126 — `router.push("/orders/new")` incorreto.

**Analog:** `src/app/(dashboard)/appointments/appointments-client.tsx` linhas 147–148 (useState para drawerOpen):

```typescript
// appointments-client.tsx linhas 147-148:
const [drawerOpen, setDrawerOpen] = useState(false);
```

**Fix a aplicar em customers-client.tsx:**

```typescript
// ADICIONAR ao topo do componente (após outros useState):
const [drawerOpen, setDrawerOpen] = useState(false);

// SUBSTITUIR linha 126:
// ANTES: <Button onClick={() => router.push("/orders/new")} ...>
// DEPOIS:
<Button onClick={() => setDrawerOpen(true)} className="gap-2">
  <Plus className="size-4" />
  Cadastrar Novo Cliente
</Button>

// ADICIONAR ao final do JSX (antes do fechamento do return):
<NewCustomerDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
/>
```

---

### `src/app/(dashboard)/orders/[id]/budget/_components/BudgetClient.tsx` (component, request-response) — NOVO

**Analog:** `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` linhas 42–46 (useAction sem react-hook-form)

**Imports:**

```typescript
"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

import { approveOrderItemAction } from "@/_actions/orders";
import { Button } from "@/_components/ui/button";
```

**ApproveItemButton — padrão useAction sem formulário** (replicar estrutura do NewPurchaseOrderClient linhas 42–46, 87–101):

```typescript
type ApproveItemButtonProps = {
  itemId: string;
  orderId: string;
  approved: boolean;
};

export function ApproveItemButton({ itemId, orderId, approved }: ApproveItemButtonProps) {
  const { execute, status } = useAction(approveOrderItemAction, {
    onSuccess: () =>
      toast.success(approved ? "Item reprovado." : "Item aprovado."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao atualizar item."),
  });

  return (
    <button
      disabled={status === "executing"}
      onClick={() => execute({ itemId, orderId, approved: !approved })}
      className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
        approved
          ? "border-status-completed bg-status-completed/10 hover:bg-error/10 hover:border-error"
          : "border-outline-variant bg-surface-container hover:border-status-completed"
      }`}
    >
      {approved && <CheckCircle className="text-status-completed size-3.5" />}
    </button>
  );
}
```

**ConfirmApprovalButton:**

```typescript
type ConfirmApprovalButtonProps = {
  orderId: string;
  itemIds: string[];
};

export function ConfirmApprovalButton({ orderId, itemIds }: ConfirmApprovalButtonProps) {
  const { execute, status } = useAction(approveOrderItemAction, {
    onSuccess: () => toast.success("Todos os itens aprovados."),
    onError: ({ error }) =>
      toast.error(error.serverError ?? "Erro ao confirmar aprovação."),
  });

  return (
    <button
      disabled={status === "executing"}
      onClick={() =>
        itemIds.forEach((itemId) =>
          execute({ itemId, orderId, approved: true })
        )
      }
      className="bg-secondary text-label-sm text-surface hover:bg-secondary/90 w-full rounded-md px-4 py-2.5 font-mono font-bold transition-colors disabled:opacity-50"
    >
      {status === "executing" ? "Confirmando..." : "Confirmar Aprovação"}
    </button>
  );
}
```

### `src/app/(dashboard)/orders/[id]/budget/page.tsx` — split Server/Client

**Modificação:** manter como Server Component, delegar botões interativos para `BudgetClient.tsx`.

**Padrão de passagem de props para Client Component:**

```typescript
// Substituir <button className="...">Confirmar Aprovação</button> (linha 208) por:
import { ApproveItemButton, ConfirmApprovalButton } from "./_components/BudgetClient";

// Em cada item (linha 119–133 atual):
<ApproveItemButton
  itemId={item.id}
  orderId={id}
  approved={item.approved}
/>

// No card "Ação do Cliente" (linha 208):
<ConfirmApprovalButton
  orderId={id}
  itemIds={pendingItems.map(i => i.id)}
/>
```

---

### `loading.tsx` — todos os segmentos (5 arquivos novos)

**Analog:** Nenhum existente — usar padrão da documentação Next.js 16 + `Skeleton` existente.

**Padrão canônico** (replicar para todos os segmentos):

```typescript
// src/app/(dashboard)/orders/loading.tsx  (e idem para customers, inventory, appointments, raiz)
import { Skeleton } from "@/_components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}
```

**Regras:**

- Sem `"use client"` — `loading.tsx` é Server Component por padrão.
- Nomes de export default devem descrever o segmento: `OrdersLoading`, `CustomersLoading`, etc.
- Não adicionar lógica — apenas markup de esqueleto.

---

### `error.tsx` — todos os segmentos (5 arquivos novos)

**Analog:** Nenhum existente — usar padrão da documentação Next.js 16.

**Padrão canônico** (replicar para todos os segmentos):

```typescript
// src/app/(dashboard)/orders/error.tsx  (e idem para customers, inventory, appointments, raiz)
"use client"; // OBRIGATÓRIO — React Error Boundary exige "use client"

export default function OrdersError({
  error,
  unstable_retry,            // CORRETO para Next.js 16 — NÃO usar "reset"
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void; // CORRETO para Next.js 16
}) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 p-6">
      <p className="text-on-surface-variant font-mono text-sm">
        Ocorreu um erro inesperado.
      </p>
      {process.env.NODE_ENV === "development" && (
        <p className="text-error font-mono text-xs">{error.message}</p>
      )}
      <button
        onClick={unstable_retry}
        className="text-secondary font-mono text-sm underline"
      >
        Tentar novamente
      </button>
    </div>
  );
}
```

**Regras:**

- `"use client"` é OBRIGATÓRIO (React constraint).
- Prop de retry é `unstable_retry` — NUNCA `reset` (Next.js 16 renomeou).
- Exibir `error.message` apenas em `development` (evitar vazamento de info em produção).

---

## Shared Patterns (Cross-cutting)

### Padrão 1: useAction com toast (aplica-se a todos os hooks e client components que chamam actions)

**Fonte:** `src/_hooks/use-appointment-form.ts` + `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx`

```typescript
// Estrutura canônica — copiar para use-new-part-form, order-wizard, NewCustomerDrawer, BudgetClient
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

const { execute, status, result } = useAction(algumAction, {
  onSuccess: ({ data }) => {
    toast.success("Mensagem de sucesso.");
    reset(); // se houver formulário
    router.push("/rota"); // se houver navegação
  },
  onError: ({ error }) => {
    toast.error(error.serverError ?? "Mensagem de fallback.");
  },
});

// Botão submit:
// <Button disabled={status === "executing"}>
//   {status === "executing" ? "Salvando..." : "Salvar"}
// </Button>

// Exibir serverError inline:
// {result.serverError && <p className="text-label-xs text-error">{result.serverError}</p>}
```

### Padrão 2: Validação inline de formulários (aplica-se a todos os formulários)

**Fonte:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` linhas 97–101, 168–172

```typescript
// Após cada campo, exibir erro do react-hook-form:
{errors.nomeDoCampo && (
  <p className="text-label-xs text-error">
    {errors.nomeDoCampo.message}
  </p>
)}
```

### Padrão 3: Controller para Select/campos controlados (aplica-se a NewCustomerDrawer e qualquer Select novo)

**Fonte:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` linhas 78–96

```typescript
<Controller
  name="nomeDoCampo"
  control={control}
  render={({ field }) => (
    <select
      {...field}
      id="nomeDoCampo"
      className="bg-surface-container border-outline-variant/50 text-body-sm text-on-surface focus:ring-secondary w-full rounded-lg border px-3 py-2 focus:ring-1 focus:outline-none"
    >
      <option value="">Selecione...</option>
      {opcoes.map((o) => (
        <option key={o.id} value={o.id}>{o.name}</option>
      ))}
    </select>
  )}
/>
```

### Padrão 4: SheetClose com render prop (aplica-se a NewCustomerDrawer e qualquer Sheet)

**Fonte:** `src/app/(dashboard)/appointments/_components/NewAppointmentDrawer.tsx` linhas 206–208

```typescript
// Base UI v1 usa render prop — NUNCA asChild
<SheetClose
  render={
    <Button variant="outline" onClick={onClose}>
      Cancelar
    </Button>
  }
/>
```

### Padrão 5: Empty state inline (aplica-se a qualquer lista/card sem dados)

**Fonte:** `src/app/(dashboard)/inventory/purchase-orders/new/_components/NewPurchaseOrderClient.tsx` linhas 339–346

```typescript
// Empty state — design system "Industrial Precision"
{items.length === 0 && (
  <div className="flex flex-col items-center gap-2 py-8 text-center">
    <IconeRelativo className="text-on-surface-variant/30 size-8" />
    <p className="text-body-sm text-on-surface-variant">
      Nenhum item encontrado.
    </p>
  </div>
)}
```

### Padrão 6: authActionClient (estrutura de todas as actions)

**Fonte:** `src/_lib/safe-action.ts` + `src/_actions/orders.ts` linhas 1–10

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/_db";
import { authActionClient } from "@/_lib/safe-action";

export const algumAction = authActionClient
  .schema(
    z.object({
      /* campos */
    }),
  )
  .action(async ({ parsedInput }) => {
    // DB operations
    revalidatePath("/rota");
    return { id: "..." };
  });

// ActionError é lançado para erros esperados (ex: "Não autenticado.")
// DEFAULT_SERVER_ERROR_MESSAGE é retornado para erros inesperados
// Ambos configurados em src/_lib/safe-action.ts
```

---

## Constraint Crítico: vehicleId NOT NULL no DB

**Descoberta:** `src/_db/schema/service-orders.ts` linha 30–32:

```typescript
vehicleId: uuid("vehicle_id")
  .notNull()                              // NÃO PODE ser null
  .references(() => vehicles.id, { onDelete: "restrict" }),
```

**Implicação para createOrderAction:** A action **deve criar um registro em `vehicles`** antes de inserir a `serviceOrder`. O wizard não fornece `vehicleId`, então a resolução mock-data-first é inserir um vehicle inline com `plate` e `model` coletados no step 1. Ver padrão detalhado na seção `src/_actions/orders.ts` acima.

---

## No Analog Found

| Arquivo                                        | Role           | Data Flow | Razão                                  |
| ---------------------------------------------- | -------------- | --------- | -------------------------------------- |
| `src/app/(dashboard)/loading.tsx`              | loading        | —         | Nenhum `loading.tsx` existe no projeto |
| `src/app/(dashboard)/orders/loading.tsx`       | loading        | —         | Nenhum `loading.tsx` existe no projeto |
| `src/app/(dashboard)/customers/loading.tsx`    | loading        | —         | Nenhum `loading.tsx` existe no projeto |
| `src/app/(dashboard)/inventory/loading.tsx`    | loading        | —         | Nenhum `loading.tsx` existe no projeto |
| `src/app/(dashboard)/appointments/loading.tsx` | loading        | —         | Nenhum `loading.tsx` existe no projeto |
| `src/app/(dashboard)/error.tsx`                | error-boundary | —         | Nenhum `error.tsx` existe no projeto   |
| `src/app/(dashboard)/orders/error.tsx`         | error-boundary | —         | Nenhum `error.tsx` existe no projeto   |
| `src/app/(dashboard)/customers/error.tsx`      | error-boundary | —         | Nenhum `error.tsx` existe no projeto   |
| `src/app/(dashboard)/inventory/error.tsx`      | error-boundary | —         | Nenhum `error.tsx` existe no projeto   |
| `src/app/(dashboard)/appointments/error.tsx`   | error-boundary | —         | Nenhum `error.tsx` existe no projeto   |

Para esses arquivos, usar os padrões da seção "loading.tsx" e "error.tsx" acima, baseados na documentação de `node_modules/next/dist/docs/`.

---

## Metadata

**Escopo de busca de analogs:** `src/_hooks/`, `src/_actions/`, `src/app/(dashboard)/`, `src/_components/ui/`, `src/_db/schema/`
**Arquivos escaneados:** ~20
**Data de mapeamento:** 2026-06-13
