// src/app/admin/organizaciones/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { OrganizacionesListPage } from "@/components/admin/organizaciones/OrganizacionesListPage";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";

export default function AdminOrganizacionesPage() {
  const { isAdmin, isLoading } = useAuth();
  const [organizaciones, setOrganizaciones] = useState<OrganizacionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrganizaciones() {
      if (isLoading) return; // Esperar a que auth se resuelva
      if (isAdmin === undefined) return; // Esperar si isAdmin aún es undefined

      try {
        console.log("🔍 Client: Fetching organizaciones, isAdmin:", isAdmin);
        const result = await organizacionesService.getAll(isAdmin);

        if (result.success && result.data) {
          console.log("📊 Client: Loaded organizaciones:", result.data.length);
          setOrganizaciones(result.data);
        } else {
          console.error(
            "❌ Client: Error fetching organizaciones:",
            result.error
          );
          setError("Error al cargar organizaciones");
        }
      } catch (error) {
        console.error("❌ Client: Error in fetchOrganizaciones:", error);
        setError("Error inesperado al cargar las organizaciones");
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizaciones();
  }, [isAdmin, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Gestión de Organizaciones"
        addLabel="Nueva Organización"
        rows={8}
        columns={5}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline"
          >
            Intentar de nuevo
          </button>
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

  return <OrganizacionesListPage allOrganizaciones={organizaciones} />;
}
