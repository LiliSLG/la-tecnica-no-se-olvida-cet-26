// /app/temas/[id]/page.tsx

import { BackButton } from "@/components/common/BackButton";
import { personasService } from "@/lib/supabase/services/personasService";
import { proyectosService } from "@/lib/supabase/services/proyectosService";
import { temasService } from "@/lib/supabase/services/temasService";
import { notFound } from "next/navigation";

interface TemaDetailPageProps {
  params: {
    id: string;
  };
}

export default async function TemaDetailPage({ params }: TemaDetailPageProps) {
  // --- ¡ARREGLO! Desestructuramos el id aquí ---
  const { id } = params;

  // Hacemos las llamadas a los servicios con el id
  const [temaResult, personasResult, proyectosResult] = await Promise.all([
    temasService.getById(id),
    personasService.getByTemaId(id),
    proyectosService.getByTemaId(id),
  ]);

  // "Desempaquetamos" los resultados de forma segura
  const tema = temaResult.data;
  const personasRelacionadas = personasResult.data || [];
  const proyectosRelacionados = proyectosResult.data || [];

  // Si el tema principal no se encontró, mostramos 404
  if (!tema) {
    notFound();
  }

  return (
    <main className="container mx-auto p-6">
      <BackButton />
      <h1 className="text-4xl font-bold mb-2">{tema.nombre}</h1>
      <p className="text-lg text-muted-foreground mb-4 capitalize">{tema.categoria_tema?.replace(/_/g, ' ')}</p>
      <div className="prose max-w-none mb-8">
        <p>{tema.descripcion}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">Comunidad Relacionada</h2>
          {personasRelacionadas.length > 0 ? (
            <ul className="space-y-2">
              {personasRelacionadas.map(persona => (
                <li key={persona.id} className="p-2 border rounded hover:bg-muted">
                  <a href={`/comunidad/personas/${persona.id}`}>{persona.nombre} {persona.apellido}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay personas asociadas a este tema.</p>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Proyectos Relacionados</h2>
          {proyectosRelacionados.length > 0 ? (
            <ul className="space-y-2">
              {proyectosRelacionados.map(proyecto => (
                <li key={proyecto.id} className="p-2 border rounded hover:bg-muted">
                  <a href={`/proyectos/${proyecto.id}`}>{proyecto.titulo}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay proyectos asociados a este tema.</p>
          )}
        </section>
      </div>
    </main>
  );
}