import type { serviceOrderStatusValues } from "@/_schemas/service-order";

export type OrderStatus = (typeof serviceOrderStatusValues)[number];

export type MockOrder = {
  id: string;
  plate: string;
  customer: string;
  vehicle: string;
  mechanic: string;
  status: OrderStatus;
  total: number;
  updatedAt: string;
};

export const mockOrders: MockOrder[] = [
  {
    id: "OSC-5521",
    plate: "ABC-1234",
    customer: "Ricardo Almeida",
    vehicle: "Toyota Corolla",
    mechanic: "Bruno Dias",
    status: "in_progress",
    total: 1850,
    updatedAt: "2023-10-24T13:10:00",
  },
  {
    id: "OSC-5520",
    plate: "XYZ-9876",
    customer: "Mariana Silva",
    vehicle: "Honda Civic",
    mechanic: "Carla Souza",
    status: "completed",
    total: 420,
    updatedAt: "2023-10-24T11:40:00",
  },
  {
    id: "OSC-5519",
    plate: "OSC-5521",
    customer: "Auto Rent Ltda",
    vehicle: "Jeep Renegade",
    mechanic: "Bruno Dias",
    status: "delayed",
    total: 3100,
    updatedAt: "2023-10-23T17:00:00",
  },
  {
    id: "OSC-5518",
    plate: "KLS-4422",
    customer: "Fernando Costa",
    vehicle: "VW Golf GTI",
    mechanic: "Não atribuído",
    status: "pending",
    total: 750,
    updatedAt: "2023-10-23T09:25:00",
  },
  {
    id: "OSC-5517",
    plate: "JPM-2210",
    customer: "Lucia Ramos",
    vehicle: "Fiat Pulse",
    mechanic: "Carla Souza",
    status: "completed",
    total: 980,
    updatedAt: "2023-10-22T16:05:00",
  },
];

export const mockMetrics = {
  revenueToday: 12450,
  openOrders: 24,
  readyVehicles: 7,
  appointments: 15,
};

export const mockStatusDistribution: {
  status: OrderStatus;
  label: string;
  value: number;
}[] = [
  { status: "in_progress", label: "Em Progresso", value: 11 },
  { status: "completed", label: "Concluído", value: 7 },
  { status: "delayed", label: "Atrasado", value: 3 },
  { status: "pending", label: "Pendente", value: 5 },
];

export const mockUpcomingDeliveries = [
  { id: "1", title: "14:00", subtitle: "Civic — Mariana", state: "active" },
  { id: "2", title: "15:30", subtitle: "Corolla — Ricardo", state: "active" },
  { id: "3", title: "17:00", subtitle: "Renegade — Frota", state: "upcoming" },
  { id: "4", title: "18:00", subtitle: "Golf — Fernando", state: "upcoming" },
] as const;

// ─── Wizard: Clientes e Peças ──────────────────────────────────────────────

// Wizard lightweight lookup (plate search on step-01)
export type MockCustomer = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  lastVehicle: string;
  lastPlate: string;
};

export const mockCustomers: MockCustomer[] = [
  {
    id: "CLT-001",
    name: "Ricardo Almeida",
    cpf: "123.456.789-00",
    phone: "(11) 99999-0001",
    email: "ricardo@email.com",
    lastVehicle: "Toyota Corolla 2022",
    lastPlate: "ABC-1234",
  },
  {
    id: "CLT-002",
    name: "Mariana Silva",
    cpf: "234.567.890-11",
    phone: "(11) 99999-0002",
    email: "mariana@email.com",
    lastVehicle: "Honda Civic 2021",
    lastPlate: "XYZ-9876",
  },
  {
    id: "CLT-003",
    name: "Fernando Costa",
    cpf: "345.678.901-22",
    phone: "(11) 99999-0003",
    email: "fernando@email.com",
    lastVehicle: "VW Golf GTI 2020",
    lastPlate: "KLS-4422",
  },
  {
    id: "CLT-004",
    name: "Lucia Ramos",
    cpf: "456.789.012-33",
    phone: "(11) 99999-0004",
    email: "lucia@email.com",
    lastVehicle: "Fiat Pulse 2023",
    lastPlate: "JPM-2210",
  },
  {
    id: "CLT-005",
    name: "Auto Rent Ltda",
    cpf: "12.345.678/0001-90",
    phone: "(11) 3300-0005",
    email: "frota@autorent.com.br",
    lastVehicle: "Jeep Renegade 2023",
    lastPlate: "OSC-5521",
  },
];

// ─── Módulo de Clientes ─────────────────────────────────────────────────────

export type MockCustomerVehicle = {
  id: string;
  model: string;
  plate: string;
  year: number;
  mileage: number;
  color: string;
};

export type MockCustomerOrder = {
  id: string;
  date: string;
  service: string;
  vehicle: string;
  total: number;
  status: OrderStatus;
};

export type MockCustomerDetail = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  lastVisit: string;
  totalSpent: number;
  visits: number;
  vehicles: MockCustomerVehicle[];
  orders: MockCustomerOrder[];
  nextServices: {
    id: string;
    title: string;
    subtitle: string;
    state: "done" | "active" | "upcoming";
  }[];
};

