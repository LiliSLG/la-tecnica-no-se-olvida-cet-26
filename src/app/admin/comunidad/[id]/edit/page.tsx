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

function EditPersonaWrapper() {
  const params = useParams();
  const searchParams = useSearchParams();
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Cargando persona...</div>
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
