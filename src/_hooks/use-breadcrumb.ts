"use client";

import { usePathname } from "next/navigation";

import { navItems } from "@/_helpers/nav";

const LABELS: Record<string, string> = {
  orders: "Ordens de Serviço",
  new: "Nova O.S.",
  appointments: "Agendamentos",
  inventory: "Estoque",
  customers: "Clientes",
  finance: "Financeiro",
  settings: "Configurações",
};

export type Crumb = { label: string; href: string };

export function useBreadcrumb(): Crumb[] {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/" }];

  let href = "";
  for (const segment of segments) {
    href += `/${segment}`;
    const navMatch = navItems.find((item) => item.href === href);
    crumbs.push({
      label: navMatch?.label ?? LABELS[segment] ?? segment,
      href,
    });
  }

  return crumbs;
}
