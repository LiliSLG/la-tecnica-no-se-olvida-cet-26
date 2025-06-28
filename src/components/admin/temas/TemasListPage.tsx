// =============================================================================
// TemasListPage ACTUALIZADO - Usando nueva interfaz AdminDataTable modernizado
// Ubicación: /src/components/admin/temas/TemasListPage.tsx
// =============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  useDataTableState,
  type DataTableConfig,
} from "@/hooks/useDataTableState";
import {
  AdminDataTable,
  type ColumnConfig,
} from "@/components/shared/data-tables/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import { temasService } from "@/lib/supabase/services/temasService";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  // ✅ Estado local para manejar la lista
  const [temas, setTemas] = useState<Tema[]>(allTemas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);

  // ✅ Actualizar el estado local cuando cambien las props
  useEffect(() => {
    setTemas(allTemas);
  }, [allTemas]);

  // ✅ Configuración de la tabla con nueva interfaz
  const dataTableConfig: DataTableConfig<Tema> = {
    data: temas,
    initialFilters: { is_deleted: false },
    searchFields: ["nombre", "descripcion"],
    filterFields: [
      { key: "is_deleted", label: "Mostrar eliminados", type: "switch" },
    ],
    sortableColumns: ["nombre", "categoria_tema"],
  };

  const tableState = useDataTableState<Tema>(dataTableConfig);

  // ✅ Definir columnas con estilo MODERNO - Consistente con Noticias
  const columns: ColumnConfig<Tema>[] = [
    {
      key: "nombre",
      label: "Nombre",
      sortable: true,
      render: (value, tema) => (
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">
            {value || "Sin nombre"}
          </div>
          {tema.descripcion && (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-1 max-w-md">
              {tema.descripcion}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "categoria_tema",
      label: "Categoría",
      sortable: true,
      render: (value) => {
        if (!value) {
          return (
            <Badge
              variant="secondary"
              className="bg-gray-50 text-gray-600 border-gray-200"
            >
              Sin categoría
            </Badge>
          );
        }

        // Colores por categoría para mejor organización visual
        const getCategoryStyle = (categoria: string) => {
          const styles = {
            tecnologico: "bg-blue-100 text-blue-800 border-blue-200",
            social: "bg-green-100 text-green-800 border-green-200",
            educativo: "bg-purple-100 text-purple-800 border-purple-200",
            ambiental: "bg-emerald-100 text-emerald-800 border-emerald-200",
            agropecuario: "bg-orange-100 text-orange-800 border-orange-200",
            energia: "bg-yellow-100 text-yellow-800 border-yellow-200",
          };
          return (
            styles[categoria as keyof typeof styles] ||
            "bg-gray-100 text-gray-800 border-gray-200"
          );
        };

        return (
          <Badge
            variant="outline"
            className={`font-medium capitalize ${getCategoryStyle(value)}`}
          >
            {value}
          </Badge>
        );
      },
    },
    {
      key: "action_buttons",
      label: "Acciones",
      render: (tema: Tema) => (
        <div className="flex items-center gap-1">
          {!tema.is_deleted ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/admin/temas/${tema.id}`)}
                title="Ver detalles"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Eye className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingTema(tema);
                  setIsModalOpen(true);
                }}
                title="Editar temática"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(tema)}
                title="Eliminar temática"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  if (!user)
                    return toast({
                      title: "Error",
                      description: "Debes iniciar sesión.",
                    });
                  try {
                    await temasService.restore(tema.id);

                    // Actualizar estado local
                    setTemas((prevTemas) =>
                      prevTemas.map((t) =>
                        t.id === tema.id ? { ...t, is_deleted: false } : t
                      )
                    );

                    toast({
                      title: "Éxito",
                      description: "El tema ha sido restaurado.",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "No se pudo restaurar el tema.",
                      variant: "destructive",
                    });
                  }
                }}
                title="Restaurar temática"
                className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
              >
                <Undo2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // ✅ Manejar envío del formulario
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
        const updateData = {
          ...data,
          updated_by_uid: user.id,
          updated_at: new Date().toISOString(),
        };

        const result = await temasService.update(editingTema.id, updateData);

        if (!result.success) {
          toast({
            title: "Error",
            description:
              typeof result.error === "string"
                ? result.error
                : "Error al actualizar",
            variant: "destructive",
          });
          return;
        }

        // Actualizar estado local
        setTemas((prevTemas) =>
          prevTemas.map((tema) =>
            tema.id === editingTema.id ? { ...tema, ...updateData } : tema
          )
        );

        toast({
          title: "Éxito",
          description: "Tema actualizado correctamente.",
        });
      } else {
        const createData = {
          ...data,
          created_by_uid: user.id,
          created_at: new Date().toISOString(),
        };

        const result = await temasService.create(createData);

        if (!result.success) {
          toast({
            title: "Error",
            description:
              typeof result.error === "string"
                ? result.error
                : "Error al crear",
            variant: "destructive",
          });
          return;
        }

        if (result.data) {
          setTemas((prevTemas) => [...prevTemas, result.data!]);
        }

        toast({
          title: "Éxito",
          description: "Tema creado correctamente.",
        });
      }

      setIsModalOpen(false);
      setEditingTema(null);
    } catch (error) {
      console.error("Error saving tema:", error);
      toast({
        title: "Error",
        description: "Error inesperado al guardar el tema.",
        variant: "destructive",
      });
    }
  };

  // Función eliminar (directo, sin confirmación)
  async function handleDelete(tema: Tema) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await temasService.delete(tema.id, user.id);

      if (result.success) {
        setTemas((prevTemas) =>
          prevTemas.map((t) =>
            t.id === tema.id ? { ...t, is_deleted: true } : t
          )
        );

        toast({
          title: "Temática eliminada",
          description:
            "La temática se movió a eliminados. Puedes restaurarla desde el filtro.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "No se pudo eliminar la temática.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la temática.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {/* ✅ AdminDataTable modernizado */}
      <AdminDataTable
        title="Gestión de Temáticas"
        columns={columns}
        config={dataTableConfig}
        state={tableState}
        addLabel="Nueva Temática"
        onAdd={() => {
          setEditingTema(null);
          setIsModalOpen(true);
        }}
        emptyState={{
          title: "No hay temáticas disponibles",
          description:
            "Comienza creando tu primera temática para organizar el contenido.",
          action: {
            label: "Crear Primera Temática",
            onClick: () => {
              setEditingTema(null);
              setIsModalOpen(true);
            },
          },
        }}
      />

      {/* ✅ Modal de formulario sin cambios */}
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
