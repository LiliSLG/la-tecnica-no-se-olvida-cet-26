// /src/app/(public)/layout.tsx
import { ReactNode } from "react";
import { PublicHeader } from "@/components/public/common/PublicHeader";
import { PublicFooter } from "@/components/public/common/PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header público con navegación */}
      <PublicHeader />

      {/* Contenido principal */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <PublicFooter />
    </div>
  );
}
