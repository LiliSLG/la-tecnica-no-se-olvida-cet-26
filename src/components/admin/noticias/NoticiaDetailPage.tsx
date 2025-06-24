// src/components/admin/noticias/NoticiaDetailPage.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BackButton } from "@/components/common/BackButton";
import { useRouter } from "next/navigation";
import { Pencil, ExternalLink, Calendar, User, Tag } from "lucide-react";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

interface NoticiaDetailPageProps {
  noticia: Noticia;
}

export function NoticiaDetailPage({ noticia }: NoticiaDetailPageProps) {
  const router = useRouter();

  // Formatear fecha para mostrar
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
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <Button
          onClick={() => router.push(`/admin/noticias/${noticia.id}/edit`)}
          className="flex items-center gap-2"
        >
          <Pencil className="h-4 w-4" />
          Editar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    noticia.tipo === "articulo" ? "default" : "secondary"
                  }
                >
                  {noticia.tipo === "articulo"
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
          {/* Información básica */}
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

          <Separator />

          {/* Contenido según tipo */}
          {noticia.tipo === "articulo" && noticia.contenido && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Contenido del Artículo
              </h3>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap leading-relaxed">
                  {noticia.contenido}
                </p>
              </div>
            </div>
          )}

          {noticia.tipo === "link" && noticia.url_externa && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Enlace Externo</h3>
              <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                <ExternalLink className="h-4 w-4" />
                <a
                  href={noticia.url_externa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {noticia.url_externa}
                </a>
              </div>
            </div>
          )}

          {/* Resumen/Contexto interno */}
          {noticia.resumen_o_contexto_interno ? (
            <>
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Resumen / Contexto Interno
                  <span className="text-blue-600 text-sm">🤖 IA</span>
                </h3>
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <p className="whitespace-pre-wrap text-sm">
                    {noticia.resumen_o_contexto_interno}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <Separator />
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                <div className="flex items-start gap-2">
                  <span className="text-orange-600 text-lg">⚠️</span>
                  <div>
                    <h4 className="font-semibold text-orange-800 mb-1">
                      Contexto IA Faltante
                    </h4>
                    <p className="text-sm text-orange-700">
                      Esta noticia no tiene contexto para la IA. Es recomendable
                      agregarlo para mejorar las búsquedas y recomendaciones del
                      sistema.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Metadatos del sistema */}
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              <strong>Creado:</strong> {formatearFecha(noticia.created_at)}
              {noticia.created_by_uid && ` por ${noticia.created_by_uid}`}
            </p>
            {noticia.updated_at && (
              <p>
                <strong>Última actualización:</strong>{" "}
                {formatearFecha(noticia.updated_at)}
                {noticia.updated_by_uid && ` por ${noticia.updated_by_uid}`}
              </p>
            )}
            {noticia.is_deleted && (
              <p className="text-red-600">
                <strong>Eliminada:</strong> {formatearFecha(noticia.deleted_at)}
                {noticia.deleted_by_uid && ` por ${noticia.deleted_by_uid}`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
