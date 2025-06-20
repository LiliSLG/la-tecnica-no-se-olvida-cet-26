// 4. src/app/temas/page.tsx (ACTUALIZADO)
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";

type Tema = {
  id: string;
  nombre: string;
  is_deleted: boolean;
  // …otros campos si los necesitas
};

export default function TemasPage() {
  const { session, isAdmin, isLoading: authLoading } = useAuth();

  const [temas, setTemas] = useState<Tema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !session) return;

    const loadTemas = async () => {
      setLoading(true);
      try {
        // Traigo todos los temas (RLS ya filtrará según is_admin)
        const { data, error: selectError } = await supabase
          .from("temas")
          .select("*");

        if (selectError) throw selectError;
        // 3) Convertir los datos al tipo que necesitamos
        const processedTemas: Tema[] = (data || []).map((tema) => ({
          id: tema.id,
          nombre: tema.nombre,
          is_deleted: Boolean(tema.is_deleted), // Convertir null a false
          categoria_tema: tema.categoria_tema,
          descripcion: tema.descripcion,
          created_at: tema.created_at,
          updated_at: tema.updated_at,
        }));

        console.log("Temas obtenidos:", processedTemas.length, "temas");
        console.log("Temas data:", processedTemas);
        setTemas(processedTemas);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    loadTemas();
  }, [session, authLoading]);

  if (authLoading) return <p>Cargando autenticación...</p>;
  if (!session) return <p>Debes iniciar sesión para ver los temas.</p>;
  if (loading) return <p>Cargando temas…</p>;
  if (error) return <p className="text-red-600">Error: {error}</p>;

  // Separamos activos y eliminados
  const activos = temas.filter((t) => !t.is_deleted);
  const eliminados = temas.filter((t) => t.is_deleted);

  return (
    <main className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Temas</h1>

      {/* DEBUG INFO - REMOVER EN PRODUCCIÓN */}
      <div className="bg-gray-100 p-2 text-sm">
        <p>Debug: isAdmin = {isAdmin ? "SÍ" : "NO"}</p>
        <p>Total temas: {temas.length}</p>
      </div>

      <section>
        <h2>Activos ({activos.length})</h2>
        <ul className="list-disc pl-6">
          {activos.map((t) => (
            <li key={t.id}>{t.nombre}</li>
          ))}
        </ul>
      </section>

      {isAdmin && (
        <section>
          <h2>Eliminados ({eliminados.length})</h2>
          <ul className="list-disc pl-6 text-gray-500">
            {eliminados.map((t) => (
              <li key={t.id}>{t.nombre}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
