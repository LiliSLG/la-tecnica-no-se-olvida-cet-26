// /src/components/public/noticias/NoticiasPublicGrid.tsx
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, User, Eye } from "lucide-react";
import Link from "next/link";
import { SearchInput } from "../common/SearchInput";
import { CategoryFilter } from "../common/CategoryFilter";

// Tipo para noticias públicas (sin campos admin)
type NoticiaPublica = {
  id: string;
  titulo: string;
  subtitulo: string | null;
  fecha_publicacion: string | null;
  tipo: "articulo_propio" | "enlace_externo";
  autor_noticia: string | null;
  fuente_externa: string | null;
  url_externa: string | null;
  contenido: string | null;
  imagen_url: string | null;
  es_destacada: boolean;
  created_by_persona: {
    nombre: string | null;
    apellido: string | null;
  } | null;
};

interface NoticiasPublicGridProps {
  noticias: NoticiaPublica[];
  showSearch?: boolean;
  showFilters?: boolean;
  className?: string;
}

export function NoticiasPublicGrid({
  noticias,
  showSearch = true,
  showFilters = true,
  className = "",
}: NoticiasPublicGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtrado del lado cliente para UX fluida
  const filteredNoticias = useMemo(() => {
    return noticias.filter((noticia) => {
      const matchesSearch =
        !searchTerm ||
        noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.subtitulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        noticia.autor_noticia?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !selectedCategory || noticia.tipo === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [noticias, searchTerm, selectedCategory]);

  // Separar destacadas de regulares
  const noticiasDestacadas = filteredNoticias.filter((n) => n.es_destacada);
  const noticiasRegulares = filteredNoticias.filter((n) => !n.es_destacada);

  // Helper functions
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearAutor = (noticia: NoticiaPublica) => {
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

  const getTipoLabel = (tipo: string) => {
    return tipo === "articulo_propio" ? "Artículo" : "Enlace";
  };

  const getTipoIcon = (tipo: string) => {
    return tipo === "articulo_propio" ? "📝" : "🔗";
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Controles de búsqueda y filtros */}
      {(showSearch || showFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {showSearch && (
            <SearchInput
              placeholder="Buscar noticias..."
              onSearch={setSearchTerm}
              className="w-full sm:w-auto"
            />
          )}

          {showFilters && (
            <CategoryFilter
              onCategoryChange={setSelectedCategory}
              selectedCategory={selectedCategory}
              className="w-full sm:w-auto"
            />
          )}
        </div>
      )}

      {/* Estadísticas de resultados */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {filteredNoticias.length === noticias.length
            ? `${noticias.length} noticias`
            : `${filteredNoticias.length} de ${noticias.length} noticias`}
          {noticiasDestacadas.length > 0 && (
            <span> • {noticiasDestacadas.length} destacadas</span>
          )}
        </div>
      </div>

      {/* Noticias Destacadas */}
      {noticiasDestacadas.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Noticias Destacadas
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              {noticiasDestacadas.length}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticiasDestacadas.map((noticia) => (
              <NoticiaCard
                key={`destacada-${noticia.id}`}
                noticia={noticia}
                isDestacada
              />
            ))}
          </div>
        </section>
      )}

      {/* Noticias Regulares */}
      {noticiasRegulares.length > 0 && (
        <section className="space-y-6">
          {noticiasDestacadas.length > 0 && (
            <h2 className="text-2xl font-bold">Más Noticias</h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {noticiasRegulares.map((noticia) => (
              <NoticiaCard key={noticia.id} noticia={noticia} />
            ))}
          </div>
        </section>
      )}

      {/* Estado vacío */}
      {filteredNoticias.length === 0 && (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                No se encontraron noticias
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "No hay noticias publicadas aún"}
              </p>
            </div>
            {(searchTerm || selectedCategory) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de card individual
function NoticiaCard({
  noticia,
  isDestacada = false,
}: {
  noticia: NoticiaPublica;
  isDestacada?: boolean;
}) {
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatearAutor = (noticia: NoticiaPublica) => {
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

  const getTipoIcon = (tipo: string) => {
    return tipo === "articulo_propio" ? "📝" : "🔗";
  };

  return (
    <Card
      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg overflow-hidden ${
        isDestacada
          ? "border-primary/30 bg-gradient-to-br from-background to-primary/5 hover:shadow-primary/10"
          : "hover:border-primary/20 hover:shadow-primary/5"
      }`}
    >
      {/* Imagen */}
      {noticia.imagen_url ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={noticia.imagen_url}
            alt={noticia.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <span className="text-6xl opacity-30">
            {getTipoIcon(noticia.tipo)}
          </span>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={
              noticia.tipo === "articulo_propio" ? "default" : "secondary"
            }
            className="text-xs"
          >
            {getTipoIcon(noticia.tipo)}{" "}
            {noticia.tipo === "articulo_propio" ? "Artículo" : "Enlace"}
          </Badge>
          {isDestacada && (
            <Badge
              variant="outline"
              className="text-yellow-600 border-yellow-200 bg-yellow-50"
            >
              ⭐ Destacada
            </Badge>
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

      <CardContent className="pt-0 space-y-4">
        {/* Metadata */}
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatearFecha(noticia.fecha_publicacion)}</span>
          </div>

          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate">{formatearAutor(noticia)}</span>
          </div>
        </div>

        {/* Botón de acción */}
        {noticia.tipo === "enlace_externo" && noticia.url_externa ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            asChild
          >
            <a
              href={noticia.url_externa}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver enlace
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            asChild
          >
            <Link href={`/noticias/${noticia.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Leer más
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
