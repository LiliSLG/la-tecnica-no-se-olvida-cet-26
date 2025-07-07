//src/components/admin/comunidad/PersonasListPage.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDataTableState } from "@/hooks/useDataTableState";
import { DataTable } from "@/components/shared/data-tables/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PersonaRow } from "@/lib/supabase/services/personasService";
import {
  Plus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Users,
  GraduationCap,
  UserCheck,
  Building,
} from "lucide-react";
import { ColumnConfig } from "@/components/shared/data-tables/DataTable";
import { DataTableConfig } from "@/hooks/useDataTableState";

interface PersonasListPageProps {
  allPersonas: PersonaRow[];
}

// Constantes para filtros
const CATEGORIAS_PERSONA = [
  { value: "docente_cet", label: "Docente CET", icon: "👨‍🏫", color: "blue" },
  {
    value: "estudiante_cet",
    label: "Estudiante CET",
    icon: "🎓",
    color: "green",
  },
  {
    value: "ex_alumno_cet",
    label: "Ex Alumno CET",
    icon: "🎓",
    color: "purple",
  },
  {
    value: "comunidad_activa",
    label: "Comunidad Activa",
    icon: "🤝",
    color: "orange",
  },
  {
    value: "comunidad_general",
    label: "Comunidad General",
    icon: "👥",
    color: "gray",
  },
];

const ESTADOS_VERIFICACION = [
  { value: "sin_invitacion", label: "Sin invitación", color: "gray" },
  { value: "pendiente_aprobacion", label: "Pendiente", color: "yellow" },
  { value: "invitacion_enviada", label: "Invitación enviada", color: "blue" },
  { value: "verificada", label: "Verificada", color: "green" },
  { value: "rechazada", label: "Rechazada", color: "red" },
];

export function PersonasListPage({ allPersonas }: PersonasListPageProps) {
  const router = useRouter();
  const [quickFilter, setQuickFilter] = useState<string>("all");

  // Filtro rápido por categoría
  const filteredByQuickFilter =
    quickFilter === "all"
      ? allPersonas
      : allPersonas.filter(
          (persona) => persona?.categoria_principal === quickFilter
        );

  // Configuración de la tabla
  const dataTableConfig: DataTableConfig<PersonaRow> = {
    data: filteredByQuickFilter,
    initialFilters: { is_deleted: false },
    searchFields: [
      "nombre",
      "apellido",
      "email",
      "descripcion_personal_o_profesional",
    ],
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
        label: "Estado verificación",
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
    ],
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

  const getCategoriaColor = (categoria: string | null) => {
    const catInfo = CATEGORIAS_PERSONA.find((c) => c.value === categoria);
    switch (catInfo?.color) {
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "green":
        return "bg-green-100 text-green-800";
      case "purple":
        return "bg-purple-100 text-purple-800";
      case "orange":
        return "bg-orange-100 text-orange-800";
      case "gray":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstadoColor = (estado: string | null) => {
    const estadoInfo = ESTADOS_VERIFICACION.find((e) => e.value === estado);
    switch (estadoInfo?.color) {
      case "green":
        return "bg-green-100 text-green-800";
      case "blue":
        return "bg-blue-100 text-blue-800";
      case "yellow":
        return "bg-yellow-100 text-yellow-800";
      case "red":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  // Configuración de columnas
  const columns: ColumnConfig<PersonaRow>[] = [
    {
      key: "nombre",
      label: "Miembro",
      sortable: true,
      render: (value: any, persona: PersonaRow) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={persona.foto_url || undefined} />
            <AvatarFallback>
              {persona.nombre?.charAt(0)}
              {persona.apellido?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {persona.nombre} {persona.apellido}
            </div>
            <div className="text-sm text-muted-foreground">
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
      render: (value: string | null) => {
        const categoria = CATEGORIAS_PERSONA.find((c) => c.value === value);
        return (
          <Badge className={getCategoriaColor(value)}>
            {categoria?.icon} {categoria?.label || value}
          </Badge>
        );
      },
    },
    {
      key: "estado_verificacion",
      label: "Estado",
      sortable: true,
      render: (value: string | null) => {
        const estado = ESTADOS_VERIFICACION.find((e) => e.value === value);
        return (
          <Badge variant="outline" className={getEstadoColor(value)}>
            {estado?.label || value}
          </Badge>
        );
      },
    },
    {
      key: "activo",
      label: "Estado",
      render: (value: boolean, persona: PersonaRow) => (
        <div className="space-y-1">
          <Badge variant={value ? "default" : "secondary"}>
            {value ? "Activo" : "Inactivo"}
          </Badge>
          {persona.disponible_para_proyectos && (
            <Badge variant="outline" className="text-xs">
              Disponible
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Creado",
      sortable: true,
      render: (value: string) => (
        <div className="text-sm text-muted-foreground">{formatDate(value)}</div>
      ),
    },
    // ✅ COLUMNA DE ACCIONES con key correcto
    {
      key: "action_buttons" as `action_${string}`,
      label: "Acciones",
      render: (persona: PersonaRow) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/admin/comunidad/${persona?.id}`)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(
                `/admin/comunidad/${persona?.id}/edit?tipo=${mapCategoriaToTipo(
                  persona?.categoria_principal || ""
                )}`
              )
            }
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // TODO: Implementar delete con confirmación
              console.log("Delete persona:", persona?.id);
            }}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  

  return (
    <div className="space-y-6">
      {/* Header con botón crear */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Comunidad
          </h1>
          <p className="text-muted-foreground">
            Gestiona los miembros de la comunidad CET
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
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
      </div>

      {/* Filtros rápidos por categoría */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={quickFilter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setQuickFilter("all")}
        >
          Todos ({allPersonas.length})
        </Button>
        {CATEGORIAS_PERSONA.map((categoria) => {
          const count = allPersonas.filter(
            (p) => p.categoria_principal === categoria.value
          ).length;
          return (
            <Button
              key={categoria.value}
              variant={quickFilter === categoria.value ? "default" : "outline"}
              size="sm"
              onClick={() => setQuickFilter(categoria.value)}
            >
              {categoria.icon} {categoria.label} ({count})
            </Button>
          );
        })}
      </div>

      {/* DataTable */}
      <DataTable<PersonaRow>
        columns={columns}
        config={{
          searchFields: dataTableConfig.searchFields,
          filterFields: dataTableConfig.filterFields,
          sortableColumns: dataTableConfig.sortableColumns,
        }}
        state={tableState}
        emptyState={{
          title: "No hay miembros registrados",
          description: "Comienza agregando el primer miembro de la comunidad",
          action: {
            label: "Crear primer miembro",
            onClick: () => router.push("/admin/comunidad/new?tipo=alumno"),
          },
        }}
      />
    </div>
  );
}
