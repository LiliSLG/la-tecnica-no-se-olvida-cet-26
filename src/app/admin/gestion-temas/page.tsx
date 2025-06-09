"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminDataTable } from "@/components/admin/AdminDataTable";
import { TemasService, MappedTema } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { useToast } from "@/components/ui/use-toast";
import { useDataTableState } from "@/lib/hooks/useDataTableState";

const temasService = new TemasService(supabase);

export default function TemasListPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [temas, setTemas] = useState<MappedTema[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataTableState = useDataTableState<MappedTema>({
    data: temas,
    searchFields: ["nombre", "descripcion"],
    sortableColumns: ["nombre", "descripcion", "categoriaTema"],
    filterFields: [
      {
        key: "categoriaTema",
        label: "Categoría",
        type: "select",
        options: [
          { value: "agropecuario", label: "Agropecuario" },
          { value: "tecnologico", label: "Tecnológico" },
          { value: "social", label: "Social" },
          { value: "ambiental", label: "Ambiental" },
          { value: "educativo", label: "Educativo" },
          { value: "produccion_animal", label: "Producción Animal" },
          { value: "sanidad", label: "Sanidad" },
          { value: "energia", label: "Energía" },
          { value: "recursos_naturales", label: "Recursos Naturales" },
          { value: "manejo_suelo", label: "Manejo de Suelo" },
          { value: "gastronomia", label: "Gastronomía" },
          { value: "otro", label: "Otro" },
        ],
      },
    ],
  });

  useEffect(() => {
    fetchTemas();
  }, []);

  const fetchTemas = async () => {
    try {
      const result = await temasService.getPublicMapped();
      if (!result.success) {
        throw new Error(result.error?.message || "Error al cargar los temas");
      }
      setTemas(result.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los temas");
      toast({
        title: "Error",
        description: "No se pudieron cargar los temas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este tema?")) return;

    try {
      const result = await temasService.delete(id);
      if (!result.success) {
        throw new Error(result.error?.message || "Error al eliminar el tema");
      }
      toast({
        title: "Éxito",
        description: "Tema eliminado correctamente",
      });
      fetchTemas();
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema",
        variant: "destructive",
      });
    }
  };

  const columns = [
    {
      key: "nombre" as keyof MappedTema,
      label: "Nombre",
      sortable: true,
    },
    {
      key: "categoriaTema" as keyof MappedTema,
      label: "Categoría",
      sortable: true,
      render: (tema: MappedTema) => {
        const categoriaLabels: Record<string, string> = {
          agropecuario: "Agropecuario",
          tecnologico: "Tecnológico",
          social: "Social",
          ambiental: "Ambiental",
          educativo: "Educativo",
          produccion_animal: "Producción Animal",
          sanidad: "Sanidad",
          energia: "Energía",
          recursos_naturales: "Recursos Naturales",
          manejo_suelo: "Manejo de Suelo",
          gastronomia: "Gastronomía",
          otro: "Otro",
        };
        return categoriaLabels[tema.categoriaTema] || tema.categoriaTema;
      },
    },
    {
      key: "descripcion" as keyof MappedTema,
      label: "Descripción",
      sortable: true,
    },
    {
      key: "actions" as keyof MappedTema,
      label: "Acciones",
      render: (tema: MappedTema) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/gestion-temas/${tema.id}`)}
            className="hover:bg-muted"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Ver</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/admin/gestion-temas/${tema.id}/editar`)}
            className="hover:bg-muted"
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(tema.id)}
            className="hover:bg-muted hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Eliminar</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      title="Gestión de Temas"
      data={temas}
      columns={columns}
      config={{
        searchFields: ["nombre", "descripcion"],
        filterFields: [
          {
            key: "categoriaTema",
            label: "Categoría",
            type: "select",
            options: [
              { value: "agropecuario", label: "Agropecuario" },
              { value: "tecnologico", label: "Tecnológico" },
              { value: "social", label: "Social" },
              { value: "ambiental", label: "Ambiental" },
              { value: "educativo", label: "Educativo" },
              { value: "produccion_animal", label: "Producción Animal" },
              { value: "sanidad", label: "Sanidad" },
              { value: "energia", label: "Energía" },
              { value: "recursos_naturales", label: "Recursos Naturales" },
              { value: "manejo_suelo", label: "Manejo de Suelo" },
              { value: "gastronomia", label: "Gastronomía" },
              { value: "otro", label: "Otro" },
            ],
          },
        ],
        sortableColumns: ["nombre", "descripcion", "categoriaTema"],
      }}
      state={dataTableState}
      onAdd={() => router.push("/admin/gestion-temas/nuevo")}
      addLabel="Nuevo Tema"
      emptyState={{
        title: "No hay temas disponibles",
        description: "Comienza agregando un nuevo tema",
        action: {
          label: "Agregar Tema",
          onClick: () => router.push("/admin/gestion-temas/nuevo"),
        },
      }}
    />
  );
} 