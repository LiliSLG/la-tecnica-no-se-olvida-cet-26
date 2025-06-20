// src/app/admin/layout.tsx
"use client";

import { ReactNode, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Database } from "@/lib/supabase/types/database.types";
import { useAuth } from "@/providers/AuthProvider";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

type Persona = Database["public"]["Tables"]["personas"]["Row"];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { session, user, isLoading, signOut } = useAuth();

  // Redirigir solo cuando terminó de cargar Y no hay sesión
  useEffect(() => {
    if (isLoading) return;

    if (!session && pathname.startsWith("/admin")) {
      console.log("❌ No hay sesión, redirigiendo a login...");
      router.replace("/login");
    }
  }, [isLoading, session, pathname, router]);

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
        <p>Redirigiendo...</p>
      </div>
    );
  }

  // Renderizar layout admin con sidebar + header + contenido
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AdminSidebar user={user! as Persona} onSignOut={signOut} />
      <div className="flex flex-col">
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 bg-muted/40">{children}</main>
      </div>
    </div>
  );
}
