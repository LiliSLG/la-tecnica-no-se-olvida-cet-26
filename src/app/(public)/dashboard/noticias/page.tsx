// /src/app/(public)/dashboard/noticias/page.tsx - ACTUALIZADO
"use client";

import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  noticiasService,
  NoticiaWithAuthor,
} from "@/lib/supabase/services/noticiasService";
import { NoticiasListPage } from "@/components/shared/list-pages/NoticiasListPage"; // 🔄 Componente unificado
import { AdminDataTableSkeleton } from "@/components/shared/data-tables/AdminDataTableSkeleton";

export default function DashboardNoticiasPage() {
  const { user, isLoading } = useAuth();
  const [noticias, setNoticias] = useState<NoticiaWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  // Cargar noticias del usuario
  useEffect(() => {
    async function loadUserNoticias() {
      if (isLoading || !user?.id) return;

      try {
        console.log("🔍 Loading user noticias for:", user.id);

        const result = await noticiasService.getUserNoticias(user.id);

        if (result.success && result.data) {
          console.log("📊 Loaded user noticias:", result.data.length);
          setNoticias(result.data);
        } else {
          console.error("Error loading user noticias:", result.error);
          setError("Error al cargar tus noticias");
        }
      } catch (error) {
        console.error("Error in loadUserNoticias:", error);
        setError("Error inesperado al cargar las noticias");
      } finally {
        setLoading(false);
      }
    }

    loadUserNoticias();
  }, [user, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <AdminDataTableSkeleton
        title="Mis Noticias"
        addLabel="Nueva Noticia"
        rows={6}
        columns={4}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return null; // El redirect se encargará de esto
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* 🔄 CAMBIO: Usar componente unificado con isUserView=true */}
      <NoticiasListPage allNoticias={noticias} isUserView={true} />
    </div>
  );
}
