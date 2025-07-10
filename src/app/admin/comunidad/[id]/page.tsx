//src/app/admin/comunidad/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Trash2,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  User,
  GraduationCap,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { CATEGORIAS_PERSONA, ESTADOS_VERIFICACION } from "@/lib/constants/persona";

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading, user } = useAuth();
  const { toast } = useToast();
  const [persona, setPersona] = useState<PersonaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const personaId = params?.id as string;

  useEffect(() => {
    async function fetchPersona() {
      if (authLoading) return;
      if (isAdmin === undefined) return;

      if (!personaId) {
        setError("ID de persona no válido");
        setLoading(false);
        return;
      }

      try {
        const result = await personasService.getById(personaId);

        if (result.success && result.data) {
          setPersona(result.data);
        } else {
          console.error("❌ Error fetching persona:", result.error);
          setError("Persona no encontrada");
          toast({
            title: "Error",
            description: "No se pudo cargar la persona",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Error in fetchPersona:", error);
        setError("Error inesperado al cargar la persona");
        toast({
          title: "Error",
          description: "Error inesperado al cargar la persona",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPersona();
  }, [personaId, isAdmin, authLoading, toast]);

  // Helper functions para colores y labels
  const getCategoriaInfo = (categoria: string | null) => {
    return (
      CATEGORIAS_PERSONA.find((c) => c.value === categoria) || {
        label: categoria || "Sin categoría",
        icon: "👤",
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const getEstadoInfo = (estado: string | null) => {
    return (
      ESTADOS_VERIFICACION.find((e) => e.value === estado) || {
        label: estado || "Sin estado",
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  const getCategoriaColor = (categoria: string | null) => {
    const categoriaInfo = getCategoriaInfo(categoria);
    switch (categoriaInfo.color) {
      case "green":
        return "bg-green-100 text-green-800 border-green-200";
      case "blue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "purple":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "orange":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "gray":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getEstadoColor = (estado: string | null) => {
    const estadoInfo = getEstadoInfo(estado);
    switch (estadoInfo.color) {
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

  // Action handlers
  const handleDelete = async () => {
    if (!user?.id || !persona) return;

    setActionLoading(true);
    try {
      const result = await personasService.delete(persona.id, user.id);

      if (result.success) {
        toast({
          title: "Persona eliminada",
          description: `${persona.nombre} ${persona.apellido} ha sido eliminada correctamente.`,
        });

        // Actualizar estado local
        setPersona((prev) =>
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
          description: result.error?.message || "Error al eliminar la persona",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting persona:", error);
      toast({
        title: "Error",
        description: "Error inesperado al eliminar la persona",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!persona) return;

    setActionLoading(true);
    try {
      const result = await personasService.restore(persona.id);

      if (result.success) {
        toast({
          title: "Persona restaurada",
          description: `${persona.nombre} ${persona.apellido} ha sido restaurada correctamente.`,
        });

        // Actualizar estado local
        setPersona((prev) =>
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
          description: result.error?.message || "Error al restaurar la persona",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error restoring persona:", error);
      toast({
        title: "Error",
        description: "Error inesperado al restaurar la persona",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Helper para mapear categoría a tipo para edición
  const mapCategoriaToTipo = (
    categoria: string
  ): "alumno" | "docente" | "activo" => {
    switch (categoria) {
      case "estudiante_cet":
      case "ex_alumno_cet":
        return "alumno";
      case "docente_cet":
        return "docente";
      case "comunidad_activa":
      case "comunidad_general":
      default:
        return "activo";
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
  if (error || !persona) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">
            {error || "Persona no encontrada"}
          </p>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/comunidad")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a comunidad
          </Button>
        </div>
      </div>
    );
  }

  const categoriaInfo = getCategoriaInfo(persona.categoria_principal);
  const estadoInfo = getEstadoInfo(persona.estado_verificacion);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        {/* Header con navegación */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/comunidad")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>

            {/* Avatar de la persona */}
            <Avatar className="w-16 h-16">
              <AvatarImage src={persona.foto_url || undefined} />
              <AvatarFallback className="text-lg">
                {persona.nombre?.charAt(0)}
                {persona.apellido?.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {persona.nombre} {persona.apellido}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={getCategoriaColor(persona.categoria_principal)}
                >
                  {categoriaInfo.icon} {categoriaInfo.label}
                </Badge>
                <Badge
                  variant="outline"
                  className={getEstadoColor(persona.estado_verificacion)}
                >
                  {estadoInfo.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                router.push(
                  `/admin/comunidad/${
                    persona.id
                  }/edit?tipo=${mapCategoriaToTipo(
                    persona.categoria_principal || "comunidad_activa"
                  )}`
                )
              }
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>

            {persona.is_deleted ? (
              <Button
                variant="outline"
                onClick={handleRestore}
                disabled={actionLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${
                    actionLoading ? "animate-spin" : ""
                  }`}
                />
                Restaurar
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
          </div>
        </div>

        {/* Información principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Información general */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card de información personal */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información Personal
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Nombre completo
                    </label>
                    <p className="text-sm">
                      {persona.nombre} {persona.apellido}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm">
                      {persona.email || "No especificado"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Categoría
                    </label>
                    <div className="mt-1">
                      <Badge
                        className={getCategoriaColor(
                          persona.categoria_principal
                        )}
                      >
                        {categoriaInfo.icon} {categoriaInfo.label}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Estado
                    </label>
                    <div className="mt-1">
                      <Badge
                        variant="outline"
                        className={getEstadoColor(persona.estado_verificacion)}
                      >
                        {estadoInfo.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Biografía si existe */}
                {persona.descripcion_personal_o_profesional && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Descripción personal/profesional
                      </label>
                      <p className="text-sm mt-1 whitespace-pre-wrap">
                        {persona.descripcion_personal_o_profesional}
                      </p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Información académica/profesional */}
            {(persona.ano_egreso_cet ||
              persona.titulacion_obtenida_cet ||
              persona.cargo_actual ||
              persona.empresa_o_institucion_actual) && (
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {persona.categoria_principal?.includes("cet") ? (
                      <>
                        <GraduationCap className="h-5 w-5" />
                        Información Académica CET
                      </>
                    ) : (
                      <>
                        <Briefcase className="h-5 w-5" />
                        Información Profesional
                      </>
                    )}
                  </h2>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Información CET */}
                    {persona.titulacion_obtenida_cet && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Titulación CET
                        </label>
                        <p className="text-sm">
                          {persona.titulacion_obtenida_cet}
                        </p>
                      </div>
                    )}

                    {persona.ano_egreso_cet && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Año de egreso
                        </label>
                        <p className="text-sm">{persona.ano_egreso_cet}</p>
                      </div>
                    )}

                    {/* Información profesional */}
                    {persona.cargo_actual && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Cargo actual
                        </label>
                        <p className="text-sm">{persona.cargo_actual}</p>
                      </div>
                    )}

                    {persona.empresa_o_institucion_actual && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Empresa/Organización
                        </label>
                        <p className="text-sm">
                          {persona.empresa_o_institucion_actual}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Áreas de interés */}
            {Array.isArray(persona.areas_de_interes_o_expertise) &&
              persona.areas_de_interes_o_expertise.length > 0 && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold">
                      Áreas de Interés y Expertise
                    </h2>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {persona.areas_de_interes_o_expertise.map(
                        (area: string, index: number) => (
                          <Badge key={index} variant="secondary">
                            {area}
                          </Badge>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Columna lateral - Información de contacto y ubicación */}
          <div className="space-y-6">
            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Información de Contacto
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {persona.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{persona.email}</span>
                  </div>
                )}

                {persona.telefono_contacto && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{persona.telefono_contacto}</span>
                  </div>
                )}

                {/* Links profesionales */}
                {Array.isArray(persona.links_profesionales) &&
                  persona.links_profesionales.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        Links profesionales
                      </label>
                      {persona.links_profesionales.map(
                        (link: any, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            <a
                              href={link.url || link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline break-all"
                            >
                              {link.url || link}
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Información de ubicación */}
            {persona.ubicacion_residencial &&
              typeof persona.ubicacion_residencial === "object" &&
              ((persona.ubicacion_residencial as any)?.direccion ||
                (persona.ubicacion_residencial as any)?.provincia ||
                (persona.ubicacion_residencial as any)?.localidad) && (
                <Card>
                  <CardHeader>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Ubicación
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(persona.ubicacion_residencial as any)?.direccion && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Dirección
                        </label>
                        <p className="text-sm">
                          {(persona.ubicacion_residencial as any).direccion}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      {(persona.ubicacion_residencial as any)?.localidad && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Localidad
                          </label>
                          <p className="text-sm">
                            {(persona.ubicacion_residencial as any).localidad}
                          </p>
                        </div>
                      )}

                      {(persona.ubicacion_residencial as any)?.provincia && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Provincia
                          </label>
                          <p className="text-sm">
                            {(persona.ubicacion_residencial as any).provincia}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

            {/* Estado del perfil */}
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Estado del Perfil
                </h2>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Activo</span>
                  <Badge variant={persona.activo ? "default" : "secondary"}>
                    {persona.activo ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Disponible para proyectos
                  </span>
                  <Badge
                    variant={
                      persona.disponible_para_proyectos ? "default" : "outline"
                    }
                  >
                    {persona.disponible_para_proyectos ? "Sí" : "No"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Perfil público
                  </span>
                  <Badge variant="outline">
                    {persona.visibilidad_perfil === "publico"
                      ? "Público"
                      : persona.visibilidad_perfil ===
                        "solo_registrados_plataforma"
                      ? "Solo registrados"
                      : "Privado"}
                  </Badge>
                </div>

                {persona.created_at && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Miembro desde
                    </label>
                    <p className="text-sm">
                      {new Date(persona.created_at).toLocaleDateString("es-AR")}
                    </p>
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
