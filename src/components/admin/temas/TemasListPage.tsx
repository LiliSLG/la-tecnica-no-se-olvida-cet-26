// =============================================================================
// TemasListPage MIGRADO - Usando AdminDataTable mejorado
// Ubicación: /src/components/admin/temas/TemasListPage.tsx
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 🔄 CAMBIOS EN IMPORTS
import {
  AdminDataTable,
  DataTableColumn,
  DataTableAction,
} from "@/components/admin/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import { temasService } from "@/lib/supabase/services/temasService";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
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

  // ✅ Estados simplificados
  const [temas, setTemas] = useState<Tema[]>(allTemas);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTema, setEditingTema] = useState<Tema | null>(null);

  // 🆕 Estados para el AdminDataTable mejorado
  const [searchValue, setSearchValue] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Fijo en 10

  useEffect(() => {
    setTemas(allTemas);
    setCurrentPage(1); // Reset página al cambiar datos
  }, [allTemas]);

  // 🆕 Lógica de paginación
  const filteredTemas = React.useMemo(() => {
    let filtered = temas;

    // Filtrar por deleted/no deleted
    if (showDeleted) {
      filtered = filtered.filter((tema) => !!tema.is_deleted);
    } else {
      filtered = filtered.filter((tema) => !tema.is_deleted);
    }

    // Aplicar búsqueda
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(
        (tema) =>
          tema.nombre?.toLowerCase().includes(searchTerm) ||
          tema.descripcion?.toLowerCase().includes(searchTerm) ||
          tema.categoria_tema?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [temas, showDeleted, searchValue]);

  const totalPages = Math.ceil(filteredTemas.length / pageSize);
  const paginatedTemas = filteredTemas.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset página cuando cambien filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, showDeleted]);

  // 🔄 CAMBIO: Definir columnas con nueva interface
  const columns: DataTableColumn<Tema>[] = [
    {
      key: "nombre",
      header: "Nombre",
      sortable: true,
      searchable: true,
    },
    {
      key: "categoria_tema",
      header: "Categoría",
      sortable: true,
      render: (value) =>
        value ? (
          <Badge variant="outline">{value}</Badge>
        ) : (
          <span className="text-gray-400">Sin categoría</span>
        ),
    },
    {
      key: "descripcion",
      header: "Descripción",
      searchable: true,
      render: (value) =>
        value ? (
          <span className="text-sm text-gray-600 max-w-xs truncate block">
            {value}
          </span>
        ) : (
          <span className="text-gray-400">Sin descripción</span>
        ),
    },
  ];

  // 🆕 NUEVO: Definir acciones por separado (más limpio)
  const actions: DataTableAction<Tema>[] = [
    {
      label: "Ver",
      icon: Eye,
      onClick: (tema) => router.push(`/temas/${tema.id}`),
      show: (item) => !item.is_deleted,
    },
    {
      label: "Editar",
      icon: Pencil,
      onClick: (tema) => {
        setEditingTema(tema);
        setIsModalOpen(true);
      },
      show: (item) => !item.is_deleted,
    },
    {
      label: "Eliminar",
      icon: Trash2,
      variant: "destructive",
      onClick: handleDelete,
      show: (item) => !item.is_deleted,
      requireConfirmation: {
        title: "¿Estás seguro?",
        description:
          "Esta acción marcará el tema como eliminado. Podrás restaurarlo después.",
      },
    },
    {
      label: "Restaurar",
      icon: RotateCcw,
      onClick: handleRestore,
      show: (item) => !!item.is_deleted,
      requireConfirmation: {
        // ✅ AGREGAR ESTO
        title: "¿Restaurar tema?",
        description:
          "Esta acción restaurará el tema y volverá a aparecer en la lista principal.",
      },
    },
  ];

  // 🔄 CAMBIO: Funciones de manejo simplificadas
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
      await temasService.delete(tema.id, user.id);

      // Actualizar estado local
      setTemas((prevTemas) =>
        prevTemas.map((t) =>
          t.id === tema.id ? { ...t, is_deleted: true } : t
        )
      );

      toast({
        title: "Éxito",
        description: "Tema eliminado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el tema.",
        variant: "destructive",
      });
    }
  }

  async function handleRestore(tema: Tema) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

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
        description: "Tema restaurado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar el tema.",
        variant: "destructive",
      });
    }
  }

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

  return (
    <>
      {/* 🔄 CAMBIO PRINCIPAL: Usar AdminDataTable mejorado */}
      <AdminDataTable
        title="Gestión de Temáticas"
        data={paginatedTemas}
        columns={columns}
        actions={actions}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showDeleted={showDeleted}
        onToggleShowDeleted={() => setShowDeleted(!showDeleted)}
        onAdd={() => {
          setEditingTema(null);
          setIsModalOpen(true);
        }}
        addButtonLabel="Nueva Temática"
        emptyMessage="No hay temáticas disponibles"
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalCount={filteredTemas.length}
        pageSize={pageSize}
      />

      {/* ✅ Modal mantenido igual */}
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
