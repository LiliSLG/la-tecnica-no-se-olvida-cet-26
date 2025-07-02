// src/components/admin/organizaciones/OrganizacionesListPage.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { DataTable } from "@/components/shared/data-tables/DataTable";
import { useDataTableState } from "@/hooks/useDataTableState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "@/components/shared/data-tables/DataTable";
// 🆕 DEFINICIÓN TEMPORAL DE TIPOS (hasta actualizar el schema)
const TIPOS_ORGANIZACION = [
  { value: "empresa", label: "Empresa", icon: "🏢" },
  {
    value: "institucion_educativa",
    label: "Institución Educativa",
    icon: "🎓",
  },
  { value: "ONG", label: "ONG", icon: "🤝" },
  {
    value: "establecimiento_ganadero",
    label: "Establecimiento Ganadero",
    icon: "🐄",
  },
  {
    value: "organismo_gubernamental",
    label: "Organismo Gubernamental",
    icon: "🏛️",
  },
  { value: "cooperativa", label: "Cooperativa", icon: "👥" },
  { value: "otro", label: "Otro", icon: "📋" },
] as const;

const ESTADOS_VERIFICACION = [
  { value: "sin_invitacion", label: "Sin invitación", color: "gray" },
  {
    value: "pendiente_aprobacion",
    label: "Pendiente aprobación",
    color: "yellow",
  },
  { value: "invitacion_enviada", label: "Invitación enviada", color: "blue" },
  { value: "verificada", label: "Verificada", color: "green" },
  { value: "rechazada", label: "Rechazada", color: "red" },
] as const;

interface OrganizacionesListPageProps {
  allOrganizaciones: OrganizacionRow[];
}

