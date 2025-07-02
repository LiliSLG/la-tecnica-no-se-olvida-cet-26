// src/app/(public)/organizaciones/page.tsx
import { organizacionesService } from "@/lib/supabase/services/organizacionesService";
import { OrganizacionesPublicGrid } from "@/components/public/organizaciones/OrganizacionesPublicGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Organizaciones Colaboradoras | La Técnica no se Olvida",
  description:
    "Descubre las organizaciones que colaboran con el CET N°26 en proyectos educativos, técnicos y de desarrollo comunitario en Ingeniero Jacobacci.",
  keywords:
    "organizaciones, colaboradores, CET 26, Ingeniero Jacobacci, educación técnica, cooperación",
};

export default async function OrganizacionesPublicPage() {
  const result = await organizacionesService.getAllPublic(); 

  if (!result.success) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Error al cargar organizaciones
          </h1>
          <p className="text-muted-foreground">
            No se pudieron cargar las organizaciones. Intenta de nuevo más
            tarde.
          </p>
        </div>
      </div>
    );
  }

  const organizacionesPublicas = result.data || [];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header público */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Organizaciones Colaboradoras
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Conoce las organizaciones que trabajan junto al CET N°26 en proyectos
          educativos, técnicos y de desarrollo comunitario en Ingeniero
          Jacobacci y la región.
        </p>
      </div>

      <OrganizacionesPublicGrid organizaciones={organizacionesPublicas} />
    </div>
  );
}