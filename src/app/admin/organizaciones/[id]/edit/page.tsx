// src/app/admin/organizaciones/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { OrganizacionForm } from "@/components/admin/organizaciones/OrganizacionForm";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { useToast } from "@/hooks/use-toast";

export default function EditOrganizacionPage() {
  const params = useParams();
  const { isAdmin, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [organizacion, setOrganizacion] = useState<OrganizacionRow | null>(
    null
  );
  const [loading, setLoading] = useState(true);
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
        const result = await organizacionesService.getById(organizacionId);

        if (result.success && result.data) {
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

  // Loading state simple como OrganizacionesListPage
  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Editar Organización
            </h1>
            <p className="text-muted-foreground">
              Cargando datos de la organización...
            </p>
          </div>

          {/* Loading placeholder más simple */}
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded w-1/4 animate-pulse"></div>
            <div className="h-10 bg-muted rounded animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-1/3 animate-pulse"></div>
            <div className="h-32 bg-muted rounded animate-pulse"></div>
          </div>
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
          <button
            onClick={() => window.history.back()}
            className="text-primary hover:underline"
          >
            Volver atrás
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <OrganizacionForm
        initialData={organizacion}
        redirectPath="/admin/organizaciones"
      />
    </div>
  );
}
