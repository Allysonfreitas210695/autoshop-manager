"use client";

import { Headset, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/_helpers/nav";
import { cn } from "@/_lib/utils";

const allNavHrefs = navItems.map((i) => i.href);

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (pathname === href) return true;
  if (pathname.startsWith(`${href}/`)) {
    // Don't highlight parent when a more-specific nav item matches
    const hasMoreSpecific = allNavHrefs.some(
      (h) =>
        h !== href &&
        h.startsWith(`${href}/`) &&
        (pathname === h || pathname.startsWith(`${h}/`)),
    );
    return !hasMoreSpecific;
  }
  return false;
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  const groups = navItems.reduce<Record<string, typeof navItems>>(
    (acc, item) => {
      const g = item.group ?? "Outros";
      if (!acc[g]) acc[g] = [];
      acc[g].push(item);
      return acc;
    },
    {},
  );

  return (
    <div className="flex h-full flex-col py-6">
      <div className="mb-6 flex items-center gap-2 px-6">
        <span className="bg-secondary-container text-on-secondary-container flex size-9 items-center justify-center rounded-lg">
          <Wrench className="size-5" />
        </span>
        <div>
          <h1 className="text-headline-md text-on-surface leading-tight font-bold">
            Precision Auto
          </h1>
          <p className="text-label-sm text-on-surface-variant/70 font-mono">
            OFICINA MECÂNICA
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto px-4">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="text-label-xs text-on-surface-variant/40 mb-1 px-4 font-mono tracking-widest uppercase">
              {group}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "text-label-md flex items-center gap-3 rounded-lg px-4 py-3 font-mono transition-colors",
                      active
                        ? "bg-secondary-container text-on-secondary-container"
                        : "text-on-surface-variant hover:bg-surface-container-highest",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="mt-auto px-6 pt-4">
        <button className="bg-surface-container-highest text-label-md text-on-surface hover:bg-outline-variant flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-mono transition-colors">
          <Headset className="size-4" />
          Suporte Técnico
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="border-outline-variant bg-surface-container fixed top-0 left-0 z-40 hidden h-screen w-64 border-r lg:block">
      <SidebarContent />
    </aside>
  );
}
