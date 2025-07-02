// src/app/admin/organizaciones/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Edit,
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TIPOS_ORGANIZACION,
  ESTADOS_VERIFICACION,
} from "@/lib/schemas/organizacionSchema";

export default function OrganizacionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [organizacion, setOrganizacion] = useState<OrganizacionRow | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const organizacionId = params?.id as string;

  useEffect(() => {
    async function fetchOrganizacion() {
      if (authLoading) return;
      if (isAdmin === undefined) return;

      if (!organizacionId) {
        setError("ID de organización no válido");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Fetching organizacion:", organizacionId);
        const result = await organizacionesService.getById(organizacionId);

        if (result.success && result.data) {
          console.log("📊 Loaded organizacion:", result.data);
          setOrganizacion(result.data);
        } else {
          console.error("❌ Error fetching organizacion:", result.error);
          setError("Organización no encontrada");
          toast({
            title: "Error",
            description: "No se pudo cargar la organización",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Error in fetchOrganizacion:", error);
        setError("Error inesperado al cargar la organización");
        toast({
          title: "Error",
          description: "Error inesperado al cargar la organización",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacion();
  }, [organizacionId, isAdmin, authLoading, toast]);

  // Helper functions
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sin fecha";
    return new Date(dateString).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTipoInfo = (tipo: string | null) => {
    return TIPOS_ORGANIZACION.find((t) => t.value === tipo);
  };

  const getEstadoInfo = (estado: string | null) => {
    return ESTADOS_VERIFICACION.find((e) => e.value === estado);
  };

  const getEstadoColor = (estado: string | null) => {
    const estadoInfo = getEstadoInfo(estado);
    switch (estadoInfo?.color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "red":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTipoColor = (tipo: string | null) => {
    const colorMap = {
      empresa: "bg-blue-100 text-blue-800 border-blue-200",
      institucion_educativa: "bg-purple-100 text-purple-800 border-purple-200",
      ONG: "bg-green-100 text-green-800 border-green-200",
      establecimiento_ganadero:
        "bg-orange-100 text-orange-800 border-orange-200",
      organismo_gubernamental:
        "bg-indigo-100 text-indigo-800 border-indigo-200",
      cooperativa: "bg-yellow-100 text-yellow-800 border-yellow-200",
      otro: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      colorMap[tipo as keyof typeof colorMap] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  // Action handlers
  const handleDelete = async () => {
    if (!user?.id || !organizacion) return;

    setActionLoading(true);
    try {
      const result = await organizacionesService.delete(
        organizacion.id,
        user.id
      );

      if (result.success) {
        toast({
          title: "Organización eliminada",
          description: `${organizacion.nombre_oficial} ha sido eliminada correctamente.`,
        });

        // Actualizar estado local
        setOrganizacion((prev) =>
          prev
            ? {
                ...prev,
                is_deleted: true,
                deleted_at: new Date().toISOString(),
              }
            : null
        );
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al eliminar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting organizacion:", error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la organización",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!organizacion) return;

    setActionLoading(true);
    try {
      const result = await organizacionesService.restore(organizacion.id);

      if (result.success) {
        toast({
          title: "Organización restaurada",
          description: `${organizacion.nombre_oficial} ha sido restaurada correctamente.`,
        });

        // Actualizar estado local
        setOrganizacion((prev) =>
          prev
            ? {
                ...prev,
                is_deleted: false,
                deleted_at: null,
              }
            : null
        );
      } else {
        toast({
          title: "Error",
          description:
            result.error?.message || "Error al restaurar la organización",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring organizacion:", error);
      toast({
        title: "Error",
        description: "Error inesperado al restaurar la organización",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
          <div className="h-32 bg-muted rounded animate-pulse"></div>
          <div className="h-24 bg-muted rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  // No admin access
  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Acceso Denegado</h1>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !organizacion) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">
            {error || "Organización no encontrada"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/organizaciones")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a organizaciones
          </Button>
        </div>
      </div>
    );
  }

  const tipoInfo = getTipoInfo(organizacion.tipo);
  const estadoInfo = getEstadoInfo(organizacion.estado_verificacion);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/organizaciones")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            {/* ✅ NUEVO: Logo de la organización */}
            {organizacion.logo_url && (
              <div className="flex-shrink-0">
                <img
                  src={organizacion.logo_url}
                  alt={`Logo de ${organizacion.nombre_oficial}`}
                  className="w-16 h-16 object-contain rounded border bg-transparent"
                />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {organizacion.nombre_oficial}
              </h1>
              {organizacion.nombre_fantasia && (
                <p className="text-muted-foreground">
                  {organizacion.nombre_fantasia}
                </p>
              )}
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/admin/organizaciones/${organizacion.id}/edit`)
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>

            {organizacion.is_deleted ? (
              <Button
                variant="outline"
                onClick={handleRestore}
                disabled={actionLoading}
                className="text-green-600 hover:text-green-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Restaurar
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={handleDelete}
                disabled={actionLoading}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Estado de eliminación */}
        {organizacion.is_deleted && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Organización eliminada</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              Esta organización fue eliminada el{" "}
              {formatDate(organizacion.deleted_at)}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tipo de Organización
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-medium",
                          getTipoColor(organizacion.tipo)
                        )}
                      >
                        {tipoInfo?.icon} {tipoInfo?.label || "Sin tipo"}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estado de Verificación
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          "text-xs",
                          getEstadoColor(organizacion.estado_verificacion)
                        )}
                      >
                        {estadoInfo?.label || "Sin estado"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {organizacion.descripcion && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Descripción
                    </label>
                    <p className="mt-1 text-sm leading-relaxed">
                      {organizacion.descripcion}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Configuración
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    {organizacion.abierta_a_colaboraciones ? (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-300"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Abierta a colaboraciones
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-600 border-gray-300"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Cerrada a colaboraciones
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Áreas de interés */}
            {organizacion.areas_de_interes &&
              organizacion.areas_de_interes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Áreas de Interés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {organizacion.areas_de_interes.map((area) => (
                        <Badge key={area} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {organizacion.email_contacto && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {organizacion.email_contacto}
                    </span>
                  </div>
                )}

                {organizacion.telefono_contacto && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {organizacion.telefono_contacto}
                    </span>
                  </div>
                )}

                {organizacion.sitio_web && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organizacion.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline"
                    >
                      {organizacion.sitio_web}
                    </a>
                  </div>
                )}

                {!organizacion.email_contacto &&
                  !organizacion.telefono_contacto &&
                  !organizacion.sitio_web && (
                    <p className="text-sm text-muted-foreground">
                      Sin información de contacto
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Metadatos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Información del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-medium">Creada:</span>
                  <br />
                  <span className="text-muted-foreground">
                    {formatDate(organizacion.created_at)}
                  </span>
                </div>

                {organizacion.updated_at &&
                  organizacion.updated_at !== organizacion.created_at && (
                    <div>
                      <span className="font-medium">Última actualización:</span>
                      <br />
                      <span className="text-muted-foreground">
                        {formatDate(organizacion.updated_at)}
                      </span>
                    </div>
                  )}

                {organizacion.deleted_at && (
                  <div>
                    <span className="font-medium">Eliminada:</span>
                    <br />
                    <span className="text-muted-foreground">
                      {formatDate(organizacion.deleted_at)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
