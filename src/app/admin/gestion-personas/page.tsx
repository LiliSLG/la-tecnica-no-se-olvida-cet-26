"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Pencil, Trash2, UserPlus, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { useDataTableState } from "@/lib/hooks/useDataTableState";
import { PersonasService } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Database } from "@/lib/supabase/types/database.types";

type Persona = Database['public']['Tables']['personas']['Row'];

const personasService = new PersonasService(supabase);

export default function PersonasListPage() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [personaToDelete, setPersonaToDelete] = useState<Persona | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const tableState = useDataTableState<Persona>({
    data: personas,
    searchFields: ['nombre', 'apellido', 'email'],
    filterFields: [
      {
        key: 'activo',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'true', label: 'Activo' },
          { value: 'false', label: 'Inactivo' },
        ],
      },
      {
        key: 'categoria_principal',
        label: 'Tipo de alumno',
        type: 'select',
        options: [
          { value: 'estudiante_cet', label: 'Alumno CET' },
          { value: 'exalumno_cet', label: 'Ex-alumno CET' },
          { value: 'ninguno', label: 'No es alumno' },
        ],
      },
      {
        key: 'esta_eliminada',
        label: 'Mostrar eliminados',
        type: 'switch',
      },
    ],
    sortableColumns: ['nombre', 'apellido', 'activo'],
  });

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  const fetchPersonas = async () => {
    try {
      const filters = tableState.filters;
      const queryOptions = {
        filters: {
          esta_eliminada: filters.esta_eliminada ? 'eq.true' : 'eq.false'
        }
      };
      
      console.log('Fetching with filters:', filters);
      const result = await personasService.getAll(queryOptions);
      if (!result.success) {
        throw new Error(result.error?.message || "Error al cargar las personas");
      }
      console.log('API Response:', result.data);
      setPersonas(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar las personas");
      toast.error("Error al cargar las personas");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Current personas state:', personas);
  }, [personas]);

  useEffect(() => {
    console.log('Current tableState:', {
      filters: tableState.filters,
      paginatedData: tableState.paginatedData,
      totalItems: tableState.totalItems
    });
  }, [tableState.filters, tableState.paginatedData, tableState.totalItems]);

  useEffect(() => {
    fetchPersonas();
  }, [tableState.filters.esta_eliminada]);

  const handleDelete = async () => {
    if (!personaToDelete || !currentUserId) return;

    try {
      const result = await personasService.softDelete(personaToDelete.id, currentUserId);
      if (!result.success) {
        throw new Error(result.error?.message || "Error al eliminar la persona");
      }
      toast.success("Persona eliminada exitosamente");
      setPersonaToDelete(null);
      fetchPersonas();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar la persona");
    }
  };

  const getCETStatus = (persona: Persona) => {
    if (persona.es_ex_alumno_cet) return "Exalumno CET";
    if (persona.categoria_principal === "estudiante_cet") return "Alumno CET";
    return "-";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <p className="text-lg text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  const columns = [
    {
      key: 'foto_url' as keyof Persona,
      label: 'Foto',
      className: 'w-[60px]',
      render: (persona: Persona) => (
        <Avatar className="h-10 w-10">
          {persona.foto_url ? (
            <AvatarImage
              src={persona.foto_url}
              alt={`Foto de ${persona.nombre}`}
            />
          ) : (
            <AvatarFallback className="bg-muted text-muted-foreground">
              {persona.nombre && persona.apellido
                ? `${persona.nombre[0]}${persona.apellido[0]}`
                : persona.nombre
                ? persona.nombre[0]
                : "?"}
            </AvatarFallback>
          )}
        </Avatar>
      ),
    },
    {
      key: 'nombre' as keyof Persona,
      label: 'Nombre',
      sortable: true,
      className: 'min-w-[120px] font-medium',
    },
    {
      key: 'apellido' as keyof Persona,
      label: 'Apellido',
      sortable: true,
      className: 'min-w-[120px]',
    },
    {
      key: 'email' as keyof Persona,
      label: 'Email',
      className: 'min-w-[200px] truncate',
      render: (persona: Persona) => persona.email || "-",
    },
    {
      key: 'activo' as keyof Persona,
      label: 'Estado',
      sortable: true,
      className: 'min-w-[100px]',
      render: (persona: Persona) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            persona.activo
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {persona.activo ? "Activo" : "Inactivo"}
        </span>
      ),
    },
    {
      key: 'categoria_principal' as keyof Persona,
      label: 'Alumno/Exalumno',
      className: 'min-w-[120px] text-sm text-muted-foreground',
      render: (persona: Persona) => getCETStatus(persona),
    },
    {
      key: 'id' as keyof Persona,
      label: 'Acciones',
      className: 'w-[120px] text-right',
      render: (persona: Persona) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hover:bg-muted focus:ring-2 focus:ring-offset-2 h-8 w-8"
          >
            <Link href={`/admin/gestion-personas/${persona.id}`}>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Ver</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            asChild
            className="hover:bg-muted focus:ring-2 focus:ring-offset-2 h-8 w-8"
          >
            <Link href={`/admin/gestion-personas/${persona.id}/edit`}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar</span>
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPersonaToDelete(persona)}
            className="hover:bg-red-50 hover:text-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500 h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable
        title="Gestión de Personas"
        data={personas}
        columns={columns}
        config={{
          searchFields: ['nombre', 'apellido', 'email'],
          filterFields: [
            {
              key: 'activo',
              label: 'Estado',
              type: 'select',
              options: [
                { value: 'true', label: 'Activo' },
                { value: 'false', label: 'Inactivo' },
              ],
            },
            {
              key: 'categoria_principal',
              label: 'Tipo de alumno',
              type: 'select',
              options: [
                { value: 'estudiante_cet', label: 'Alumno CET' },
                { value: 'exalumno_cet', label: 'Ex-alumno CET' },
                { value: 'ninguno', label: 'No es alumno' },
              ],
            },
            {
              key: 'esta_eliminada',
              label: 'Mostrar eliminados',
              type: 'switch',
            },
          ],
          sortableColumns: ['nombre', 'apellido', 'activo'],
        }}
        state={tableState}
        onAdd={() => router.push("/admin/gestion-personas/nueva")}
        addLabel="Nueva Persona"
        emptyState={{
          title: "No hay personas registradas",
          description: "Comienza agregando una nueva persona",
          action: {
            label: "Agregar Persona",
            onClick: () => router.push("/admin/gestion-personas/nueva"),
          },
        }}
      />

      <AlertDialog open={!!personaToDelete} onOpenChange={() => setPersonaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la persona{" "}
              <span className="font-medium">
                {personaToDelete?.nombre} {personaToDelete?.apellido}
              </span>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 