// /src/components/admin/noticias/NoticiasListPage.tsx - UNIFICADO
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  useDataTableState,
  type DataTableConfig,
} from "@/hooks/useDataTableState";
import {
  DataTable,
  type ColumnConfig,
} from "@/components/shared/data-tables/DataTable";
import { Database } from "@/lib/supabase/types/database.types";
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

type Noticia = Database["public"]["Tables"]["noticias"]["Row"];

interface NoticiasListPageProps {
  allNoticias: NoticiaWithAuthor[];
  isUserView?: boolean; // 🆕 Nueva prop para distinguir contexto
}

export function NoticiasListPage({
  allNoticias,
  isUserView = false,
}: NoticiasListPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  // Estados principales
  const [noticias, setNoticias] = useState<NoticiaWithAuthor[]>(allNoticias);

  // Estados para confirmación de toggle publicación
  const [noticiaToToggle, setNoticiaToToggle] = useState<Noticia | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  // Estados para confirmación de toggle destacada
  const [noticiaToToggleDestacada, setNoticiaToToggleDestacada] =
    useState<Noticia | null>(null);
  const [isTogglingDestacada, setIsTogglingDestacada] = useState(false);

  // Estados para temas
  const [noticiasTemas, setNoticiasTemas] = useState<Record<string, any[]>>({});
  const [loadingTemas, setLoadingTemas] = useState(true);

  useEffect(() => {
    setNoticias(allNoticias);
  }, [allNoticias]);

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

  // 🆕 Configuración dinámica basada en el contexto
  const getRouteConfig = () => {
    if (isUserView) {
      return {
        createRoute: "/dashboard/noticias/new",
        editRoute: (id: string) => `/dashboard/noticias/${id}/edit`,
        viewRoute: (id: string) => `/dashboard/noticias/${id}`, // Nueva vista dashboard con sidebar        addLabel: "Nueva Noticia",
        emptyTitle: "No tienes noticias aún",
        emptyDescription:
          "Comienza creando tu primera noticia para compartir contenido con la comunidad.",
        emptyActionLabel: "Crear Primera Noticia",
      };
    } else {
      return {
        createRoute: "/admin/noticias/new",
        editRoute: (id: string) => `/admin/noticias/${id}/edit`,
        viewRoute: (id: string) => `/admin/noticias/${id}`, // Vista admin
        title: "Gestión de Noticias",
        addLabel: "Nueva Noticia",
        emptyTitle: "No hay noticias disponibles",
        emptyDescription:
          "Comienza creando tu primera noticia para compartir contenido.",
        emptyActionLabel: "Crear Primera Noticia",
      };
    }
  };

  const routeConfig = getRouteConfig();

  // Configuración de la tabla
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

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  // Definir columnas
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
              {noticia.tipo === "articulo_propio" ? "📝 Artículo" : "🔗 Enlace"}
            </Badge>
            {!loadingTemas && noticiasTemas[noticia.id]?.length > 0 && (
              <div className="flex gap-1">
                {/* Mostrar solo categorías únicas, no nombres completos de temas */}
                {Array.from(
                  new Set(
                    noticiasTemas[noticia.id]
                      .map((tema) => tema.categoria_tema)
                      .filter(Boolean)
                  )
                )
                  .slice(0, 2)
                  .map((categoria, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {categoria}
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
      key: "tipo",
      label: "Tipo",
      sortable: true,
      className: "hidden lg:table-cell",
      mobileHidden: true,
      render: (value) => (
        <Badge
          variant={value === "articulo_propio" ? "default" : "outline"}
          className={`font-medium ${
            value === "articulo_propio"
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {value === "articulo_propio" ? "Artículo" : "Enlace"}
        </Badge>
      ),
    },
    {
      key: "autor_noticia",
      label: "Autor",
      className: "hidden lg:table-cell",
      mobileHidden: true,
      render: (value, noticia) => {
        const autor = formatAutor(noticia);
        const autorLimpio = autor.replace(/📡|👤|📢|📝/g, "").trim();
        const isExternal = noticia.tipo === "enlace_externo";

        return (
          <div className="text-sm">
            <span
              className={`${isExternal ? "text-blue-600" : "text-foreground"}`}
            >
              {autorLimpio}
            </span>
            {isExternal && (
              <div className="text-xs text-muted-foreground">
                Fuente externa
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "fecha_publicacion",
      label: "Publicación",
      sortable: true,
      mobileHidden: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: "action_estado" as `action_${string}`,
      label: "Estado",
      render: (noticia: NoticiaWithAuthor) => (
        <div className="space-y-1">
          <Badge
            variant={noticia.esta_publicada ? "default" : "secondary"}
            className={`text-xs font-medium cursor-pointer transition-colors ${
              noticia.esta_publicada
                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
            }`}
            onClick={() => !noticia.is_deleted && setNoticiaToToggle(noticia)}
          >
            {noticia.esta_publicada ? "Publicada" : "Borrador"}
          </Badge>

          <Badge
            variant="outline"
            className={`text-xs font-medium cursor-pointer transition-colors ${
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
    },
    {
      key: "action_buttons" as `action_${string}`,
      label: "Acciones",
      render: (noticia: NoticiaWithAuthor) => (
        <div className="flex items-center gap-1">
          {!noticia.is_deleted ? (
            <>
              {/* 🔧 BOTÓN VER - Ahora usa Link y solo aparece si está publicada */}
              {noticia.esta_publicada && (
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  title="Ver noticia"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Link href={routeConfig.viewRoute(noticia.id)}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              )}

              {/* BOTÓN EDITAR */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(routeConfig.editRoute(noticia.id))}
                title="Editar noticia"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </Button>

              {/* BOTÓN ELIMINAR */}
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

  // Funciones de manejo (sin cambios)
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
      <DataTable
        title={routeConfig.title}
        columns={columns}
        config={dataTableConfig}
        state={tableState}
        addLabel={routeConfig.addLabel}
        onAdd={() => router.push(routeConfig.createRoute)}
        emptyState={{
          title: routeConfig.emptyTitle,
          description: routeConfig.emptyDescription,
          action: {
            label: routeConfig.emptyActionLabel,
            onClick: () => router.push(routeConfig.createRoute),
          },
        }}
        mobileCardView={true}
      />

      {/* AlertDialogs sin cambios */}
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
