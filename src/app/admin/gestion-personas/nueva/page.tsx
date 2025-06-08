"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { PersonasService } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import PersonaForm from "../_components/PersonaForm";

const personasService = new PersonasService(supabase);

export default function NuevaPersonaPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const result = await personasService.create(data);
      if (!result.success || !result.data) {
        throw new Error(result.error?.message || "Error al crear la persona");
      }
      toast.success("Persona creada exitosamente");
      router.push("/admin/gestion-personas");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al crear la persona");
    }
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Nueva Persona</h1>
      <PersonaForm
        onSubmit={handleSubmit}
        submitLabel="Crear persona"
      />
    </div>
  );
} 