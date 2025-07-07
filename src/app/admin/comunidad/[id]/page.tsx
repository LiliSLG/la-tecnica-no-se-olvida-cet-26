//src/app/admin/comunidad/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
  personasService,
  PersonaRow,
} from "@/lib/supabase/services/personasService";
import { PersonasListPage } from "@/components/admin/comunidad/PersonasListPage";
import { DataTableSkeleton } from "@/components/shared/data-tables/DataTableSkeleton";

export default function AdminComunidadPage() {
  const { isAdmin, isLoading } = useAuth();
  const [personas, setPersonas] = useState<PersonaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPersonas() {
      if (isLoading) return; // Esperar a que auth se resuelva
      if (isAdmin === undefined) return; // Esperar si isAdmin aún es undefined

      try {
        console.log("🔍 Client: Fetching personas, isAdmin:", isAdmin);
        const result = await personasService.getAll(false); // Solo activas

        if (result.success && result.data) {
          console.log("📊 Client: Loaded personas:", result.data.length);
          setPersonas(result.data);
        } else {
          console.error("❌ Client: Error fetching personas:", result.error);
          setError("Error al cargar miembros de la comunidad");
        }
      } catch (error) {
        console.error("❌ Client: Error in fetchPersonas:", error);
        setError("Error inesperado al cargar los miembros");
      } finally {
        setLoading(false);
      }
    }

    fetchPersonas();
  }, [isAdmin, isLoading]);

  // Loading state
  if (isLoading || loading) {
    return (
      <DataTableSkeleton
        title="Gestión de Comunidad"
        addLabel="Nuevo Miembro"
        rows={8}
        columns={6}
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

  return (
    <div className="container mx-auto py-8 px-4">
      <PersonasListPage allPersonas={personas} />
    </div>
  );
}
