// src/app/dashboard/organizaciones/[id]/page.tsx
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
import { Alert, AlertDescription } from "@/components/ui/alert";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrganizacionDashboardPageProps {
  params: {
    id: string;
  };
}

export default function OrganizacionDashboardPage({
  params,
}: OrganizacionDashboardPageProps) {
  const { id } = params;
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [organizacion, setOrganizacion] = useState<OrganizacionRow | null>(
    null
  );
  const [miCargo, setMiCargo] = useState<string>("");
  const [loading, setLoading] = useState(true);

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

        // TODO: Verificar que el usuario tiene permisos para esta organización
        // const permisoResult = await organizacionesService.verificarPermisoUsuario(id, user.id);

        setOrganizacion(orgResult.data);
        setMiCargo("admin_organizacion"); // TODO: Obtener cargo real del join

        console.log("✅ Organización cargada:", orgResult.data.nombre_oficial);
      } catch (error) {
        console.error("❌ Error cargando organización:", error);
        toast({
          title: "Error",
          description: "No se pudo cargar la organización",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacion();
  }, [id, user, authLoading]);

  // Helper para mostrar tipo de organización
  const getTipoInfo = (tipo: string | null) => {
    const tipos = {
      empresa: {
        label: "Empresa",
        icon: "🏢",
        color: "bg-blue-100 text-blue-800",
      },
      institucion_educativa: {
        label: "Institución Educativa",
        icon: "🎓",
        color: "bg-purple-100 text-purple-800",
      },
      ONG: { label: "ONG", icon: "🤝", color: "bg-green-100 text-green-800" },
      establecimiento_ganadero: {
        label: "Establecimiento Ganadero",
        icon: "🐄",
        color: "bg-orange-100 text-orange-800",
      },
      organismo_gubernamental: {
        label: "Organismo Gubernamental",
        icon: "🏛️",
        color: "bg-indigo-100 text-indigo-800",
      },
      cooperativa: {
        label: "Cooperativa",
        icon: "👥",
        color: "bg-yellow-100 text-yellow-800",
      },
      otro: { label: "Otro", icon: "📋", color: "bg-gray-100 text-gray-800" },
    };
    return tipos[tipo as keyof typeof tipos] || tipos.otro;
  };

  // Helper para mostrar cargo
  const getCargoInfo = (cargo: string) => {
    const cargos = {
      admin_organizacion: {
        label: "Administrador",
        color: "bg-red-100 text-red-800",
        permisos: "Gestión completa",
      },
      miembro: {
        label: "Miembro",
        color: "bg-blue-100 text-blue-800",
        permisos: "Colaboración",
      },
      referente_area: {
        label: "Referente",
        color: "bg-green-100 text-green-800",
        permisos: "Área específica",
      },
    };
    return (
      cargos[cargo as keyof typeof cargos] || {
        label: cargo,
        color: "bg-gray-100 text-gray-800",
        permisos: "Sin definir",
      }
    );
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Cargando organización...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!organizacion) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Organización no encontrada
            </h3>
            <p className="text-muted-foreground mb-4">
              No se pudo cargar la información de esta organización.
            </p>
            <Button onClick={() => router.push("/dashboard/organizaciones")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Mis Organizaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tipoInfo = getTipoInfo(organizacion.tipo);
  const cargoInfo = getCargoInfo(miCargo);
  const esAdmin = miCargo === "admin_organizacion";

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/organizaciones")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Mis Organizaciones
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-2xl font-bold tracking-tight">
          {organizacion.nombre_oficial}
        </h1>
      </div>

      {/* Banner principal de la organización */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {organizacion.logo_url ? (
                  <img
                    src={organizacion.logo_url}
                    alt={`Logo de ${organizacion.nombre_oficial}`}
                    className="w-16 h-16 object-contain rounded-lg border bg-white"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-2xl border">
                    {tipoInfo.icon}
                  </div>
                )}
              </div>

              {/* Información principal */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold">
                    {organizacion.nombre_oficial}
                  </h2>
                  {organizacion.estado_verificacion === "verificada" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                </div>

                {organizacion.nombre_fantasia && (
                  <p className="text-muted-foreground mb-2">
                    {organizacion.nombre_fantasia}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Badge className={tipoInfo.color}>
                    {tipoInfo.icon} {tipoInfo.label}
                  </Badge>
                  <Badge className={cargoInfo.color}>
                    <User className="h-3 w-3 mr-1" />
                    {cargoInfo.label}
                  </Badge>
                  {organizacion.abierta_a_colaboraciones && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      <Users className="h-3 w-3 mr-1" />
                      Colaborativa
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Acciones principales */}
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  router.push(`/organizaciones/${organizacion.id}`)
                }
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Público
              </Button>

              {esAdmin && (
                <Button
                  onClick={() =>
                    router.push(
                      `/dashboard/organizaciones/${organizacion.id}/perfil`
                    )
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Perfil
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {organizacion.descripcion && (
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {organizacion.descripcion}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Información de mi rol */}
      <Alert>
        <Briefcase className="h-4 w-4" />
        <AlertDescription>
          <strong>Tu rol:</strong> {cargoInfo.label} - {cargoInfo.permisos}
          {esAdmin && " (Puedes editar toda la información de la organización)"}
        </AlertDescription>
      </Alert>

      {/* Tabs de contenido */}
      <Tabs defaultValue="resumen" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="contacto">Contacto</TabsTrigger>
          <TabsTrigger value="proyectos">Proyectos</TabsTrigger>
          {esAdmin && <TabsTrigger value="miembros">Miembros</TabsTrigger>}
        </TabsList>

        {/* Tab: Resumen */}
        <TabsContent value="resumen" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Stats de la organización */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {organizacion.estado_verificacion === "verificada"
                    ? "Verificada"
                    : "Pendiente"}
                </div>
                <p className="text-xs text-muted-foreground">
                  {organizacion.estado_verificacion === "verificada"
                    ? "Públicamente verificada"
                    : "En proceso de verificación"}
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
                <p className="text-xs text-muted-foreground">
                  Proyectos activos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Miembros</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
                <p className="text-xs text-muted-foreground">
                  Personas vinculadas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto p-4 justify-start"
                  onClick={() => {
                    // TODO: Implementar gestión de proyectos
                    toast({
                      title: "Próximamente",
                      description:
                        "La gestión de proyectos estará disponible pronto",
                    });
                  }}
                >
                  <div className="text-left">
                    <div className="font-medium">Gestionar Proyectos</div>
                    <div className="text-sm text-muted-foreground">
                      Agregar y editar proyectos de la organización
                    </div>
                  </div>
                  <Plus className="h-4 w-4 ml-auto" />
                </Button>

                {esAdmin && (
                  <Button
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => {
                      // TODO: Implementar gestión de miembros
                      toast({
                        title: "Próximamente",
                        description:
                          "La gestión de miembros estará disponible pronto",
                      });
                    }}
                  >
                    <div className="text-left">
                      <div className="font-medium">Invitar Miembros</div>
                      <div className="text-sm text-muted-foreground">
                        Agregar empleados a la organización
                      </div>
                    </div>
                    <Users className="h-4 w-4 ml-auto" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contacto */}
        <TabsContent value="contacto" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {organizacion.email_contacto && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-sm text-muted-foreground">
                        {organizacion.email_contacto}
                      </div>
                    </div>
                  </div>
                )}

                {organizacion.telefono_contacto && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Teléfono</div>
                      <div className="text-sm text-muted-foreground">
                        {organizacion.telefono_contacto}
                      </div>
                    </div>
                  </div>
                )}

                {organizacion.sitio_web && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Sitio Web</div>
                      <div className="text-sm text-muted-foreground">
                        <a
                          href={organizacion.sitio_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {organizacion.sitio_web}
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* TODO: Mostrar ubicación cuando esté implementada */}
              </div>

              {esAdmin && (
                <div className="pt-4 border-t">
                  <Button
                    onClick={() =>
                      router.push(
                        `/dashboard/organizaciones/${organizacion.id}/perfil`
                      )
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Información de Contacto
                  </Button>
                </div>
              )}
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
              <Button
                onClick={() => {
                  toast({
                    title: "Próximamente",
                    description:
                      "La gestión de proyectos estará disponible pronto",
                  });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Proyecto
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Miembros (solo para admins) */}
        {esAdmin && (
          <TabsContent value="miembros" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Miembros de la Organización</CardTitle>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Próximamente",
                        description:
                          "La gestión de miembros estará disponible pronto",
                      });
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Invitar Miembro
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Lista de miembros actuales */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">
                        {user?.nombre && user?.apellido
                          ? `${user.nombre} ${user.apellido}`
                          : user?.email || "Usuario actual"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user?.email}
                      </div>
                    </div>
                    <Badge className={cargoInfo.color}>{cargoInfo.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