export function OrganizacionesListPage({
  allOrganizaciones,
}: OrganizacionesListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [organizaciones, setOrganizaciones] =
    useState<OrganizacionRow[]>(allOrganizaciones);

  // 🆕 Estado para filtros rápidos y toggle de expansión
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  const [showTypeFilters, setShowTypeFilters] = useState(false);

  // ✅ AGREGAR: Calcular pendientes totales
  const pendientesAprobacion = organizaciones.filter(
    (org) =>
      org.estado_verificacion === "pendiente_aprobacion" ||
      org.estado_verificacion === "sin_invitacion"
  ).length;

  useEffect(() => {
    setOrganizaciones(allOrganizaciones);
  }, [allOrganizaciones]);

  // 🆕 Aplicar filtro rápido con verificación de seguridad
  const filteredByQuickFilter = quickFilter
    ? organizaciones.filter((org) => org?.tipo === quickFilter)
    : organizaciones;

  // Configuración de la tabla usando el patrón correcto
  const dataTableConfig = {
    data: filteredByQuickFilter, // 🆕 Usar datos filtrados
    initialFilters: { is_deleted: false },
    searchFields: [
      "nombre_oficial",
      "nombre_fantasia",
      "descripcion",
      "email_contacto",
    ] as (keyof OrganizacionRow)[],
    filterFields: [
      {
        key: "is_deleted",
        label: "Mostrar eliminadas",
        type: "switch" as const,
      },
      {
        key: "tipo",
        label: "Tipo de organización",
        type: "select" as const,
        options: TIPOS_ORGANIZACION.map((tipo) => ({
          value: tipo.value,
          label: tipo.label,
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
        key: "abierta_a_colaboraciones",
        label: "Solo abiertas a colaboración",
        type: "switch" as const,
      },
    ],
    sortableColumns: [
      "nombre_oficial",
      "tipo",
      "estado_verificacion",
      "created_at",
    ] as (keyof OrganizacionRow)[],
  };

  const tableState = useDataTableState(dataTableConfig);

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEstadoColor = (estado: string | null) => {
    const estadoInfo = ESTADOS_VERIFICACION.find((e) => e.value === estado);
    switch (estadoInfo?.color) {
      case "green":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "red":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  // Helper function para obtener colores por tipo de organización
  const getTipoColor = (tipo: string | null) => {
    const colorMap = {
      empresa: "bg-blue-100 text-blue-800 border-blue-200",
      institucion_educativa: "bg-purple-100 text-purple-800 border-purple-200",
      ONG: "bg-green-100 text-green-800 border-green-200",
      establecimiento_ganadero:
        "bg-orange-100 text-orange-800 border-orange-200",
      organismo_gubernamental:
        "bg-indigo-100 text-indigo-800 border-indigo-200",
      cooperativa: "bg-yellow-100 text-yellow-800 border-yellow-200",
      otro: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      colorMap[tipo as keyof typeof colorMap] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getTipoLabel = (tipo: string | null) => {
    const tipoInfo = TIPOS_ORGANIZACION.find((t) => t.value === tipo);
    return tipoInfo?.label || tipo || "Sin tipo";
  };

  // 🆕 Función para obtener icono por tipo
  const getTipoIcon = (tipo: string | null) => {
    const tipoInfo = TIPOS_ORGANIZACION.find((t) => t.value === tipo);
    return tipoInfo?.icon || "🏢";
  };

  // 🆕 Contar organizaciones por tipo con verificación
  const getCountByTipo = (tipo: string) => {
    return organizaciones.filter(
      (org) => org?.tipo === tipo && !(org?.is_deleted ?? false)
    ).length;
  };

  // Actions handlers
  const handleDelete = async (organizacion: OrganizacionRow) => {
    if (!user?.id) return;

    try {
      console.log("🗑️ Deleting organization:", organizacion.id);
      const result = await organizacionesService.delete(
        organizacion.id,
        user.id
      );

      if (result.success) {
        toast({
          title: "Organización eliminada",
          description: `${organizacion.nombre_oficial} ha sido eliminada correctamente.`,
        });

        // Actualizar lista local
        setOrganizaciones((prev) =>
          prev.map((org) =>
            org.id === organizacion.id
              ? {
                  ...org,
                  is_deleted: true,
                  deleted_at: new Date().toISOString(),
                }
              : org
          )
        );
      } else {
        console.error("❌ Delete error:", result.error);
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al eliminar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("❌ Error deleting organizacion:", error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la organización",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async (organizacion: OrganizacionRow) => {
    try {
      const result = await organizacionesService.restore(organizacion.id);

      if (result.success) {
        toast({
          title: "Organización restaurada",
          description: `${organizacion.nombre_oficial} ha sido restaurada correctamente.`,
        });

        // Actualizar lista local
        setOrganizaciones((prev) =>
          prev.map((org) =>
            org.id === organizacion.id
              ? { ...org, is_deleted: false, deleted_at: null }
              : org
          )
        );
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al restaurar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring organizacion:", error);
      toast({
        title: "Error",
        description: "Error inesperado al restaurar la organización",
        variant: "destructive",
      });
    }
  };

  // Definir columnas simplificadas
  const columns: ColumnConfig<OrganizacionRow>[] = [
    {
      key: "nombre_oficial",
      label: "Organización",
      sortable: true,
      render: (value, organizacion) => (
        <div className="flex items-center gap-3 min-w-0">
          {/* ✅ NUEVO: Avatar con logo */}
          <div className="flex-shrink-0">
            {organizacion?.logo_url ? (
              <img
                src={organizacion.logo_url}
                alt={`Logo de ${value}`}
                className="w-10 h-10 object-contain rounded-full border bg-white"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg font-semibold text-muted-foreground">
                {getTipoIcon(organizacion?.tipo)}
              </div>
            )}
          </div>

          {/* Información de la organización */}
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground">
              {value || "Sin nombre"}
            </div>
            {organizacion?.nombre_fantasia && (
              <div className="text-sm text-muted-foreground mt-1">
                {organizacion.nombre_fantasia}
              </div>
            )}
            {/* Áreas de interés - Solo las primeras 2 */}
            {organizacion?.areas_de_interes &&
              organizacion.areas_de_interes.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {organizacion.areas_de_interes.slice(0, 2).map((area) => (
                    <Badge key={area} variant="outline" className="text-xs">
                      {area}
                    </Badge>
                  ))}
                  {organizacion.areas_de_interes.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{organizacion.areas_de_interes.length - 2} más
                    </Badge>
                  )}
                </div>
              )}
          </div>
        </div>
      ),
    },
    {
      key: "tipo",
      label: "Tipo",
      sortable: true,
      render: (value) => (
        <Badge
          variant="outline"
          className={cn("font-medium capitalize", getTipoColor(value))}
        >
          {getTipoLabel(value)}
        </Badge>
      ),
    },
    {
      key: "estado_verificacion",
      label: "Estado",
      sortable: true,
      render: (value) => {
        const estadoInfo = ESTADOS_VERIFICACION.find((e) => e.value === value);
        return (
          <Badge className={cn("text-xs", getEstadoColor(value))}>
            {estadoInfo?.label || value || "Sin estado"}
          </Badge>
        );
      },
    },
    {
      key: "email_contacto",
      label: "Contacto",
      render: (value, organizacion) => (
        <div className="text-sm">
          {value && <div className="text-muted-foreground">{value}</div>}
          {organizacion?.telefono_contacto && (
            <div className="text-muted-foreground text-xs mt-1">
              {organizacion.telefono_contacto}
            </div>
          )}
          {organizacion?.abierta_a_colaboraciones && (
            <Badge variant="outline" className="text-xs mt-1">
              Abierta a colaboración
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Creada",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
    },
    {
      key: "action_buttons" as keyof OrganizacionRow,
      label: "Acciones",
      render: (value, organizacion) => {
        // 🔧 FIX: La DataTable está pasando el objeto completo como 'value'
        const org = organizacion || value;

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push(`/admin/organizaciones/${org?.id}`);
              }}
              className="h-8 w-8 p-0"
            >
              <Eye className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (org?.id) {
                  router.push(`/admin/organizaciones/${org.id}/edit`);
                }
              }}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>

            {org?.is_deleted ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleRestore(org);
                }}
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleDelete(org);
                }}
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Gestión de Organizaciones
          </h1>
          <p className="text-muted-foreground">
            Administra las organizaciones colaboradoras del CET N°26
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => router.push("/admin/organizaciones/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Organización
          </Button>

          {/* ✅ NUEVO: Botón de gestionar pendientes */}
          {pendientesAprobacion > 0 && (
            <Button
              variant="outline"
              onClick={() => router.push("/admin/organizaciones/pendientes")}
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Gestionar Pendientes ({pendientesAprobacion})
            </Button>
          )}
        </div>
      </div>

      {/* 🆕 ALERTA DE PENDIENTES CRÍTICAS */}
      {filteredByQuickFilter.filter(
        (o) => o?.estado_verificacion === "pendiente_aprobacion"
      ).length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-orange-500 text-lg">⚠️</div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-800">
                Tienes{" "}
                {
                  filteredByQuickFilter.filter(
                    (o) => o?.estado_verificacion === "pendiente_aprobacion"
                  ).length
                }{" "}
                organizaciones esperando tu aprobación
              </h3>
              <p className="text-sm text-orange-700 mt-1">
                Estas organizaciones fueron agregadas por alumnos y necesitan tu
                revisión. Una vez aprobadas, se enviará automáticamente una
                invitación a la organización para que puedan reclamar su perfil.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  onClick={() => {
                    setQuickFilter(null);
                    console.log("Filtrar pendientes de aprobación");
                  }}
                >
                  Ver pendientes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-orange-600 hover:text-orange-700"
                  onClick={() => {
                    // TODO: Navegar a guía de workflow
                    console.log("Mostrar guía de workflow");
                  }}
                >
                  ¿Cómo funciona?
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold">
            {
              filteredByQuickFilter.filter((o) => !(o?.is_deleted ?? false))
                .length
            }
          </div>
          <div className="text-sm text-muted-foreground">
            {quickFilter ? "En esta categoría" : "Organizaciones activas"}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            💡 Total de organizaciones disponibles
          </div>
        </div>

        {/* Sin verificar */}
        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-gray-600">
            {
              filteredByQuickFilter.filter(
                (o) => o?.estado_verificacion === "sin_invitacion"
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">Sin verificar</div>
          <div className="text-xs text-muted-foreground mt-1">
            📋 Creadas por admin, sin invitación enviada
          </div>
        </div>

        {/* Pendientes de aprobación - CONDICIONAL */}

        <div
          className={`bg-card p-4 rounded-lg border ${
            filteredByQuickFilter.filter(
              (o) => o.estado_verificacion === "pendiente_aprobacion"
            ).length > 0
              ? "border-orange-200 bg-orange-50/50"
              : ""
          }`}
        >
          <div
            className={`text-2xl font-bold ${
              filteredByQuickFilter.filter(
                (o) => o.estado_verificacion === "pendiente_aprobacion"
              ).length > 0
                ? "text-orange-600"
                : "text-yellow-600"
            }`}
          >
            {
              filteredByQuickFilter.filter(
                (o) => o.estado_verificacion === "pendiente_aprobacion"
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">
            Pendientes aprobación
          </div>
          <div
            className={`text-xs mt-1 font-medium ${
              filteredByQuickFilter.filter(
                (o) => o.estado_verificacion === "pendiente_aprobacion"
              ).length > 0
                ? "text-orange-600"
                : "text-muted-foreground"
            }`}
          >
            {filteredByQuickFilter.filter(
              (o) => o?.estado_verificacion === "pendiente_aprobacion"
            ).length > 0
              ? "⚠️ Agregadas por alumnos - Requieren tu aprobación"
              : "📝 Sin organizaciones esperando aprobación"}
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-green-600">
            {
              filteredByQuickFilter.filter(
                (o) => o?.estado_verificacion === "verificada"
              ).length
            }
          </div>
          <div className="text-sm text-muted-foreground">Verificadas</div>
          <div className="text-xs text-muted-foreground mt-1">
            ✅ Organizaciones activas y confirmadas
          </div>
        </div>

        <div className="bg-card p-4 rounded-lg border">
          <div className="text-2xl font-bold text-blue-600">
            {
              filteredByQuickFilter.filter((o) => o?.abierta_a_colaboraciones)
                .length
            }
          </div>
          <div className="text-sm text-muted-foreground">
            Abiertas a colaboración
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            🤝 Disponibles para proyectos conjuntos
          </div>
        </div>
      </div>

      {/* Tabla usando la estructura correcta */}
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
            ? "No hay organizaciones de este tipo"
            : "No hay organizaciones",
          description: quickFilter
            ? `No se encontraron organizaciones de tipo "${getTipoLabel(
                quickFilter
              )}".`
            : "Comienza creando tu primera organización para gestionar colaboraciones.",
          action: {
            label: "Nueva Organización",
            onClick: () => router.push("/admin/organizaciones/new"),
          },
        }}
      />
    </div>
  );
}
