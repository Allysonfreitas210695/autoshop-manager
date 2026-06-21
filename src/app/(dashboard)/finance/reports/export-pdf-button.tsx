"use client";

import { Download } from "lucide-react";

export function ExportPdfButton() {
  return (
    <button
      onClick={() => window.print()}
      className="border-outline-variant bg-surface-container text-label-sm text-on-surface-variant hover:bg-surface-container-highest flex items-center gap-2 rounded-md border px-4 py-2 font-mono transition-colors print:hidden"
    >
      <Download className="size-4" />
      Exportar PDF
    </button>
  );
}
