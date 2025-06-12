"use client";

import { Database } from "@/lib/supabase/types/database.types";
import {
  AdminDataTable,
  ColumnConfig,
} from "@/components/admin/AdminDataTable";
import { useDataTableState } from "@/hooks/useDataTableState";
import { Eye, Pencil, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
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
type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

interface NoticiasClientPageProps {
  allNoticias: Noticia[];
}

export function NoticiasClientPage({ allNoticias }: NoticiasClientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [noticiaToDelete, setNoticiaToDelete] = useState<Noticia | null>(null);

  // 1. Definimos la configuración en un solo lugar.
  const dataTableConfig: DataTableConfig<Noticia> = {
    data: allNoticias, // <-- ¡ASÍ! Ahora usa los datos frescos del servidor
    initialFilters: { esta_eliminada: false },
    searchFields: ["titulo", "tipo", "fecha_publicacion", "esta_publicada"],
    filterFields: [
      { key: "esta_eliminada", label: "Mostrar eliminadas", type: "switch" },
    ],
    sortableColumns: ["titulo", "tipo", "fecha_publicacion"],
  };

  // 2. Le pasamos la configuración al "cerebro" (el hook).
  const state = useDataTableState<Noticia>(dataTableConfig);

  const handleDelete = async () => {
    if (!noticiaToDelete || !user) return;
    try {
      await noticiasService.delete(noticiaToDelete.id, user.id);
      toast({
        title: "Noticia eliminada",
        description: "El noticia se ha marcado como eliminada.",
      });
      router.refresh();
      setNoticiaToDelete(null);
    } catch (error) {
      console.error("Error deleting new:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la noticia.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnConfig<Noticia>[] = [
    { key: "titulo", label: "Título", sortable: true },
    { key: "tipo", label: "Tipo", sortable: true },
    { key: "fecha_publicacion", label: "Fecha", sortable: true },
    { key: "esta_publicada", label: "Publicada", sortable: true },
    {
      key: "action_buttons",
      label: "Acciones",
      render: (noticia: Noticia) => (
        <div className="flex items-center gap-2">
          {/* Mostramos este bloque si el tema NO está eliminado */}
          {!noticia.esta_eliminada ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/admin/noticias/${noticia.id}`)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(`/admin/noticias/${noticia.id}/edit`)
                }
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNoticiaToDelete(noticia)}
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            // Y mostramos este otro bloque si la noticia SÍ está eliminado
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
                    await noticiasService.restore(noticia.id);
                    toast({
                      title: "Éxito",
                      description: "La noticia ha sido restaurada.",
                    });
                    router.refresh();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudo restaurar la noticia.",
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
      <AdminDataTable
        title="Gestión de Noticias"
        columns={columns}
        config={dataTableConfig} // <-- 3. Le pasamos la MISMA configuración al "cuerpo" (la tabla)
        state={state}
        addLabel="Nueva Noticia"
        onAdd={() => router.push("/admin/noticias/new")}
      />

      <AlertDialog
        open={!!noticiaToDelete}
        onOpenChange={() => setNoticiaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará la noticia como eliminada. Podrá restaurarla
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
