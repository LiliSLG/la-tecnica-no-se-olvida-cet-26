// src/app/admin/organizaciones/pendientes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  organizacionesService,
  OrganizacionRow,
} from "@/lib/supabase/services/organizacionesService";
import { OrganizacionesPendientesPage } from "@/components/admin/organizaciones/OrganizacionesPendientesPage";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";

export default function OrganizacionesPendientesAdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const [organizaciones, setOrganizaciones] = useState<OrganizacionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrganizacionesPendientes() {
      if (isLoading || isAdmin === undefined) return;

      try {
        // Obtener todas las organizaciones
        const result = await organizacionesService.getAll(false);

        if (result.success && result.data) {
          /*
          // Filtrar solo las que están pendientes de aprobación
          const pendientes = result.data.filter(
            (org) =>
              org.estado_verificacion === "pendiente_aprobacion" ||
              org.estado_verificacion === "sin_invitacion"
          );
          setOrganizaciones(pendientes);
          */
          setOrganizaciones(result.data);
        }
      } catch (error) {
        console.error("Error fetching organizaciones pendientes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrganizacionesPendientes();
  }, [isAdmin, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Organizaciones Pendientes"
        addLabel=""
        rows={5}
        columns={3}
      />
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

  return (
    <div className="container mx-auto py-8 px-4">
      <OrganizacionesPendientesPage
        organizacionesPendientes={organizaciones}
        onApprovalChange={() => {
          // Refrescar la lista cuando haya cambios
          window.location.reload();
        }}
      />
    </div>
  );
}
