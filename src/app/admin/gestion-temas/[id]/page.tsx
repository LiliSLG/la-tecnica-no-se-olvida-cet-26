"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TemasService, MappedTema } from "@/lib/supabase/services/temasService";
import { supabase } from "@/lib/supabase/supabaseClient";

const temasService = new TemasService(supabase);

export default function VerTemaPage() {
  const router = useRouter();
  const params = useParams();
  const [tema, setTema] = useState<MappedTema | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const fetchTema = async () => {
      try {
        const result = await temasService.getByIdMapped(id);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Tema no encontrado");
        }
        setTema(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar el tema");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTema();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  if (!tema) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-muted-foreground">Tema no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/gestion-temas")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalles del Tema</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Información General</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="text-lg">{tema.nombre}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Descripción</p>
                <p className="text-lg whitespace-pre-wrap">{tema.descripcion || "-"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Información del Sistema</h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="text-lg font-mono">{tema.id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Creado</p>
                <p className="text-lg">
                  {new Date(tema.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Última actualización</p>
                <p className="text-lg">
                  {new Date(tema.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/gestion-temas")}
        >
          Volver a la lista
        </Button>
        <Button
          onClick={() => router.push(`/admin/gestion-temas/${tema.id}/editar`)}
        >
          Editar Tema
        </Button>
      </div>
    </div>
  );
} 