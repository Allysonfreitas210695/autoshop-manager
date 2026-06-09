/**
 * Seed de demonstração — Precision Auto
 *
 * Cria dados realistas para todas as telas: usuários (admin, mecânicos,
 * clientes via better-auth para login real), veículos, peças, ordens de
 * serviço com itens, transações dos últimos 6 meses, agendamentos e ordens
 * de compra.
 *
 * Uso: npm run db:seed
 * Senha padrão de todos os usuários: senha123
 */
import "dotenv/config";

import { eq } from "drizzle-orm";

import { db } from "@/_db";
import {
  account as accountTable,
  appointments,
  purchaseOrderItems,
  purchaseOrders,
  serviceOrderItems,
  serviceOrders,
  services,
  session as sessionTable,
  transactions,
  user as userTable,
  vehicles,
} from "@/_db/schema";
import { auth } from "@/_lib/auth";

const DEFAULT_PASSWORD = "senha123";

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function pick<T>(arr: T[], i: number): T {
  return arr[i % arr.length];
}

async function createUser(opts: {
  name: string;
  email: string;
  role: "admin" | "mechanic" | "customer";
  phone?: string;
  cpf?: string;
  address?: string;
}): Promise<string> {
  const res = await auth.api.signUpEmail({
    body: { name: opts.name, email: opts.email, password: DEFAULT_PASSWORD },
  });
  const id = res.user.id;
  await db
    .update(userTable)
    .set({
      role: opts.role,
      phone: opts.phone ?? null,
      cpf: opts.cpf ?? null,
      address: opts.address ?? null,
      emailVerified: true,
    })
    .where(eq(userTable.id, id));
  return id;
}

async function wipe() {
  console.log("🧹 Limpando tabelas...");
  await db.delete(transactions);
  await db.delete(serviceOrderItems);
  await db.delete(serviceOrders);
  await db.delete(appointments);
  await db.delete(purchaseOrderItems);
  await db.delete(purchaseOrders);
  await db.delete(vehicles);
  await db.delete(services);
  await db.delete(sessionTable);
  await db.delete(accountTable);
  await db.delete(userTable);
}

