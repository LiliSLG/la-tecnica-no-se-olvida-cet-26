// /src/components/admin/temas/TemasListPage.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useDataTableState,
  type DataTableConfig,
} from "@/hooks/useDataTableState";
import {
  AdminDataTable,
  type ColumnConfig,
} from "@/components/admin/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import { temasService } from "@/lib/supabase/services/temasService";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Undo2 } from "lucide-react";
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
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemaForm } from "./TemaForm";
import { useAuth } from "@/providers/AuthProvider";

type Tema = Database["public"]["Tables"]["temas"]["Row"];

interface TemasListPageProps {
  allTemas: Tema[];
}

export function TemasListPage({ allTemas }: TemasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [temaToDelete, setTemaToDelete] = useState<Tema | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);

  const dataTableConfig: DataTableConfig<Tema> = {
    data: allTemas, // Usamos directamente los datos de las props
    initialFilters: { is_deleted: false },
    searchFields: ["nombre", "descripcion"],
    filterFields: [
      { key: "is_deleted", label: "Mostrar eliminados", type: "switch" },
    ],
    sortableColumns: ["nombre", "categoria_tema"],
  };

  const tableState = useDataTableState<Tema>(dataTableConfig);

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }
    try {
      if (editingTema) {
        await temasService.update(editingTema.id, {
          ...data,
          updated_by_uid: user.id,
        });
        toast({ title: "Éxito", description: "Tema actualizado." });
      } else {
        await temasService.create({ ...data, created_by_uid: user.id });
        toast({ title: "Éxito", description: "Tema creado." });
      }
      setIsModalOpen(false);
      setEditingTema(null);
      router.refresh(); // La única fuente de verdad para actualizar la lista
    } catch (error) {
      console.error("Error saving tema:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar el tema.",
        variant: "destructive",
      });
    }
  };

  const columns: ColumnConfig<Tema>[] = [
    { key: "nombre", label: "Nombre", sortable: true },
    { key: "categoria_tema", label: "Categoría", sortable: true },
    {
      key: "action_buttons",
      label: "Acciones",
      render: (row: Tema) => (
        <div className="flex items-center gap-2">
          {/* Mostramos este bloque si el tema NO está eliminado */}
          {!row.is_deleted? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push(`/temas/${row.id}`)}
                title="Ver"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditingTema(row);
                  setIsModalOpen(true);
                }}
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTemaToDelete(row)}
                title="Eliminar"
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
                    await temasService.restore(row.id);
                    toast({
                      title: "Éxito",
                      description: "El tema ha sido restaurado.",
                    });
                    router.refresh();
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudo restaurar el tema.",
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
    <>
      <AdminDataTable
        title="Gestión de Temáticas"
        columns={columns}
        config={dataTableConfig}
        state={tableState}
        onAdd={() => {
          setEditingTema(null);
          setIsModalOpen(true);
        }}
        addLabel="Nueva Temática"
      />

      <AlertDialog
        open={!!temaToDelete}
        onOpenChange={() => setTemaToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el tema como eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                // <--- LÓGICA DE BORRADO DIRECTA
                if (!temaToDelete || !user) return;
                try {
                  await temasService.delete(temaToDelete.id, user.id);
                  toast({ title: "Tema eliminado" });
                  router.refresh();
                  setTemaToDelete(null);
                } catch (error) {
                  console.error("Error deleting tema:", error);
                  toast({
                    title: "Error",
                    description: "No se pudo eliminar el tema.",
                    variant: "destructive",
                  });
                }
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTema ? "Editar Temática" : "Crear Nueva Temática"}
            </DialogTitle>
          </DialogHeader>
          <TemaForm
            onSubmit={handleSubmit}
            initialData={editingTema || undefined}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