export const mockCustomerDetails: MockCustomerDetail[] = [
  {
    id: "CLT-001",
    name: "Ricardo Almeida",
    cpf: "123.456.789-00",
    phone: "(11) 99999-0001",
    email: "ricardo@email.com",
    address: "Rua das Flores, 142 — Vila Madalena, SP",
    lastVisit: "2023-10-24",
    totalSpent: 8450,
    visits: 7,
    vehicles: [
      {
        id: "V001",
        model: "Toyota Corolla XEi",
        plate: "ABC-1234",
        year: 2022,
        mileage: 45200,
        color: "Prata",
      },
      {
        id: "V002",
        model: "Honda CB 500F",
        plate: "MNO-3344",
        year: 2020,
        mileage: 18900,
        color: "Preto",
      },
    ],
    orders: [
      {
        id: "OSC-5521",
        date: "2023-10-24",
        service: "Revisão 45.000 km — troca de óleo, filtros e velas",
        vehicle: "Corolla ABC-1234",
        total: 1850,
        status: "in_progress",
      },
      {
        id: "OSC-5498",
        date: "2023-08-12",
        service: "Troca de pastilhas de freio dianteiras",
        vehicle: "Corolla ABC-1234",
        total: 620,
        status: "completed",
      },
      {
        id: "OSC-5440",
        date: "2023-05-30",
        service: "Alinhamento, balanceamento e calibragem",
        vehicle: "Corolla ABC-1234",
        total: 280,
        status: "completed",
      },
      {
        id: "OSC-5380",
        date: "2023-02-14",
        service: "Revisão 30.000 km completa",
        vehicle: "Corolla ABC-1234",
        total: 2100,
        status: "completed",
      },
    ],
    nextServices: [
      {
        id: "ns1",
        title: "Troca de Correia",
        subtitle: "Prev. Jan/2024 — 60.000 km",
        state: "upcoming",
      },
      {
        id: "ns2",
        title: "Revisão 60k",
        subtitle: "Prev. Mar/2024",
        state: "upcoming",
      },
    ],
  },
  {
    id: "CLT-002",
    name: "Mariana Silva",
    cpf: "234.567.890-11",
    phone: "(11) 99999-0002",
    email: "mariana@email.com",
    address: "Av. Paulista, 900, ap 82 — Bela Vista, SP",
    lastVisit: "2023-10-24",
    totalSpent: 3200,
    visits: 4,
    vehicles: [
      {
        id: "V003",
        model: "Honda Civic EXL",
        plate: "XYZ-9876",
        year: 2021,
        mileage: 32100,
        color: "Branco",
      },
    ],
    orders: [
      {
        id: "OSC-5520",
        date: "2023-10-24",
        service: "Troca de óleo e filtro de ar",
        vehicle: "Civic XYZ-9876",
        total: 420,
        status: "completed",
      },
      {
        id: "OSC-5490",
        date: "2023-09-01",
        service: "Higienização de ar condicionado",
        vehicle: "Civic XYZ-9876",
        total: 350,
        status: "completed",
      },
      {
        id: "OSC-5455",
        date: "2023-06-20",
        service: "Revisão 30.000 km",
        vehicle: "Civic XYZ-9876",
        total: 1980,
        status: "completed",
      },
    ],
    nextServices: [
      {
        id: "ns3",
        title: "Revisão 45k",
        subtitle: "Prev. Abr/2024",
        state: "upcoming",
      },
    ],
  },
  {
    id: "CLT-003",
    name: "Fernando Costa",
    cpf: "345.678.901-22",
    phone: "(11) 99999-0003",
    email: "fernando@email.com",
    address: "Rua Augusta, 500 — Consolação, SP",
    lastVisit: "2023-10-23",
    totalSpent: 4750,
    visits: 5,
    vehicles: [
      {
        id: "V004",
        model: "VW Golf GTI",
        plate: "KLS-4422",
        year: 2020,
        mileage: 58000,
        color: "Cinza",
      },
      {
        id: "V005",
        model: "VW Polo Track",
        plate: "PQR-7788",
        year: 2023,
        mileage: 8200,
        color: "Vermelho",
      },
    ],
    orders: [
      {
        id: "OSC-5518",
        date: "2023-10-23",
        service: "Diagnóstico eletrônico + correção de falha no motor",
        vehicle: "Golf KLS-4422",
        total: 750,
        status: "pending",
      },
      {
        id: "OSC-5472",
        date: "2023-07-15",
        service: "Revisão 50.000 km completa",
        vehicle: "Golf KLS-4422",
        total: 2800,
        status: "completed",
      },
      {
        id: "OSC-5401",
        date: "2023-03-10",
        service: "Troca de amortecedores traseiros",
        vehicle: "Golf KLS-4422",
        total: 980,
        status: "completed",
      },
    ],
    nextServices: [
      {
        id: "ns4",
        title: "Troca Pneus",
        subtitle: "Prev. Dez/2023",
        state: "active",
      },
      {
        id: "ns5",
        title: "Revisão 60k",
        subtitle: "Prev. Jun/2024",
        state: "upcoming",
      },
    ],
  },
  {
    id: "CLT-004",
    name: "Lucia Ramos",
    cpf: "456.789.012-33",
    phone: "(11) 99999-0004",
    email: "lucia@email.com",
    address: "Rua Haddock Lobo, 200 — Cerqueira César, SP",
    lastVisit: "2023-10-22",
    totalSpent: 2310,
    visits: 3,
    vehicles: [
      {
        id: "V006",
        model: "Fiat Pulse Drive",
        plate: "JPM-2210",
        year: 2023,
        mileage: 12500,
        color: "Azul",
      },
    ],
    orders: [
      {
        id: "OSC-5517",
        date: "2023-10-22",
        service: "Revisão 10.000 km + troca de óleo",
        vehicle: "Pulse JPM-2210",
        total: 980,
        status: "completed",
      },
      {
        id: "OSC-5460",
        date: "2023-06-30",
        service: "Instalação de película solar",
        vehicle: "Pulse JPM-2210",
        total: 890,
        status: "completed",
      },
      {
        id: "OSC-5420",
        date: "2023-04-05",
        service: "Revisão de entrega (0 km)",
        vehicle: "Pulse JPM-2210",
        total: 440,
        status: "completed",
      },
    ],
    nextServices: [
      {
        id: "ns6",
        title: "Revisão 20k",
        subtitle: "Prev. Fev/2024",
        state: "upcoming",
      },
    ],
  },
  {
    id: "CLT-005",
    name: "Auto Rent Ltda",
    cpf: "12.345.678/0001-90",
    phone: "(11) 3300-0005",
    email: "frota@autorent.com.br",
    address: "Rod. Anhanguera, km 12 — Osasco, SP",
    lastVisit: "2023-10-23",
    totalSpent: 18600,
    visits: 14,
    vehicles: [
      {
        id: "V007",
        model: "Jeep Renegade Sport",
        plate: "OSC-5521",
        year: 2023,
        mileage: 67000,
        color: "Branco",
      },
      {
        id: "V008",
        model: "Fiat Strada Volcano",
        plate: "ABC-9900",
        year: 2022,
        mileage: 43000,
        color: "Prata",
      },
      {
        id: "V009",
        model: "VW T-Cross",
        plate: "DEF-1122",
        year: 2023,
        mileage: 28000,
        color: "Preto",
      },
    ],
    orders: [
      {
        id: "OSC-5519",
        date: "2023-10-23",
        service: "Manutenção preventiva + troca de 4 pneus",
        vehicle: "Renegade OSC-5521",
        total: 3100,
        status: "delayed",
      },
      {
        id: "OSC-5505",
        date: "2023-09-18",
        service: "Revisão 60.000 km frota",
        vehicle: "Strada ABC-9900",
        total: 2200,
        status: "completed",
      },
    ],
    nextServices: [
      {
        id: "ns7",
        title: "Revisão Frota",
        subtitle: "Nov/2023 — 3 veículos",
        state: "active",
      },
      {
        id: "ns8",
        title: "IPVA 2024",
        subtitle: "Jan/2024",
        state: "upcoming",
      },
    ],
  },
];

