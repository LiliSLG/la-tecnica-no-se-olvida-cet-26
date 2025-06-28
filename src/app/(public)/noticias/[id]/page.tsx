// /src/app/(public)/noticias/[id]/page.tsx - FIXED
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ExternalLink, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// ✅ FIX: generateMetadata con await params
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Promise<>
}): Promise<Metadata> {
  const { id } = await params; // ✅ await params

  const result = await noticiasService.getPublishedById(id);

  if (!result.success || !result.data) {
    return {
      title: "Noticia no encontrada | La Técnica no se Olvida",
    };
  }

  const noticia = result.data;

  return {
    title: `${noticia.titulo} | La Técnica no se Olvida`,
    description:
      noticia.subtitulo ||
      noticia.contenido?.substring(0, 160) ||
      "Noticia de la comunidad del CET N°26",
    keywords: ["noticia", "CET", "Ingeniero Jacobacci", noticia.titulo],
    openGraph: {
      title: noticia.titulo,
      description: noticia.subtitulo || "Noticia de la comunidad técnica rural",
      type: "article",
      images: noticia.imagen_url ? [noticia.imagen_url] : [],
      publishedTime: noticia.fecha_publicacion || undefined,
      authors: noticia.autor_noticia ? [noticia.autor_noticia] : undefined,
    },
  };
}

// ✅ FIX: Componente principal con await params
export default async function NoticiaPublicaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Promise<>
}) {
  const { id } = await params; // ✅ await params

  console.log("🔍 Server Public: Loading noticia detail:", id);

  const result = await noticiasService.getPublishedById(id);

  if (!result.success) {
    console.error(
      "❌ Server Public: Error loading noticia detail:",
      result.error
    );
    notFound();
  }

  if (!result.data) {
    console.log("📭 Server Public: Noticia not found or not published:", id);
    notFound();
  }

  const noticia = result.data;
  console.log("📊 Server Public: Found noticia:", noticia.titulo);

  // Helper functions
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatearAutor = () => {
    if (noticia.autor_noticia) {
      return noticia.autor_noticia;
    }

    if (noticia.tipo === "enlace_externo" && noticia.fuente_externa) {
      return noticia.fuente_externa;
    }

    if (noticia.created_by_persona?.nombre) {
      const { nombre, apellido } = noticia.created_by_persona;
      return apellido ? `${nombre} ${apellido}` : nombre;
    }

    return "Autor CET";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header con navegación */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/noticias">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a noticias
            </Link>
          </Button>
        </div>

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-lg bg-card/95 backdrop-blur">
            <CardHeader className="space-y-6">
              {/* Imagen destacada */}
              {noticia.imagen_url && (
                <div className="w-full">
                  <img
                    src={noticia.imagen_url}
                    alt={noticia.titulo}
                    className="w-full h-64 sm:h-80 object-cover rounded-lg border border-border"
                  />
                </div>
              )}

              {/* Metadata y badges */}
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <Badge
                  variant={
                    noticia.tipo === "articulo_propio" ? "default" : "secondary"
                  }
                  className="text-sm"
                >
                  {noticia.tipo === "articulo_propio"
                    ? "📝 Artículo"
                    : "🔗 Enlace"}
                </Badge>

                {noticia.es_destacada && (
                  <Badge
                    variant="outline"
                    className="text-yellow-600 border-yellow-200 bg-yellow-50"
                  >
                    ⭐ Destacada
                  </Badge>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{formatearFecha(noticia.fecha_publicacion)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{formatearAutor()}</span>
                  </div>
                </div>
              </div>

              {/* Título y subtítulo */}
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {noticia.titulo}
                </h1>

                {noticia.subtitulo && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {noticia.subtitulo}
                  </p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                {noticia.tipo === "enlace_externo" && noticia.url_externa && (
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <a
                      href={noticia.url_externa}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver enlace original
                    </a>
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: noticia.titulo,
                        text: noticia.subtitulo || noticia.titulo,
                        url: window.location.href,
                      });
                    } else {
                      // Fallback: copiar al portapapeles
                      navigator.clipboard.writeText(window.location.href);
                    }
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartir
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Contenido del artículo */}
              {noticia.tipo === "articulo_propio" && noticia.contenido && (
                <>
                  <Separator />
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                      {noticia.contenido}
                    </div>
                  </div>
                </>
              )}

              {/* Info del enlace externo */}
              {noticia.tipo === "enlace_externo" && (
                <>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">
                      Información del enlace
                    </h3>

                    {noticia.url_externa && (
                      <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
                        <ExternalLink className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">
                            Enlace original:
                          </p>
                          <a
                            href={noticia.url_externa}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline break-all"
                          >
                            {noticia.url_externa}
                          </a>
                        </div>
                      </div>
                    )}

                    {noticia.fuente_externa && (
                      <div className="text-sm text-muted-foreground">
                        <strong>Fuente:</strong> {noticia.fuente_externa}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Temas relacionados */}
              {noticia.temas && noticia.temas.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">
                      Temas relacionados
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {noticia.temas.map((tema) => (
                        <Badge key={tema.id} variant="outline">
                          {tema.nombre}
                          {tema.categoria_tema && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({tema.categoria_tema})
                            </span>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Footer */}
              <Separator />
              <div className="text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  ¿Te gustó esta noticia? Únete a nuestra comunidad educativa.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/noticias">Ver más noticias</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/">Conocer el proyecto</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
