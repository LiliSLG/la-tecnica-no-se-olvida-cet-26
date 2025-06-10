"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PersonasService, MappedPersona } from "@/lib/supabase/services/personasService";
import { supabase } from "@/lib/supabase/supabaseClient";

const personasService = new PersonasService(supabase);

export default function VerPersonaPublicPage() {
  const router = useRouter();
  const params = useParams();
  const [persona, setPersona] = useState<MappedPersona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const id = params.id as string;

  useEffect(() => {
    const fetchPersona = async () => {
      try {
        const result = await personasService.getByIdMapped(id);
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || "Persona no encontrada");
        }
        setPersona(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la persona");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPersona();
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

  if (!persona) {
    return (
      <div className="container mx-auto py-6 px-4">
        <p className="text-lg text-muted-foreground">Persona no encontrada.</p>
      </div>
    );
  }

  const getCETStatus = (persona: MappedPersona) => {
    if (persona.esExAlumnoCET) return "Exalumno CET";
    if (persona.categoriaPrincipal === "estudiante_cet") return "Alumno CET";
    return "-";
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/comunidad/personas")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <h1 className="text-2xl font-bold">Detalles de la Persona</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              {persona.fotoUrl ? (
                <AvatarImage
                  src={persona.fotoUrl}
                  alt={`Foto de ${persona.nombre}`}
                />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground text-2xl">
                  {persona.nombre && persona.apellido
                    ? `${persona.nombre[0]}${persona.apellido[0]}`
                    : persona.nombre
                    ? persona.nombre[0]
                    : "?"}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{persona.nombre} {persona.apellido}</h2>
              <p className="text-muted-foreground">{getCETStatus(persona)}</p>
            </div>
          </div>

          {persona.tituloProfesional && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Título Profesional</h3>
              <p>{persona.tituloProfesional}</p>
            </div>
          )}

          {persona.descripcionPersonalOProfesional && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="whitespace-pre-wrap">{persona.descripcionPersonalOProfesional}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {persona.areasDeInteresOExpertise?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Áreas de Interés</h3>
              <div className="flex flex-wrap gap-2">
                {persona.areasDeInteresOExpertise.map((area, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {persona.linksProfesionales?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Enlaces Profesionales</h3>
              <div className="space-y-2">
                {persona.linksProfesionales.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:underline"
                  >
                    {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}

          {persona.ubicacionResidencial?.localidad && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Ubicación</h3>
              <p>{persona.ubicacionResidencial.localidad}, {persona.ubicacionResidencial.provincia}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => router.push("/comunidad/personas")}
        >
          Volver a la lista
        </Button>
      </div>
    </div>
  );
} 