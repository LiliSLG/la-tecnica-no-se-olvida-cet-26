import { notFound } from "next/navigation";
import { temasService } from "@/lib/supabase/services/temasService";
import { personasService } from "@/lib/supabase/services/personasService";
import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BackButton } from "@/components/common/BackButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TemaPage({ params }: PageProps) {
  try {
    const { id } = await params;
    const [temaResult, personasResult, proyectosResult] = await Promise.all([
      temasService.getById(id),
      personasService.getByTemaId(id),
      proyectosService.getByTemaId(id),
    ]);

    // Unwrap the data from ServiceResult objects
    const tema = temaResult.data;
    const personas = personasResult.data || [];
    const proyectos = proyectosResult.data || [];

    // Handle not found case
    if (!tema) {
      notFound();
    }

    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <BackButton />
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{tema.nombre}</h1>
            <Badge variant="outline" className="mb-4">
              {tema.categoria_tema}
            </Badge>
            {tema.descripcion && (
              <p className="text-lg text-muted-foreground">{tema.descripcion}</p>
            )}
          </div>

          <div className="grid gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Comunidad Relacionada</CardTitle>
              </CardHeader>
              <CardContent>
                {personas.length > 0 ? (
                  <ul className="space-y-2">
                    {personas.map((persona) => (
                      <li key={persona.id}>
                        <Link
                          href={`/comunidad/personas/${persona.id}`}
                          className="text-primary hover:underline"
                        >
                          {persona.nombre} {persona.apellido}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Aún no hay personas asociadas a este tema.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proyectos Relacionados</CardTitle>
              </CardHeader>
              <CardContent>
                {proyectos.length > 0 ? (
                  <ul className="space-y-2">
                    {proyectos.map((proyecto) => (
                      <li key={proyecto.id}>
                        <Link
                          href={`/proyectos/${proyecto.id}`}
                          className="text-primary hover:underline"
                        >
                          {proyecto.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground">
                    Aún no hay proyectos asociados a este tema.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading tema:", error);
    notFound();
  }
} 