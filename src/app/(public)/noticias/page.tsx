// src/app/(public)/noticias/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Calendar,
  User,
  ExternalLink,
  Filter,
  Clock,
  Star,
  Newspaper,
} from "lucide-react";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { Database } from "@/lib/supabase/types/database.types";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

export default function NoticiasPublicPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  useEffect(() => {
    async function fetchNoticias() {
      try {
        // Solo noticias publicadas y no eliminadas
        const result = await noticiasService.getAll(false); // false = no incluir eliminadas
        if (result.success && result.data) {
          // Filtrar solo las publicadas
          const publicadas = result.data.filter(
            (noticia) => noticia.esta_publicada && !noticia.is_deleted
          );
          setNoticias(publicadas);
        }
      } catch (error) {
        console.error("Error fetching noticias:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNoticias();
  }, []);

  // Filtrar noticias según búsqueda y tipo
  const filteredNoticias = noticias.filter((noticia) => {
    const titulo = noticia.titulo || "";
    const subtitulo = noticia.subtitulo || "";
    const matchesSearch =
      titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subtitulo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || noticia.tipo === selectedType;
    return matchesSearch && matchesType;
  });

  // Separar noticias destacadas
  const noticiasDestacadas = filteredNoticias.filter((n) => n.es_destacada);
  const noticiasRegulares = filteredNoticias.filter((n) => !n.es_destacada);

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Fecha no disponible";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para obtener color del tipo (más vibrantes)
  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case "articulo":
        return "bg-blue-500/90 text-white";
      case "evento":
        return "bg-green-500/90 text-white";
      case "enlace":
        return "bg-purple-500/90 text-white";
      default:
        return "bg-primary/90 text-white";
    }
  };

  // Función para obtener ícono del tipo
  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "enlace":
        return <ExternalLink className="h-4 w-4" />;
      case "evento":
        return <Calendar className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Función para obtener patrón visual por tipo cuando no hay imagen
  const getBackgroundPattern = (tipo: string) => {
    switch (tipo) {
      case "articulo":
        return "bg-gradient-to-br from-blue-50 to-blue-100/50";
      case "evento":
        return "bg-gradient-to-br from-green-50 to-green-100/50";
      case "enlace":
        return "bg-gradient-to-br from-purple-50 to-purple-100/50";
      default:
        return "bg-gradient-to-br from-primary/5 to-primary/10";
    }
  };

  // Función para obtener ícono grande por tipo
  const getBigTypeIcon = (tipo: string) => {
    switch (tipo) {
      case "enlace":
        return <ExternalLink className="h-12 w-12" />;
      case "evento":
        return <Calendar className="h-12 w-12" />;
      default:
        return <Newspaper className="h-12 w-12" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando noticias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            Noticias
          </h1>
          <div className="w-16 h-1 bg-gradient-to-r from-primary to-primary/60 mx-auto rounded-full"></div>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Mantente al día con las últimas novedades, eventos y logros de la
          comunidad del CET N°26
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary h-4 w-4" />
          <Input
            placeholder="Buscar noticias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-primary/20 rounded-md px-3 py-2 text-sm bg-background focus:border-primary focus:outline-none"
          >
            <option value="all">Todos los tipos</option>
            <option value="articulo">Artículos</option>
            <option value="evento">Eventos</option>
            <option value="enlace">Enlaces</option>
          </select>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-primary/70 font-medium">
        {filteredNoticias.length}{" "}
        {filteredNoticias.length === 1
          ? "noticia encontrada"
          : "noticias encontradas"}
      </div>

      {/* Noticias Destacadas */}
      {noticiasDestacadas.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg">
              <Star className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Noticias Destacadas
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticiasDestacadas.map((noticia) => (
              <Card
                key={noticia.id}
                className="hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 border-l-4 border-l-primary bg-gradient-to-br from-background to-primary/5 overflow-hidden"
              >
                {/* Imagen o patrón de fondo */}
                {noticia.imagen_url ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={noticia.imagen_url}
                      alt={noticia.titulo || "Imagen de noticia"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                ) : (
                  <div
                    className={`aspect-video relative overflow-hidden ${getBackgroundPattern(
                      noticia.tipo
                    )}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/80 opacity-20">
                        {getBigTypeIcon(noticia.tipo)}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {getTypeIcon(noticia.tipo)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <Badge
                      className={`${getTypeColor(noticia.tipo)} shadow-md`}
                    >
                      <div className="flex items-center gap-1">
                        {getTypeIcon(noticia.tipo)}
                        {noticia.tipo}
                      </div>
                    </Badge>
                    <div className="p-1 bg-gradient-to-br from-primary to-primary/80 rounded-full shadow-md">
                      <Star className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight text-foreground/90">
                    {noticia.titulo}
                  </CardTitle>
                  {noticia.subtitulo && (
                    <CardDescription className="text-sm text-muted-foreground/80">
                      {noticia.subtitulo}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {noticia.resumen_o_contexto_interno && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-3">
                      {noticia.resumen_o_contexto_interno}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">CET N°26</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>{formatDate(noticia.fecha_publicacion)}</span>
                    </div>
                  </div>

                  {noticia.tipo === "enlace_externo" && noticia.url_externa && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                      asChild
                    >
                      <a
                        href={noticia.url_externa}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver enlace
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Noticias Regulares */}
      {noticiasRegulares.length > 0 && (
        <section>
          {noticiasDestacadas.length > 0 && (
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">
              Más Noticias
            </h2>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticiasRegulares.map((noticia) => (
              <Card
                key={noticia.id}
                className="hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:border-primary/20 bg-gradient-to-br from-background to-primary/3 overflow-hidden"
              >
                {/* Imagen o patrón de fondo */}
                {noticia.imagen_url ? (
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={noticia.imagen_url}
                      alt={noticia.titulo || "Imagen de noticia"}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                ) : (
                  <div
                    className={`aspect-video relative overflow-hidden ${getBackgroundPattern(
                      noticia.tipo
                    )}`}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-white/60 opacity-30">
                        {getBigTypeIcon(noticia.tipo)}
                      </div>
                    </div>
                    <div className="absolute top-4 left-4">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {getTypeIcon(noticia.tipo)}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent" />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <Badge
                    className={`${getTypeColor(noticia.tipo)} w-fit shadow-md`}
                  >
                    <div className="flex items-center gap-1">
                      {getTypeIcon(noticia.tipo)}
                      {noticia.tipo}
                    </div>
                  </Badge>
                  <CardTitle className="text-lg leading-tight text-foreground/90">
                    {noticia.titulo}
                  </CardTitle>
                  {noticia.subtitulo && (
                    <CardDescription className="text-sm text-muted-foreground/80">
                      {noticia.subtitulo}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {noticia.resumen_o_contexto_interno && (
                    <p className="text-sm text-muted-foreground/80 line-clamp-3">
                      {noticia.resumen_o_contexto_interno}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <span className="font-medium">CET N°26</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-primary" />
                      <span>{formatDate(noticia.fecha_publicacion)}</span>
                    </div>
                  </div>

                  {noticia.tipo === "enlace_externo" && noticia.url_externa && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-primary/30 text-primary hover:bg-primary hover:text-white transition-colors"
                      asChild
                    >
                      <a
                        href={noticia.url_externa}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Ver enlace
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {filteredNoticias.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">
            No se encontraron noticias
          </h3>
          <p className="text-muted-foreground">
            {searchTerm || selectedType !== "all"
              ? "Intenta ajustar los filtros de búsqueda"
              : "Aún no hay noticias publicadas"}
          </p>
        </div>
      )}
    </div>
  );
}
