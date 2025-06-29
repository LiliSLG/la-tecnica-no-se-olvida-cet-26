// src/app/dashboard/noticias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, redirect, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/shared/navigation/BackButton";
import { useAuth } from "@/providers/AuthProvider";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";
import { Database } from "@/lib/supabase/types/database.types";
import {
  Calendar,
  User,
  ExternalLink,
  Pencil,
  Eye,
  Share2,
  Tag,
} from "lucide-react";
import Link from "next/link";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
type Tema = Database["public"]["Tables"]["temas"]["Row"];

export default function DashboardNoticiaViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params.id as string;

  useEffect(() => {
    async function loadNoticia() {
      if (isLoading || !user || !id) return;

      try {
        console.log("🔍 Loading noticia for dashboard view:", id);

        // Cargar noticia y temas en paralelo
        const [noticiaResult, temasResult] = await Promise.all([
          noticiasService.getById(id),
          noticiaTemasService.getTemasWithInfoForNoticia(id),
        ]);

        if (!noticiaResult.success || !noticiaResult.data) {
          setError("Noticia no encontrada");
          return;
        }

        const noticiaData = noticiaResult.data;
        setNoticia(noticiaData);

        if (temasResult.success && temasResult.data) {
          setTemas(temasResult.data);
        }

        console.log("📊 Loaded noticia:", {
          titulo: noticiaData.titulo,
          esPropia: noticiaData.created_by_uid === user.id,
          temasCount: temasResult.success ? (temasResult.data || []).length : 0,
        });
      } catch (error) {
        console.error("Error loading noticia:", error);
        setError("Error inesperado al cargar la noticia");
      } finally {
        setLoading(false);
      }
    }

    loadNoticia();
  }, [id, user, isLoading]);

  // Verificar autenticación
  useEffect(() => {
    if (!isLoading && !user) {
      redirect("/login");
    }
  }, [user, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground">Cargando noticia...</p>
            </div>
          </div>
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
                  La noticia no existe o no tienes permisos para verla.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // No noticia
  if (!noticia) {
    return null;
  }

  // Verificar si es el autor de la noticia
  const esAutor = noticia.created_by_uid === user?.id;

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <BackButton href="/dashboard/noticias" label="Volver a Mis Noticias" />

        {/* Header con acciones */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">{noticia.titulo}</h1>
            {noticia.subtitulo && (
              <p className="text-xl text-muted-foreground">
                {noticia.subtitulo}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            {/* Botón Ver Público */}
            <Button variant="outline" asChild>
              <Link href={`/noticias/${noticia.id}?from=dashboard`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver Público
              </Link>
            </Button>

            {/* Botón Editar - Solo si es autor */}
            {esAutor && (
              <Button asChild>
                <Link href={`/dashboard/noticias/${noticia.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Metadatos */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(noticia.fecha_publicacion)}</span>
              </div>

              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{noticia.autor_noticia || "Autor CET"}</span>
              </div>

              <Badge variant={noticia.esta_publicada ? "default" : "secondary"}>
                {noticia.esta_publicada ? "Publicada" : "Borrador"}
              </Badge>

              {noticia.es_destacada && (
                <Badge variant="outline">Destacada</Badge>
              )}

              <Badge variant="outline">
                {noticia.tipo === "articulo_propio"
                  ? "📝 Artículo"
                  : "🔗 Enlace"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Temas */}
        {temas.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Temáticas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {temas.map((tema) => (
                  <Badge key={tema.id} variant="secondary">
                    {tema.nombre}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Contenido principal */}
        <Card>
          <CardContent className="pt-6">
            {noticia.tipo === "enlace_externo" ? (
              <div className="space-y-4">
                {noticia.resumen_o_contexto_interno && (
                  <div className="prose prose-sm max-w-none">
                    <h4>Contexto:</h4>
                    <p>{noticia.resumen_o_contexto_interno}</p>
                  </div>
                )}

                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Enlace externo</p>
                      <p className="text-sm text-muted-foreground">
                        {noticia.fuente_externa || "Fuente externa"}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a
                        href={noticia.url_externa || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="prose prose-lg max-w-none">
                {noticia.contenido ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                  />
                ) : (
                  <p className="text-muted-foreground">
                    Sin contenido disponible.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Panel de autor - Solo si es el autor */}
        {esAutor && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-primary">Panel de Autor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Esta es tu noticia. Puedes editarla o ver cómo la ven otros
                  usuarios.
                </p>

                <div className="flex gap-2">
                  <Button size="sm" asChild>
                    <Link href={`/dashboard/noticias/${noticia.id}/edit`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Editar Noticia
                    </Link>
                  </Button>

                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/noticias/${noticia.id}?from=dashboard`}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir Vista Pública
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
