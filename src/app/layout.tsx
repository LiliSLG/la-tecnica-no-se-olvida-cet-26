// src/app/layout.tsx
import { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/app/globals.css';
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "La Técnica No Se Olvida",
  description: "Archivo histórico de la Escuela Técnica N°26",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
