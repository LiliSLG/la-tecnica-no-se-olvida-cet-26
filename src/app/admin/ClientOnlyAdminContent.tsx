// src/app/admin/ClientOnlyAdminContent.tsx - ARREGLADO TIMING
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

  // ✅ NUEVO: Delay para dar tiempo a que se resuelva isAdmin
  const [adminCheckDelay, setAdminCheckDelay] = useState(true);

  // ✅ NUEVO: Dar un poco más de tiempo para que se resuelva isAdmin
  useEffect(() => {
    if (!isLoading && session && user) {
      // Dar 1 segundo para que se resuelva isAdmin antes de evaluar redirecciones
      const timer = setTimeout(() => {
        setAdminCheckDelay(false);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isLoading, session, user]);

  // Redirigir solo después del delay
  useEffect(() => {
    if (isLoading || adminCheckDelay) return;

    if (!session && pathname.startsWith("/admin")) {
      console.log("❌ No session, redirecting to login...");
      router.replace("/login");
      return;
    }

    // Solo verificar permisos cuando isAdmin ya se resolvió Y pasó el delay
    if (session && user && isAdmin !== undefined) {
      if (!isAdmin) {
        console.log("❌ User is not admin, redirecting to homepage...");
        router.replace("/");
        return;
      } else {
        console.log("🎉 User IS admin, staying in admin panel");
      }
    }
  }, [isLoading, adminCheckDelay, session, user, isAdmin, pathname, router]);

  // Cerrar mobile menu al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Mostrar loading mientras carga O durante el delay de admin check
  if (
    isLoading ||
    adminCheckDelay ||
    (session && user && isAdmin === undefined)
  ) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">
            {!session
              ? "Verificando sesión..."
              : adminCheckDelay
              ? "Verificando permisos..."
              : "Cargando panel..."}
          </p>
        </div>
      </div>
    );
  }

  // Si no hay sesión después de cargar, mostrar loader (mientras redirige)
  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-pulse w-12 h-12 bg-gray-200 rounded-full mx-auto"></div>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  // Solo mostrar "Acceso Denegado" si ya pasó el delay y no es admin
  if (session && user && !adminCheckDelay && isAdmin === false) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <div className="space-y-2">
            <div className="text-red-600 font-semibold text-lg">
              Acceso Denegado
            </div>
            <p className="text-gray-600">No tienes permisos de administrador</p>
            <p className="text-sm text-gray-500">Redirigiendo...</p>
          </div>
        </div>
      </div>
    );
  }

  // Guard final: si isAdmin sigue undefined después del delay, seguir esperando
  if (isAdmin === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-600">Verificando permisos...</p>
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

  // Solo renderizar si TODO está listo
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
