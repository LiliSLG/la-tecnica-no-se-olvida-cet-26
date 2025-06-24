// =============================================================================
// NoticiasListPage - Usando AdminDataTable mejorado
// Ubicación: /src/components/admin/noticias/NoticiasListPage.tsx
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AdminDataTable,
  DataTableColumn,
  DataTableAction,
} from "@/components/admin/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  ExternalLink,
  Star,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
import { useErrorHandler } from "@/hooks/useErrorHandler"; // Tu hook personalizado

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

interface NoticiasListPageProps {
  allNoticias: Noticia[];
}

export function NoticiasListPage({ allNoticias }: NoticiasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  // Estados
  const [noticias, setNoticias] = useState<Noticia[]>(allNoticias);
  const [searchValue, setSearchValue] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    setNoticias(allNoticias);
    setCurrentPage(1);
  }, [allNoticias]);

  // Lógica de paginación
  const filteredNoticias = React.useMemo(() => {
    let filtered = noticias;

    // Filtrar por deleted/no deleted
    if (showDeleted) {
      filtered = filtered.filter((noticia) => !!noticia.is_deleted);
    } else {
      filtered = filtered.filter((noticia) => !noticia.is_deleted);
    }

    // Aplicar búsqueda
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(
        (noticia) =>
          noticia.titulo?.toLowerCase().includes(searchTerm) ||
          noticia.subtitulo?.toLowerCase().includes(searchTerm) ||
          noticia.contenido?.toLowerCase().includes(searchTerm) ||
          noticia.autor_noticia?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [noticias, showDeleted, searchValue]);

  const totalPages = Math.ceil(filteredNoticias.length / pageSize);
  const paginatedNoticias = filteredNoticias.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Reset página cuando cambien filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, showDeleted]);

  // Definir columnas
  const columns: DataTableColumn<Noticia>[] = [
    {
      key: "titulo",
      header: "Título",
      sortable: true,
      searchable: true,
      render: (value, item) => (
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}</span>
          {item.es_destacada && (
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
          )}
        </div>
      ),
    },
    {
      key: "tipo",
      header: "Tipo",
      sortable: true,
      render: (value) => (
        <Badge variant={value === "articulo_propio" ? "default" : "secondary"}>
          {value === "articulo_propio" ? "Artículo Propio" : "Enlace Externo"}
        </Badge>
      ),
    },
    {
      key: "autor_noticia",
      header: "Autor",
      searchable: true,
      render: (value) =>
        value || <span className="text-gray-400">Sin autor</span>,
    },
    {
      key: "fecha_publicacion",
      header: "Fecha Publicación",
      sortable: true,
      render: (value) =>
        value ? (
          new Date(value).toLocaleDateString("es-ES")
        ) : (
          <span className="text-gray-400">Sin fecha</span>
        ),
    },
  ];

  // Definir acciones
  const actions: DataTableAction<Noticia>[] = [
    {
      label: "Ver",
      icon: Eye,
      onClick: (noticia) => {
        if (noticia.tipo === "enlace_externo" && noticia.url_externa) {
          window.open(noticia.url_externa, "_blank");
        } else {
          router.push(`/admin/noticias/${noticia.id}`);
        }
      },
      show: (item) => !item.is_deleted,
    },
    {
      label: "Abrir Enlace",
      icon: ExternalLink,
      onClick: (noticia) => {
        if (noticia.url_externa) {
          window.open(noticia.url_externa, "_blank");
        }
      },
      show: (item) =>
        !item.is_deleted &&
        item.tipo === "enlace_externo" &&
        !!item.url_externa,
    },
    {
      label: "Editar",
      icon: Pencil,
      onClick: (noticia) => router.push(`/admin/noticias/${noticia.id}/edit`),
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
          "Esta acción marcará la noticia como eliminada. Podrás restaurarla después.",
      },
    },
    {
      label: "Restaurar",
      icon: RotateCcw,
      onClick: handleRestore,
      show: (item) => !!item.is_deleted,
    },
  ];

  // Funciones de manejo
  async function handleDelete(noticia: Noticia) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    try {
      await noticiasService.delete(noticia.id, user.id);

      setNoticias((prev) =>
        prev.map((n) => (n.id === noticia.id ? { ...n, is_deleted: true } : n))
      );

      toast({
        title: "Éxito",
        description: "Noticia eliminada correctamente.",
      });
    } catch (error) {
      handleError(error, "No se pudo eliminar la noticia");
    }
  }

  async function handleRestore(noticia: Noticia) {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    try {
      await noticiasService.restore(noticia.id);

      setNoticias((prev) =>
        prev.map((n) => (n.id === noticia.id ? { ...n, is_deleted: false } : n))
      );

      toast({
        title: "Éxito",
        description: "Noticia restaurada correctamente.",
      });
    } catch (error) {
      handleError(error, "No se pudo restaurar la noticia");
    }
  }

  return (
    <AdminDataTable
      title="Gestión de Noticias"
      data={paginatedNoticias}
      columns={columns}
      actions={actions}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      showDeleted={showDeleted}
      onToggleShowDeleted={() => setShowDeleted(!showDeleted)}
      onAdd={() => router.push("/admin/noticias/new")}
      addButtonLabel="Nueva Noticia"
      emptyMessage="No hay noticias disponibles"
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={setCurrentPage}
      totalCount={filteredNoticias.length}
      pageSize={pageSize}
    />
  );
}
