// src/app/(public)/noticias/[id]/page.tsx
import { notFound } from "next/navigation";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ExternalLink, ArrowLeft, Tag } from "lucide-react";
import { ShareButton } from "@/components/public/common/ShareButton";
import Link from "next/link";
import { Metadata } from "next";

// Generar metadata para SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  try {
    const { id } = await params;

    console.log("🔍 Generating metadata for noticia:", id);

    const result = await noticiasService.getPublishedById(id);

    if (!result.success || !result.data) {
      return {
        title: "Noticia no encontrada | La Técnica no se Olvida",
        description:
          "La noticia solicitada no fue encontrada o no está disponible.",
      };
    }

    const noticia = result.data;

    return {
      title: `${noticia.titulo} | La Técnica no se Olvida`,
      description: noticia.subtitulo || "Noticia de la comunidad del CET N°26",
      keywords: ["noticia", "CET", "Ingeniero Jacobacci", noticia.titulo],
      openGraph: {
        title: noticia.titulo,
        description:
          noticia.subtitulo || "Noticia de la comunidad técnica rural",
        type: "article",
        images: noticia.imagen_url ? [noticia.imagen_url] : [],
        publishedTime: noticia.fecha_publicacion || undefined,
        authors: noticia.autor_noticia ? [noticia.autor_noticia] : undefined,
      },
    };
  } catch (error) {
    console.error("❌ Error generating metadata:", error);
    return {
      title: "Error | La Técnica no se Olvida",
      description: "Hubo un error al cargar la noticia.",
    };
  }
}

export default async function NoticiaPublicaPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const { from } = await searchParams;

  console.log("🔍 Server Public: Loading noticia detail:", id);

  try {
    // Cargar noticia publicada y sus temas
    const [noticiaResult, temasResult] = await Promise.all([
      noticiasService.getPublishedById(id),
      noticiaTemasService.getTemasWithInfoForNoticia(id),
    ]);

    if (!noticiaResult.success || !noticiaResult.data) {
      console.log("❌ Server Public: Noticia not found or not published:", id);
      notFound();
    }

    const noticia = noticiaResult.data;
    const temas = temasResult.success ? temasResult.data || [] : [];

    console.log("📊 Server Public: Loaded noticia:", {
      titulo: noticia.titulo,
      tipo: noticia.tipo,
      temasCount: temas.length,
    });

    // Helper functions
    const formatDate = (dateString: string | null) => {
      if (!dateString) return "Sin fecha";
      return new Date(dateString).toLocaleDateString("es-AR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatAutor = () => {
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

      return "CET N°26";
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Navegación */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link
                  href={
                    from === "dashboard" ? "/dashboard/noticias" : "/noticias"
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {from === "dashboard"
                    ? "Volver a Mis Noticias"
                    : "Volver a Noticias"}
                </Link>
              </Button>
            </div>

            {/* Header del artículo */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tight leading-tight bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  {noticia.titulo}
                </h1>

                {noticia.subtitulo && (
                  <p className="text-xl text-muted-foreground leading-relaxed">
                    {noticia.subtitulo}
                  </p>
                )}
              </div>

              {/* Metadatos */}
              <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{formatDate(noticia.fecha_publicacion)}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{formatAutor()}</span>
                    </div>

                    <Separator orientation="vertical" className="h-4" />

                    <Badge variant="outline" className="border-primary/30">
                      {noticia.tipo === "articulo_propio"
                        ? "📝 Artículo"
                        : "🔗 Enlace"}
                    </Badge>

                    {noticia.es_destacada && (
                      <Badge variant="default" className="bg-primary">
                        ⭐ Destacada
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Imagen principal */}
            {noticia.imagen_url && (
              <div className="relative aspect-video overflow-hidden rounded-xl shadow-lg">
                <img
                  src={noticia.imagen_url}
                  alt={noticia.titulo}
                  className="object-cover w-full h-full transition-transform hover:scale-105"
                />
              </div>
            )}

            {/* Temas */}
            {temas.length > 0 && (
              <Card className="border-primary/20">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold">Temáticas relacionadas</h3>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {temas.map((tema) => (
                      <Badge
                        key={tema.id}
                        variant="secondary"
                        className="hover:bg-primary/10"
                      >
                        {tema.nombre}
                        {tema.categoria_tema && (
                          <span className="ml-1 text-xs opacity-70">
                            ({tema.categoria_tema})
                          </span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contenido principal */}
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                {noticia.tipo === "enlace_externo" ? (
                  <div className="space-y-6">
                    {/* Contexto del enlace */}
                    {noticia.resumen_o_contexto_interno && (
                      <div className="prose prose-lg max-w-none dark:prose-invert">
                        <h3 className="text-primary">Contexto</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {noticia.resumen_o_contexto_interno}
                        </p>
                      </div>
                    )}

                    {/* Enlace externo */}
                    <div className="border rounded-xl p-8 bg-gradient-to-r from-primary/5 to-accent/5 text-center space-y-4">
                      <div>
                        <h4 className="font-semibold text-lg text-primary">
                          Enlace externo
                        </h4>
                        <p className="text-muted-foreground">
                          {noticia.fuente_externa || "Fuente externa"}
                        </p>
                      </div>

                      {noticia.url_externa && (
                        <Button size="lg" className="shadow-lg" asChild>
                          <a
                            href={noticia.url_externa}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir enlace
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Artículo propio */
                  <div className="prose prose-lg max-w-none dark:prose-invert">
                    {noticia.contenido ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: noticia.contenido }}
                      />
                    ) : (
                      <div className="text-center py-12 space-y-4">
                        <div className="text-muted-foreground">
                          El contenido de este artículo no está disponible.
                        </div>
                        <Button variant="outline" asChild>
                          <Link href="/noticias">Ver otras noticias</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Footer con acciones */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t">
              <Button variant="outline" asChild>
                <Link
                  href={
                    from === "dashboard" ? "/dashboard/noticias" : "/noticias"
                  }
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {from === "dashboard"
                    ? "Volver a Mis Noticias"
                    : "Ver más noticias"}
                </Link>
              </Button>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Compartir:
                </span>
                <ShareButton
                  title={noticia.titulo}
                  text={noticia.subtitulo || ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("❌ Server Public: Unexpected error:", error);
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Error</h1>
          <p className="text-muted-foreground">
            Ocurrió un error al cargar la noticia.
          </p>
          <Button asChild>
            <Link href="/noticias">Volver a Noticias</Link>
          </Button>
        </div>
      </div>
    );
  }
}
