"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { PersonasService } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import PersonaForm from "../../_components/PersonaForm";
import { Database } from "@/lib/supabase/types/database.types";

type Persona = Database['public']['Tables']['personas']['Row'];

const personasService = new PersonasService(supabase);

export default function EditarPersonaPage() {
  const router = useRouter();
  const params = useParams();
  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const result = await personasService.getById(id);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Persona no encontrada");
        }
        setPersona(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la persona");
        toast.error("Error al cargar la persona");
        router.push("/admin/gestion-personas"); // Redirect if person not found or error
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPersona();
    }
  }, [id, router]);

  const handleSubmit = async (data: any) => {
    try {
      const result = await personasService.update(id, data);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Error al actualizar la persona");
      }
      toast.success("Persona actualizada exitosamente");
      // Refresh the router cache before navigation
      router.refresh();
      // Add a small delay to ensure the refresh is processed
      setTimeout(() => {
        router.push("/admin/gestion-personas");
      }, 100);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar la persona");
    }
  };

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

  if (!persona) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-muted-foreground">Persona no encontrada.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Editar Persona</h1>
      <PersonaForm
        initialData={persona}
        onSubmit={handleSubmit}
        submitLabel="Guardar cambios"
      />
    </div>
  );
} 