// /src/app/(public)/layout.tsx
import { ReactNode } from "react";
import { MainHeader } from "@/components/common/MainHeader";
import { PublicFooter } from "@/components/common/PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header común para páginas públicas */}
      <MainHeader />

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
