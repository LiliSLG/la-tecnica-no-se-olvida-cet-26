// /src/app/(public)/noticias/page.tsx
import { noticiasService } from "@/lib/supabase/services/noticiasService";
import { NoticiasPublicGrid } from "@/components/public/noticias/NoticiasPublicGrid";
import { Metadata } from "next";

// Metadata para SEO
export const metadata: Metadata = {
  title: "Noticias | La Técnica no se Olvida",
  description:
    "Descubre las últimas noticias, artículos y enlaces de interés de la comunidad del CET N°26 de Ingeniero Jacobacci.",
  keywords: [
    "noticias",
    "CET",
    "Ingeniero Jacobacci",
    "educación técnica",
    "rural",
  ],
  openGraph: {
    title: "Noticias | La Técnica no se Olvida",
    description: "Últimas noticias y artículos de la comunidad técnica rural",
    type: "website",
  },
};

export default async function NoticiasPublicasPage() {
  console.log("🔍 Server Public: Loading noticias page");

  const result = await noticiasService.getAllPublished();

  if (!result.success) {
    console.error("❌ Server Public: Error loading noticias:", result.error);
    return (
      <div className="container mx-auto py-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-600">
            Error al cargar noticias
          </h1>
          <p className="text-muted-foreground">
            Hubo un problema al cargar las noticias. Por favor, intenta
            nuevamente más tarde.
          </p>
          <div className="text-sm text-muted-foreground">
            Error: {result.error?.message || "Error desconocido"}
          </div>
        </div>
      </div>
    );
  }

  const noticias = result.data || [];
  console.log("📊 Server Public: Loaded noticias:", noticias.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header de la página */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Noticias de la Comunidad
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Mantente al día con las últimas novedades, proyectos y
            acontecimientos de nuestra comunidad técnica rural.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <span>📍 CET N°26 - Ingeniero Jacobacci</span>
            <span>•</span>
            <span>📚 {noticias.length} noticias publicadas</span>
          </div>
        </div>

        {/* Grid de noticias híbrido */}
        <NoticiasPublicGrid
          noticias={noticias}
          showSearch={true}
          showFilters={true}
        />

        {/* Footer de la página */}
        {noticias.length > 0 && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full border border-primary/20">
              <span className="text-sm text-muted-foreground">
                ¿Tienes una noticia para compartir?
              </span>
              <a
                href="/dashboard"
                className="text-sm font-medium text-primary hover:underline"
              >
                Únete a la comunidad
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
