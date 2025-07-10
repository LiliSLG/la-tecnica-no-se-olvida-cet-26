//src/app/admin/comunidad/[id]/edit/page.tsx

"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { PersonaForm } from "@/components/admin/comunidad/PersonaForm";
import {
  personasService,
  type PersonaRow,
} from "@/lib/supabase/services/personasService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

function EditPersonaWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const id = params.id as string;
  const tipoParam = searchParams.get("tipo");

  const [personaData, setPersonaData] = useState<PersonaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mapear categoría BD a tipo del formulario
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
        return "activo";
      default:
        return "activo";
    }
  };

  useEffect(() => {
    async function loadPersona() {
      try {
        setLoading(true);
        console.log("🔍 Cargando persona ID:", id);

        const result = await personasService.getById(id);

        if (!result.success) {
          setError(result.error?.message || "Error cargando persona");
          return;
        }

        if (!result.data) {
          setError("Persona no encontrada");
          return;
        }

        console.log("✅ Persona cargada:", result.data);
        setPersonaData(result.data);
      } catch (error) {
        console.error("❌ Error cargando persona:", error);
        setError("Error inesperado cargando persona");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadPersona();
    }
  }, [id]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Editar Persona
            </h1>
            <p className="text-muted-foreground">
              Cargando datos de la persona...
            </p>
          </div>
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
  if (error || !personaData) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {error || "Persona no encontrada"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tipo =
    (tipoParam as "alumno" | "docente" | "activo") ||
    mapCategoriaToTipo(personaData.categoria_principal || "comunidad_activa");

  return (
    <div className="container mx-auto p-6">
      <PersonaForm
        tipo={tipo}
        initialData={personaData}
        redirectPath="/admin/comunidad"
      />
    </div>
  );
}

export default function EditPersonaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <EditPersonaWrapper />
    </Suspense>
  );
}
