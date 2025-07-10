// src/app/admin/comunidad/pendientes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { PersonasPendientesPage } from "@/components/admin/comunidad/PersonasPendientesPage";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";

export default function PersonasPendientesAdminPage() {
  const { isAdmin, isLoading } = useAuth();
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPersonasPendientes() {
      if (isLoading || isAdmin === undefined) return;

      try {
        // Obtener todas las personas
        const result = await personasService.getAll(false);

        if (result.success && result.data) {
          setPersonas(result.data);
        }
      } catch (error) {
        console.error("Error fetching personas pendientes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPersonasPendientes();
  }, [isAdmin, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Personas Pendientes"
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
      <PersonasPendientesPage
        personasPendientes={personas}
        onApprovalChange={() => {
          // Refrescar la lista cuando haya cambios
          window.location.reload();
        }}
      />
    </div>
  );
}
