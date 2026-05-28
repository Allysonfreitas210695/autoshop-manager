import {
  CalendarClock,
  LayoutDashboard,
  type LucideIcon,
  Package,
  PlusSquare,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Ordens de Serviço", href: "/orders", icon: Wrench },
  { label: "Nova O.S.", href: "/orders/new", icon: PlusSquare },
  { label: "Agendamentos", href: "/appointments", icon: CalendarClock },
  { label: "Estoque", href: "/inventory", icon: Package },
  { label: "Clientes", href: "/customers", icon: Users },
  { label: "Financeiro", href: "/finance", icon: Wallet },
];
