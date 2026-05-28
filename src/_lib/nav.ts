import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  LayoutDashboard,
  type LucideIcon,
  Package,
  PlusSquare,
  ShoppingCart,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, group: "Principal" },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    group: "Principal",
  },
  {
    label: "Ordens de Serviço",
    href: "/orders",
    icon: Wrench,
    group: "Operações",
  },
  {
    label: "Nova O.S.",
    href: "/orders/new",
    icon: PlusSquare,
    group: "Operações",
  },
  {
    label: "Agendamentos",
    href: "/appointments",
    icon: CalendarClock,
    group: "Operações",
  },
  { label: "Clientes", href: "/customers", icon: Users, group: "Operações" },
  { label: "Estoque", href: "/inventory", icon: Package, group: "Estoque" },
  {
    label: "Alertas",
    href: "/inventory/alerts",
    icon: AlertTriangle,
    group: "Estoque",
  },
  {
    label: "Ordens de Compra",
    href: "/inventory/purchase-orders",
    icon: ShoppingCart,
    group: "Estoque",
  },
  { label: "Financeiro", href: "/finance", icon: Wallet, group: "Financeiro" },
];
