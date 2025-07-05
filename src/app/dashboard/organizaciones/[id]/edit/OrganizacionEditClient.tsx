// src/app/dashboard/organizaciones/[id]/edit/OrganizacionEditClient.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { OrganizacionForm } from "@/components/admin/organizaciones/OrganizacionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Loader2, AlertTriangle, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrganizacionEditClientProps {
  id: string;
}

export function OrganizacionEditClient({ id }: OrganizacionEditClientProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [organizacion, setOrganizacion] = useState<OrganizacionRow | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [esAdmin, setEsAdmin] = useState(false);

  // Cargar organización y verificar permisos
  useEffect(() => {
    async function fetchOrganizacionAndPermissions() {
      if (authLoading || !user) return;

      console.log("🔍 Cargando organización para editar:", id);

      try {
        // 1. Cargar datos de la organización
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

        // 2. Verificar si el usuario es admin de esta organización
        const misOrgsResult = await organizacionesService.getMisOrganizaciones(
          user.id
        );

        let isOrgAdmin = false;

        if (misOrgsResult.success && misOrgsResult.data) {
          const miOrg = misOrgsResult.data.find((o) => o.id === id);
          isOrgAdmin = miOrg?.cargo === "admin_organizacion";
        }

        if (!isOrgAdmin) {
          toast({
            title: "Sin permisos",
            description:
              "Solo los administradores de la organización pueden editarla",
            variant: "destructive",
          });
          router.push(`/dashboard/organizaciones/${id}`);
          return;
        }

        setOrganizacion(orgResult.data);
        setEsAdmin(true);
        console.log("✅ Organización cargada y permisos verificados");
      } catch (error) {
        console.error("❌ Error cargando organización:", error);
        toast({
          title: "Error",
          description: "Error al cargar la organización",
          variant: "destructive",
        });
        router.push("/dashboard/organizaciones");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacionAndPermissions();
  }, [id, user, authLoading, router, toast]);

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="text-muted-foreground">Cargando organización...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No authenticated user
  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Acceso requerido</h3>
              <p className="text-muted-foreground mb-4">
                Debes iniciar sesión para editar organizaciones
              </p>
              <Button onClick={() => router.push("/login")}>
                Iniciar Sesión
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Sin permisos o organización no encontrada
  if (!esAdmin || !organizacion) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sin permisos</h3>
              <p className="text-muted-foreground mb-4">
                Solo los administradores de la organización pueden editarla
              </p>
              <Button onClick={() => router.push("/dashboard/organizaciones")}>
                Volver a Mis Organizaciones
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/organizaciones/${id}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="flex items-center gap-3">
            {organizacion.logo_url ? (
              <img
                src={organizacion.logo_url}
                alt={`Logo de ${organizacion.nombre_oficial}`}
                className="w-10 h-10 object-contain rounded-lg border"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <Edit className="h-5 w-5 text-muted-foreground" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold">
                Editar {organizacion.nombre_oficial}
              </h1>
              {organizacion.nombre_fantasia && (
                <p className="text-muted-foreground text-sm">
                  {organizacion.nombre_fantasia}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información importante para usuarios */}
        <Alert className="mb-6">
          <Edit className="h-4 w-4" />
          <AlertDescription>
            <strong>Editando desde tu dashboard:</strong> Los cambios se
            aplicarán inmediatamente y serán visibles tanto en tu dashboard como
            en la página pública de la organización.
          </AlertDescription>
        </Alert>

        {/* Formulario reutilizado del admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Información de la Organización
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* ✨ REUTILIZAR COMPLETAMENTE el OrganizacionForm del admin */}
            <OrganizacionForm
              initialData={organizacion}
              redirectPath={`/dashboard/organizaciones/${id}`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
