// src/app/dashboard/noticias/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";
import { BackButton } from "@/components/shared/navigation/BackButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  User,
  Tag,
  ExternalLink,
  Eye,
  Pencil,
  Share,
} from "lucide-react";
import { type Database } from "@/lib/supabase/types/database.types";
import Link from "next/link";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];
type Tema = Database["public"]["Tables"]["temas"]["Row"];

export default function DashboardNoticiaViewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  const [noticia, setNoticia] = useState<Noticia | null>(null);
  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [temasLoading, setTemasLoading] = useState(true);

  const noticiaId = params.id as string;

  // Cargar noticia
  useEffect(() => {
    async function fetchNoticia() {
      if (isLoading || !user?.id || !noticiaId) return;

      try {
        const result = await noticiasService.getById(noticiaId);

        if (result.success && result.data) {
          setNoticia(result.data);
        } else {
          console.error("Error loading noticia:", result.error);
          toast({
            title: "Error",
            description: "No se pudo cargar la noticia",
            variant: "destructive",
          });
          router.push("/dashboard/noticias");
        }
      } catch (error) {
        console.error("Error fetching noticia:", error);
        toast({
          title: "Error",
          description: "Error inesperado al cargar la noticia",
          variant: "destructive",
        });
        router.push("/dashboard/noticias");
      } finally {
        setLoading(false);
      }
    }

    fetchNoticia();
  }, [noticiaId, user?.id, isLoading, router, toast]);

  // Cargar temas de la noticia
  useEffect(() => {
    async function fetchTemas() {
      if (!noticiaId) return;

      try {
        const result = await noticiaTemasService.getTemasWithInfoForNoticia(
          noticiaId
        );

        if (result.success && result.data) {
          setTemas(result.data);
        }
      } catch (error) {
        console.error("Error loading temas:", error);
      } finally {
        setTemasLoading(false);
      }
    }

    fetchTemas();
  }, [noticiaId]);

  // Loading state
  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Cargando noticia...</p>
        </div>
      </div>
    );
  }

  // No noticia encontrada
  if (!noticia) {
    return (
      <div className="text-center space-y-4">
        <div className="text-lg font-semibold">Noticia no encontrada</div>
        <p className="text-muted-foreground">
          La noticia que buscas no existe o no tienes permisos para verla.
        </p>
        <BackButton href="/dashboard/noticias" label="Volver a Mis Noticias" />
      </div>
    );
  }

  // Verificar si es el autor de la noticia
  const esAutor = noticia.created_by_uid === user?.id;

  // Helper functions - MISMO FORMATO QUE ADMIN
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "No especificada";
    try {
      return new Date(fecha).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Header con navegación - IGUAL QUE ADMIN */}
      <div className="flex items-center justify-between mb-6">
        <BackButton href="/dashboard/noticias" label="Volver a Mis Noticias" />

        {/* Botón Editar principal - Solo si es autor */}
        {esAutor && (
          <Button asChild className="flex items-center gap-2">
            <Link href={`/dashboard/noticias/${noticia.id}/edit`}>
              <Pencil className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        )}
      </div>

      {/* Card principal - ESTRUCTURA IDÉNTICA A ADMIN */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Badges de tipo y estado */}
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    noticia.tipo === "articulo_propio" ? "default" : "secondary"
                  }
                >
                  {noticia.tipo === "articulo_propio"
                    ? "Artículo Propio"
                    : "Enlace Externo"}
                </Badge>
                {noticia.esta_publicada && (
                  <Badge variant="outline" className="text-green-600">
                    Publicada
                  </Badge>
                )}
                {noticia.es_destacada && (
                  <Badge variant="outline" className="text-yellow-600">
                    Destacada
                  </Badge>
                )}
              </div>

              {/* Título y subtítulo */}
              <CardTitle className="text-3xl font-bold mb-3">
                {noticia.titulo}
              </CardTitle>

              {noticia.subtitulo && (
                <p className="text-xl text-muted-foreground">
                  {noticia.subtitulo}
                </p>
              )}
            </div>
          </div>

          {/* Imagen de la noticia */}
          {noticia.imagen_url && (
            <div className="mt-4">
              <img
                src={noticia.imagen_url}
                alt={noticia.titulo}
                className="w-full max-w-2xl h-64 object-cover rounded-lg border"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información básica - MISMA ESTRUCTURA QUE ADMIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {noticia.autor_noticia && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Autor:</span>
                <span>{noticia.autor_noticia}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Fecha:</span>
              <span>{formatearFecha(noticia.fecha_publicacion)}</span>
            </div>

            {noticia.fuente_externa && (
              <div className="flex items-start gap-2">
                <Tag className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  Fuente:
                </span>
                <span className="break-words break-all min-w-0">
                  {noticia.fuente_externa}
                </span>
              </div>
            )}
          </div>

          {/* Temas asociados */}
          {!temasLoading && temas.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Temáticas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {temas.map((tema) => (
                  <Badge key={tema.id} variant="secondary">
                    {tema.nombre}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contenido principal - IGUAL QUE ADMIN */}
          {noticia.tipo === "enlace_externo" ? (
            <div className="space-y-4">
              {noticia.resumen_o_contexto_interno && (
                <div className="space-y-2">
                  <h4 className="font-medium">Contexto interno:</h4>
                  <p className="text-muted-foreground">
                    {noticia.resumen_o_contexto_interno}
                  </p>
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
            <>
              {/* Contenido del artículo */}
              {noticia.contenido ? (
                <div className="prose prose-lg max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Esta noticia no tiene contenido aún.
                  </p>
                </div>
              )}

              {/* Resumen interno si existe */}
              {noticia.resumen_o_contexto_interno && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium">Resumen interno:</h4>
                    <p className="text-muted-foreground">
                      {noticia.resumen_o_contexto_interno}
                    </p>
                  </div>
                </>
              )}
            </>
          )}

          {/* Metadatos del sistema - IGUAL QUE ADMIN */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Creado:</strong> {formatearFecha(noticia.created_at)}
            </p>
            {noticia.updated_at && (
              <p>
                <strong>Última actualización:</strong>{" "}
                {formatearFecha(noticia.updated_at)}
              </p>
            )}
            {noticia.is_deleted && (
              <p className="text-red-600">
                <strong>Eliminada:</strong> {formatearFecha(noticia.deleted_at)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Panel de acciones del autor - SOLO SI ES AUTOR */}
      {esAutor && (
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Acciones del Autor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Como autor de esta noticia, puedes realizar las siguientes
              acciones:
            </p>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/noticias/${noticia.id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar Noticia
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link
                  href={`/noticias/${noticia.id}?from=dashboard`}
                  className="flex items-center gap-2"
                >
                  <Share className="h-4 w-4" />
                  Previsualizar en público

                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
