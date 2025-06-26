// /src/components/admin/temas/TemaDetailPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";
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
import { temasService } from "@/lib/supabase/services/temasService";
import { useAuth } from "@/providers/AuthProvider";
import { Database } from "@/lib/supabase/types/database.types";
import {
  Pencil,
  Trash2,
  Users,
  FolderOpen,
  ArrowLeft,
  Undo2,
} from "lucide-react";

type Tema = Database["public"]["Tables"]["temas"]["Row"];

interface TemaDetailPageProps {
  tema: Tema;
}

export function TemaDetailPage({ tema }: TemaDetailPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const result = await temasService.delete(tema.id, user.id);

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Tema eliminado correctamente.",
        });
        router.push("/admin/temas");
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "No se pudo eliminar el tema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al eliminar el tema.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleRestore = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await temasService.restore(tema.id);

      if (result.success) {
        toast({
          title: "Éxito",
          description: "Tema restaurado correctamente.",
        });
        router.refresh(); // Recargar la página para mostrar el tema restaurado
      } else {
        toast({
          title: "Error",
          description: result.error?.message || "No se pudo restaurar el tema.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error inesperado al restaurar el tema.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Breadcrumbs con título personalizado */}
      <AdminBreadcrumbs customTitle={tema.nombre} />

      <div className="space-y-6">
        {/* Header con acciones */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/admin/temas")}
                className="px-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver a Temáticas
              </Button>
            </div>
            <h1 className="text-3xl font-bold">{tema.nombre}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{tema.categoria_tema}</Badge>
              {tema.is_deleted && (
                <Badge variant="destructive">Eliminado</Badge>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            {!tema.is_deleted ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => router.push(`/admin/temas/${tema.id}/edit`)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleRestore}>
                <Undo2 className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
            )}
          </div>
        </div>

        {/* Contenido principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Descripción</CardTitle>
              </CardHeader>
              <CardContent>
                {tema.descripcion ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {tema.descripcion}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No hay descripción disponible.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Información de gestión */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Gestión</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Creado:</span>
                    <p className="text-muted-foreground">
                      {tema.created_at
                        ? new Date(tema.created_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Actualizado:</span>
                    <p className="text-muted-foreground">
                      {tema.updated_at
                        ? new Date(tema.updated_at).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar con estadísticas */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Comunidad Relacionada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Aún no hay personas asociadas a este tema.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Proyectos Relacionados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  Aún no hay proyectos asociados a este tema.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar temática?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la temática "{tema.nombre}". Podrás
              restaurarla más tarde si es necesario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
