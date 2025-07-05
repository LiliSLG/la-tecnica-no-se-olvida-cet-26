// src/app/dashboard/organizaciones/[id]/OrganizacionDashboardClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  Users,
  Settings,
  Eye,
  ArrowLeft,
  CheckCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Loader2,
  Edit,
  Plus,
  User,
  Briefcase,
  AlertTriangle,
  Target,
  TrendingUp,
  ExternalLink,
  Clock,
  Shield,
  Star,
  FileText,
  Camera,
  Share2,
  Bell,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase/client";
import { uploadOrganizacionLogo } from "@/lib/supabase/supabaseStorage";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Interface para datos completos incluyendo relación
interface OrganizacionConRelacion extends OrganizacionRow {
  miCargo?: string;
  fechaVinculacion?: string;
}

// Progress component simple
const Progress = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => (
  <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
    <div
      className="bg-primary h-2 rounded-full transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
);

// Helper para calcular completitud del perfil
const calcularCompletion = (org: OrganizacionRow) => {
  const campos = [
    org.nombre_oficial,
    org.descripcion,
    org.email_contacto,
    org.telefono_contacto,
    org.sitio_web,
    org.ubicacion, // JSONB field
    org.logo_url,
  ];

  const completados = campos.filter(Boolean).length;
  const total = campos.length;
  return Math.round((completados / total) * 100);
};

// Helper para obtener campos faltantes
const getCamposFaltantes = (org: OrganizacionRow) => {
  const campos = [
    { key: "descripcion", label: "Descripción", value: org.descripcion },
    {
      key: "telefono_contacto",
      label: "Teléfono",
      value: org.telefono_contacto,
    },
    { key: "sitio_web", label: "Sitio web", value: org.sitio_web },
    { key: "ubicacion", label: "Ubicación", value: org.ubicacion },
    { key: "logo_url", label: "Logo", value: org.logo_url },
  ];

  return campos.filter((campo) => !campo.value);
};

interface OrganizacionDashboardClientProps {
  id: string;
}