export type MockPart = {
  id: string;
  name: string;
  category: string;
  sku: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  supplier?: string;
  location?: string;
  lastMovement?: string;
};

export const mockParts: MockPart[] = [
  {
    id: "PRT-001",
    name: "Filtro de Óleo Bosch",
    category: "Filtros",
    sku: "FO-1234",
    stock: 18,
    minStock: 5,
    unitPrice: 32.9,
    supplier: "Bosch Brasil",
    location: "A1-P01",
    lastMovement: "2023-10-24",
  },
  {
    id: "PRT-002",
    name: "Pastilha de Freio Dianteira",
    category: "Freios",
    sku: "PF-5678",
    stock: 6,
    minStock: 4,
    unitPrice: 128.5,
    supplier: "Fras-le",
    location: "B2-P03",
    lastMovement: "2023-10-22",
  },
  {
    id: "PRT-003",
    name: "Vela de Ignição NGK",
    category: "Ignição",
    sku: "VI-9012",
    stock: 2,
    minStock: 8,
    unitPrice: 45.0,
    supplier: "NGK Spark Plugs",
    location: "C1-P02",
    lastMovement: "2023-10-20",
  },
  {
    id: "PRT-004",
    name: "Correia Dentada Gates",
    category: "Motor",
    sku: "CD-3456",
    stock: 9,
    minStock: 3,
    unitPrice: 215.0,
    supplier: "Gates Indústria",
    location: "D3-P01",
    lastMovement: "2023-10-18",
  },
  {
    id: "PRT-005",
    name: "Amortecedor Traseiro Monroe",
    category: "Suspensão",
    sku: "AT-7890",
    stock: 4,
    minStock: 2,
    unitPrice: 380.0,
    supplier: "Monroe",
    location: "E1-P05",
    lastMovement: "2023-10-15",
  },
  {
    id: "PRT-006",
    name: "Filtro de Ar K&N",
    category: "Filtros",
    sku: "FA-2345",
    stock: 11,
    minStock: 5,
    unitPrice: 89.9,
    supplier: "K&N Filters",
    location: "A1-P02",
    lastMovement: "2023-10-23",
  },
  {
    id: "PRT-007",
    name: "Disco de Freio Dianteiro Brembo",
    category: "Freios",
    sku: "DF-6789",
    stock: 3,
    minStock: 4,
    unitPrice: 245.0,
    supplier: "Brembo",
    location: "B2-P01",
    lastMovement: "2023-10-10",
  },
  {
    id: "PRT-008",
    name: "Óleo Motor 5W30 Sintético Mobil",
    category: "Lubrificantes",
    sku: "OM-0011",
    stock: 24,
    minStock: 10,
    unitPrice: 58.9,
    supplier: "ExxonMobil",
    location: "F1-P01",
    lastMovement: "2023-10-24",
  },
  {
    id: "PRT-009",
    name: "Bateria 60Ah Heliar",
    category: "Elétrica",
    sku: "BA-3312",
    stock: 1,
    minStock: 3,
    unitPrice: 480.0,
    supplier: "Heliar",
    location: "G2-P01",
    lastMovement: "2023-10-05",
  },
  {
    id: "PRT-010",
    name: "Filtro de Combustível WIX",
    category: "Filtros",
    sku: "FC-7711",
    stock: 7,
    minStock: 5,
    unitPrice: 42.5,
    supplier: "WIX Filters",
    location: "A1-P03",
    lastMovement: "2023-10-19",
  },
  {
    id: "PRT-011",
    name: "Rolamento de Roda FAG",
    category: "Suspensão",
    sku: "RR-4490",
    stock: 5,
    minStock: 4,
    unitPrice: 195.0,
    supplier: "FAG Brasil",
    location: "E2-P02",
    lastMovement: "2023-10-12",
  },
  {
    id: "PRT-012",
    name: "Alternador Bosch Recondicionado",
    category: "Elétrica",
    sku: "AL-8821",
    stock: 2,
    minStock: 2,
    unitPrice: 720.0,
    supplier: "Bosch Brasil",
    location: "G1-P03",
    lastMovement: "2023-09-28",
  },
];

