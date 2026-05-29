import type { ReactNode } from "react";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-surface text-on-surface min-h-screen">
      <header className="border-outline-variant/30 border-b px-4 py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <div className="bg-secondary size-7 rounded-md" />
          <div>
            <p className="text-label-lg text-on-surface font-mono font-bold tracking-wider uppercase">
              Precision Auto
            </p>
            <p className="text-label-xs text-on-surface-variant font-mono">
              Rastreamento de Ordem de Serviço
            </p>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-8">{children}</main>
      <footer className="border-outline-variant/30 mt-12 border-t px-4 py-6 text-center">
        <p className="text-label-xs text-on-surface-variant font-mono">
          Precision Auto · (11) 3456-7890 · precision@auto.com.br
        </p>
      </footer>
    </div>
  );
}