export function OrganizacionDashboardClient({
  id,
}: OrganizacionDashboardClientProps) {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [organizacion, setOrganizacion] =
    useState<OrganizacionConRelacion | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showColaboracionDialog, setShowColaboracionDialog] = useState(false);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [showLogoDialog, setShowLogoDialog] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const handleLogoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setLogoFile(null);
      setLogoPreview(null);
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Archivo inválido",
        description: "Por favor selecciona una imagen válida",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El logo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setLogoFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = async () => {
    if (!logoFile || !user?.id || !esAdmin) {
      toast({
        title: "Error",
        description: "Selecciona un archivo válido",
        variant: "destructive",
      });
      return;
    }

    setLogoUploading(true);

    try {
      // 1. Subir archivo usando la función existente
      const logoUrl = await uploadOrganizacionLogo(logoFile);

      // 2. ✅ Actualizar usando organizacionesService (como en admin)
      const result = await organizacionesService.update(id, {
        logo_url: logoUrl,
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(
          result.error?.message || "Error actualizando organización"
        );
      }

      // 3. Actualizar estado local
      setOrganizacion((prev) =>
        prev
          ? {
              ...prev,
              logo_url: logoUrl,
            }
          : null
      );

      toast({
        title: "¡Logo actualizado!",
        description:
          "El logo de tu organización ha sido actualizado correctamente",
      });

      // Limpiar estado y cerrar modal
      setLogoFile(null);
      setLogoPreview(null);
      setShowLogoDialog(false);
    } catch (error) {
      console.error("Error uploading logo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error subiendo el logo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    if (!user?.id || !esAdmin) {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden cambiar el logo",
        variant: "destructive",
      });
      return;
    }

    try {
      setLogoUploading(true);

      // ✅ Actualizar usando organizacionesService (como en admin)
      const result = await organizacionesService.update(id, {
        logo_url: null, // ✅ Esto sí funciona con el service
        updated_by_uid: user.id,
        updated_at: new Date().toISOString(),
      });

      if (!result.success) {
        throw new Error(result.error?.message || "Error eliminando logo");
      }

      // Actualizar estado local
      setOrganizacion((prev) =>
        prev
          ? {
              ...prev,
              logo_url: null,
            }
          : null
      );

      toast({
        title: "Logo eliminado",
        description: "El logo ha sido eliminado correctamente",
      });

      setShowLogoDialog(false);
    } catch (error) {
      console.error("Error removing logo:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Error eliminando el logo";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLogoUploading(false);
    }
  };

  const handleToggleColaboraciones = async () => {
    if (!esAdmin || !user?.id) {
      toast({
        title: "Sin permisos",
        description: "Solo los administradores pueden cambiar este estado",
        variant: "destructive",
      });
      return;
    }

    setToggleLoading(true);

    try {
      const nuevoEstado = !organizacion?.abierta_a_colaboraciones;

      // ✅ Ahora user.id está garantizado que no es undefined:
      const { error } = await supabase.rpc(
        "toggle_organizacion_colaboraciones",
        {
          org_id: id,
          nuevo_estado: nuevoEstado,
          user_id: user.id, // ✅ Ya no es user?.id
        }
      );

      if (error) {
        throw new Error(error.message || "Error actualizando colaboraciones");
      }

      // ✅ También cambiar el update del service por supabase directo:
      setOrganizacion((prev) =>
        prev
          ? {
              ...prev,
              abierta_a_colaboraciones: nuevoEstado,
            }
          : null
      );

      toast({
        title: nuevoEstado
          ? "¡Colaboraciones Abiertas!"
          : "Colaboraciones Cerradas",
        description: nuevoEstado
          ? "Tu organización ahora está abierta a nuevas colaboraciones"
          : "Tu organización ya no acepta nuevas colaboraciones",
      });

      setShowColaboracionDialog(false);
    } catch (error) {
      console.error("Error toggling colaboraciones:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setToggleLoading(false);
    }
  };

  // Cargar datos de la organización
  useEffect(() => {
    async function fetchOrganizacion() {
      if (authLoading || !user) return;

      console.log("🔍 Cargando organización:", id);

      try {
        // Cargar datos de la organización
        const orgResult = await organizacionesService.getById(id);

        if (!orgResult.success || !orgResult.data) {
          toast({
            title: "Error",
            description: "Organización no encontrada",
            variant: "destructive",
          });
          router.push("/dashboard/organizaciones");
          return;
        }

        // Cargar mis organizaciones para obtener el cargo
        const misOrgsResult = await organizacionesService.getMisOrganizaciones(
          user.id
        );

        let cargo = "";
        let fechaVinculacion = "";

        if (misOrgsResult.success && misOrgsResult.data) {
          const miOrg = misOrgsResult.data.find((o) => o.id === id);
          if (miOrg) {
            cargo = miOrg.cargo;
            fechaVinculacion = miOrg.fecha_inicio;
          }
        }

        const orgConRelacion: OrganizacionConRelacion = {
          ...orgResult.data,
          miCargo: cargo,
          fechaVinculacion: fechaVinculacion,
        };

        setOrganizacion(orgConRelacion);
      } catch (error) {
        console.error("❌ Error cargando organización:", error);
        toast({
          title: "Error",
          description: "Error al cargar la organización",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacion();
  }, [id, user, authLoading, router, toast]);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!organizacion) {
    return (
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Organización no encontrada
            </h3>
            <Button onClick={() => router.push("/dashboard/organizaciones")}>
              Volver a Mis Organizaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calcular completion
  const completion = organizacion ? calcularCompletion(organizacion) : 0;
  const camposFaltantes = organizacion ? getCamposFaltantes(organizacion) : [];
  const esAdmin = organizacion?.miCargo === "admin_organizacion";

  // Helper para el estado de verificación
  const getEstadoBadge = () => {
    switch (organizacion.estado_verificacion) {
      case "verificada":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificada
          </Badge>
        );
      case "invitacion_enviada":
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Sin verificar
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/dashboard/organizaciones")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>

          <div className="flex items-center gap-3">
            {organizacion.logo_url ? (
              <img
                src={organizacion.logo_url}
                alt={`Logo de ${organizacion.nombre_oficial}`}
                className="w-12 h-12 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Building className="h-6 w-6 text-muted-foreground" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">
                {organizacion.nombre_oficial}
              </h1>
              {organizacion.nombre_fantasia && (
                <p className="text-muted-foreground">
                  {organizacion.nombre_fantasia}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {getEstadoBadge()}

          {organizacion.miCargo && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <User className="h-3 w-3 mr-1" />
              {organizacion.miCargo === "admin_organizacion"
                ? "Administrador"
                : organizacion.miCargo}
            </Badge>
          )}
        </div>
      </div>

      {/* Banner de completar perfil */}
      {completion < 100 && esAdmin && (
        <Alert className="border-orange-200 bg-orange-50">
          <Target className="h-4 w-4" />
          <AlertTitle className="text-orange-800">
            Completa el perfil de tu organización ({completion}%)
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            <div className="mt-2 mb-3">
              <Progress value={completion} className="h-2" />
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {camposFaltantes.slice(0, 3).map((campo) => (
                <Badge key={campo.key} variant="outline" className="text-xs">
                  {campo.label}
                </Badge>
              ))}
              {camposFaltantes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{camposFaltantes.length - 3} más
                </Badge>
              )}
            </div>

            <Button size="sm" onClick={() => setActiveTab("perfil")}>
              <Edit className="h-3 w-3 mr-1" />
              Completar perfil
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfil</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completion}%</div>
            <p className="text-xs text-muted-foreground">Completitud</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Colaboraciones
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizacion.abierta_a_colaboraciones ? "Sí" : "No"}
            </div>
            <p className="text-xs text-muted-foreground">
              Abierta a nuevos proyectos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Miembros</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">En la organización</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {esAdmin && (
              <>
                {/* ✨ NUEVO: Logo Upload */}
                {esAdmin && (
                  <>
                    <Button
                      variant="outline"
                      className="h-auto flex-col gap-2 p-4"
                      onClick={() =>
                        router.push(`/dashboard/organizaciones/${id}/edit`)
                      }
                    >
                      <Edit className="h-5 w-5" />
                      <span className="text-sm">Editar Perfil</span>
                    </Button>

                    <Dialog
                      open={showLogoDialog}
                      onOpenChange={setShowLogoDialog}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="h-auto flex-col gap-2 p-4"
                        >
                          <Camera className="h-5 w-5" />
                          <span className="text-sm">
                            {organizacion?.logo_url
                              ? "Cambiar Logo"
                              : "Subir Logo"}
                          </span>
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>
                            {organizacion?.logo_url
                              ? "Cambiar Logo"
                              : "Subir Logo"}
                          </DialogTitle>
                          <DialogDescription>
                            Sube una imagen para representar tu organización.
                            Tamaño máximo: 5MB.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                          {/* Logo actual */}
                          {organizacion?.logo_url && (
                            <div className="space-y-2">
                              <Label>Logo actual:</Label>
                              <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <img
                                  src={organizacion.logo_url}
                                  alt="Logo actual"
                                  className="w-16 h-16 object-contain rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    Logo actual
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Subido anteriormente
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleRemoveLogo}
                                  disabled={logoUploading}
                                >
                                  {logoUploading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    "Eliminar"
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Input de archivo */}
                          <div className="space-y-2">
                            <Label htmlFor="logo-upload">
                              {organizacion?.logo_url
                                ? "Nuevo logo:"
                                : "Seleccionar logo:"}
                            </Label>
                            <Input
                              id="logo-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleLogoFileChange}
                              disabled={logoUploading}
                            />
                          </div>

                          {/* Preview */}
                          {logoPreview && (
                            <div className="space-y-2">
                              <Label>Vista previa:</Label>
                              <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
                                <img
                                  src={logoPreview}
                                  alt="Vista previa"
                                  className="w-16 h-16 object-contain rounded"
                                />
                                <div className="flex-1">
                                  <p className="text-sm font-medium">
                                    {logoFile?.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {logoFile
                                      ? `${(
                                          logoFile.size /
                                          1024 /
                                          1024
                                        ).toFixed(2)} MB`
                                      : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowLogoDialog(false);
                              setLogoFile(null);
                              setLogoPreview(null);
                            }}
                            disabled={logoUploading}
                          >
                            Cancelar
                          </Button>

                          {logoFile && (
                            <Button
                              onClick={handleLogoUpload}
                              disabled={logoUploading}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              {logoUploading ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Subiendo...
                                </>
                              ) : (
                                <>
                                  <Camera className="h-4 w-4 mr-2" />
                                  Subir Logo
                                </>
                              )}
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {/* ✨ NUEVO: Toggle Colaboraciones */}
                <Dialog
                  open={showColaboracionDialog}
                  onOpenChange={setShowColaboracionDialog}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className={`h-auto flex-col gap-2 p-4 ${
                        organizacion.abierta_a_colaboraciones
                          ? "border-green-200 bg-green-50 hover:bg-green-100"
                          : "border-orange-200 bg-orange-50 hover:bg-orange-100"
                      }`}
                    >
                      {organizacion.abierta_a_colaboraciones ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-600" />
                      )}
                      <span className="text-sm">
                        {organizacion.abierta_a_colaboraciones
                          ? "Cerrar"
                          : "Abrir"}{" "}
                        Colaboraciones
                      </span>
                    </Button>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {organizacion.abierta_a_colaboraciones
                          ? "Cerrar Colaboraciones"
                          : "Abrir Colaboraciones"}
                      </DialogTitle>
                      <DialogDescription>
                        {organizacion.abierta_a_colaboraciones ? (
                          <>
                            ¿Estás seguro de que quieres <strong>cerrar</strong>{" "}
                            las colaboraciones?
                            <br />
                            <br />
                            <span className="text-orange-600">
                              • Tu organización dejará de aparecer en búsquedas
                              de colaboradores
                              <br />
                              • No recibirás propuestas de nuevos proyectos
                              <br />• Los proyectos actuales no se verán
                              afectados
                            </span>
                          </>
                        ) : (
                          <>
                            ¿Quieres <strong>abrir</strong> tu organización a
                            nuevas colaboraciones?
                            <br />
                            <br />
                            <span className="text-green-600">
                              • Aparecerás en búsquedas de organizaciones
                              colaboradoras
                              <br />
                              • Podrás recibir invitaciones a nuevos proyectos
                              <br />• Aumentará la visibilidad de tu
                              organización
                            </span>
                          </>
                        )}
                      </DialogDescription>
                    </DialogHeader>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowColaboracionDialog(false)}
                        disabled={toggleLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        onClick={handleToggleColaboraciones}
                        disabled={toggleLoading}
                        className={
                          organizacion.abierta_a_colaboraciones
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-green-600 hover:bg-green-700"
                        }
                      >
                        {toggleLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : organizacion.abierta_a_colaboraciones ? (
                          <Clock className="h-4 w-4 mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        {organizacion.abierta_a_colaboraciones
                          ? "Cerrar"
                          : "Abrir"}{" "}
                        Colaboraciones
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                window.open(`/organizaciones/${id}`, "_blank");
              }}
            >
              <Eye className="h-5 w-5" />
              <span className="text-sm">Ver Público</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              onClick={() => {
                console.log("🔍 Compartir clicked"); // Debug
                const url = `${window.location.origin}/organizaciones/${id}`;
                console.log("🔍 URL:", url); // Debug
                navigator.clipboard.writeText(url).then(() => {
                  console.log("🔍 Copied to clipboard"); // Debug
                  toast({
                    title: "¡Copiado!",
                    description: "Enlace público copiado al portapapeles",
                  });
                });
              }}
            >
              <Share2 className="h-5 w-5" />
              <span className="text-sm">Compartir</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">General</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          <TabsTrigger value="miembros">Miembros</TabsTrigger>
        </TabsList>

        {/* Tab: General */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Información de la Organización
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizacion.descripcion && (
                  <div>
                    <div className="text-sm font-medium mb-1">Descripción</div>
                    <p className="text-sm text-muted-foreground">
                      {organizacion.descripcion}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Tipo</div>
                    <div className="text-muted-foreground capitalize">
                      {organizacion.tipo?.replace("_", " ")}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Estado</div>
                    <div>{getEstadoBadge()}</div>
                  </div>

                  {organizacion.fechaVinculacion && (
                    <>
                      <div>
                        <div className="font-medium">Vinculado desde</div>
                        <div className="text-muted-foreground">
                          {new Date(
                            organizacion.fechaVinculacion
                          ).toLocaleDateString()}
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="font-medium">Colaboraciones</div>
                    <div className="text-muted-foreground">
                      {organizacion.abierta_a_colaboraciones
                        ? "Abierta"
                        : "Cerrada"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de contacto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {organizacion.email_contacto && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${organizacion.email_contacto}`}
                      className="text-blue-600 hover:underline"
                    >
                      {organizacion.email_contacto}
                    </a>
                  </div>
                )}

                {organizacion.telefono_contacto && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${organizacion.telefono_contacto}`}
                      className="text-blue-600 hover:underline"
                    >
                      {organizacion.telefono_contacto}
                    </a>
                  </div>
                )}

                {organizacion.sitio_web && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={organizacion.sitio_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      {organizacion.sitio_web}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {camposFaltantes.length > 0 && esAdmin && (
                  <div className="pt-2 border-t">
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Faltan {camposFaltantes.length} campos de contacto.{" "}
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => setActiveTab("perfil")}
                        >
                          Completar información
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Perfil */}
        <TabsContent value="perfil" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestión del Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <Edit className="h-4 w-4" />
                  <AlertTitle>Editor de Perfil</AlertTitle>
                  <AlertDescription>
                    Edita toda la información de tu organización desde el editor
                    completo.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={() =>
                    router.push(`/dashboard/organizaciones/${id}/edit`)
                  }
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Abrir Editor de Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Proyectos */}
        <TabsContent value="proyectos" className="space-y-4">
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin proyectos aún</h3>
              <p className="text-muted-foreground mb-4">
                Esta organización no tiene proyectos registrados.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Proyecto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Miembros */}
        <TabsContent value="miembros" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Miembros de la Organización</span>
                {esAdmin && (
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Invitar Miembro
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mostrar usuario actual */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">
                        {user?.nombre} {user?.apellido || ""}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                  </div>

                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    {organizacion.miCargo === "admin_organizacion"
                      ? "Administrador"
                      : "Miembro"}
                  </Badge>
                </div>

                {/* Placeholder para más miembros */}
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {esAdmin
                      ? "Invita a otros miembros para que puedan colaborar en proyectos"
                      : "Solo hay un miembro en esta organización"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
