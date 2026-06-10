import "./globals.css";

import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { Providers } from "@/_components/shared/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["500"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Precision Auto — AutoShop Manager",
    template: "%s | Precision Auto",
  },
  description:
    "Sistema de gestão para oficinas mecânicas. Controle ordens de serviço, estoque, agendamentos e financeiro em um único lugar.",
  applicationName: "Precision Auto",
  authors: [{ name: "Precision Auto" }],
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: siteUrl,
    siteName: "Precision Auto",
    title: "Precision Auto — AutoShop Manager",
    description:
      "Sistema de gestão para oficinas mecânicas. Controle ordens de serviço, estoque, agendamentos e financeiro em um único lugar.",
  },
  twitter: {
    card: "summary",
    title: "Precision Auto — AutoShop Manager",
    description:
      "Sistema de gestão para oficinas mecânicas. Controle ordens de serviço, estoque, agendamentos e financeiro em um único lugar.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