export { inventoryCategories, type InventoryCategory } from "./constants";

export const mockInventoryMetrics = {
  totalItems: mockParts.length,
  lowStockCount: mockParts.filter((p) => p.stock <= p.minStock).length,
  criticalCount: mockParts.filter((p) => p.stock < p.minStock).length,
  totalValue: mockParts.reduce((sum, p) => sum + p.stock * p.unitPrice, 0),
};

// ─── Finance ────────────────────────────────────────────────────────────────

export type TransactionType = "income" | "expense";
export type TransactionStatus = "paid" | "pending" | "overdue";
export type TransactionCategory =
  | "Serviço"
  | "Peças"
  | "Mão de Obra"
  | "Fornecedor"
  | "Despesa Fixa"
  | "Imposto"
  | "Outros";

export type MockTransaction = {
  id: string;
  date: string;
  description: string;
  category: TransactionCategory;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
};

export const mockTransactions: MockTransaction[] = [
  {
    id: "T001",
    date: "2023-10-28",
    description: "O.S. #0042 — Revisão Completa",
    category: "Serviço",
    type: "income",
    amount: 1850.0,
    status: "paid",
  },
  {
    id: "T002",
    date: "2023-10-27",
    description: "Compra de filtros — Bosch Brasil",
    category: "Fornecedor",
    type: "expense",
    amount: 640.0,
    status: "paid",
  },
  {
    id: "T003",
    date: "2023-10-27",
    description: "O.S. #0041 — Troca de pastilhas",
    category: "Mão de Obra",
    type: "income",
    amount: 520.0,
    status: "paid",
  },
  {
    id: "T004",
    date: "2023-10-26",
    description: "O.S. #0040 — Alinhamento e balanceamento",
    category: "Serviço",
    type: "income",
    amount: 280.0,
    status: "paid",
  },
  {
    id: "T005",
    date: "2023-10-25",
    description: "Aluguel do espaço — Outubro",
    category: "Despesa Fixa",
    type: "expense",
    amount: 3200.0,
    status: "paid",
  },
  {
    id: "T006",
    date: "2023-10-24",
    description: "O.S. #0039 — Diagnóstico eletrônico",
    category: "Serviço",
    type: "income",
    amount: 380.0,
    status: "pending",
  },
  {
    id: "T007",
    date: "2023-10-23",
    description: "Compra de amortecedores — Monroe",
    category: "Peças",
    type: "expense",
    amount: 1120.0,
    status: "paid",
  },
  {
    id: "T008",
    date: "2023-10-22",
    description: "O.S. #0038 — Troca de óleo",
    category: "Mão de Obra",
    type: "income",
    amount: 180.0,
    status: "paid",
  },
  {
    id: "T009",
    date: "2023-10-21",
    description: "Simples Nacional — Set/2023",
    category: "Imposto",
    type: "expense",
    amount: 890.0,
    status: "overdue",
  },
  {
    id: "T010",
    date: "2023-10-20",
    description: "O.S. #0037 — Suspensão dianteira",
    category: "Serviço",
    type: "income",
    amount: 2100.0,
    status: "paid",
  },
  {
    id: "T011",
    date: "2023-10-19",
    description: "Energia elétrica — Outubro",
    category: "Despesa Fixa",
    type: "expense",
    amount: 480.0,
    status: "pending",
  },
  {
    id: "T012",
    date: "2023-10-18",
    description: "O.S. #0036 — Injeção eletrônica",
    category: "Serviço",
    type: "income",
    amount: 760.0,
    status: "paid",
  },
];

export type MockCashFlow = {
  week: string;
  receitas: number;
  despesas: number;
};

export const mockCashFlow: MockCashFlow[] = [
  { week: "Sem 1", receitas: 8400, despesas: 4200 },
  { week: "Sem 2", receitas: 6800, despesas: 5100 },
  { week: "Sem 3", receitas: 9200, despesas: 3800 },
  { week: "Sem 4", receitas: 11500, despesas: 6300 },
];

