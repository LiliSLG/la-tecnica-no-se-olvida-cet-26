// /src/components/user/noticias/UserNoticiasListPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useDataTableState,
  type DataTableConfig,
} from "@/hooks/useDataTableState";
import {
  AdminDataTable,
  type ColumnConfig,
} from "@/components/admin/AdminDataTable";
import {
  noticiasService,
  NoticiaWithAuthor,
} from "@/lib/supabase/services/noticiasService";
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

interface UserNoticiasListPageProps {
  userNoticias: NoticiaWithAuthor[];
  userId: string;
}

export function UserNoticiasListPage({
  userNoticias,
  userId,
}: UserNoticiasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [noticias, setNoticias] = useState<NoticiaWithAuthor[]>(userNoticias);

  // Estados para confirmación de toggle publicación
  const [noticiaToToggle, setNoticiaToToggle] =
    useState<NoticiaWithAuthor | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Estados para confirmación de toggle destacada
  const [noticiaToToggleDestacada, setNoticiaToToggleDestacada] =
    useState<NoticiaWithAuthor | null>(null);
  const [isTogglingDestacada, setIsTogglingDestacada] = useState(false);

  // Estados para temas
  const [noticiasTemas, setNoticiasTemas] = useState<Record<string, any[]>>({});
  const [loadingTemas, setLoadingTemas] = useState(true);

  useEffect(() => {
    setNoticias(userNoticias);
  }, [userNoticias]);

  useEffect(() => {
    async function loadTemasForNoticias() {
      if (noticias.length === 0) {
        setLoadingTemas(false);
        return;
      }

      try {
        const temasMap: Record<string, any[]> = {};

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

  // Configuración de la tabla (igual que admin)
  const dataTableConfig: DataTableConfig<NoticiaWithAuthor> = {
    data: noticias,
    initialFilters: { is_deleted: false },
    searchFields: ["titulo", "subtitulo", "autor_noticia", "fuente_externa"],
    filterFields: [
      { key: "is_deleted", label: "Mostrar eliminados", type: "switch" },
      {
        key: "tipo",
        label: "Tipo de contenido",
        type: "select",
        options: [
          { value: "articulo_propio", label: "Artículos" },
          { value: "enlace_externo", label: "Enlaces" },
        ],
      },
      {
        key: "esta_publicada",
        label: "Solo publicadas",
        type: "switch",
      },
      {
        key: "es_destacada",
        label: "Solo destacadas",
        type: "switch",
      },
    ],
    sortableColumns: ["titulo", "fecha_publicacion", "tipo"],
  };

  const tableState = useDataTableState<NoticiaWithAuthor>(dataTableConfig);

  // Helper functions (igual que admin)
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
    if (noticia.autor_noticia) {
      return noticia.autor_noticia;
    }

    if (noticia.tipo === "enlace_externo" && noticia.fuente_externa) {
      return `📡 ${noticia.fuente_externa}`;
    }

    if (noticia.tipo === "articulo_propio" && noticia.created_by_persona) {
      const persona = noticia.created_by_persona;

      let nombreCompleto = "";

      if (persona.nombre) {
        nombreCompleto = persona.nombre;

        if (persona.apellido) {
          nombreCompleto += ` ${persona.apellido}`;
        }

        return `👤 ${nombreCompleto}`;
      }

      if (persona.email) {
        return `👤 ${persona.email}`;
      }
    }

    if (noticia.tipo === "articulo_propio") {
      return "👤 Autor CET";
    }

    return "Sin autor";
  };

  // Columnas (exactamente igual que admin)
  const columns: ColumnConfig<NoticiaWithAuthor>[] = [
    {
      key: "titulo",
      label: "Título",
      sortable: true,
      render: (value, noticia) => (
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-foreground">
            {value || "Sin título"}
          </div>
          {noticia.subtitulo && (
            <div className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {noticia.subtitulo}
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              {formatTipo(noticia.tipo)}
            </Badge>
            {!loadingTemas && noticiasTemas[noticia.id]?.length > 0 && (
              <div className="flex gap-1">
                {noticiasTemas[noticia.id].slice(0, 2).map((tema) => (
                  <Badge key={tema.id} variant="secondary" className="text-xs">
                    {tema.nombre}
                  </Badge>
                ))}
                {noticiasTemas[noticia.id].length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{noticiasTemas[noticia.id].length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      ),
      mobileHidden: false,
    },
    {
      key: "fecha_publicacion",
      label: "Fecha",
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(value)}
        </div>
      ),
      mobileHidden: true,
      className: "w-32",
    },
    {
      key: "autor_noticia",
      label: "Autor",
      render: (value, noticia) => (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formatAutor(noticia)}
        </div>
      ),
      mobileHidden: true,
      className: "w-40",
    },
    {
      key: "esta_publicada",
      label: "Estado",
      render: (value, noticia) => (
        <div className="flex flex-col gap-1">
          <Badge
            variant="outline"
            className={`cursor-pointer transition-colors ${
              value
                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-300"
            }`}
            onClick={() => !noticia.is_deleted && setNoticiaToToggle(noticia)}
          >
            {value ? "Publicada" : "Borrador"}
          </Badge>
          <Badge
            variant="outline"
            className={`cursor-pointer transition-colors ${
              noticia.es_destacada
                ? "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-yellow-50 hover:text-yellow-700 hover:border-yellow-300"
            }`}
            onClick={() =>
              !noticia.is_deleted && setNoticiaToToggleDestacada(noticia)
            }
          >
            {noticia.es_destacada ? "Destacada" : "Normal"}
          </Badge>
        </div>
      ),
      className: "w-24",
    },
    {
      key: "action_buttons" as `action_${string}`,
      label: "Acciones",
      render: (noticia: NoticiaWithAuthor) => (
        <div className="flex items-center gap-1">
          {!noticia.is_deleted ? (
            <>
              {noticia.esta_publicada && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/noticias/${noticia.id}`)}
                  title="Ver noticia pública"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  router.push(`/dashboard/noticias/${noticia.id}/edit`)
                }
                title="Editar noticia"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(noticia)}
                title="Eliminar noticia"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRestore(noticia)}
              title="Restaurar noticia"
              className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Función toggle publicación
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

  // Función toggle destacada
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

  // Función eliminar
  async function handleDelete(noticia: NoticiaWithAuthor) {
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

  // Función restaurar
  async function handleRestore(noticia: NoticiaWithAuthor) {
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
      {/* AdminDataTable - igual que admin */}
      <AdminDataTable
        title="Mis Noticias"
        columns={columns}
        config={dataTableConfig}
        state={tableState}
        addLabel="Nueva Noticia"
        onAdd={() => router.push("/dashboard/noticias/new")}
        emptyState={{
          title: "No tienes noticias aún",
          description:
            "Comienza creando tu primera noticia para compartir contenido con la comunidad.",
          action: {
            label: "Crear Primera Noticia",
            onClick: () => router.push("/dashboard/noticias/new"),
          },
        }}
        mobileCardView={true}
      />

      {/* AlertDialog para confirmar cambio de publicación */}
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

      {/* AlertDialog para confirmar cambio de destacada */}
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
