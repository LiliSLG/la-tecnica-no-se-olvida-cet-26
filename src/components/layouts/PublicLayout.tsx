// /src/components/layouts/PublicLayout.tsx
import { ReactNode } from "react";
import { MainHeader } from "@/components/common/MainHeader";
import { PublicFooter } from "@/components/common/PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
  /** Añadir clase adicional al contenedor principal */
  className?: string;
  /** Deshabilitar el footer (útil para páginas especiales) */
  noFooter?: boolean;
}

export function PublicLayout({
  children,
  className = "",
  noFooter = false,
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header común */}
      <MainHeader />

      {/* Contenido principal */}
      <main className={`flex-1 ${className}`}>{children}</main>

      {/* Footer (opcional) */}
      {!noFooter && <PublicFooter />}
    </div>
  );
}
