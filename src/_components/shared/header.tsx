"use client";

import { Bell, CheckCircle2, Info, Menu, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { SidebarContent } from "@/_components/shared/sidebar";
import { ThemeToggle } from "@/_components/shared/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar";
import { Button } from "@/_components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/_components/ui/dropdown-menu";
import { Input } from "@/_components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/_components/ui/sheet";
import type { Notification } from "@/_data-access/dashboard";
import { useBreadcrumb } from "@/_hooks/use-breadcrumb";
import { signOut } from "@/_lib/auth-client";

type HeaderUser = {
  name: string;
  email: string;
  image?: string | null;
};

export function Header({
  user,
  notifications = [],
}: {
  user: HeaderUser;
  notifications?: Notification[];
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const crumbs = useBreadcrumb();

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  function handleSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    router.push(`/orders?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
    setSearchQuery("");
  }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      handleSearch((e.target as HTMLInputElement).value);
    }
  }

  const hasNotifications = notifications.length > 0;

  return (
    <header className="border-outline-variant bg-surface sticky top-0 z-30 border-b">
      {/* Barra de busca mobile */}
      {searchOpen && (
        <div className="flex items-center gap-2 px-4 py-2 sm:hidden">
          <div className="relative flex-1">
            <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              autoFocus
              placeholder="Pesquisar placa ou cliente..."
              className="pl-9"
              aria-label="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(false)}
            aria-label="Fechar busca"
          >
            <X className="size-5" />
          </Button>
        </div>
      )}

      <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex flex-1 items-center gap-3">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-touch"
                  className="lg:hidden"
                  aria-label="Abrir menu"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="border-outline-variant bg-surface-container w-[85vw] max-w-xs p-0"
            >
              <SheetTitle className="sr-only">Navegação</SheetTitle>
              <SidebarContent onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-1.5 sm:flex"
          >
            {crumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {index > 0 ? (
                  <span className="text-on-surface-variant/40">/</span>
                ) : null}
                <span
                  className={
                    index === crumbs.length - 1
                      ? "text-label-md text-on-surface font-mono"
                      : "text-label-md text-on-surface-variant font-mono"
                  }
                >
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>

          <div className="relative hidden w-full max-w-sm sm:ml-4 sm:block">
            <Search className="text-on-surface-variant absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              placeholder="Pesquisar placa ou cliente..."
              className="pl-9"
              aria-label="Pesquisar"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-touch"
            onClick={() => setSearchOpen(true)}
            aria-label="Pesquisar"
            className="sm:hidden"
          >
            <Search className="size-5" />
          </Button>
          <Sheet open={notifOpen} onOpenChange={setNotifOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-touch"
                  aria-label="Notificações"
                  className="text-on-surface-variant hover:bg-surface-container relative rounded-full"
                />
              }
            >
              <Bell className="size-5" />
              {hasNotifications && (
                <span className="bg-tertiary absolute top-2 right-2 size-2 rounded-full" />
              )}
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-outline-variant bg-surface w-full p-0 sm:max-w-sm"
            >
              <SheetHeader className="border-outline-variant border-b px-6 py-4">
                <SheetTitle className="text-on-surface font-semibold">
                  Notificações
                </SheetTitle>
                <SheetDescription className="text-on-surface-variant text-label-sm">
                  Avisos e atualizações recentes
                </SheetDescription>
              </SheetHeader>
              <div className="divide-outline-variant/30 divide-y">
                {notifications.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-label-sm text-on-surface-variant font-mono">
                      Nenhuma notificação
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const Icon =
                      n.type === "critical_stock" ? Info : CheckCircle2;
                    const color =
                      n.type === "critical_stock"
                        ? "text-error"
                        : "text-status-completed";
                    return (
                      <div
                        key={n.id}
                        className="flex items-start gap-3 px-6 py-4"
                      >
                        <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm text-on-surface font-medium">
                            {n.title}
                          </p>
                          <p className="text-label-sm text-on-surface-variant font-mono">
                            {n.description}
                          </p>
                        </div>
                        <span className="text-label-xs text-on-surface-variant/60 shrink-0 font-mono">
                          {n.time}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </SheetContent>
          </Sheet>
          <ThemeToggle />
          <div className="bg-outline-variant mx-1 hidden h-8 w-px sm:block" />
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className="flex items-center gap-2 rounded-full outline-none"
                  aria-label="Conta"
                />
              }
            >
              <Avatar className="border-outline-variant size-9 border">
                {user.image && !avatarError ? (
                  <AvatarImage
                    src={user.image}
                    alt={user.name}
                    onError={() => setAvatarError(true)}
                  />
                ) : null}
                <AvatarFallback className="bg-surface-container-highest text-label-md">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p className="text-body-md text-on-surface font-semibold">
                  {user.name}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {user.email}
                </p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