export const mockFinanceMetrics = {
  receivable: 12840.0,
  monthlyRevenue: 35900.0,
  pendingExpenses: 4570.0,
  monthlyProfit: 18320.0,
};

// ─── Finance Reports ─────────────────────────────────────────────────────────

export type MockReportKpi = {
  label: string;
  value: string;
  hint?: string;
};

export type MockMonthlyCashFlow = {
  month: string;
  receitas: number;
  despesas: number;
  lucro: number;
};

export type MockCostBreakdown = {
  name: string;
  value: number;
  fill: string;
};

export type MockServiceDetail = {
  id: string;
  category: string;
  grossRevenue: number;
  partsCost: number;
  laborCost: number;
  netProfit: number;
  status: "positive" | "neutral" | "negative";
};

export const mockReportKpis: MockReportKpi[] = [
  { label: "Ticket Médio O.S.", value: "R$ 892,50", hint: "↑ 8% vs set." },
  { label: "Margem Líquida", value: "51,0%", hint: "↑ 3pp vs set." },
  { label: "Volume O.S.", value: "42", hint: "↑ 5 vs set." },
  { label: "Lucro Líquido", value: "R$ 18.320", hint: "↑ 14% vs set." },
];

export const mockMonthlyCashFlow: MockMonthlyCashFlow[] = [
  { month: "Mai", receitas: 28400, despesas: 16200, lucro: 12200 },
  { month: "Jun", receitas: 31200, despesas: 17800, lucro: 13400 },
  { month: "Jul", receitas: 29800, despesas: 15600, lucro: 14200 },
  { month: "Ago", receitas: 33500, despesas: 18900, lucro: 14600 },
  { month: "Set", receitas: 30100, despesas: 14200, lucro: 15900 },
  { month: "Out", receitas: 35900, despesas: 17580, lucro: 18320 },
];

export const mockCostBreakdown: MockCostBreakdown[] = [
  { name: "Peças", value: 7840, fill: "#adc6ff" },
  { name: "Mão de Obra", value: 4320, fill: "#ffb690" },
  { name: "Despesas Fixas", value: 3680, fill: "#94a3b8" },
  { name: "Impostos", value: 1740, fill: "#475569" },
];

export const mockServiceDetails: MockServiceDetail[] = [
  {
    id: "SD001",
    category: "Revisão / Preventiva",
    grossRevenue: 14200,
    partsCost: 4100,
    laborCost: 1800,
    netProfit: 8300,
    status: "positive",
  },
  {
    id: "SD002",
    category: "Freios & Suspensão",
    grossRevenue: 9800,
    partsCost: 3200,
    laborCost: 1400,
    netProfit: 5200,
    status: "positive",
  },
  {
    id: "SD003",
    category: "Diagnóstico Eletrônico",
    grossRevenue: 5400,
    partsCost: 420,
    laborCost: 2100,
    netProfit: 2880,
    status: "positive",
  },
  {
    id: "SD004",
    category: "Motor & Transmissão",
    grossRevenue: 4200,
    partsCost: 1980,
    laborCost: 980,
    netProfit: 1240,
    status: "neutral",
  },
  {
    id: "SD005",
    category: "Elétrica Automotiva",
    grossRevenue: 2300,
    partsCost: 140,
    laborCost: 1800,
    netProfit: 360,
    status: "negative",
  },
];

// ─── Order Detail (Budget + Print) ──────────────────────────────────────────

export type MockOrderItem = {
  id: string;
  description: string;
  type: "part" | "labor";
  quantity: number;
  unitPrice: number;
  approved: boolean;
};

export type MockOrderDetail = {
  id: string;
  plate: string;
  customer: string;
  customerCpf: string;
  customerPhone: string;
  vehicle: string;
  vehicleYear: number;
  vehicleColor: string;
  mileage: number;
  mechanic: string;
  status: OrderStatus;
  serviceType: string;
  priority: string;
  entryDate: string;
  estimatedDelivery: string;
  clientReport: string;
  diagnosis: string;
  items: MockOrderItem[];
  notes: string;
  signatureDataUrl: string | null;
};

