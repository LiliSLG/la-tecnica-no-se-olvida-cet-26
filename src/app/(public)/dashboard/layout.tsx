// /src/app/(public)/dashboard/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserSidebar } from "@/components/user/UserSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Redirect si no está autenticado
  if (!user) {
    redirect("/login");
  }

  // Handlers para mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Layout con Sidebar - Similar al admin */}
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* UserSidebar */}
        <UserSidebar
          user={user}
          onSignOut={signOut}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        {/* Contenido Principal */}
        <div className="flex flex-col min-h-screen">
          {/* Header Mobile - Solo para abrir sidebar */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-semibold">Mi Dashboard</h1>
            <Button variant="outline" size="sm" onClick={toggleMobileMenu}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Contenido de la página */}
          <main className="flex-1">{children}</main>
        </div>
      </div>

      {/* Toaster para notificaciones */}
      <Toaster />
    </div>
  );
}
