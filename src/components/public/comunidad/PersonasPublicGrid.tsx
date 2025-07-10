// src/components/public/comunidad/PersonasPublicGrid.tsx

"use client";

import { useState } from "react";
import { PersonaPublica } from "@/lib/supabase/services/personasService";
import { PersonaCard } from "./PersonaCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Users } from "lucide-react";

interface PersonasPublicGridProps {
  personas: PersonaPublica[];
}

export function PersonasPublicGrid({ personas }: PersonasPublicGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(
    null
  );
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ VALIDACIÓN DE PROPS PARA EVITAR ERRORES
  const personasSeguras = personas || [];

  // Categorías para filtros
  const CATEGORIAS_FILTRO = [
    { value: "estudiante_cet", label: "Estudiantes CET", icon: "🎓" },
    { value: "ex_alumno_cet", label: "Ex-Alumnos CET", icon: "👨‍🎓" },
    { value: "docente_cet", label: "Docentes CET", icon: "👨‍🏫" },
    { value: "comunidad_activa", label: "Comunidad Activa", icon: "🤝" },
    { value: "comunidad_general", label: "Comunidad General", icon: "👥" },
    { value: "profesional_independiente", label: "Profesionales", icon: "💼" },
    { value: "tecnico_especializado", label: "Técnicos", icon: "🔧" },
  ];

  // Áreas populares (extraídas dinámicamente)
  const AREAS_POPULARES = Array.from(
    new Set(
      personasSeguras
        .flatMap((p) => p.areas_de_interes_o_expertise || [])
        .filter(Boolean)
    )
  ).slice(0, 10); // Top 10 áreas

  // Filtrar personas
  const personasFiltradas = personasSeguras.filter((persona) => {
    const matchesSearch =
      searchTerm === "" ||
      persona.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (persona.apellido || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      persona.descripcion_personal_o_profesional
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesCategoria =
      !selectedCategoria || persona.categoria_principal === selectedCategoria;

    const matchesArea =
      !selectedArea ||
      persona.areas_de_interes_o_expertise?.includes(selectedArea);

    return matchesSearch && matchesCategoria && matchesArea;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategoria(null);
    setSelectedArea(null);
  };

  const hasActiveFilters = searchTerm || selectedCategoria || selectedArea;

  return (
    <div className="space-y-8">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {personasFiltradas.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? "Resultados" : "Total miembros"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                personasSeguras.filter((p) =>
                  p.categoria_principal?.includes("cet")
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">CET Family</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {
                personasSeguras.filter((p) =>
                  p.categoria_principal?.includes("profesional")
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Profesionales</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {
                personasSeguras.filter((p) => p.disponible_para_proyectos)
                  .length
              }
            </div>
            <div className="text-sm text-muted-foreground">Disponibles</div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {
                  [selectedCategoria, selectedArea, searchTerm].filter(Boolean)
                    .length
                }
              </Badge>
            )}
          </Button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Filtro por categoría */}
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS_FILTRO.map((categoria) => (
                      <Badge
                        key={categoria.value}
                        variant={
                          selectedCategoria === categoria.value
                            ? "default"
                            : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() =>
                          setSelectedCategoria(
                            selectedCategoria === categoria.value
                              ? null
                              : categoria.value
                          )
                        }
                      >
                        {categoria.icon} {categoria.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Filtro por área de interés */}
                {AREAS_POPULARES.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-3">Áreas de Interés</h3>
                    <div className="flex flex-wrap gap-2">
                      {AREAS_POPULARES.map((area) => (
                        <Badge
                          key={area}
                          variant={
                            selectedArea === area ? "default" : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedArea(selectedArea === area ? null : area)
                          }
                        >
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón limpiar filtros */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grid de personas */}
      {personasFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personasFiltradas.map((persona) => (
            <PersonaCard key={persona.id} persona={persona} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay personas</h3>
            <p className="text-muted-foreground mb-4">
              {hasActiveFilters
                ? "No se encontraron personas con los filtros aplicados."
                : "Aún no hay personas públicas en la comunidad."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
