// src/app/(public)/comunidad/[id]/page.tsx
import { notFound } from "next/navigation";
import { personasService } from "@/lib/supabase/services/personasService";
import { PersonaDetail } from "@/components/public/comunidad/PersonaDetail";
import { Metadata } from "next";

interface PersonaDetailPageProps {
  params: {
    id: string;
  };
}

// ✅ Generar metadata dinámico para SEO
export async function generateMetadata({
  params,
}: PersonaDetailPageProps): Promise<Metadata> {
  const result = await personasService.getPublicaById(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Persona no encontrada | La Técnica no se Olvida",
      description:
        "La persona solicitada no fue encontrada en nuestra comunidad.",
    };
  }

  const persona = result.data;
  const nombreCompleto = `${persona.nombre} ${persona.apellido}`.trim();

  // Helper para formatear categoría
  const formatCategoria = (categoria: string) => {
    const categorias: Record<string, string> = {
      estudiante_cet: "Estudiante CET",
      ex_alumno_cet: "Ex-Alumno CET",
      docente_cet: "Docente CET",
      comunidad_activa: "Comunidad Activa",
      comunidad_general: "Comunidad",
      profesional_independiente: "Profesional",
      tecnico_especializado: "Técnico Especializado",
    };
    return categorias[categoria] || categoria;
  };

  const categoriaFormateada = formatCategoria(
    persona.categoria_principal || "comunidad_general"
  );

  return {
    title: `${nombreCompleto} | ${categoriaFormateada} | CET N°26`,
    description: persona.descripcion_personal_o_profesional
      ? `${persona.descripcion_personal_o_profesional.substring(0, 155)}...`
      : `${nombreCompleto}, ${categoriaFormateada} del CET N°26 en Ingeniero Jacobacci.`,
    keywords: `${nombreCompleto}, ${categoriaFormateada}, CET 26, Ingeniero Jacobacci, ${persona.areas_de_interes_o_expertise?.join(
      ", "
    )}`,
    openGraph: {
      title: `${nombreCompleto} - ${categoriaFormateada}`,
      description:
        persona.descripcion_personal_o_profesional ||
        `${categoriaFormateada} del CET N°26 - La Técnica no se Olvida`,
      type: "profile",
      images: persona.foto_url
        ? [
            {
              url: persona.foto_url,
              width: 400,
              height: 400,
              alt: `Foto de ${nombreCompleto}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: `${nombreCompleto} - ${categoriaFormateada}`,
      description:
        persona.descripcion_personal_o_profesional ||
        `${categoriaFormateada} del CET N°26`,
      images: persona.foto_url ? [persona.foto_url] : [],
    },
  };
}

export default async function PersonaDetailPublicPage({
  params,
}: PersonaDetailPageProps) {
  const result = await personasService.getPublicaById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const persona = result.data;
  const nombreCompleto = `${persona.nombre} ${persona.apellido}`.trim();

  // ✅ Generar JSON-LD para SEO estructurado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: nombreCompleto,
    description: persona.descripcion_personal_o_profesional || undefined,
    image: persona.foto_url || undefined,
    url: persona.links_profesionales?.website || undefined,
    sameAs: [
      persona.links_profesionales?.linkedin,
      persona.links_profesionales?.github,
      persona.links_profesionales?.instagram,
      persona.links_profesionales?.twitter,
    ].filter(Boolean),
    affiliation: {
      "@type": "EducationalOrganization",
      name: "CET N°26 - La Técnica no se Olvida",
      url:
        process.env.NEXT_PUBLIC_SITE_URL || "https://latecnicanoseolvida.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ingeniero Jacobacci",
        addressRegion: "Río Negro",
        addressCountry: "Argentina",
      },
    },
    knowsAbout: persona.areas_de_interes_o_expertise?.join(", ") || undefined,
    alumniOf: persona.categoria_principal?.includes("ex_alumno")
      ? {
          "@type": "EducationalOrganization",
          name: "CET N°26 - La Técnica no se Olvida",
        }
      : undefined,
  };

  return (
    <>
      {/* JSON-LD para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Contenido principal */}
      <div className="container mx-auto py-12 px-4">
        <PersonaDetail persona={persona} />
      </div>
    </>
  );
}

// ✅ Generar rutas estáticas para mejor performance (opcional)
export async function generateStaticParams() {
  try {
    const result = await personasService.getAllPublicas();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map((persona) => ({
      id: persona.id,
    }));
  } catch (error) {
    console.error("Error generating static params for comunidad:", error);
    return [];
  }
}
