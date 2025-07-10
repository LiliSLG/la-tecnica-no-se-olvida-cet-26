// src/components/admin/comunidad/PersonasListPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { DataTable } from "@/components/shared/data-tables/DataTable";
import { useDataTableState } from "@/hooks/useDataTableState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/components/shared/data-tables/DataTable";
import {
  CATEGORIAS_PERSONA,
  ESTADOS_VERIFICACION,
  getCategoriaColor,
  getEstadoVerificacionColor,
  getCategoriaColor as getCategoriaBadgeColor,
  getCategoriaInfo,
  getEstadoVerificacionInfo,
} from "@/lib/constants/persona";

interface PersonasListPageProps {
  allPersonas: PersonaRow[];
}

export function PersonasListPage({ allPersonas }: PersonasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principales (igual que organizaciones)
  const [personas, setPersonas] = useState<PersonaRow[]>(allPersonas);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [showTypeFilters, setShowTypeFilters] = useState(false);

  // Calcular pendientes totales (igual que organizaciones)
  const pendientesAprobacion = personas.filter(
    (persona) =>
      persona.estado_verificacion === "pendiente_aprobacion" ||
      persona.estado_verificacion === "sin_invitacion"
  ).length;

  useEffect(() => {
    setPersonas(allPersonas);
  }, [allPersonas]);

  // Aplicar filtro rápido (igual que organizaciones)
  const filteredByQuickFilter = quickFilter
    ? personas.filter((persona) => persona?.categoria_principal === quickFilter)
    : personas;

  // Configuración de la tabla (estructura idéntica)
  const dataTableConfig = {
    data: filteredByQuickFilter,
    initialFilters: { is_deleted: false },
    searchFields: [
      "nombre",
      "apellido",
      "email",
      "descripcion_personal_o_profesional",
    ] as (keyof PersonaRow)[],
    filterFields: [
      {
        key: "is_deleted",
        label: "Mostrar eliminados",
        type: "switch" as const,
      },
      {
        key: "categoria_principal",
        label: "Categoría",
        type: "select" as const,
        options: CATEGORIAS_PERSONA.map((cat) => ({
          value: cat.value,
          label: cat.label,
        })),
      },
      {
        key: "estado_verificacion",
        label: "Estado de verificación",
        type: "select" as const,
        options: ESTADOS_VERIFICACION.map((estado) => ({
          value: estado.value,
          label: estado.label,
        })),
      },
      {
        key: "activo",
        label: "Solo activos",
        type: "switch" as const,
      },
      {
        key: "disponible_para_proyectos",
        label: "Disponibles para proyectos",
        type: "switch" as const,
      },
    ],
    sortableColumns: [
      "nombre",
      "apellido",
      "categoria_principal",
      "estado_verificacion",
      "created_at",
    ] as (keyof PersonaRow)[],
  };

  const tableState = useDataTableState(dataTableConfig);

  // Helper functions (igual que organizaciones)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };


  // Mapear categoría a tipo para edición
  const mapCategoriaToTipo = (
    categoria: string
  ): "alumno" | "docente" | "activo" => {
    switch (categoria) {
      case "estudiante_cet":
      case "ex_alumno_cet":
        return "alumno";
      case "docente_cet":
        return "docente";
      case "comunidad_activa":
        return "activo";
      default:
        return "activo";
    }
  };

  // Contar personas por categoría
  const getCountByCategoria = (categoria: string) => {
    return personas.filter(
      (persona) =>
        persona?.categoria_principal === categoria &&
        !(persona?.is_deleted ?? false)
    ).length;
  };

  // Action handlers (igual que organizaciones)
  const handleDelete = async (persona: PersonaRow) => {
    if (!user?.id) return;

    try {
      console.log("🗑️ Deleting persona:", persona.id);
      const result = await personasService.delete(persona.id, user.id);

      if (result.success) {
        toast({
          title: "Miembro eliminado",
          description: `${persona.nombre} ${persona.apellido} ha sido eliminado correctamente.`,
        });

        // Actualizar lista local
        setPersonas((prev) =>
          prev.map((p) =>
            p.id === persona.id
              ? {
                  ...p,
                  is_deleted: true,
                  deleted_at: new Date().toISOString(),
                }
              : p
          )
        );
      } else {
        console.error("❌ Delete error:", result.error);
        toast({
          title: "Error",
          description: result.error?.message || "Error al eliminar el miembro",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error deleting persona:", error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el miembro",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (persona: PersonaRow) => {
    try {
      const result = await personasService.restore(persona.id);

      if (result.success) {
        toast({
          title: "Miembro restaurado",
          description: `${persona.nombre} ${persona.apellido} ha sido restaurado correctamente.`,
        });

        // Actualizar lista local
        setPersonas((prev) =>
          prev.map((p) =>
            p.id === persona.id
              ? { ...p, is_deleted: false, deleted_at: null }
              : p
          )
        );
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "Error al restaurar el miembro",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring persona:", error);
      toast({
        title: "Error",
        description: "Error inesperado al restaurar el miembro",
        variant: "destructive",
      });
    }
  };

  // Configuración de columnas (adaptada para personas)
  const columns: ColumnConfig<PersonaRow>[] = [
    {
      key: "nombre",
      label: "Miembro",
      sortable: true,
      render: (value, persona) => (
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10">
              <AvatarImage src={persona?.foto_url || undefined} />
              <AvatarFallback>
                {persona.nombre?.charAt(0)}
                {persona.apellido?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm">
              {persona.nombre} {persona.apellido}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {persona.email || "Sin email"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "categoria_principal",
      label: "Categoría",
      sortable: true,
      render: (value, persona) => {
        const categoriaInfo = getCategoriaInfo(value);
        return (
          <div className="space-y-1">
            <Badge className={getCategoriaBadgeColor(value)} variant="outline">
              {categoriaInfo.icon} {categoriaInfo.label}
            </Badge>
            {persona.disponible_para_proyectos && (
              <Badge variant="outline" className="text-xs mt-1">
                Disponible para proyectos
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      key: "estado_verificacion",
      label: "Estado",
      sortable: true,
      render: (value) => {
        const estadoInfo = getEstadoVerificacionInfo(value);
        return (
          <Badge
            className={getEstadoVerificacionColor(value)}
            variant="outline"
          >
            {estadoInfo.label}
          </Badge>
        );
      },
    },
    {
      key: "created_at",
      label: "Creado",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
    },
    {
      key: "action_buttons" as keyof PersonaRow,
      label: "Acciones",
      render: (value, persona) => {
        const p = persona || value;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push(`/admin/comunidad/${p?.id}`);
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (p?.id) {
                  router.push(
                    `/admin/comunidad/${p.id}/edit?tipo=${mapCategoriaToTipo(
                      p.categoria_principal || ""
                    )}`
                  );
                }
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {p?.is_deleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRestore(p)}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(p)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header igual que organizaciones */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Gestión de Comunidad
          </h1>
          <p className="text-muted-foreground">
            Gestiona los miembros de la comunidad CET
          </p>
        </div>

        {/* AGREGAR ESTE DIV CON AMBOS BOTONES */}
        <div className="flex items-center gap-4">
          {/* Botón dropdown crear (igual que organizaciones) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Crear Miembro
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => router.push("/admin/comunidad/new?tipo=docente")}
              >
                👨‍🏫 Docente
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/comunidad/new?tipo=alumno")}
              >
                🎓 Alumno
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/admin/comunidad/new?tipo=activo")}
              >
                🤝 Comunidad Activa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* Botón Gestionar Pendientes - NUEVO */}
          <Button
            variant="outline"
            onClick={() => router.push("/admin/comunidad/pendientes")}
            className="flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Gestionar Pendientes ({pendientesAprobacion})
          </Button>
        </div>
      </div>

      {/* Estadísticas en cards (igual que organizaciones) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-primary">
            {
              filteredByQuickFilter.filter((p) => !(p?.is_deleted ?? false))
                .length
            }
          </div>
          <div className="text-sm text-muted-foreground">Total miembros</div>
          <div className="text-xs text-muted-foreground mt-1">
            👥 Registrados en la plataforma
          </div>
        </div>

        <div
          className={`bg-card p-4 rounded-lg border ${
            filteredByQuickFilter.filter(
              (p) => p.estado_verificacion === "pendiente_aprobacion"
            ).length > 0
              ? "border-orange-200 bg-orange-50/50"
              : ""
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              filteredByQuickFilter.filter(
                (p) => p.estado_verificacion === "pendiente_aprobacion"
              ).length > 0
                ? "text-orange-600"
                : "text-yellow-600"
            }`}
          >
            {
              filteredByQuickFilter.filter(
                (p) => p.estado_verificacion === "pendiente_aprobacion"
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">
            Pendientes aprobación
          </div>
          <div
            className={`text-xs mt-1 font-medium ${
              filteredByQuickFilter.filter(
                (p) => p.estado_verificacion === "pendiente_aprobacion"
              ).length > 0
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            {filteredByQuickFilter.filter(
              (p) => p?.estado_verificacion === "pendiente_aprobacion"
            ).length > 0
              ? "⚠️ Requieren tu aprobación"
              : "📝 Sin miembros esperando aprobación"}
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {
              filteredByQuickFilter.filter(
                (p) => p?.estado_verificacion === "verificada"
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">Verificados</div>
          <div className="text-xs text-muted-foreground mt-1">
            ✅ Miembros activos y confirmados
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {
              filteredByQuickFilter.filter((p) => p?.disponible_para_proyectos)
                .length
            }
          </div>
          <div className="text-sm text-muted-foreground">
            Disponibles para proyectos
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            🤝 Disponibles para colaboraciones
          </div>
        </div>
      </div>

      {/* Filtros rápidos (igual que organizaciones) */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Filtrar por categoría:</span>
            <Button
              variant={quickFilter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(null)}
            >
              Todos ({getCountByCategoria("")})
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTypeFilters(!showTypeFilters)}
            className="ml-auto"
          >
            {showTypeFilters ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Ocultar categorías
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Ver todas las categorías
              </>
            )}
          </Button>
        </div>

        {showTypeFilters && (
          <div className="flex flex-wrap gap-2">
            {CATEGORIAS_PERSONA.map((categoria) => {
              const count = getCountByCategoria(categoria.value);
              return (
                <Button
                  key={categoria.value}
                  variant={
                    quickFilter === categoria.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setQuickFilter(
                      quickFilter === categoria.value ? null : categoria.value
                    )
                  }
                  className="text-xs"
                >
                  {categoria.icon} {categoria.label} ({count})
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* DataTable (estructura idéntica) */}
      <DataTable
        columns={columns}
        config={{
          searchFields: dataTableConfig.searchFields,
          filterFields: dataTableConfig.filterFields,
          sortableColumns: dataTableConfig.sortableColumns,
        }}
        state={tableState}
        emptyState={{
          title: quickFilter
            ? "No hay miembros de esta categoría"
            : "No hay miembros",
          description: quickFilter
            ? `Prueba cambiando el filtro de categoría o ajustando los criterios de búsqueda.`
            : "Comienza agregando el primer miembro de la comunidad.",
          action: {
            label: "Crear primer miembro",
            onClick: () => router.push("/admin/comunidad/new?tipo=alumno"),
          },
        }}
      />
    </div>
  );
}
