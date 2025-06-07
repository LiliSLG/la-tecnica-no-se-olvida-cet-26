// src/app/layout.tsx

import "@/styles/globals.css"; // Si tenés tu CSS global
import { ReactNode } from "react";

export const metadata = {
  title: "La técnica no se olvida",
  description: "Admin Panel",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-100 text-gray-900">
        {children}
      </body>
    </html>
  );
}
