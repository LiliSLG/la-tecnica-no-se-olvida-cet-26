"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDataTableState } from "@/hooks/useDataTableState";
import { AdminDataTable, ColumnConfig } from "@/components/admin/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import { temasService } from "@/lib/supabase/services/temasService";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
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
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TemaForm } from "./TemaForm";
import { useAuth } from "@/providers/AuthProvider";

type Tema = Database['public']['Tables']['temas']['Row'];

interface TemasClientPageProps {
  allTemas: Tema[];
}

export function TemasClientPage({ allTemas }: TemasClientPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [temas, setTemas] = useState<Tema[]>(allTemas);
  const [temaToDelete, setTemaToDelete] = useState<Tema | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);

  const handleDelete = async (tema: Tema) => {
    if (!user) {
      toast.error("Debes iniciar sesión para eliminar temas");
      return;
    }

    try {
      await temasService.delete(tema.id, user.id);
      setTemas(temas.map(t => 
        t.id === tema.id ? { ...t, esta_eliminada: true } : t
      ));
      toast.success("Tema eliminado correctamente");
    } catch (error) {
      console.error("Error deleting tema:", error);
      toast.error("Error al eliminar el tema");
    } finally {
      setTemaToDelete(null);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!user) {
      toast.error("Debes iniciar sesión para guardar temas");
      return;
    }

    try {
      if (editingTema) {
        const result = await temasService.update(editingTema.id, {
          ...data,
          modificado_por_uid: user.id,
          actualizado_en: new Date().toISOString(),
        });
        if (result.data) {
          setTemas(temas.map(t => t.id === editingTema.id ? result.data! : t));
          toast.success("Tema actualizado correctamente");
        }
      } else {
        const result = await temasService.create({
          ...data,
          ingresado_por_uid: user.id,
          creado_en: new Date().toISOString(),
        });
        if (result.data) {
          setTemas([...temas, result.data]);
          toast.success("Tema creado correctamente");
        }
      }
      setIsModalOpen(false);
      setEditingTema(null);
    } catch (error) {
      console.error("Error saving tema:", error);
      toast.error("Error al guardar el tema");
    }
  };

  const handleView = (temaId: string) => {
    router.push(`/temas/${temaId}`);
  };

  const tableState = useDataTableState({
    data: temas,
    searchFields: ['nombre', 'descripcion'],
    filterFields: [
      {
        key: "categoria_tema",
        label: "Categoría",
        type: "select",
        options: [
          { value: "all", label: "Todas" },
          { value: "TECNICA", label: "Técnica" },
          { value: "HISTORIA", label: "Historia" },
          { value: "CULTURA", label: "Cultura" },
          { value: "COMUNIDAD", label: "Comunidad" },
        ],
      },
    ],
    sortableColumns: ['nombre', 'categoria_tema']
  });

  const columns: ColumnConfig<Tema>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
    },
    {
      key: 'categoria_tema',
      label: 'Categoría',
      sortable: true,
    },
    {
      key: 'action_buttons',
      label: 'Acciones',
      render: (tema) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleView(tema.id)}
            title="Ver detalles"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setEditingTema(tema);
              setIsModalOpen(true);
            }}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTemaToDelete(tema)}
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <AdminDataTable
        title="Gestión de Temas"
        columns={columns}
        config={{
          searchFields: ['nombre', 'descripcion'],
          filterFields: [
            {
              key: "categoria_tema",
              label: "Categoría",
              type: "select",
              options: [
                { value: "all", label: "Todas" },
                { value: "TECNICA", label: "Técnica" },
                { value: "HISTORIA", label: "Historia" },
                { value: "CULTURA", label: "Cultura" },
                { value: "COMUNIDAD", label: "Comunidad" },
              ],
            },
          ],
          sortableColumns: ['nombre', 'categoria_tema']
        }}
        state={tableState}
        onAdd={() => {
          setEditingTema(null);
          setIsModalOpen(true);
        }}
        addLabel="Agregar Tema"
      />

      <AlertDialog open={!!temaToDelete} onOpenChange={() => setTemaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El tema será marcado como eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => temaToDelete && handleDelete(temaToDelete)}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTema ? "Editar Tema" : "Crear Nuevo Tema"}
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