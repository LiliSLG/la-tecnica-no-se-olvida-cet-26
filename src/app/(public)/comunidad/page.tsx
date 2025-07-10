// src/app/(public)/comunidad/page.tsx
import { personasService } from "@/lib/supabase/services/personasService";
import { PersonasPublicGrid } from "@/components/public/comunidad/PersonasPublicGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Comunidad | La Técnica no se Olvida",
  description:
    "Conoce a los miembros de nuestra comunidad: estudiantes, ex-alumnos, docentes, profesionales y técnicos que forman parte del CET N°26 en Ingeniero Jacobacci.",
  keywords:
    "comunidad, estudiantes, ex-alumnos, docentes, profesionales, técnicos, CET 26, Ingeniero Jacobacci, educación técnica",
};

export default async function ComunidadPublicPage() {
  const result = await personasService.getAllPublicas();

  if (!result.success) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error al cargar la comunidad
          </h1>
          <p className="text-muted-foreground">
            No se pudieron cargar los perfiles de la comunidad. Intenta de nuevo
            más tarde.
          </p>
        </div>
      </div>
    );
  }

  const personasPublicas = result.data || [];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header público */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Nuestra Comunidad
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Conoce a los estudiantes, ex-alumnos, docentes, profesionales y
          técnicos que forman parte de la gran familia del CET N°26 en Ingeniero
          Jacobacci y nuestra región.
        </p>
      </div>

      <PersonasPublicGrid personas={personasPublicas} />
    </div>
  );
}
