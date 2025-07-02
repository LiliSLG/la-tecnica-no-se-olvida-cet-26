// src/components/public/organizaciones/OrganizacionesPublicGrid.tsx

"use client";

import { useState } from "react"; // ✅ IMPORTANTE: Verificar este import
import { OrganizacionRow } from "@/lib/supabase/services/organizacionesService";
import { OrganizacionCard } from "./OrganizacionCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, X, Building } from "lucide-react";

interface OrganizacionesPublicGridProps {
  organizaciones: OrganizacionRow[];
}

export function OrganizacionesPublicGrid({
  organizaciones,
}: OrganizacionesPublicGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // ✅ VALIDACIÓN DE PROPS PARA EVITAR ERRORES
  const organizacionesSeguras = organizaciones || [];


  // Resto del componente igual...
  // Tipos de organización para filtros
  const TIPOS_FILTRO = [
    { value: "empresa", label: "Empresas", icon: "🏢" },
    {
      value: "institucion_educativa",
      label: "Instituciones Educativas",
      icon: "🎓",
    },
    { value: "ONG", label: "ONGs", icon: "🤝" },
    {
      value: "establecimiento_ganadero",
      label: "Establecimientos Ganaderos",
      icon: "🐄",
    },
    {
      value: "organismo_gubernamental",
      label: "Organismos Gubernamentales",
      icon: "🏛️",
    },
    { value: "cooperativa", label: "Cooperativas", icon: "👥" },
    { value: "otro", label: "Otros", icon: "📋" },
  ];

  const AREAS_POPULARES = [
    "Agropecuario",
    "Tecnología",
    "Educación",
    "Producción Animal",
    "Desarrollo Social",
    "Investigación",
  ];

  // Filtrar organizaciones usando el array seguro
  const organizacionesFiltradas = organizacionesSeguras.filter((org) => {
    const matchesSearch =
      searchTerm === "" ||
      org.nombre_oficial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.nombre_fantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTipo = !selectedTipo || org.tipo === selectedTipo;

    const matchesArea =
      !selectedArea || org.areas_de_interes?.includes(selectedArea);

    return matchesSearch && matchesTipo && matchesArea;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTipo(null);
    setSelectedArea(null);
  };

  const hasActiveFilters = searchTerm || selectedTipo || selectedArea;

  return (
    <div className="space-y-8">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {organizacionesFiltradas.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {hasActiveFilters ? "Resultados" : "Total organizaciones"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                organizacionesSeguras.filter((org) => org.tipo === "empresa")
                  .length
              }
            </div>
            <div className="text-sm text-muted-foreground">Empresas</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {
                organizacionesSeguras.filter(
                  (org) => org.tipo === "institucion_educativa"
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Instituciones</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {
                organizacionesSeguras.filter(
                  (org) => org.tipo === "establecimiento_ganadero"
                ).length
              }
            </div>
            <div className="text-sm text-muted-foreground">Est. Ganaderos</div>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y filtros */}
      <div className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar organizaciones por nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-base"
          />
        </div>

        {/* Toggle filtros */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {
                  [searchTerm, selectedTipo, selectedArea].filter(Boolean)
                    .length
                }
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="text-sm">
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Filtro por tipo */}
              <div>
                <h3 className="font-medium mb-2">Tipo de Organización</h3>
                <div className="flex flex-wrap gap-2">
                  {TIPOS_FILTRO.map((tipo) => (
                    <Button
                      key={tipo.value}
                      variant={
                        selectedTipo === tipo.value ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setSelectedTipo(
                          selectedTipo === tipo.value ? null : tipo.value
                        )
                      }
                      className="flex items-center gap-1"
                    >
                      <span>{tipo.icon}</span>
                      {tipo.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Filtro por área */}
              <div>
                <h3 className="font-medium mb-2">Áreas de Interés</h3>
                <div className="flex flex-wrap gap-2">
                  {AREAS_POPULARES.map((area) => (
                    <Button
                      key={area}
                      variant={selectedArea === area ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedArea(selectedArea === area ? null : area)
                      }
                    >
                      {area}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Grid de organizaciones */}
      {organizacionesFiltradas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {organizacionesFiltradas.map((organizacion) => (
            <OrganizacionCard
              key={organizacion.id}
              organizacion={organizacion}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {hasActiveFilters
                ? "No se encontraron organizaciones"
                : "No hay organizaciones disponibles"}
            </h3>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Intenta ajustar los filtros para encontrar más resultados."
                : "Necesitamos crear organizaciones verificadas para mostrar."}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Limpiar filtros
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}