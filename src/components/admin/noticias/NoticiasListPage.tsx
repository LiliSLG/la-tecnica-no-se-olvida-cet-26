// =============================================================================
// NoticiasListPage - CON TOGGLE PUBLICADA + DESTACADA
// Ubicación: /src/components/admin/noticias/NoticiasListPage.tsx
// =============================================================================

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// 🔄 IMPORTS actualizados para nueva interface
import {
  AdminDataTable,
  DataTableColumn,
  DataTableAction,
} from "@/components/admin/AdminDataTable";
import { Database } from "@/lib/supabase/types/database.types";
import {
  noticiasService,
  NoticiaWithAuthor,
} from "@/lib/supabase/services/noticiasService"; // 🔄 AGREGAR NoticiaWithAuthor
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2, RotateCcw, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/AuthProvider";
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
import { noticiaTemasService } from "@/lib/supabase/services/noticiaTemasService";

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

interface NoticiasListPageProps {
  allNoticias: NoticiaWithAuthor[]; // 🔄 CAMBIO: Era Noticia[]
}

export function NoticiasListPage({ allNoticias }: NoticiasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // ✅ Estados existentes
  const [noticias, setNoticias] = useState<NoticiaWithAuthor[]>(allNoticias); // 🔄 CAMBIO: Era Noticia[]
  const [searchValue, setSearchValue] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // ✅ Estados para confirmación de toggle publicación
  const [noticiaToToggle, setNoticiaToToggle] = useState<Noticia | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // 🆕 NUEVO: Estados para confirmación de toggle destacada
  const [noticiaToToggleDestacada, setNoticiaToToggleDestacada] =
    useState<Noticia | null>(null);
  const [isTogglingDestacada, setIsTogglingDestacada] = useState(false);

  // 🆕 NUEVO: Estado para manejar temas de cada noticia
  const [noticiasTemas, setNoticiasTemas] = useState<Record<string, any[]>>({});
  const [loadingTemas, setLoadingTemas] = useState(true);

  useEffect(() => {
    setNoticias(allNoticias);
    setCurrentPage(1);
  }, [allNoticias]);

  useEffect(() => {
    async function loadTemasForNoticias() {
      if (noticias.length === 0) {
        setLoadingTemas(false);
        return;
      }

      try {
        const temasMap: Record<string, any[]> = {};

        // Cargar temas para cada noticia
        const temasPromises = noticias.map(async (noticia) => {
          const result = await noticiaTemasService.getTemasWithInfoForNoticia(
            noticia.id
          );
          if (result.success && result.data) {
            temasMap[noticia.id] = result.data;
          } else {
            temasMap[noticia.id] = [];
          }
        });

        await Promise.all(temasPromises);
        setNoticiasTemas(temasMap);
      } catch (error) {
        console.error("Error loading temas for noticias:", error);
      } finally {
        setLoadingTemas(false);
      }
    }

    loadTemasForNoticias();
  }, [noticias]);

  // 🆕 Lógica de paginación
  const filteredNoticias = React.useMemo(() => {
    let filtered = noticias;

    if (showDeleted) {
      filtered = filtered.filter((noticia) => !!noticia.is_deleted);
    } else {
      filtered = filtered.filter((noticia) => !noticia.is_deleted);
    }

    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase();
      filtered = filtered.filter(
        (noticia) =>
          noticia.titulo?.toLowerCase().includes(searchTerm) ||
          noticia.autor_noticia?.toLowerCase().includes(searchTerm) ||
          noticia.fuente_externa?.toLowerCase().includes(searchTerm) ||
          noticia.tipo?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  }, [noticias, showDeleted, searchValue]);

  const totalPages = Math.ceil(filteredNoticias.length / pageSize);
  const paginatedNoticias = filteredNoticias.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, showDeleted]);

  // ✅ Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTipo = (tipo: string) => {
    return tipo === "articulo_propio" ? "📝 Artículo" : "🔗 Enlace";
  };

  const formatAutor = (noticia: NoticiaWithAuthor) => {
    // Si hay autor_noticia explícito, lo mostramos
    if (noticia.autor_noticia) {
      return noticia.autor_noticia;
    }

    // Si es enlace externo y hay fuente, mostramos la fuente
    if (noticia.tipo === "enlace_externo" && noticia.fuente_externa) {
      return `📡 ${noticia.fuente_externa}`;
    }

    // 🆕 Para artículos propios, concatenar nombre + apellido
    if (noticia.tipo === "articulo_propio" && noticia.created_by_persona) {
      const persona = noticia.created_by_persona;

      // Construir nombre completo
      let nombreCompleto = "";

      if (persona.nombre) {
        nombreCompleto = persona.nombre;

        // Agregar apellido si existe
        if (persona.apellido) {
          nombreCompleto += ` ${persona.apellido}`;
        }

        return `👤 ${nombreCompleto}`;
      }

      // Fallback al email si no hay nombre
      if (persona.email) {
        return `👤 ${persona.email}`;
      }
    }

    // Fallback para artículos propios sin datos de persona
    if (noticia.tipo === "articulo_propio") {
      return "👤 Autor CET";
    }

    return "Sin autor";
  };

  // 🔄 ACTUALIZAR: Columna Estado con AMBOS botones (Publicada + Destacada)
  const columns: DataTableColumn<Noticia>[] = [
    {
      key: "titulo",
      header: "Título",
      sortable: true,
      searchable: true,
      render: (value, noticia) => (
        <div className="max-w-xs">
          <div className="font-medium truncate">{value}</div>
          {noticia.subtitulo && (
            <div className="text-xs text-muted-foreground truncate">
              {noticia.subtitulo}
            </div>
          )}
          {noticia.tipo === "enlace_externo" && noticia.url_externa && (
            <div className="flex items-center gap-1 mt-1">
              <ExternalLink className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-blue-500 truncate max-w-[150px]">
                {noticia.url_externa}
              </span>
            </div>
          )}

          {/* 🆕 NUEVO: Mostrar solo CATEGORÍAS de temas (compacto) */}
          {!loadingTemas &&
            noticiasTemas[noticia.id] &&
            noticiasTemas[noticia.id].length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {/* Obtener categorías únicas */}
                {Array.from(
                  new Set(
                    noticiasTemas[noticia.id]
                      .map((tema) => tema.categoria_tema)
                      .filter(Boolean) // Filtrar nulls
                  )
                )
                  .slice(0, 3)
                  .map((categoria, index) => (
                    <Badge
                      key={`categoria-${index}`}
                      variant="outline"
                      className="text-xs px-1 py-0 h-4 capitalize"
                    >
                      {categoria}
                    </Badge>
                  ))}

                {/* Mostrar temas sin categoría */}
                {noticiasTemas[noticia.id].some(
                  (tema) => !tema.categoria_tema
                ) && (
                  <Badge
                    variant="outline"
                    className="text-xs px-1 py-0 h-4 text-muted-foreground"
                  >
                    sin categoría
                  </Badge>
                )}
              </div>
            )}

          {/* Indicador de carga */}
          {loadingTemas && (
            <div className="text-xs text-muted-foreground mt-1">
              Cargando...
            </div>
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
          {formatTipo(value)}
        </Badge>
      ),
    },
    {
      key: "autor_noticia",
      header: "Autor/Fuente",
      sortable: false,
      searchable: true,
      render: (value, noticia) => (
        <span className="text-sm">{formatAutor(noticia)}</span>
      ),
    },
    {
      key: "fecha_publicacion",
      header: "Fecha Pub.",
      sortable: true,
      render: (value) => <span className="text-sm">{formatDate(value)}</span>,
    },
    {
      key: "created_at",
      header: "Creada",
      sortable: true,
      render: (value) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(value)}
        </span>
      ),
    },
    {
      key: "temas_relacionados",
      header: "Temas",
      sortable: false,
      render: (value, noticia) => (
        <div className="max-w-[200px]">
          {loadingTemas ? (
            <div className="text-xs text-muted-foreground">Cargando...</div>
          ) : noticiasTemas[noticia.id] &&
            noticiasTemas[noticia.id].length > 0 ? (
            <div className="space-y-1">
              {/* 🆕 NUEVO: Mostrar NOMBRES completos de temas */}
              {noticiasTemas[noticia.id].slice(0, 3).map((tema) => (
                <Badge
                  key={tema.id}
                  variant="outline"
                  className="text-xs mr-1 mb-1 block max-w-full"
                  title={tema.descripcion || tema.nombre} // Tooltip con descripción
                >
                  <span className="truncate block max-w-[150px]">
                    {tema.nombre}
                  </span>
                </Badge>
              ))}
              {noticiasTemas[noticia.id].length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{noticiasTemas[noticia.id].length - 3} más
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-muted-foreground">Sin temas</div>
          )}
        </div>
      ),
    },
    {
      key: "estado",
      header: "Estado",
      sortable: false,
      render: (value, noticia) => (
        <div className="flex flex-col gap-1">
          {/* ✅ Botón toggle publicación */}
          <Button
            variant={noticia.esta_publicada ? "default" : "outline"}
            size="sm"
            onClick={() => setNoticiaToToggle(noticia)}
            disabled={!!noticia.is_deleted}
            className="text-xs h-6 px-2"
          >
            {noticia.esta_publicada ? "📢 Publicada" : "📝 Borrador"}
          </Button>

          {/* 🆕 NUEVO: Botón toggle destacada */}
          <Button
            variant={noticia.es_destacada ? "default" : "outline"}
            size="sm"
            onClick={() => setNoticiaToToggleDestacada(noticia)}
            disabled={!!noticia.is_deleted}
            className={`text-xs h-6 px-2 ${
              noticia.es_destacada
                ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                : "border-yellow-300 text-yellow-600 hover:bg-yellow-50"
            }`}
          >
            {noticia.es_destacada ? "⭐ Destacada" : "☆ Normal"}
          </Button>
        </div>
      ),
    },
  ];

  // ✅ Actions (sin cambios)
  const actions: DataTableAction<Noticia>[] = [
    {
      label: "Ver",
      icon: Eye,
      onClick: (noticia) => router.push(`/admin/noticias/${noticia.id}`),
      show: (item) => !item.is_deleted,
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
      onClick: (noticia) => handleDelete(noticia), // ✅ Pasar como callback
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
      onClick: (noticia) => handleRestore(noticia), // ✅ Pasar como callback
      show: (item) => !!item.is_deleted,
      requireConfirmation: {
        title: "¿Restaurar noticia?",
        description:
          "Esta acción restaurará la noticia y volverá a aparecer en la lista principal.",
      },
    },
  ];

  // ✅ Función toggle publicación (sin cambios)
  async function handleTogglePublished() {
    if (!noticiaToToggle || !user || isToggling) return;

    setIsToggling(true);
    try {
      const newStatus = !noticiaToToggle.esta_publicada;

      const updateData = {
        esta_publicada: newStatus,
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      };

      const result = await noticiasService.update(
        noticiaToToggle.id,
        updateData
      );

      if (!result.success) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado de publicación.",
          variant: "destructive",
        });
        return;
      }

      setNoticias((prevNoticias) =>
        prevNoticias.map((n) =>
          n.id === noticiaToToggle.id ? { ...n, esta_publicada: newStatus } : n
        )
      );

      toast({
        title: "Éxito",
        description: `Noticia ${
          newStatus ? "publicada" : "guardada como borrador"
        }.`,
      });

      setNoticiaToToggle(null);
    } catch (error) {
      console.error("Error toggling published status:", error);
      toast({
        title: "Error",
        description: "Error al cambiar estado de publicación.",
        variant: "destructive",
      });
    } finally {
      setIsToggling(false);
    }
  }

  // 🆕 NUEVA: Función toggle destacada
  async function handleToggleDestacada() {
    if (!noticiaToToggleDestacada || !user || isTogglingDestacada) return;

    setIsTogglingDestacada(true);
    try {
      const newStatus = !noticiaToToggleDestacada.es_destacada;

      const updateData = {
        es_destacada: newStatus,
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      };

      const result = await noticiasService.update(
        noticiaToToggleDestacada.id,
        updateData
      );

      if (!result.success) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el estado destacada.",
          variant: "destructive",
        });
        return;
      }

      setNoticias((prevNoticias) =>
        prevNoticias.map((n) =>
          n.id === noticiaToToggleDestacada.id
            ? { ...n, es_destacada: newStatus }
            : n
        )
      );

      toast({
        title: "Éxito",
        description: `Noticia ${
          newStatus ? "marcada como destacada" : "desmarcada como destacada"
        }.`,
      });

      setNoticiaToToggleDestacada(null);
    } catch (error) {
      console.error("Error toggling destacada status:", error);
      toast({
        title: "Error",
        description: "Error al cambiar estado destacada.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingDestacada(false);
    }
  }

  // ✅ Funciones existentes (sin cambios)
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

      setNoticias((prevNoticias) =>
        prevNoticias.map((n) =>
          n.id === noticia.id ? { ...n, is_deleted: true } : n
        )
      );

      toast({
        title: "Éxito",
        description: "Noticia eliminada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la noticia.",
        variant: "destructive",
      });
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

      setNoticias((prevNoticias) =>
        prevNoticias.map((n) =>
          n.id === noticia.id ? { ...n, is_deleted: false } : n
        )
      );

      toast({
        title: "Éxito",
        description: "Noticia restaurada correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restaurar la noticia.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {/* ✅ AdminDataTable (sin cambios) */}
      <AdminDataTable
        title="Gestión de Noticias"
        data={filteredNoticias} // ← Datos filtrados, no paginados
        columns={columns}
        actions={actions}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        showDeleted={showDeleted}
        onToggleShowDeleted={() => setShowDeleted(!showDeleted)}
        onAdd={() => router.push("/admin/noticias/new")}
        addButtonLabel="Nueva Noticia"
        emptyMessage="No hay noticias disponibles"
        // ❌ REMOVER: currentPage, totalPages, onPageChange, totalCount, pageSize
      />

      {/* ✅ AlertDialog para confirmar cambio de publicación */}
      <AlertDialog
        open={!!noticiaToToggle}
        onOpenChange={() => !isToggling && setNoticiaToToggle(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Estado de Publicación</AlertDialogTitle>
            <AlertDialogDescription>
              {noticiaToToggle?.esta_publicada
                ? "¿Deseas cambiar esta noticia a borrador? Dejará de ser visible para los usuarios."
                : "¿Deseas publicar esta noticia? Será visible para todos los usuarios."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isToggling}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTogglePublished}
              disabled={isToggling}
            >
              {isToggling
                ? "Guardando..."
                : noticiaToToggle?.esta_publicada
                ? "Cambiar a Borrador"
                : "Publicar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 🆕 NUEVO: AlertDialog para confirmar cambio de destacada */}
      <AlertDialog
        open={!!noticiaToToggleDestacada}
        onOpenChange={() =>
          !isTogglingDestacada && setNoticiaToToggleDestacada(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cambiar Estado Destacada</AlertDialogTitle>
            <AlertDialogDescription>
              {noticiaToToggleDestacada?.es_destacada
                ? "¿Deseas quitar el estado destacada de esta noticia? Dejará de aparecer en la sección de noticias destacadas."
                : "¿Deseas marcar esta noticia como destacada? Aparecerá en la sección de noticias destacadas."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isTogglingDestacada}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleDestacada}
              disabled={isTogglingDestacada}
              className="bg-yellow-500 hover:bg-yellow-600"
            >
              {isTogglingDestacada
                ? "Guardando..."
                : noticiaToToggleDestacada?.es_destacada
                ? "Quitar Destacada"
                : "Marcar Destacada"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
