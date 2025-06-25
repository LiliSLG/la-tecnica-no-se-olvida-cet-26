// src/app/admin/noticias/[id]/page.tsx
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";
import { temasService } from "@/lib/supabase/services/temasService";
import { BackButton } from "@/components/common/BackButton";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Tag, ExternalLink, Edit } from "lucide-react";
import Link from "next/link";

interface NoticiaPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function NoticiaPage({ params }: NoticiaPageProps) {
  const { id } = await params;

  try {
    console.log("🔍 Server: Loading noticia with ID:", id);

    // ✅ CAMBIO: Server Component - carga directa
    const [noticiaResult, temasIdsResult] = await Promise.all([
      noticiasService.getById(id),
      noticiaTemasService.getTemasForNoticia(id),
    ]);

    console.log("📊 Server: Noticia result:", {
      success: noticiaResult.success,
      hasData: !!noticiaResult.data,
      error: noticiaResult.error,
    });

    if (!noticiaResult.success) {
      console.error("❌ Server: Service failed:", noticiaResult.error);
      notFound();
    }

    if (!noticiaResult.data) {
      console.error("❌ Server: No data returned from service");
      notFound();
    }

    const noticia = noticiaResult.data;
    const temasIds = temasIdsResult.success ? temasIdsResult.data || [] : [];

    // Obtener información completa de los temas
    let temas: any[] = [];
    if (temasIds.length > 0) {
      const temasPromises = temasIds.map((temaId) =>
        temasService.getById(temaId)
      );
      const temasResults = await Promise.all(temasPromises);
      temas = temasResults
        .filter((result) => result.success && result.data)
        .map((result) => result.data);
    }

    const formatearFecha = (fecha: string | null) => {
      if (!fecha) return "Sin fecha";
      return new Date(fecha).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton />

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Badges de estado y tipo */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge
                      variant={
                        noticia.tipo === "articulo_propio"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {noticia.tipo === "articulo_propio"
                        ? "📝 Artículo Propio"
                        : "🔗 Enlace Externo"}
                    </Badge>
                    {noticia.esta_publicada && (
                      <Badge className="bg-green-100 text-green-800">
                        📢 Publicada
                      </Badge>
                    )}
                    {noticia.es_destacada && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        ⭐ Destacada
                      </Badge>
                    )}
                    {!noticia.esta_publicada && (
                      <Badge variant="outline">📝 Borrador</Badge>
                    )}
                  </div>

                  <h1 className="text-3xl font-bold mb-3">{noticia.titulo}</h1>

                  {noticia.subtitulo && (
                    <p className="text-xl text-muted-foreground mb-4">
                      {noticia.subtitulo}
                    </p>
                  )}
                </div>

                {/* Botón de editar */}
                <Button asChild>
                  <Link href={`/admin/noticias/${id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
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
                    <span className="text-sm text-muted-foreground">
                      Autor:
                    </span>
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

              {/* Temas relacionados */}
              {temas.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">
                      Temáticas Relacionadas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {temas.map((tema) => (
                        <Link key={tema.id} href={`/temas/${tema.id}`}>
                          <Badge
                            variant="outline"
                            className="hover:bg-gray-100 cursor-pointer"
                          >
                            {tema.nombre}
                            {tema.categoria_tema && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({tema.categoria_tema})
                              </span>
                            )}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* ✅ CORREGIDO: Contenido según tipo */}
              {noticia.tipo === "articulo_propio" && noticia.contenido && (
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

              {noticia.tipo === "enlace_externo" && noticia.url_externa && (
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
                          Esta noticia no tiene contexto para la IA. Es
                          recomendable agregarlo para mejorar las búsquedas y
                          recomendaciones del sistema.
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
                  {noticia.created_by_uid && (
                    <span className="ml-1">
                      por {noticia.created_by_uid.substring(0, 8)}...
                    </span>
                  )}
                </p>
                {noticia.updated_at && (
                  <p>
                    <strong>Última actualización:</strong>{" "}
                    {formatearFecha(noticia.updated_at)}
                    {noticia.updated_by_uid && (
                      <span className="ml-1">
                        por {noticia.updated_by_uid.substring(0, 8)}...
                      </span>
                    )}
                  </p>
                )}
                {noticia.is_deleted && (
                  <p className="text-red-600">
                    <strong>Eliminada:</strong>{" "}
                    {formatearFecha(noticia.deleted_at)}
                    {noticia.deleted_by_uid && (
                      <span className="ml-1">
                        por {noticia.deleted_by_uid.substring(0, 8)}...
                      </span>
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Server: Error loading noticia:", error);
    notFound();
  }
}
