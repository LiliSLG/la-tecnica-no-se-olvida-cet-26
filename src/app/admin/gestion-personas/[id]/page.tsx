"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PersonasService } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";
import { Database } from "@/lib/supabase/types/database.types";

type Persona = Database['public']['Tables']['personas']['Row'];

const personasService = new PersonasService(supabase);

export default function VerPersonaPage() {
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
        router.push("/admin/gestion-personas");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPersona();
    }
  }, [id, router]);

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
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/admin/gestion-personas")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la Persona</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Información Personal</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nombre:</span> {persona.nombre}</p>
              <p><span className="font-medium">Apellido:</span> {persona.apellido}</p>
              <p><span className="font-medium">Email:</span> {persona.email || "-"}</p>
              <p><span className="font-medium">Teléfono:</span> {persona.telefono_contacto || "-"}</p>
              <p>
                <span className="font-medium">Estado:</span>{" "}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  persona.activo
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}>
                  {persona.activo ? "Activo" : "Inactivo"}
                </span>
              </p>
            </div>
          </div>

        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Información Profesional</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Título Profesional:</span> {persona.titulo_profesional || "-"}</p>
              <p><span className="font-medium">Empresa/Institución:</span> {persona.empresa_o_institucion_actual || "-"}</p>
              <p><span className="font-medium">Cargo Actual:</span> {persona.cargo_actual || "-"}</p>
              <p><span className="font-medium">Situación Laboral:</span> {persona.estado_situacion_laboral || "-"}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Información CET</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Categoría Principal:</span> {persona.categoria_principal || "-"}</p>
              <p><span className="font-medium">Año de Cursada:</span> {persona.ano_cursada_actual_cet || "-"}</p>
              <p><span className="font-medium">Año de Egreso:</span> {persona.ano_egreso_cet || "-"}</p>
              <p><span className="font-medium">Titulación:</span> {persona.titulacion_obtenida_cet || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/gestion-personas")}
        >
          Volver
        </Button>
        <Button
          onClick={() => router.push(`/admin/gestion-personas/${id}/edit`)}
        >
          Editar
        </Button>
      </div>
    </div>
  );
} 