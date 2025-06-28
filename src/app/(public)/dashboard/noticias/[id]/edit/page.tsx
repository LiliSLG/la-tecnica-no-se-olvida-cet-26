// /src/app/(public)/dashboard/noticias/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, redirect } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";
import { NoticiaForm } from "@/components/admin/noticias/NoticiaForm";
import { BackButton } from "@/components/common/BackButton";
import { useAuth } from "@/providers/AuthProvider";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

export default function EditNoticiaUserPage() {
  const params = useParams();
  const { user, isLoading } = useAuth();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [temasIds, setTemasIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    async function loadNoticiaAndTemas() {
      if (isLoading || !user || !id) return;

      try {
        console.log("🔍 Loading noticia for edit:", id);

        // Cargar noticia y temas en paralelo
        const [noticiaResult, temasResult] = await Promise.all([
          noticiasService.getById(id),
          noticiaTemasService.getTemasForNoticia(id),
        ]);

        if (!noticiaResult.success || !noticiaResult.data) {
          setError("Noticia no encontrada o sin permisos para editarla");
          return;
        }

        const noticiaData = noticiaResult.data;

        // ✅ VERIFICAR que el usuario puede editar ESTA noticia
        if (noticiaData.created_by_uid !== user.id) {
          setError("No tienes permisos para editar esta noticia");
          return;
        }

        setNoticia(noticiaData);
        setTemasIds(temasResult.success ? temasResult.data || [] : []);

        console.log("📊 Loaded noticia with temas:", {
          titulo: noticiaData.titulo,
          temasCount: temasResult.success ? (temasResult.data || []).length : 0,
        });
      } catch (error) {
        console.error("Error loading noticia for edit:", error);
        setError("Error inesperado al cargar la noticia");
      } finally {
        setLoading(false);
      }
    }

    loadNoticiaAndTemas();
  }, [id, user, isLoading]);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  // Loading states
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando noticia...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton
            href="/dashboard/noticias"
            label="Volver a Mis Noticias"
          />

          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-red-600 font-medium">{error}</div>
                <p className="text-sm text-muted-foreground">
                  Verifica que tengas permisos para editar esta noticia.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No user or noticia
  if (!user || !noticia) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <BackButton href="/dashboard/noticias" label="Volver a Mis Noticias" />

        <Card>
          <CardHeader>
            <CardTitle>Editar Noticia</CardTitle>
            <CardDescription>
              Modifica los datos de la noticia "{noticia.titulo}"
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Reutilizar el mismo NoticiaForm de admin con redirectPath personalizado */}
            <NoticiaForm
              initialData={noticia}
              initialTemas={temasIds}
              redirectPath="/dashboard/noticias"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