export const mockOrderDetails: MockOrderDetail[] = [
  {
    id: "OSC-5521",
    plate: "ABC-1234",
    customer: "Ricardo Almeida",
    customerCpf: "123.456.789-00",
    customerPhone: "(11) 99999-0001",
    vehicle: "Toyota Corolla XEi",
    vehicleYear: 2022,
    vehicleColor: "Prata",
    mileage: 45200,
    mechanic: "Bruno Dias",
    status: "in_progress",
    serviceType: "Preventiva",
    priority: "Normal",
    entryDate: "2023-10-24",
    estimatedDelivery: "2023-10-25",
    clientReport:
      "Veículo apresenta ruído ao frear e luz do motor acesa. Solicita revisão dos 45.000 km.",
    diagnosis:
      "Pastilhas dianteiras desgastadas (3mm restantes). Filtro de óleo saturado. Código OBD: P0420 — catalisador abaixo da eficiência.",
    items: [
      {
        id: "I001",
        description: "Troca de óleo 5W30 sintético (5L)",
        type: "part",
        quantity: 1,
        unitPrice: 180.0,
        approved: true,
      },
      {
        id: "I002",
        description: "Filtro de óleo Bosch",
        type: "part",
        quantity: 1,
        unitPrice: 45.0,
        approved: true,
      },
      {
        id: "I003",
        description: "Filtro de ar K&N",
        type: "part",
        quantity: 1,
        unitPrice: 120.0,
        approved: true,
      },
      {
        id: "I004",
        description: "Pastilhas de freio dianteiras Brembo",
        type: "part",
        quantity: 1,
        unitPrice: 280.0,
        approved: true,
      },
      {
        id: "I005",
        description: "Velas de ignição NGK (jogo 4)",
        type: "part",
        quantity: 1,
        unitPrice: 220.0,
        approved: false,
      },
      {
        id: "I006",
        description: "Mão de obra — revisão completa",
        type: "labor",
        quantity: 1,
        unitPrice: 650.0,
        approved: true,
      },
      {
        id: "I007",
        description: "Mão de obra — diagnóstico eletrônico",
        type: "labor",
        quantity: 1,
        unitPrice: 150.0,
        approved: true,
      },
    ],
    notes:
      "Cliente autorizou revisão completa. Verificar catalisador após limpeza do sistema. Retornar caso código OBD persista.",
    signatureDataUrl: null,
  },
  {
    id: "OSC-5520",
    plate: "XYZ-9876",
    customer: "Mariana Silva",
    customerCpf: "234.567.890-11",
    customerPhone: "(11) 99999-0002",
    vehicle: "Honda Civic EXL",
    vehicleYear: 2021,
    vehicleColor: "Branco",
    mileage: 32100,
    mechanic: "Carla Souza",
    status: "completed",
    serviceType: "Preventiva",
    priority: "Normal",
    entryDate: "2023-10-24",
    estimatedDelivery: "2023-10-24",
    clientReport:
      "Troca de óleo e revisão de filtros conforme programação de manutenção.",
    diagnosis:
      "Veículo em bom estado geral. Óleo com coloração escura — troca necessária. Filtro de ar com acúmulo de poeira.",
    items: [
      {
        id: "I008",
        description: "Óleo 5W30 sintético (4L)",
        type: "part",
        quantity: 1,
        unitPrice: 145.0,
        approved: true,
      },
      {
        id: "I009",
        description: "Filtro de óleo Honda original",
        type: "part",
        quantity: 1,
        unitPrice: 55.0,
        approved: true,
      },
      {
        id: "I010",
        description: "Filtro de ar Honda original",
        type: "part",
        quantity: 1,
        unitPrice: 80.0,
        approved: true,
      },
      {
        id: "I011",
        description: "Mão de obra — troca de óleo e filtros",
        type: "labor",
        quantity: 1,
        unitPrice: 140.0,
        approved: true,
      },
    ],
    notes: "Serviço concluído sem intercorrências.",
    signatureDataUrl: null,
  },
];

export function getMockOrderById(id: string): MockOrderDetail | undefined {
  return mockOrderDetails.find((o) => o.id === id);
}

// ─── Appointments ────────────────────────────────────────────────────────────

export type AppointmentStatus =
  | "confirmed"
  | "pending"
  | "cancelled"
  | "completed";

export type AppointmentServiceType =
  | "Revisão"
  | "Troca de Óleo"
  | "Freios"
  | "Suspensão"
  | "Elétrica"
  | "Diagnóstico"
  | "Funilaria"
  | "Alinhamento";

export type MockAppointment = {
  id: string;
  customer: string;
  phone: string;
  vehicle: string;
  plate: string;
  serviceType: AppointmentServiceType;
  mechanic: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // minutes
  status: AppointmentStatus;
  notes: string;
};

