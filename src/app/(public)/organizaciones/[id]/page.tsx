// src/app/(public)/organizaciones/[id]/page.tsx
import { notFound } from "next/navigation";
import { organizacionesService } from "@/lib/supabase/services/organizacionesService";
import { OrganizacionDetail } from "@/components/public/organizaciones/OrganizacionDetail";
import { Metadata } from "next";

interface OrganizacionDetailPageProps {
  params: {
    id: string;
  };
}

// ✅ Generar metadata dinámico para SEO
export async function generateMetadata({
  params,
}: OrganizacionDetailPageProps): Promise<Metadata> {
  const result = await organizacionesService.getById(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Organización no encontrada | La Técnica no se Olvida",
      description: "La organización solicitada no fue encontrada.",
    };
  }

  const organizacion = result.data;
  const nombreCompleto = organizacion.nombre_fantasia
    ? `${organizacion.nombre_oficial} (${organizacion.nombre_fantasia})`
    : organizacion.nombre_oficial;

  return {
    title: `${nombreCompleto} | Organizaciones Colaboradoras`,
    description: organizacion.descripcion
      ? `${organizacion.descripcion.substring(0, 155)}...`
      : `Conoce más sobre ${nombreCompleto}, organización colaboradora del CET N°26 en Ingeniero Jacobacci.`,
    keywords: `${nombreCompleto}, ${
      organizacion.tipo
    }, CET 26, Ingeniero Jacobacci, colaboración, ${organizacion.areas_de_interes?.join(
      ", "
    )}`,
    openGraph: {
      title: nombreCompleto,
      description:
        organizacion.descripcion || `Organización colaboradora del CET N°26`,
      type: "website",
      images: organizacion.logo_url
        ? [
            {
              url: organizacion.logo_url,
              width: 400,
              height: 400,
              alt: `Logo de ${nombreCompleto}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary",
      title: nombreCompleto,
      description:
        organizacion.descripcion || `Organización colaboradora del CET N°26`,
      images: organizacion.logo_url ? [organizacion.logo_url] : [],
    },
  };
}

export default async function OrganizacionDetailPublicPage({
  params,
}: OrganizacionDetailPageProps) {
  const result = await organizacionesService.getPublicById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const organizacion = result.data;

  // ✅ Generar JSON-LD para SEO estructurado
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: organizacion.nombre_oficial,
    alternateName: organizacion.nombre_fantasia || undefined,
    description: organizacion.descripcion || undefined,
    url: organizacion.sitio_web || undefined,
    email: organizacion.email_contacto || undefined,
    telephone: organizacion.telefono_contacto || undefined,
    logo: organizacion.logo_url || undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Ingeniero Jacobacci",
      addressRegion: "Río Negro",
      addressCountry: "Argentina",
    },
    memberOf: {
      "@type": "EducationalOrganization",
      name: "CET N°26 - La Técnica no se Olvida",
      url:
        process.env.NEXT_PUBLIC_SITE_URL || "https://latecnicanoseolvida.com",
    },
    keywords: organizacion.areas_de_interes?.join(", ") || undefined,
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
        <OrganizacionDetail organizacion={organizacion} />
      </div>
    </>
  );
}

// ✅ Generar rutas estáticas para mejor performance (opcional)
export async function generateStaticParams() {
  try {
    // ✅ CAMBIAR: usar método público
    const result = await organizacionesService.getAllPublic();

    if (!result.success || !result.data) {
      return [];
    }

    return result.data.map((org) => ({
      id: org.id,
    }));
  } catch (error) {
    console.error("Error generating static params for organizaciones:", error);
    return [];
  }
}
