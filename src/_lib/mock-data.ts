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

export const inventoryCategories = [
  "Todos",
  "Filtros",
  "Freios",
  "Motor",
  "Suspensão",
  "Ignição",
  "Lubrificantes",
  "Elétrica",
] as const;

export type InventoryCategory = (typeof inventoryCategories)[number];

export const mockInventoryMetrics = {
  totalItems: mockParts.length,
  lowStockCount: mockParts.filter((p) => p.stock <= p.minStock).length,
  criticalCount: mockParts.filter((p) => p.stock < p.minStock).length,
  totalValue: mockParts.reduce((sum, p) => sum + p.stock * p.unitPrice, 0),
};