export const mockAppointments: MockAppointment[] = [
  {
    id: "AGD-001",
    customer: "Ricardo Almeida",
    phone: "(11) 98765-4321",
    vehicle: "Toyota Corolla 2020",
    plate: "ABC-1234",
    serviceType: "Revisão",
    mechanic: "Bruno Dias",
    date: "2026-05-28",
    time: "08:00",
    duration: 120,
    status: "confirmed",
    notes: "Revisão completa dos 30.000 km.",
  },
  {
    id: "AGD-002",
    customer: "Mariana Silva",
    phone: "(11) 97654-3210",
    vehicle: "Honda Civic EXL 2021",
    plate: "XYZ-9876",
    serviceType: "Troca de Óleo",
    mechanic: "Carla Souza",
    date: "2026-05-28",
    time: "09:30",
    duration: 60,
    status: "confirmed",
    notes: "",
  },
  {
    id: "AGD-003",
    customer: "Fernando Costa",
    phone: "(11) 96543-2109",
    vehicle: "VW Golf GTI 2022",
    plate: "KLS-4422",
    serviceType: "Diagnóstico",
    mechanic: "Bruno Dias",
    date: "2026-05-28",
    time: "11:00",
    duration: 90,
    status: "pending",
    notes: "Cliente relata barulho no motor ao acelerar.",
  },
  {
    id: "AGD-004",
    customer: "Lucia Ramos",
    phone: "(11) 95432-1098",
    vehicle: "Fiat Pulse 2023",
    plate: "JPM-2210",
    serviceType: "Alinhamento",
    mechanic: "Carlos Melo",
    date: "2026-05-28",
    time: "14:00",
    duration: 45,
    status: "confirmed",
    notes: "",
  },
  {
    id: "AGD-005",
    customer: "Auto Rent Ltda",
    phone: "(11) 94321-0987",
    vehicle: "Jeep Renegade 2021",
    plate: "OSC-5521",
    serviceType: "Freios",
    mechanic: "Carla Souza",
    date: "2026-05-28",
    time: "15:30",
    duration: 120,
    status: "pending",
    notes: "Substituição de pastilhas e discos dianteiros.",
  },
  {
    id: "AGD-006",
    customer: "Paulo Mendes",
    phone: "(11) 93210-9876",
    vehicle: "Chevrolet Onix 2022",
    plate: "MNO-3344",
    serviceType: "Elétrica",
    mechanic: "Bruno Dias",
    date: "2026-05-29",
    time: "08:00",
    duration: 90,
    status: "confirmed",
    notes: "Problemas na central elétrica.",
  },
  {
    id: "AGD-007",
    customer: "Ana Oliveira",
    phone: "(11) 92109-8765",
    vehicle: "Hyundai HB20 2020",
    plate: "PQR-5566",
    serviceType: "Suspensão",
    mechanic: "Carlos Melo",
    date: "2026-05-29",
    time: "10:00",
    duration: 120,
    status: "confirmed",
    notes: "Troca de amortecedores traseiros.",
  },
  {
    id: "AGD-008",
    customer: "Rodrigo Lima",
    phone: "(11) 91098-7654",
    vehicle: "Ford Ka 2019",
    plate: "STU-7788",
    serviceType: "Troca de Óleo",
    mechanic: "Carla Souza",
    date: "2026-05-29",
    time: "13:00",
    duration: 60,
    status: "cancelled",
    notes: "Cliente cancelou por motivo pessoal.",
  },
  {
    id: "AGD-009",
    customer: "Camila Torres",
    phone: "(11) 90987-6543",
    vehicle: "Renault Kwid 2023",
    plate: "VWX-9900",
    serviceType: "Revisão",
    mechanic: "Bruno Dias",
    date: "2026-05-30",
    time: "09:00",
    duration: 180,
    status: "confirmed",
    notes: "Revisão de 10.000 km.",
  },
  {
    id: "AGD-010",
    customer: "Jorge Ferreira",
    phone: "(11) 89876-5432",
    vehicle: "Nissan Kicks 2022",
    plate: "YZA-1122",
    serviceType: "Funilaria",
    mechanic: "Carlos Melo",
    date: "2026-05-30",
    time: "14:00",
    duration: 240,
    status: "pending",
    notes: "Reparo de amassado na porta traseira esquerda.",
  },
  {
    id: "AGD-011",
    customer: "Sandra Vieira",
    phone: "(11) 88765-4321",
    vehicle: "Peugeot 208 2021",
    plate: "BCD-3344",
    serviceType: "Freios",
    mechanic: "Carla Souza",
    date: "2026-06-02",
    time: "08:30",
    duration: 90,
    status: "confirmed",
    notes: "",
  },
  {
    id: "AGD-012",
    customer: "Marcos Antônio",
    phone: "(11) 87654-3210",
    vehicle: "Toyota Hilux 2023",
    plate: "EFG-5566",
    serviceType: "Revisão",
    mechanic: "Bruno Dias",
    date: "2026-06-03",
    time: "10:00",
    duration: 150,
    status: "pending",
    notes: "Revisão pré-viagem.",
  },
  {
    id: "AGD-013",
    customer: "Beatriz Nunes",
    phone: "(11) 86543-2109",
    vehicle: "Honda HR-V 2022",
    plate: "HIJ-7788",
    serviceType: "Diagnóstico",
    mechanic: "Carlos Melo",
    date: "2026-06-04",
    time: "11:00",
    duration: 60,
    status: "confirmed",
    notes: "Verificar luz de check engine.",
  },
];

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  confirmed: "Confirmado",
  pending: "Pendente",
  cancelled: "Cancelado",
  completed: "Concluído",
};

export const mechanics = [
  "Bruno Dias",
  "Carla Souza",
  "Carlos Melo",
  "Ana Paula",
];

export const appointmentServiceTypes: AppointmentServiceType[] = [
  "Revisão",
  "Troca de Óleo",
  "Freios",
  "Suspensão",
  "Elétrica",
  "Diagnóstico",
  "Funilaria",
  "Alinhamento",
];

// ─── Purchase Orders ─────────────────────────────────────────────────────────

export type PurchaseOrderStatus =
  | "draft"
  | "sent"
  | "confirmed"
  | "received"
  | "cancelled";

export type MockPurchaseOrderItem = {
  partId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
};

export type MockPurchaseOrder = {
  id: string;
  supplier: string;
  supplierContact: string;
  createdAt: string;
  expectedDelivery: string;
  status: PurchaseOrderStatus;
  items: MockPurchaseOrderItem[];
  notes: string;
};

