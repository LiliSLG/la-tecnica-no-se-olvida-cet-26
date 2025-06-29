// src/app/dashboard/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { UserSidebar } from "@/components/user/UserSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading, signOut } = useAuth();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  // No authenticated user
  if (!user) {
    return null; // El redirect se encargará de esto
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* UserSidebar - Estilo similar a admin */}
        <UserSidebar
          user={user}
          onSignOut={signOut}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Contenido Principal - Layout idéntico a admin */}
        <div className="flex flex-col min-h-screen">
          {/* Header Mobile - Solo para abrir sidebar */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-semibold">Mi Dashboard</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Page content con mismo padding que admin */}
          <main className="flex-1 p-6 bg-muted/30">{children}</main>
        </div>
      </div>
    </div>
  );
}
