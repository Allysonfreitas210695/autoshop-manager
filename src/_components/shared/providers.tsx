"use client";

import { ThemeProvider } from "next-themes";

import { Toaster } from "@/_components/ui/sonner";
import { TooltipProvider } from "@/_components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider delay={200}>{children}</TooltipProvider>
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
}
