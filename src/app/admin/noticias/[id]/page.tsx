// src/app/admin/noticias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiaDetailPage } from "@/components/admin/noticias/NoticiaDetailPage";
import { DetailPageSkeleton } from "@/components/admin/DetailPageSkeleton";
import { Database } from "@/lib/supabase/types/database.types";
import { useAuth } from "@/providers/AuthProvider";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

export default function NoticiaDetailClientPage() {
  const params = useParams();
  const { isLoading } = useAuth();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    async function fetchNoticia() {
      if (isLoading || !id) return;

      try {
        console.log("🔍 Fetching noticia with ID:", id);
        const result = await noticiasService.getById(id);
        console.log("📥 Service result:", result);

        if (!result.success) {
          console.error("❌ Service error:", result.error);
          setError("No se pudo cargar la noticia");
          return;
        }

        if (!result.data) {
          console.error("❌ No data returned");
          setError("Noticia no encontrada");
          return;
        }

        console.log("✅ Noticia found:", result.data.titulo);
        setNoticia(result.data);
      } catch (error) {
        console.error("❌ Error loading noticia detail:", error);
        setError("Error inesperado al cargar la noticia");
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [id, isLoading]);

  // Show skeleton while loading
  if (isLoading || loading) {
    return <DetailPageSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-sm text-red-600">{error}</div>
            <p className="text-sm text-muted-foreground">
              Verifica que la URL sea correcta o contacta al administrador.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Noticia no encontrada
          </div>
        </div>
      </div>
    );
  }

  return <NoticiaDetailPage noticia={noticia} />;
}
