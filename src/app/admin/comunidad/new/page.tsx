// /src/app/admin/comunidad/new/page.tsx

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PersonaForm } from "@/components/admin/comunidad/PersonaForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

function PersonaFormWrapper() {
  const searchParams = useSearchParams();
  const tipoParam = searchParams.get("tipo");

  // Validar que el tipo sea válido
  const tiposValidos = ["alumno", "docente", "activo"] as const;
  const tipo = tiposValidos.includes(tipoParam as any)
    ? (tipoParam as "alumno" | "docente" | "activo")
    : null;

  if (!tipo) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Tipo de miembro no especificado o inválido. Tipos válidos: alumno,
            docente, activo
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <PersonaForm tipo={tipo} redirectPath="/admin/comunidad" />
    </div>
  );
}

export default function NewPersonaPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <PersonaFormWrapper />
    </Suspense>
  );
}