async function main() {
  await wipe();

  // ── Usuários ────────────────────────────────────────────────────────────
  console.log("👤 Criando usuários...");
  await createUser({
    name: "Carlos Mendes",
    email: "admin@precisionauto.com",
    role: "admin",
    phone: "(11) 98888-0001",
    cpf: "123.456.789-00",
  });

  const mechanics = [
    { name: "Roberto Silva", email: "roberto@precisionauto.com" },
    { name: "André Costa", email: "andre@precisionauto.com" },
    { name: "Felipe Souza", email: "felipe@precisionauto.com" },
  ];
  const mechanicIds: string[] = [];
  for (const m of mechanics) {
    mechanicIds.push(
      await createUser({
        name: m.name,
        email: m.email,
        role: "mechanic",
        phone: "(11) 97777-1000",
      }),
    );
  }

  const customers = [
    {
      name: "Ricardo Almeida",
      email: "ricardo.almeida@email.com",
      phone: "(11) 99999-0001",
      cpf: "987.654.321-00",
      address: "Rua das Flores, 120 — São Paulo, SP",
    },
    {
      name: "Mariana Lopes",
      email: "mariana.lopes@email.com",
      phone: "(11) 99999-0002",
      cpf: "111.222.333-44",
      address: "Av. Paulista, 1500 — São Paulo, SP",
    },
    {
      name: "João Pereira",
      email: "joao.pereira@email.com",
      phone: "(11) 99999-0003",
      cpf: "222.333.444-55",
      address: "Rua Augusta, 800 — São Paulo, SP",
    },
    {
      name: "Beatriz Santos",
      email: "beatriz.santos@email.com",
      phone: "(11) 99999-0004",
      cpf: "333.444.555-66",
      address: "Rua Oscar Freire, 200 — São Paulo, SP",
    },
    {
      name: "Eduardo Rocha",
      email: "eduardo.rocha@email.com",
      phone: "(11) 99999-0005",
      cpf: "444.555.666-77",
      address: "Av. Faria Lima, 3000 — São Paulo, SP",
    },
    {
      name: "Patrícia Gomes",
      email: "patricia.gomes@email.com",
      phone: "(11) 99999-0006",
      cpf: "555.666.777-88",
      address: "Rua Haddock Lobo, 50 — São Paulo, SP",
    },
  ];
  const customerIds: string[] = [];
  for (const c of customers) {
    customerIds.push(await createUser({ ...c, role: "customer" }));
  }

  // ── Veículos ────────────────────────────────────────────────────────────
  console.log("🚗 Criando veículos...");
  const vehicleSeed = [
    {
      plate: "RIK-2A20",
      make: "Toyota",
      model: "Corolla XEi",
      year: 2022,
      color: "Prata",
      mileage: 38000,
      owner: 0,
    },
    {
      plate: "MAR-3B15",
      make: "Honda",
      model: "Civic Touring",
      year: 2021,
      color: "Preto",
      mileage: 45200,
      owner: 1,
    },
    {
      plate: "JOA-4C88",
      make: "Volkswagen",
      model: "Golf GTI",
      year: 2020,
      color: "Branco",
      mileage: 61000,
      owner: 2,
    },
    {
      plate: "BEA-5D33",
      make: "Hyundai",
      model: "HB20",
      year: 2023,
      color: "Vermelho",
      mileage: 12500,
      owner: 3,
    },
    {
      plate: "EDU-6E77",
      make: "Jeep",
      model: "Compass Limited",
      year: 2022,
      color: "Cinza",
      mileage: 29800,
      owner: 4,
    },
    {
      plate: "PAT-7F44",
      make: "Chevrolet",
      model: "Onix Plus",
      year: 2021,
      color: "Azul",
      mileage: 51000,
      owner: 5,
    },
    {
      plate: "RIK-8G10",
      make: "Fiat",
      model: "Toro Freedom",
      year: 2023,
      color: "Branco",
      mileage: 8900,
      owner: 0,
    },
  ];
  const vehicleIds: string[] = [];
  for (const v of vehicleSeed) {
    const [row] = await db
      .insert(vehicles)
      .values({
        plate: v.plate,
        make: v.make,
        model: v.model,
        year: v.year,
        color: v.color,
        mileage: v.mileage,
        ownerId: customerIds[v.owner],
      })
      .returning({ id: vehicles.id });
    vehicleIds.push(row.id);
  }

  // ── Peças (estoque) ─────────────────────────────────────────────────────
  console.log("🔧 Criando peças e serviços...");
  const partsSeed = [
    {
      name: "Filtro de Óleo",
      sku: "FO-1001",
      price: "35.90",
      stock: 48,
      min: 20,
    },
    {
      name: "Pastilha de Freio Dianteira",
      sku: "PF-2010",
      price: "189.90",
      stock: 8,
      min: 12,
    }, // crítico
    {
      name: "Óleo Motor 5W30 Sintético (1L)",
      sku: "OL-3001",
      price: "52.00",
      stock: 60,
      min: 30,
    },
    {
      name: "Filtro de Ar",
      sku: "FA-1500",
      price: "44.50",
      stock: 15,
      min: 15,
    }, // baixo
    {
      name: "Vela de Ignição (un)",
      sku: "VI-4002",
      price: "29.90",
      stock: 80,
      min: 40,
    },
    {
      name: "Correia Dentada",
      sku: "CD-5005",
      price: "145.00",
      stock: 6,
      min: 10,
    }, // crítico
    {
      name: "Amortecedor Dianteiro",
      sku: "AM-6011",
      price: "320.00",
      stock: 10,
      min: 8,
    },
    { name: "Bateria 60Ah", sku: "BT-7001", price: "489.90", stock: 5, min: 6 }, // baixo
    {
      name: "Disco de Freio",
      sku: "DF-2020",
      price: "210.00",
      stock: 14,
      min: 10,
    },
    {
      name: "Filtro de Combustível",
      sku: "FC-1200",
      price: "58.00",
      stock: 25,
      min: 15,
    },
    {
      name: "Lâmpada Farol H4",
      sku: "LF-8001",
      price: "39.90",
      stock: 40,
      min: 20,
    },
    {
      name: "Fluido de Freio DOT4 (500ml)",
      sku: "FL-9001",
      price: "32.00",
      stock: 3,
      min: 12,
    }, // crítico
    {
      name: "Aditivo Radiador (1L)",
      sku: "AR-1010",
      price: "28.50",
      stock: 35,
      min: 15,
    },
    {
      name: "Kit Embreagem",
      sku: "KE-3030",
      price: "780.00",
      stock: 4,
      min: 5,
    }, // baixo
    {
      name: "Palheta Limpador (par)",
      sku: "PL-4040",
      price: "65.00",
      stock: 22,
      min: 12,
    },
  ];
  const partIds: string[] = [];
  for (const p of partsSeed) {
    const [row] = await db
      .insert(services)
      .values({
        name: p.name,
        type: "part",
        sku: p.sku,
        price: p.price,
        stockQuantity: p.stock,
        minStock: p.min,
      })
      .returning({ id: services.id, price: services.price });
    partIds.push(row.id);
  }

  const serviceSeed = [
    { name: "Troca de Óleo e Filtro", price: "120.00" },
    { name: "Revisão Completa", price: "450.00" },
    { name: "Alinhamento e Balanceamento", price: "180.00" },
    { name: "Troca de Pastilhas de Freio", price: "150.00" },
    { name: "Diagnóstico Eletrônico", price: "90.00" },
    { name: "Troca de Correia Dentada", price: "380.00" },
  ];
  for (const s of serviceSeed) {
    await db
      .insert(services)
      .values({ name: s.name, type: "service", price: s.price });
  }

  // ── Ordens de Serviço + Itens + Transações ──────────────────────────────
  // Geração por mês para alimentar os gráficos com receita > despesa
  // (margem saudável de demonstração).
  console.log("📋 Criando ordens de serviço e transações...");
  const serviceTypes = [
    "Manutenção Preventiva",
    "Reparo",
    "Revisão",
    "Diagnóstico",
  ];
  // Padrão de 20 O.S./mês: 15 concluídas+pagas, 2 em andamento, 2 pendentes, 1 atrasada
  const monthlyStatuses = [
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "completed",
    "in_progress",
    "in_progress",
    "pending",
    "pending",
    "delayed",
  ] as const;

  let orderSeq = 0;
  for (let month = 5; month >= 0; month--) {
    for (let k = 0; k < monthlyStatuses.length; k++) {
      const status = monthlyStatuses[k];
      const dayInMonth = 2 + (k % 26);
      const opened = daysAgo(month * 30 + dayInMonth);
      const vehicleIdx = orderSeq % vehicleIds.length;
      const customerIdx = vehicleSeed[vehicleIdx].owner;
      const partsCount = 2 + (orderSeq % 3); // 2–4 peças
      const laborPrice = 350 + (orderSeq % 5) * 150; // R$350–950

      let total = laborPrice;
      const itemsToInsert: {
        description: string;
        itemType: "part" | "labor";
        quantity: number;
        unitPrice: string;
      }[] = [
        {
          description: pick(serviceSeed, orderSeq).name,
          itemType: "labor",
          quantity: 1,
          unitPrice: String(laborPrice),
        },
      ];
      for (let j = 0; j < partsCount; j++) {
        const part = partsSeed[(orderSeq + j) % partsSeed.length];
        const qty = 1 + (j % 2);
        total += Number(part.price) * qty;
        itemsToInsert.push({
          description: part.name,
          itemType: "part",
          quantity: qty,
          unitPrice: part.price,
        });
      }

      const isClosed = status === "completed";
      const [order] = await db
        .insert(serviceOrders)
        .values({
          vehicleId: vehicleIds[vehicleIdx],
          customerId: customerIds[customerIdx],
          mechanicId: pick(mechanicIds, orderSeq),
          status,
          clientReport: "Cliente relatou ruído e solicitou verificação.",
          diagnosis: isClosed ? "Serviço executado e testado." : "Em análise.",
          serviceType: pick(serviceTypes, orderSeq),
          priority: orderSeq % 4 === 0 ? "high" : "normal",
          totalAmount: total.toFixed(2),
          openedAt: opened,
          dueAt: daysFromNow(3 - (orderSeq % 6)),
          closedAt: isClosed ? new Date(opened.getTime() + 2 * 86400000) : null,
        })
        .returning({ id: serviceOrders.id });

      await db
        .insert(serviceOrderItems)
        .values(
          itemsToInsert.map((it) => ({ ...it, serviceOrderId: order.id })),
        );

      if (isClosed) {
        await db.insert(transactions).values({
          date: new Date(opened.getTime() + 2 * 86400000),
          description: `Receita O.S. — ${pick(serviceTypes, orderSeq)}`,
          category: "Serviço",
          type: "income",
          amount: total.toFixed(2),
          status: "paid",
          serviceOrderId: order.id,
        });
      } else if (status === "in_progress" || status === "delayed") {
        await db.insert(transactions).values({
          date: opened,
          description: `A receber O.S. — ${pick(serviceTypes, orderSeq)}`,
          category: "Serviço",
          type: "income",
          amount: total.toFixed(2),
          status: "pending",
          serviceOrderId: order.id,
        });
      }
      orderSeq++;
    }
  }

  // ── Despesas recorrentes (6 meses) ──────────────────────────────────────
  // Custos de oficina pequena (~R$15,6k/mês) abaixo da receita mensal.
  console.log("💸 Criando despesas...");
  const expenseCats = [
    {
      category: "Fornecedor",
      desc: "Compra de peças — fornecedor",
      base: 2800,
    },
    { category: "Despesa Fixa", desc: "Aluguel da oficina", base: 3500 },
    { category: "Despesa Fixa", desc: "Energia e água", base: 720 },
    {
      category: "Mão de Obra",
      desc: "Folha de pagamento mecânicos",
      base: 7500,
    },
    { category: "Imposto", desc: "Impostos e taxas", base: 1100 },
  ];
  for (let month = 0; month < 6; month++) {
    for (const e of expenseCats) {
      const variance = 1 + ((month % 3) - 1) * 0.06;
      await db.insert(transactions).values({
        date: daysAgo(month * 30 + 5),
        description: `${e.desc} (${month === 0 ? "mês atual" : `${month}m atrás`})`,
        category: e.category,
        type: "expense",
        amount: (e.base * variance).toFixed(2),
        status: month === 0 ? "pending" : "paid",
      });
    }
  }

  // ── Agendamentos ────────────────────────────────────────────────────────
  console.log("📅 Criando agendamentos...");
  const apptStatuses = [
    "confirmed",
    "scheduled",
    "completed",
    "confirmed",
    "scheduled",
  ] as const;
  const apptOffsets = [-2, 0, 0, 1, 2, 3, 5, 7];
  for (let i = 0; i < apptOffsets.length; i++) {
    const day = daysFromNow(apptOffsets[i]);
    day.setHours(8 + (i % 8), (i % 2) * 30, 0, 0);
    const vehicleIdx = i % vehicleIds.length;
    await db.insert(appointments).values({
      customerId: customerIds[vehicleSeed[vehicleIdx].owner],
      vehicleId: vehicleIds[vehicleIdx],
      mechanicId: pick(mechanicIds, i),
      scheduledAt: day,
      status: apptOffsets[i] < 0 ? "completed" : pick([...apptStatuses], i),
      notes: pick(
        [
          "Troca de óleo",
          "Revisão dos freios",
          "Diagnóstico geral",
          "Alinhamento",
        ],
        i,
      ),
    });
  }

  // ── Ordens de Compra ────────────────────────────────────────────────────
  console.log("🛒 Criando ordens de compra...");
  const poSeed = [
    {
      supplier: "AutoPeças Brasil Ltda",
      status: "sent" as const,
      delivery: 4,
      items: [1, 5, 11],
    },
    {
      supplier: "Distribuidora FreiMax",
      status: "received" as const,
      delivery: -3,
      items: [7, 13],
    },
    {
      supplier: "MotoForce Distribuidora",
      status: "draft" as const,
      delivery: 7,
      items: [3],
    },
  ];
  for (const po of poSeed) {
    let total = 0;
    const items = po.items.map((idx) => {
      const part = partsSeed[idx];
      const qty = Math.max(part.min - part.stock + 5, 3);
      total += Number(part.price) * qty;
      return {
        serviceId: partIds[idx],
        description: part.name,
        quantity: qty,
        unitPrice: part.price,
      };
    });
    const [row] = await db
      .insert(purchaseOrders)
      .values({
        supplier: po.supplier,
        status: po.status,
        totalAmount: total.toFixed(2),
        expectedDelivery: daysFromNow(po.delivery),
        notes: "Reposição de estoque automática.",
      })
      .returning({ id: purchaseOrders.id });
    await db
      .insert(purchaseOrderItems)
      .values(items.map((it) => ({ ...it, purchaseOrderId: row.id })));
  }

  console.log("\n✅ Seed concluído!");
  console.log("   Admin:    admin@precisionauto.com");
  console.log("   Mecânico: roberto@precisionauto.com");
  console.log("   Cliente:  ricardo.almeida@email.com");
  console.log(`   Senha:    ${DEFAULT_PASSWORD}\n`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Erro no seed:", err);
    process.exit(1);
  });
