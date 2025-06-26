// src/app/admin/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Database } from "@/lib/supabase/types/database.types";
import { useAuth } from "@/providers/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { MainHeader } from "@/components/common/MainHeader";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, user, isAdmin, isLoading, signOut } = useAuth();

  // Redirigir solo cuando terminó de cargar Y no hay sesión
  useEffect(() => {
    if (isLoading) return;

    if (!session && pathname.startsWith("/admin")) {
      console.log("❌ No hay sesión, redirigiendo a login...");
      router.replace("/login");
      return;
    }

    // GUARD: Solo admins pueden acceder
    if (session && user && isAdmin !== undefined && !isAdmin) {
      console.log("❌ Usuario no es admin, redirigiendo a homepage...");
      router.replace("/");
      return;
    }
  }, [isLoading, session, user, isAdmin, pathname, router]);

  // Cerrar mobile menu al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Mostrar loader mientras carga
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <p className="ml-2">Cargando...</p>
      </div>
    );
  }

  // Si no hay sesión después de cargar, mostrar loader (mientras redirige)
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirigiendo al login...</p>
      </div>
    );
  }

  // Si no es admin, mostrar mensaje mientras redirige
  if (session && user && isAdmin !== undefined && !isAdmin) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="text-red-600 font-semibold">Acceso Denegado</div>
          <p className="text-muted-foreground">
            No tienes permisos de administrador
          </p>
          <p className="text-sm text-muted-foreground">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Renderizar layout admin con MainHeader + sidebar + breadcrumbs + contenido
  return (
    <div className="min-h-screen bg-background">
      {/* MainHeader para navegación global */}
      <MainHeader />

      {/* Layout Admin Principal */}
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* AdminSidebar con soporte mobile */}
        <AdminSidebar
          user={user! as Persona}
          onSignOut={signOut}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        <div className="flex flex-col">
          {/* Mini header para mobile hamburger (solo visible en móvil) */}
          <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <div className="flex-1">
              <h2 className="font-semibold">Panel Admin</h2>
            </div>
          </header>

          {/* Contenido principal con breadcrumbs */}
          <main className="flex-1 p-4 sm:p-6 bg-muted/40">
            {/* Breadcrumbs - se muestran automáticamente según la ruta */}
            <AdminBreadcrumbs />
            {children}
          </main>
        </div>
      </div>

      {/* Toaster para notificaciones */}
      <Toaster />
    </div>
  );
}
