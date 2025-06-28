// src/app/admin/ClientOnlyAdminContent.tsx - VERSIÓN FINAL CORREGIDA
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Database } from "@/lib/supabase/types/database.types";
import { useAuth } from "@/providers/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

interface ClientOnlyAdminContentProps {
  children: ReactNode;
}

export default function ClientOnlyAdminContent({
  children,
}: ClientOnlyAdminContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { session, user, isAdmin, isLoading, signOut } = useAuth();

  // ✅ SIN DELAYS - Redirigir solo cuando esté todo listo
  useEffect(() => {
    // Solo actuar cuando ya no esté cargando
    if (isLoading) return;

    // Si no hay sesión → login
    if (!session) {
      console.log("❌ No session, redirecting to login...");
      router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Si hay sesión pero no es admin → homepage
    if (session && user && isAdmin === false) {
      console.log("❌ User is not admin, redirecting to homepage...");
      router.replace("/");
      return;
    }

    // Si llegó aquí y es admin, quedarse
    if (session && user && isAdmin === true) {
      console.log("🎉 User IS admin, staying in admin panel");
    }
  }, [isLoading, session, user, isAdmin, pathname, router]);

  // Cerrar mobile menu al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // ✅ SOLO mostrar loading mientras realmente está cargando
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // ✅ Si no hay sesión, mostrar loading (mientras redirige)
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // ✅ Si no es admin, mostrar loading (mientras redirige)
  if (isAdmin === false) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">
            Acceso denegado, redirigiendo...
          </p>
        </div>
      </div>
    );
  }

  // ✅ Si isAdmin aún es undefined, esperar
  if (isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // ✅ Solo renderizar cuando TODO esté confirmado (session + user + isAdmin = true)
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Layout Admin SOLO - SIN MainHeader */}
      <div className="grid w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        {/* AdminSidebar */}
        <AdminSidebar
          user={user}
          onSignOut={signOut}
          isMobileOpen={isMobileMenuOpen}
          onMobileClose={closeMobileMenu}
        />

        {/* Contenido Principal */}
        <div className="flex flex-col min-h-screen">
          {/* Header Mobile - Solo para abrir sidebar */}
          <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
            <h1 className="text-lg font-semibold">Panel Admin</h1>
            <Button variant="outline" size="sm" onClick={toggleMobileMenu}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Breadcrumbs */}
          <div className="p-4 border-b bg-card/50">
            <AdminBreadcrumbs />
          </div>

          {/* Contenido de la página */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>

      {/* Toaster para notificaciones */}
      <Toaster />
    </div>
  );
}
