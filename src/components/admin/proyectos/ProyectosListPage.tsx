"use client";

import { Database } from "@/lib/supabase/types/database.types";
import {
  DataTable,
  ColumnConfig,
} from "@/components/shared/data-tables/DataTable";
import { useDataTableState } from "@/hooks/useDataTableState";
import { Eye, Pencil, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { useToast } from "@/components/ui/use-toast";
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
import { DataTableConfig } from "@/hooks/useDataTableState";
type Proyecto = Database["public"]["Tables"]["proyectos"]["Row"];

interface ProyectosListPageProps {
  allProyectos: Proyecto[];
}

export function ProyectosListPage({ allProyectos }: ProyectosListPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [proyectoToDelete, setProyectoToDelete] = useState<Proyecto | null>(
    null
  );

  // 1. Definimos la configuración en un solo lugar.
  const dataTableConfig: DataTableConfig<Proyecto> = {
    data: allProyectos, // <-- ¡ASÍ! Ahora usa los datos frescos del servidor
    initialFilters: { is_deleted: false },
    searchFields: ["titulo", "descripcion_general"],
    filterFields: [
      { key: "is_deleted", label: "Mostrar eliminados", type: "switch" },
    ],
    sortableColumns: ["titulo", "ano_proyecto", "estado_actual"],
  };

  // 2. Le pasamos la configuración al "cerebro" (el hook).
  const state = useDataTableState<Proyecto>(dataTableConfig);

  const handleDelete = async () => {
    if (!proyectoToDelete || !user) return;
    try {
      await proyectosService.delete(proyectoToDelete.id, user.id);
      toast({
        title: "Proyecto eliminado",
        description: "El proyecto se ha marcado como eliminado.",
      });
      router.refresh();
      setProyectoToDelete(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el proyecto.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnConfig<Proyecto>[] = [
    { key: "titulo", label: "Título", sortable: true },
    { key: "ano_proyecto", label: "Año", sortable: true },
    { key: "estado_actual", label: "Estado", sortable: true },
    {
      key: "action_buttons",
      label: "Acciones",
      render: (proyecto: Proyecto) => (
        <div className="flex items-center gap-2">
          {/* Mostramos este bloque si el tema NO está eliminado */}
          {!proyecto.is_deleted? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/admin/proyectos/${proyecto.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(`/admin/proyectos/${proyecto.id}/edit`)
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setProyectoToDelete(proyecto)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            // Y mostramos este otro bloque si el tema SÍ está eliminado
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                  if (!user)
                    return toast({
                      title: "Error",
                      description: "Debes iniciar sesión.",
                    });
                  try {
                    await proyectosService.restore(proyecto.id);
                    toast({
                      title: "Éxito",
                      description: "El proyecto ha sido restaurado.",
                    });
                    router.refresh();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudo restaurar el proyecto.",
                      variant: "destructive",
                    });
                  }
                }}
                title="Restaurar"
              >
                <Undo2 className="h-4 w-4 text-green-600" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <DataTable
        title="Gestión de Proyectos"
        columns={columns}
        config={dataTableConfig} // <-- 3. Le pasamos la MISMA configuración al "cuerpo" (la tabla)
        state={state}
        addLabel="Nuevo Proyecto"
        onAdd={() => router.push("/admin/proyectos/new")}
      />

      <AlertDialog
        open={!!proyectoToDelete}
        onOpenChange={() => setProyectoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el proyecto como eliminado. Podrá restaurarlo
              más tarde.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
