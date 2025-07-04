// src/app/dashboard/organizaciones/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Building,
  Users,
  CheckCircle,
  Calendar,
  Settings,
  Eye,
  Plus,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { organizacionesService } from "@/lib/supabase/services/organizacionesService";

// Tipos para las organizaciones del usuario
interface MiOrganizacion {
  id: string;
  nombre_oficial: string;
  nombre_fantasia?: string;
  tipo: string;
  descripcion?: string;
  logo_url?: string;
  estado_verificacion: string;
  email_contacto?: string;
  abierta_a_colaboraciones: boolean;
  cargo: string; // del join con persona_organizacion
  fecha_inicio: string; // cuando se vinculó a la org
}

export default function OrganizacionesPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [organizaciones, setOrganizaciones] = useState<MiOrganizacion[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar organizaciones del usuario
  useEffect(() => {
    async function fetchMisOrganizaciones() {
      if (authLoading || !user) return;

      console.log("🔍 Cargando organizaciones del usuario:", user.id);

      try {
        const result = await organizacionesService.getMisOrganizaciones(
          user.id
        );
        if (result.success) {
          setOrganizaciones(result.data || []);
          console.log("✅ Organizaciones cargadas:", result.data?.length || 0);
        } else {
          console.error("❌ Error en resultado:", result.error);
          toast({
            title: "Error",
            description:
              result.error?.message ||
              "No se pudieron cargar tus organizaciones",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Error cargando organizaciones:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar tus organizaciones",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchMisOrganizaciones();
  }, [user, authLoading]);

  // Helper para mostrar tipo de organización
  const getTipoInfo = (tipo: string) => {
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
      },
      miembro: { label: "Miembro", color: "bg-blue-100 text-blue-800" },
      referente_area: {
        label: "Referente",
        color: "bg-green-100 text-green-800",
      },
    };
    return (
      cargos[cargo as keyof typeof cargos] || {
        label: cargo,
        color: "bg-gray-100 text-gray-800",
      }
    );
  };

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">
              Cargando tus organizaciones...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Mis Organizaciones
          </h1>
          <p className="text-muted-foreground">
            Gestiona las organizaciones donde participas
          </p>
        </div>

        {isAdmin && (
          <Button
            onClick={() => router.push("/admin/organizaciones")}
            variant="outline"
          >
            <Settings className="h-4 w-4 mr-2" />
            Panel Admin
          </Button>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizaciones
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organizaciones.length}</div>
            <p className="text-xs text-muted-foreground">Donde participo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Como Administrador
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                organizaciones.filter(
                  (org) => org.cargo === "admin_organizacion"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Gestiono completamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {
                organizaciones.filter(
                  (org) => org.estado_verificacion === "verificada"
                ).length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Públicamente verificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abiertas</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {
                organizaciones.filter((org) => org.abierta_a_colaboraciones)
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">A colaboraciones</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de organizaciones */}
      {organizaciones.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No tienes organizaciones
            </h3>
            <p className="text-muted-foreground mb-4">
              Aún no estás vinculado a ninguna organización.
            </p>

            <Alert className="max-w-md mx-auto">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Las organizaciones se vinculan a tu cuenta cuando:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Verificas una invitación de organización</li>
                  <li>Un administrador te invita como miembro</li>
                  <li>Creas una organización (próximamente)</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {organizaciones.map((org) => {
            const tipoInfo = getTipoInfo(org.tipo);
            const cargoInfo = getCargoInfo(org.cargo);

            return (
              <Card key={org.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        {org.logo_url ? (
                          <img
                            src={org.logo_url}
                            alt={`Logo de ${org.nombre_oficial}`}
                            className="w-12 h-12 object-contain rounded-lg border bg-white"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-xl border">
                            {tipoInfo.icon}
                          </div>
                        )}
                      </div>

                      {/* Nombre y tipo */}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg leading-tight">
                          {org.nombre_oficial}
                        </h3>
                        {org.nombre_fantasia && (
                          <p className="text-sm text-muted-foreground">
                            {org.nombre_fantasia}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={tipoInfo.color}>
                            {tipoInfo.icon} {tipoInfo.label}
                          </Badge>
                          <Badge className={cargoInfo.color}>
                            {cargoInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Estado de verificación */}
                    <div className="flex-shrink-0">
                      {org.estado_verificacion === "verificada" ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <div className="h-5 w-5 rounded-full bg-yellow-200 border-2 border-yellow-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Descripción */}
                  {org.descripcion && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {org.descripcion}
                    </p>
                  )}

                  {/* Información adicional */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Desde {new Date(org.fecha_inicio).toLocaleDateString()}
                    </div>
                    {org.abierta_a_colaboraciones && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Users className="h-3 w-3" />
                        Colaborativa
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/organizaciones/${org.id}`)
                      }
                      className="flex-1"
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Gestionar
                    </Button>

                    <Button
                      onClick={() => router.push(`/organizaciones/${org.id}`)}
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Público
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Acciones rápidas */}
      {organizaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  // TODO: Implementar toggle de contexto
                  toast({
                    title: "Próximamente",
                    description:
                      "El toggle de contexto estará disponible pronto",
                  });
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Cambiar Contexto</div>
                  <div className="text-sm text-muted-foreground">
                    Actuar como persona u organización
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => router.push("/organizaciones")}
              >
                <div className="text-left">
                  <div className="font-medium">Explorar Organizaciones</div>
                  <div className="text-sm text-muted-foreground">
                    Ver directorio público
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>

              <Button
                variant="outline"
                className="h-auto p-4 justify-start"
                onClick={() => {
                  // TODO: Implementar invitación de miembros
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
                    Agregar empleados a tus organizaciones
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