export const mockPurchaseOrders: MockPurchaseOrder[] = [
  {
    id: "OC-0023",
    supplier: "AutoPeças Brasil Ltda",
    supplierContact: "(11) 3344-5566",
    createdAt: "2026-05-25",
    expectedDelivery: "2026-05-30",
    status: "confirmed",
    items: [
      {
        partId: "P001",
        name: "Filtro de Óleo Honda",
        sku: "FO-HND-001",
        quantity: 10,
        unitPrice: 28.5,
      },
      {
        partId: "P002",
        name: "Filtro de Ar Universal",
        sku: "FA-UNV-002",
        quantity: 8,
        unitPrice: 35.0,
      },
    ],
    notes: "Entrega prioritária.",
  },
  {
    id: "OC-0022",
    supplier: "Distribuidora FreiMax",
    supplierContact: "(11) 4455-6677",
    createdAt: "2026-05-22",
    expectedDelivery: "2026-05-27",
    status: "received",
    items: [
      {
        partId: "P010",
        name: "Pastilha de Freio Dianteira",
        sku: "PF-DIA-010",
        quantity: 12,
        unitPrice: 89.0,
      },
    ],
    notes: "",
  },
  {
    id: "OC-0021",
    supplier: "MotoForce Distribuidora",
    supplierContact: "(11) 5566-7788",
    createdAt: "2026-05-20",
    expectedDelivery: "2026-06-05",
    status: "sent",
    items: [
      {
        partId: "P005",
        name: "Correia Dentada Gates",
        sku: "CD-GAT-005",
        quantity: 5,
        unitPrice: 145.0,
      },
      {
        partId: "P006",
        name: "Vela de Ignição NGK",
        sku: "VI-NGK-006",
        quantity: 20,
        unitPrice: 22.5,
      },
    ],
    notes: "Aguardando confirmação do fornecedor.",
  },
  {
    id: "OC-0020",
    supplier: "AutoPeças Brasil Ltda",
    supplierContact: "(11) 3344-5566",
    createdAt: "2026-05-15",
    expectedDelivery: "2026-05-20",
    status: "received",
    items: [
      {
        partId: "P003",
        name: "Óleo Motor 5W30 Sintético",
        sku: "OM-5W30-003",
        quantity: 24,
        unitPrice: 38.0,
      },
    ],
    notes: "",
  },
];

export const purchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  draft: "Rascunho",
  sent: "Enviado",
  confirmed: "Confirmado",
  received: "Recebido",
  cancelled: "Cancelado",
};

// ─── Analytics / Strategic Dashboard ────────────────────────────────────────

export type MockMonthlyRevenue = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  orders: number;
};

export const mockMonthlyRevenue: MockMonthlyRevenue[] = [
  {
    month: "Mai/25",
    revenue: 48200,
    expenses: 31400,
    profit: 16800,
    orders: 52,
  },
  {
    month: "Jun/25",
    revenue: 51300,
    expenses: 33200,
    profit: 18100,
    orders: 57,
  },
  {
    month: "Jul/25",
    revenue: 45900,
    expenses: 29800,
    profit: 16100,
    orders: 49,
  },
  {
    month: "Ago/25",
    revenue: 53700,
    expenses: 35100,
    profit: 18600,
    orders: 61,
  },
  {
    month: "Set/25",
    revenue: 58400,
    expenses: 37800,
    profit: 20600,
    orders: 65,
  },
  {
    month: "Out/25",
    revenue: 62100,
    expenses: 40200,
    profit: 21900,
    orders: 70,
  },
  {
    month: "Nov/25",
    revenue: 59800,
    expenses: 38700,
    profit: 21100,
    orders: 67,
  },
  {
    month: "Dez/25",
    revenue: 71500,
    expenses: 46300,
    profit: 25200,
    orders: 80,
  },
  {
    month: "Jan/26",
    revenue: 44300,
    expenses: 28900,
    profit: 15400,
    orders: 48,
  },
  {
    month: "Fev/26",
    revenue: 47800,
    expenses: 31100,
    profit: 16700,
    orders: 53,
  },
  {
    month: "Mar/26",
    revenue: 55200,
    expenses: 35800,
    profit: 19400,
    orders: 62,
  },
  {
    month: "Abr/26",
    revenue: 60400,
    expenses: 39100,
    profit: 21300,
    orders: 68,
  },
];

export type MockMechanicPerformance = {
  name: string;
  orders: number;
  revenue: number;
  avgRating: number;
  completionRate: number;
};

export const mockMechanicPerformance: MockMechanicPerformance[] = [
  {
    name: "Bruno Dias",
    orders: 128,
    revenue: 95400,
    avgRating: 4.8,
    completionRate: 96,
  },
  {
    name: "Carla Souza",
    orders: 112,
    revenue: 83200,
    avgRating: 4.9,
    completionRate: 98,
  },
  {
    name: "Carlos Melo",
    orders: 98,
    revenue: 72100,
    avgRating: 4.6,
    completionRate: 93,
  },
  {
    name: "Ana Paula",
    orders: 84,
    revenue: 61800,
    avgRating: 4.7,
    completionRate: 95,
  },
];

export type MockServiceCategory = {
  category: string;
  orders: number;
  revenue: number;
  percentage: number;
};

export const mockServiceCategories: MockServiceCategory[] = [
  {
    category: "Revisão Preventiva",
    orders: 186,
    revenue: 142300,
    percentage: 35,
  },
  { category: "Freios", orders: 124, revenue: 98700, percentage: 24 },
  { category: "Motor", orders: 87, revenue: 76400, percentage: 17 },
  { category: "Suspensão", orders: 65, revenue: 53200, percentage: 12 },
  { category: "Elétrica", orders: 48, revenue: 39100, percentage: 9 },
  { category: "Outros", orders: 12, revenue: 9800, percentage: 3 },
];

export const mockAnalyticsKpis = {
  totalRevenue12m: 658600,
  totalOrders12m: 732,
  avgTicket: 899,
  netMargin: 32,
  returnRate: 68,
  nps: 87,
  newCustomers: 143,
  activeCustomers: 312,
};
