// /src/app/(public)/page.tsx - HOMEPAGE CON DATOS REALES
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { statsService } from "@/lib/supabase/services/statsService";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  FolderOpen,
  Newspaper,
  BrainCircuit,
  ArrowRight,
  ExternalLink,
  Calendar,
  MapPin,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { Metadata } from "next";

// Metadata para SEO
export const metadata: Metadata = {
  title: "La Técnica no se Olvida | CET N°26 Ingeniero Jacobacci",
  description:
    "Preservamos y compartimos el conocimiento técnico y rural del CET N°26 de Ingeniero Jacobacci. Descubre proyectos, noticias y la sabiduría de nuestra comunidad.",
  keywords: [
    "CET 26",
    "Ingeniero Jacobacci",
    "educación técnica",
    "conocimiento rural",
    "proyectos técnicos",
  ],
  openGraph: {
    title: "La Técnica no se Olvida",
    description: "Archivo vivo del conocimiento técnico y rural del CET N°26",
    type: "website",
  },
};

export default async function HomePage() {
  console.log("🔍 Server Public: Loading homepage");

  // Cargar noticias destacadas y estadísticas en paralelo
  const [noticiasResult, statsResult] = await Promise.all([
    noticiasService.getFeaturedPublished(),
    statsService.getQuickStats(),
  ]);

  const noticiasDestacadas = noticiasResult.success
    ? noticiasResult.data || []
    : [];
  const stats = statsResult.success ? statsResult.data : null;

  // Valores por defecto si no hay datos
  const safeStats = stats || {
    proyectos: 0,
    noticias: 0,
    comunidad: 0,
    historias: 0,
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-accent/5">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-accent bg-clip-text text-transparent">
              La Técnica no se Olvida
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Preservamos y compartimos el conocimiento técnico y rural del{" "}
              <span className="font-semibold text-primary">CET N°26</span>,{" "}
              construyendo un archivo vivo de nuestra historia y proyectos.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/proyectos">
                <FolderOpen className="h-5 w-5 mr-2" />
                Ver Proyectos
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/comunidad">
                <Users className="h-5 w-5 mr-2" />
                Conocer la Comunidad
              </Link>
            </Button>
          </div>

          {/* Info del CET */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground pt-8">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Ingeniero Jacobacci, Río Negro</span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>Centro de Educación Técnica N°26</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats rápidas con datos reales y comentarios */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {safeStats.proyectos}
              </div>
              <div className="text-sm text-muted-foreground">
                Proyectos Técnicos
              </div>
              <Badge variant="outline" className="text-xs">
                {safeStats.proyectos > 0 ? "en crecimiento" : "empezando"}
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {safeStats.noticias}
              </div>
              <div className="text-sm text-muted-foreground">
                Noticias Publicadas
              </div>
              <Badge variant="outline" className="text-xs">
                {safeStats.noticias > 10
                  ? "muy activo"
                  : safeStats.noticias > 0
                  ? "creciendo"
                  : "nuevo"}
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {safeStats.comunidad}
              </div>
              <div className="text-sm text-muted-foreground">
                Miembros Activos
              </div>
              <Badge variant="outline" className="text-xs">
                {safeStats.comunidad > 50
                  ? "comunidad fuerte"
                  : safeStats.comunidad > 10
                  ? "creciendo"
                  : "iniciando"}
              </Badge>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-primary">
                {safeStats.historias}
              </div>
              <div className="text-sm text-muted-foreground">
                Historias Orales
              </div>
              <Badge variant="outline" className="text-xs">
                {safeStats.historias > 5
                  ? "rica tradición"
                  : safeStats.historias > 0
                  ? "preservando"
                  : "por comenzar"}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Noticias Destacadas */}
      {noticiasDestacadas.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-bold">
                Últimas Noticias
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Mantente al día con las novedades de nuestra comunidad técnica
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {noticiasDestacadas.slice(0, 6).map((noticia) => (
                <Card
                  key={noticia.id}
                  className="group hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  {noticia.imagen_url && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={noticia.imagen_url}
                        alt={noticia.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                  )}

                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          noticia.tipo === "articulo_propio"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {noticia.tipo === "articulo_propio"
                          ? "Artículo"
                          : "Enlace"}
                      </Badge>
                      {noticia.fecha_publicacion && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(
                            noticia.fecha_publicacion
                          ).toLocaleDateString("es-AR")}
                        </div>
                      )}
                    </div>

                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {noticia.titulo}
                    </CardTitle>

                    {noticia.subtitulo && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {noticia.subtitulo}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Por{" "}
                        {noticia.autor_noticia ||
                          (noticia.created_by_persona?.nombre &&
                          noticia.created_by_persona?.apellido
                            ? `${noticia.created_by_persona.nombre} ${noticia.created_by_persona.apellido}`
                            : "CET N°26")}
                      </div>

                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/noticias/${noticia.id}`}>
                          <span className="sr-only">
                            Leer más sobre {noticia.titulo}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button asChild variant="outline" size="lg">
                <Link href="/noticias">
                  <Newspaper className="h-5 w-5 mr-2" />
                  Ver Todas las Noticias
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Secciones principales */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/20">
        <div className="container mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Explora Nuestra Plataforma
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Descubre todo lo que tenemos para ofrecer
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Proyectos */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <FolderOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Proyectos Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Explora los proyectos desarrollados por estudiantes y la
                  comunidad, desde energías renovables hasta agricultura
                  sustentable.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/proyectos">
                    Explorar Proyectos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Consulta IA */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                  <BrainCircuit className="h-8 w-8 text-accent" />
                </div>
                <CardTitle>Consulta IA</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Pregúntale a nuestra inteligencia artificial sobre proyectos,
                  técnicas rurales y conocimiento preservado.
                </p>
                <Button asChild className="w-full">
                  <Link href="/consulta-ia">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Hacer Consulta
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Historias Orales */}
            <Card className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Historias Orales</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Preservamos la sabiduría y experiencias de nuestra comunidad
                  rural a través de testimonios y relatos.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/historias">
                    Escuchar Historias
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">
              ¿Formas parte de nuestra comunidad?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Únete a nosotros para compartir conocimiento, colaborar en
              proyectos y preservar nuestra historia técnica y rural.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-6">
              <Link href="/login">
                <Users className="h-5 w-5 mr-2" />
                Unirse a la Comunidad
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="text-lg px-8 py-6"
            >
              <Link href="/comunidad">
                <ExternalLink className="h-5 w-5 mr-2" />
                Conocer Más
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
